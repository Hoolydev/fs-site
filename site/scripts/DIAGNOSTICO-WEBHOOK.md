# Conversa guiada de diagnóstico e integração com o funil

## Fluxo publicado

1. O botão da página inicial abre `/diagnostico/`.
2. A conversa guiada faz uma pergunta por vez: CNPJ, empresa, UF, cidade, regime, responsável, e-mail, WhatsApp, necessidade e observações. Cidade, UF, regime e observações podem ser pulados. O visitante pode voltar, revisar e editar as respostas. Cada nova resposta aparece imediatamente; a próxima pergunta chega após 2 segundos, com indicador de digitação. Edição e navegação para respostas anteriores são imediatas. A autorização de privacidade aparece somente na revisão final. As respostas ficam apenas na memória da página até o envio; não há IA nem armazenamento local.
3. `POST /api/diagnostic` valida os campos no servidor.
4. Com webhook configurado, o servidor aguarda uma resposta HTTP 2xx do receptor antes de liberar o WhatsApp.
5. Sem webhook configurado, a API informa `delivery: "whatsapp"`, e a página orienta o visitante a concluir o envio da mensagem no WhatsApp. Não afirma que o lead foi salvo em um funil.
6. O WhatsApp abre com os dados preenchidos; o visitante confirma o envio no próprio WhatsApp.

O site não faz consultas fiscais por este formulário. A autorização do formulário é para atendimento, não substitui procurações ou outras autorizações exigidas para consultas.

## Variáveis na Vercel (somente servidor)

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `DIAGNOSTIC_WEBHOOK_URL` | Para ativar o funil | Endpoint HTTPS que recebe o lead via POST JSON |
| `DIAGNOSTIC_WEBHOOK_TOKEN` | Conforme o receptor | Header `Authorization: Bearer ...` |
| `DIAGNOSTIC_WEBHOOK_SECRET` | Conforme o receptor | Segredo para assinatura HMAC SHA-256 |
| `DIAGNOSTIC_PIPELINE_ID` | Conforme o receptor | Identificador do funil, enviado em `funnel.pipeline` |
| `DIAGNOSTIC_STAGE_ID` | Conforme o receptor | Etapa inicial, enviada em `funnel.stage` |

Cadastrar no ambiente Production do projeto `fs-site-preview` e realizar novo deploy. Para homologação, cadastrar apenas em Preview e usar um destino de teste.

Credenciais nunca devem ser colocadas no HTML, no JavaScript público nem em query strings. A URL do receptor permanece no servidor. O endpoint público GET retorna apenas disponibilidade e modo, sem credenciais.

## Contrato de dados

```json
{
  "schema_version": "1.0",
  "event": "diagnostic.requested",
  "event_id": "UUID-v4-do-envio",
  "occurred_at": "data-ISO-gerada-pelo-servidor",
  "source": { "channel": "website", "form": "diagnostico", "page": "/diagnostico/" },
  "funnel": { "pipeline": "ID-do-funil-ou-null", "stage": "ID-da-etapa-ou-null" },
  "company": {
    "name": "Empresa demonstrativa",
    "cnpj": "11222333000181",
    "city": "Goiânia",
    "state": "GO",
    "tax_regime": "real",
    "tax_regime_label": "Lucro Real"
  },
  "contact": { "name": "Responsável", "email": "teste@example.com", "whatsapp": "(62) 99999-9999" },
  "request": { "service": "diagnostico", "service_label": "Diagnóstico tributário completo", "message": null },
  "consent": {
    "accepted": true,
    "version": "diagnostico-v1-2026-09-15",
    "received_at": "data-ISO-gerada-pelo-servidor",
    "purpose": "Solicitação de diagnóstico e contato pela FS Soluções Tributárias"
  }
}
```

Regimes: `simples`, `presumido`, `real`, `mei`, `desconhecido` (ou null).
Necessidades: `diagnostico`, `debitos`, `creditos`, `planejamento`, `outra`.

Mapear no receptor: empresa/CNPJ para o cadastro empresarial; nome/e-mail/WhatsApp para o contato; necessidade/mensagem para a oportunidade; IDs para o funil e etapa.

## Confirmação, falhas e reenvio

- O receptor deve persistir o lead ou colocá-lo em uma fila durável antes de responder 2xx. O formulário não interpreta o corpo da resposta: para esta integração, 2xx é confirmação de recebimento.
- Enviar `Idempotency-Key` e `event_id` com o mesmo UUID. O receptor deve deduplicar por `event_id`. Reenvios sem edição mantêm o UUID; editar os dados inicia uma nova solicitação. O timestamp e a assinatura podem mudar entre tentativas.
- Timeout: 10 segundos. Não há reenvio automático nem armazenamento local durável na função Vercel.
- Falha, timeout ou redirecionamento do receptor retornam 503. A página mantém os campos, oferece nova tentativa e permite enviar o resumo pelo WhatsApp, avisando que o registro no sistema não foi confirmado.
- O botão é bloqueado durante o envio. Navegação externa só acontece depois da resposta da API.
- Os dados não são persistidos em localStorage nem registrados nos logs do aplicativo.

## Assinatura opcional

Headers enviados:

- `X-FS-Event: diagnostic.requested`
- `X-FS-Timestamp: <occurred_at>`
- `X-FS-Signature: sha256=<hex>` (se houver segredo configurado)

Calcular `HMAC_SHA256(secret, timestamp + "." + corpo_JSON_original)`. Verificar com comparação em tempo constante, validar janela de tempo e deduplicar `event_id` no receptor. Usar o corpo original, não serializar novamente após o parse.

## Validação feita

`npm test` cobre validação, consentimento, origem, corpo excessivo, modo WhatsApp, assinatura, espera pela confirmação, falha, timeout e chave de reenvio.

O fluxo de navegador foi testado localmente com dados fictícios, interceptando a navegação ao WhatsApp antes de qualquer acesso externo. Nenhuma mensagem ou lead real foi enviado.

## Pendente para conectar o cliente

Nome do sistema, URL/documentação do receptor, autenticação exigida e identificação do funil/etapa. A estrutura está preparada; a integração real só estará ativa após configuração e homologação com o sistema escolhido.
