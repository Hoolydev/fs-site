import test from 'node:test';
import assert from 'node:assert/strict';
import {handleContact} from '../api/contact.js';
import {validCnpj} from '../public/contact-validation.js';

const input = {name:'Contato de teste',email:'contato@example.test',phone:'+55 (62) 99999-9999',state:'GO',company:'Empresa de teste',cnpj:'11.222.333/0001-81',message:'Solicitação de teste.',website:'',submissionId:'6fcf2b18-529a-46cc-922e-2a44152e96ee'};
const env = {RESEND_API_KEY:'test-only',CONTACT_TO_EMAIL:'fs@example.test',CONTACT_FROM_EMAIL:'site@example.test'};
const request = (body=input, origin='https://fs.example.test') => new Request('https://fs.example.test/api/contact', {method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});

test('aceita CNPJ numérico e alfanumérico e rejeita dígitos incorretos', () => {
  assert.equal(validCnpj(input.cnpj), true);
  assert.equal(validCnpj('00.000.000/E08G-12'), true);
  assert.equal(validCnpj('11.222.333/0001-82'), false);
  assert.equal(validCnpj('00.000.000/0000-00'), false);
});

test('validação impede envio de campos inválidos', async () => {
  const result = await handleContact(request({...input,email:'invalid',cnpj:'123'}), {env,fetcher:()=>assert.fail('Não deve enviar')});
  assert.equal(result.status,422);
  const body = await result.json();
  assert.ok(body.errors.email && body.errors.cnpj);
});

test('origem externa e honeypot impedem envio', async () => {
  const options = {env,fetcher:()=>assert.fail('Não deve enviar')};
  assert.equal((await handleContact(request(input,'https://other.example.test'),options)).status,403);
  assert.equal((await handleContact(request({...input,website:'spam'}),options)).status,400);
});

test('destinatário vem do servidor e conteúdo chega integralmente ao provedor', async () => {
  let sent;
  const result = await handleContact(request({...input,to:'arbitrary@example.test'}), {env,fetcher:async (url,options)=>{
    assert.equal(url,'https://api.resend.com/emails');
    sent=JSON.parse(options.body);
    assert.equal(options.headers['Idempotency-Key'],`fs-contact-${input.submissionId}`);
    return Response.json({id:'test-message-id'});
  }});
  assert.equal(result.status,200);
  assert.deepEqual(sent.to,[env.CONTACT_TO_EMAIL]);
  assert.equal(sent.reply_to,input.email);
  for(const value of [input.name,input.phone,input.company,input.cnpj,input.message]) assert.ok(sent.text.includes(value));
});

test('falha do provedor ou configuração ausente nunca confirma sucesso', async () => {
  const failed = await handleContact(request(),{env,fetcher:async()=>Response.json({error:'unavailable'},{status:500})});
  assert.equal(failed.status,503);
  assert.equal((await failed.json()).success,undefined);
  const missing = await handleContact(request(),{env:{},fetcher:()=>assert.fail('Não deve enviar')});
  assert.equal(missing.status,503);
  const status = await handleContact(new Request('https://fs.example.test/api/contact'),{env:{}});
  assert.deepEqual(await status.json(),{available:false});
});
