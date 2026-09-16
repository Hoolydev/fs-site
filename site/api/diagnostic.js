import { createHmac } from 'node:crypto';
import { validateDiagnostic, diagnosticWhatsappUrl, consentVersion, regimes, needs } from '../public/diagnostic-validation.js';

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const failed = () => json({ error: 'Não conseguimos confirmar o registro da solicitação. Tente novamente ou continue pelo WhatsApp.', retryable: true }, 503);

export function diagnosticPayload(values, submissionId, env, timestamp) {
  return {
    schema_version: '1.0', event: 'diagnostic.requested', event_id: submissionId, occurred_at: timestamp,
    source: { channel: 'website', form: 'diagnostico', page: '/diagnostico/' },
    funnel: { pipeline: env.DIAGNOSTIC_PIPELINE_ID || null, stage: env.DIAGNOSTIC_STAGE_ID || null },
    company: { name: values.company, cnpj: values.cnpj.replace(/[.\/-]/g, ''), city: values.city || null, state: values.state || null, tax_regime: values.regime || null, tax_regime_label: regimes[values.regime] || null },
    contact: { name: values.name, email: values.email, whatsapp: values.phone },
    request: { service: values.need, service_label: needs[values.need], message: values.message || null },
    consent: { accepted: true, version: consentVersion, received_at: timestamp, purpose: 'Solicitação de diagnóstico e contato pela FS Soluções Tributárias' }
  };
}

export async function handleDiagnostic(request, { env = process.env, fetcher = fetch, now = () => new Date().toISOString() } = {}) {
  const configured = Boolean(env.DIAGNOSTIC_WEBHOOK_URL);
  if (request.method === 'GET') return json({ available: true, mode: configured ? 'webhook' : 'whatsapp' });
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST', 'Cache-Control': 'no-store' } });
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Origem da solicitação inválida.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Formato de envio inválido.' }, 415);
  if (Number(request.headers.get('content-length')) > 14000) return json({ error: 'Solicitação muito longa.' }, 413);
  let input;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > 14000) return json({ error: 'Solicitação muito longa.' }, 413);
    input = JSON.parse(text);
  } catch { return json({ error: 'Não foi possível ler os dados. Revise e tente novamente.' }, 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input) || input.website) return json({ error: 'Revise os dados e tente novamente.' }, 400);
  const { values, errors, valid } = validateDiagnostic(input);
  if (!valid) return json({ error: 'Confira os campos indicados.', errors }, 422);
  if (!uuid.test(input.submissionId || '')) return json({ error: 'Atualize a página e tente novamente.' }, 400);
  const whatsappUrl = diagnosticWhatsappUrl(values);
  // Without a configured destination, do not claim the lead has been stored.
  if (!configured) return json({ success: true, delivery: 'whatsapp', whatsappUrl });
  try {
    const endpoint = new URL(env.DIAGNOSTIC_WEBHOOK_URL);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) return failed();
    const payload = diagnosticPayload(values, input.submissionId, env, now());
    const body = JSON.stringify(payload);
    const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': input.submissionId, 'X-FS-Event': payload.event, 'X-FS-Timestamp': payload.occurred_at };
    if (env.DIAGNOSTIC_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${env.DIAGNOSTIC_WEBHOOK_TOKEN}`;
    if (env.DIAGNOSTIC_WEBHOOK_SECRET) headers['X-FS-Signature'] = `sha256=${createHmac('sha256', env.DIAGNOSTIC_WEBHOOK_SECRET).update(`${payload.occurred_at}.${body}`).digest('hex')}`;
    const response = await fetcher(endpoint.toString(), { method: 'POST', headers, body, redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!response.ok) return failed();
    return json({ success: true, delivery: 'webhook', whatsappUrl });
  } catch { return failed(); }
}
export default { fetch: request => handleDiagnostic(request) };
