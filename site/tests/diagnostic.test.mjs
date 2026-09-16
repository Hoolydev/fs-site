import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { handleDiagnostic } from '../api/diagnostic.js';

const origin = 'https://fs-site-preview.vercel.app';
const input = { submissionId: 'b8899058-f5eb-4f04-af65-1a1f06b05036', company: 'Empresa demonstrativa', cnpj: '11.222.333/0001-81', name: 'Responsável de teste', email: 'teste@example.com', phone: '(62) 99999-9999', state: 'GO', city: 'Goiânia', regime: 'real', need: 'diagnostico', message: 'Teste local de integração', consent: true, website: '' };
const request = (data = input, options = {}) => new Request(origin + '/api/diagnostic', { method: 'POST', headers: { origin, 'content-type': 'application/json', ...options.headers }, body: JSON.stringify(data) });
const env = { DIAGNOSTIC_WEBHOOK_URL: 'https://crm.example.test/webhook', DIAGNOSTIC_WEBHOOK_TOKEN: 'test-token', DIAGNOSTIC_WEBHOOK_SECRET: 'test-secret', DIAGNOSTIC_PIPELINE_ID: 'pipeline-test', DIAGNOSTIC_STAGE_ID: 'new' };

test('sem integração, prepara WhatsApp com todos os dados e não simula persistência', async () => {
  const response = await handleDiagnostic(request(), { env: {}, fetcher: () => { throw Error('não deve chamar rede'); } });
  const result = await response.json();
  assert.equal(response.status, 200); assert.equal(result.delivery, 'whatsapp');
  const url = new URL(result.whatsappUrl); assert.equal(url.origin, 'https://wa.me'); assert.equal(url.pathname, '/5562992446000');
  for (const value of ['Empresa demonstrativa', input.cnpj, input.name, input.email, input.phone, 'Lucro Real', input.message]) assert.ok(url.searchParams.get('text').includes(value));
});

test('aguarda confirmação do webhook e envia dados, consentimento e assinatura', async () => {
  let release; const gate = new Promise(resolve => { release = resolve; }); let settled = false; let captured;
  const running = handleDiagnostic(request(), { env, now: () => '2026-09-15T23:00:00.000Z', fetcher: async (url, options) => { captured = { url, options }; await gate; return new Response(null, { status: 204 }); } }).then(value => { settled = true; return value; });
  await new Promise(resolve => setTimeout(resolve, 5)); assert.equal(settled, false); release();
  const response = await running; const result = await response.json(); assert.equal(result.delivery, 'webhook');
  const { options } = captured; const payload = JSON.parse(options.body);
  assert.equal(captured.url, env.DIAGNOSTIC_WEBHOOK_URL); assert.equal(options.redirect, 'error');
  assert.equal(payload.company.cnpj, '11222333000181'); assert.equal(payload.contact.email, input.email);
  assert.equal(payload.request.service, 'diagnostico'); assert.equal(payload.funnel.stage, 'new'); assert.equal(payload.consent.accepted, true);
  assert.equal(payload.event_id, input.submissionId); assert.equal(options.headers['Idempotency-Key'], input.submissionId);
  assert.equal(options.headers.Authorization, 'Bearer test-token');
  assert.equal(options.headers['X-FS-Signature'], 'sha256=' + createHmac('sha256', env.DIAGNOSTIC_WEBHOOK_SECRET).update(`${payload.occurred_at}.${options.body}`).digest('hex'));
  assert.ok(!JSON.stringify(result).includes('test-token'));
});

test('falha ou timeout no destino não retorna sucesso nem redirecionamento automático', async () => {
  for (const fetcher of [async () => new Response('erro interno', { status: 500 }), async () => { throw new DOMException('timeout', 'TimeoutError'); }]) {
    const response = await handleDiagnostic(request(), { env, fetcher }); const result = await response.json();
    assert.equal(response.status, 503); assert.equal(result.success, undefined); assert.equal(result.whatsappUrl, undefined); assert.equal(result.retryable, true);
  }
});

test('reenvio preserva event_id e chave de idempotência para deduplicação no receptor', async () => {
  const ids = []; const fetcher = async (_, options) => { ids.push([JSON.parse(options.body).event_id, options.headers['Idempotency-Key']]); return new Response('{}'); };
  await handleDiagnostic(request(), { env, fetcher }); await handleDiagnostic(request(), { env, fetcher });
  assert.deepEqual(ids, [[input.submissionId, input.submissionId], [input.submissionId, input.submissionId]]);
});

test('validação no servidor bloqueia CNPJ, contato, consentimento e campos adulterados', async () => {
  for (const changes of [{ cnpj: '11.111.111/1111-11' }, { company: '' }, { email: 'inválido' }, { consent: false }, { regime: 'injetado' }, { need: 'injetado' }, { city: 'cidade\nmodificada' }]) {
    const response = await handleDiagnostic(request({ ...input, ...changes }), { env, fetcher: () => { throw Error('não deve encaminhar'); } }); assert.equal(response.status, 422);
  }
});

test('bloqueia requisições de outra origem, corpo excessivo, robô e id inválido', async () => {
  assert.equal((await handleDiagnostic(request(input, { headers: { origin: 'https://another.test' } }), { env: {} })).status, 403);
  assert.equal((await handleDiagnostic(request({ ...input, message: 'a'.repeat(15000) }), { env: {} })).status, 413);
  assert.equal((await handleDiagnostic(request({ ...input, website: 'bot' }), { env: {} })).status, 400);
  assert.equal((await handleDiagnostic(request({ ...input, submissionId: '../malicious' }), { env: {} })).status, 400);
  assert.equal((await handleDiagnostic(request(input, { headers: { 'content-type': 'text/plain' } }), { env: {} })).status, 415);
});

test('configuração pública não expõe endpoint ou credenciais e falha segura em HTTP', async () => {
  const response = await handleDiagnostic(new Request(origin + '/api/diagnostic'), { env }); assert.deepEqual(await response.json(), { available: true, mode: 'webhook' });
  const invalid = await handleDiagnostic(request(), { env: { DIAGNOSTIC_WEBHOOK_URL: 'http://crm.example.test' }, fetcher: () => { throw Error('não deve chamar rede'); } }); assert.equal(invalid.status, 503);
});
