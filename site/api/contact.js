import { validateContact } from '../public/contact-validation.js';

const json = (data, status = 200) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}});
const unavailable = () => json({error:'Não foi possível enviar agora. Tente novamente mais tarde ou fale com a FS pelo WhatsApp.'}, 503);

export async function handleContact(request, {env = process.env, fetcher = fetch} = {}) {
  const configured = Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL);
  if (request.method === 'GET') return json({available:configured});
  if (request.method !== 'POST') return new Response(null, {status:405,headers:{Allow:'GET, POST'}});
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'Origem da solicitação inválida.'}, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Formato de envio inválido.'}, 415);
  if (Number(request.headers.get('content-length')) > 20000) return json({error:'Mensagem muito longa.'}, 413);
  let input;
  try {
    const text = await request.text();
    if (text.length > 20000) return json({error:'Mensagem muito longa.'}, 413);
    input = JSON.parse(text);
  } catch { return json({error:'Não foi possível ler o formulário.'}, 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input) || input.website) return json({error:'Revise os dados e tente novamente.'}, 400);
  const {values, errors, valid} = validateContact(input);
  if (!valid) return json({error:'Confira os campos indicados.',errors}, 422);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.submissionId || '')) return json({error:'Atualize a página e tente novamente.'}, 400);
  if (!configured) return unavailable();
  const text = [
    'Novo contato pelo site da FS Soluções Tributárias',
    '', `Nome: ${values.name}`, `E-mail: ${values.email}`, `WhatsApp: ${values.phone}`,
    `Estado: ${values.state || 'Não informado'}`, `Empresa: ${values.company || 'Não informada'}`,
    `CNPJ: ${values.cnpj || 'Não informado'}`, '', 'Mensagem:', values.message || 'Não informada'
  ].join('\n');
  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`fs-contact-${input.submissionId}`},
      body:JSON.stringify({from:env.CONTACT_FROM_EMAIL,to:[env.CONTACT_TO_EMAIL],reply_to:values.email,subject:'Novo contato pelo site da FS',text}),
      signal:AbortSignal.timeout(12000)
    });
    if (!response.ok) return unavailable();
    const result = await response.json();
    if (!result.id) return unavailable();
    return json({success:true});
  } catch { return unavailable(); }
}

export default { fetch: request => handleContact(request) };
