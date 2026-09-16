<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function unavailable(): never {
    respond(['error'=>'Não foi possível enviar agora. Tente novamente mais tarde ou fale com a FS pelo WhatsApp.'],503);
}
function validCnpj(string $value): bool {
    $raw = preg_replace('/[.\s\/-]/', '', strtoupper($value));
    if (!preg_match('/^[A-Z0-9]{12}[0-9]{2}$/', $raw) || preg_match('/^(.)\1{13}$/', $raw)) return false;
    $digit = function(string $input): string {
        $weight = 2; $sum = 0;
        for ($i = strlen($input)-1; $i >= 0; $i--) {
            $sum += (ord($input[$i])-48)*$weight;
            $weight = $weight === 9 ? 2 : $weight+1;
        }
        $remainder = $sum % 11;
        return $remainder < 2 ? '0' : (string)(11-$remainder);
    };
    $first = $digit(substr($raw,0,12));
    return substr($raw,12) === $first.$digit(substr($raw,0,12).$first);
}

$configPath = dirname(__DIR__,2).'/fs-contact-config.php';
$config = is_file($configPath) ? require $configPath : [];
$configured = is_array($config) && !empty($config['enabled']) && function_exists('mail')
    && filter_var($config['to'] ?? '', FILTER_VALIDATE_EMAIL)
    && filter_var($config['from'] ?? '', FILTER_VALIDATE_EMAIL);
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') respond(['available'=>(bool)$configured]);
if ($method !== 'POST') { header('Allow: GET, POST'); respond(['error'=>'Método não permitido.'],405); }
if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', $config['origins'] ?? ['https://www.fssolucoestributarias.com.br','https://fssolucoestributarias.com.br'],true)) respond(['error'=>'Origem inválida.'],403);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) respond(['error'=>'Formato inválido.'],415);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>20000) respond(['error'=>'Mensagem muito longa.'],413);
$raw = file_get_contents('php://input',false,null,0,20001);
if ($raw === false || strlen($raw)>20000) respond(['error'=>'Mensagem muito longa.'],413);
$input = json_decode($raw,true);
if (!is_array($input) || !empty($input['website'])) respond(['error'=>'Revise os dados e tente novamente.'],400);
$values=[]; $errors=[];
foreach (['name'=>120,'email'=>180,'phone'=>25,'state'=>2,'company'=>160,'cnpj'=>18,'message'=>5000] as $field=>$limit) {
    $value = is_string($input[$field] ?? null) ? trim($input[$field]) : '';
    $values[$field] = $value;
    if (!preg_match('//u',$value) || preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f]/',$value) || preg_match_all('/./us',$value)>$limit) $errors[$field]='Revise este campo.';
}
if (strlen($values['name'])<2) $errors['name']='Informe seu nome.';
if (!filter_var($values['email'],FILTER_VALIDATE_EMAIL) || strpbrk($values['email'],"\r\n")!==false) $errors['email']='Informe um e-mail válido.';
if (!preg_match('/^[+()\s\d-]+$/',$values['phone']) || !preg_match('/^\d{10,15}$/',preg_replace('/\D/','',$values['phone']))) $errors['phone']='Informe um WhatsApp válido com DDD.';
$states=explode(',','AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO');
if ($values['state'] && !in_array($values['state'],$states,true)) $errors['state']='Selecione um estado válido.';
if ($values['cnpj'] && !validCnpj($values['cnpj'])) $errors['cnpj']='Confira o CNPJ informado.';
if ($errors) respond(['error'=>'Confira os campos indicados.','errors'=>$errors],422);
if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',$input['submissionId'] ?? '')) respond(['error'=>'Atualize a página e tente novamente.'],400);
if (!$configured) unavailable();

// Registros privados contêm somente horários e identificadores, nunca a mensagem.
$stateDir=dirname(__DIR__,2).'/.fs-contact-state';
if (!is_dir($stateDir) && !mkdir($stateDir,0700,true) && !is_dir($stateDir)) unavailable();
$lock=fopen($stateDir.'/lock','c');
if (!$lock || !flock($lock,LOCK_EX)) unavailable();
$now=time();
$stateFile=$stateDir.'/state.json';
$state=is_file($stateFile) ? json_decode(file_get_contents($stateFile),true) : [];
if (!is_array($state)) $state=[];
$recent=array_filter($state['sent'] ?? [],fn($item)=>is_array($item) && ($item['time'] ?? 0)>$now-86400);
$id=$input['submissionId'];
if (isset($recent[$id])) respond(['success'=>true]);
$ip=hash('sha256',($_SERVER['REMOTE_ADDR'] ?? '').$config['from']);
$attempts=array_filter($state['attempts'] ?? [],fn($item)=>is_array($item) && ($item['time'] ?? 0)>$now-3600);
$ipAttempts=count(array_filter($attempts,fn($item)=>($item['ip'] ?? '')===$ip));
if ($ipAttempts>=5 || count($attempts)>=100) {header('Retry-After: 3600');respond(['error'=>'Limite de tentativas atingido. Tente mais tarde ou fale pelo WhatsApp.'],429);}
$attempts[]=['time'=>$now,'ip'=>$ip];
if (file_put_contents($stateFile,json_encode(['sent'=>$recent,'attempts'=>array_values($attempts)]),LOCK_EX)===false) unavailable();
chmod($stateFile,0600);
$text="Novo contato pelo site da FS Soluções Tributárias\n\n";
foreach (['name'=>'Nome','email'=>'E-mail','phone'=>'WhatsApp','state'=>'Estado','company'=>'Empresa','cnpj'=>'CNPJ'] as $field=>$label) $text.=$label.': '.($values[$field] ?: 'Não informado')."\n";
$text.="\nMensagem:\n".($values['message'] ?: 'Não informada');
$headers=['From'=>'FS Solucoes Tributarias <'.$config['from'].'>','Reply-To'=>$values['email'],'MIME-Version'=>'1.0','Content-Type'=>'text/plain; charset=UTF-8'];
if (!mail($config['to'],'Novo contato pelo site da FS',$text,$headers)) unavailable();
$recent[$id]=['time'=>$now];
file_put_contents($stateFile,json_encode(['sent'=>$recent,'attempts'=>array_values($attempts)]),LOCK_EX);
flock($lock,LOCK_UN); fclose($lock);
respond(['success'=>true]);
