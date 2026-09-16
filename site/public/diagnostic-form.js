import { validateDiagnostic, diagnosticWhatsappUrl, regimes, needs } from './diagnostic-validation.js';
import { formatCnpj, states } from './contact-validation.js';

const steps = [
  { key: 'cnpj', label: 'CNPJ', question: 'Para começar, qual é o CNPJ da sua empresa?', hint: 'Vamos identificar a empresa que você quer analisar.', placeholder: '00.000.000/0000-00', max: 18, autocomplete: 'off' },
  { key: 'company', label: 'Razão social / empresa', question: 'Qual é a razão social da empresa?', hint: 'Informe o nome da empresa vinculada a esse CNPJ.', placeholder: 'Nome da sua empresa', max: 160, autocomplete: 'organization' },
  { key: 'state', label: 'Estado', question: 'Em qual estado sua empresa está?', hint: 'Assim, conhecemos um pouco mais sobre sua operação.', options: Object.fromEntries([...states].map(uf => [uf, uf])), optional: true },
  { key: 'city', label: 'Cidade', question: 'E em qual cidade?', hint: 'Você também pode deixar essa informação para depois.', placeholder: 'Cidade da empresa', max: 100, autocomplete: 'address-level2', optional: true },
  { key: 'regime', label: 'Regime tributário', question: 'Qual é o regime tributário da empresa?', hint: 'Se tiver dúvida, selecione “Não sei informar”.', options: regimes, choices: true, optional: true },
  { key: 'name', label: 'Nome do responsável', question: 'Como podemos chamar você?', hint: 'Agora, vamos aos dados de quem vai conversar com a FS.', placeholder: 'Seu nome', max: 120, autocomplete: 'name' },
  { key: 'email', label: 'E-mail', question: 'Qual é o seu e-mail de contato?', hint: 'Informe um endereço que você costuma acompanhar.', placeholder: 'voce@empresa.com.br', type: 'email', max: 180, autocomplete: 'email' },
  { key: 'phone', label: 'WhatsApp', question: 'Em qual WhatsApp podemos falar com você?', hint: 'Inclua o DDD. É por aqui que podemos continuar o atendimento.', placeholder: '(62) 99999-9999', type: 'tel', max: 25, autocomplete: 'tel' },
  { key: 'need', label: 'Necessidade', question: 'O que sua empresa precisa neste momento?', hint: 'Escolha a opção que melhor representa sua necessidade.', options: needs, choices: true },
  { key: 'message', label: 'Informações adicionais', question: 'Quer nos contar mais alguma coisa?', hint: 'Se quiser, compartilhe uma dúvida ou um detalhe importante para a análise.', placeholder: 'Conte um pouco sobre o momento da empresa…', max: 1000, textarea: true, optional: true }
];
const $ = selector => document.querySelector(selector);
const form = $('#diagnostic-form');
const submit = $('#diagnostic-submit');
const back = $('#diagnostic-back');
const skip = $('#diagnostic-skip');
const status = $('#diagnostic-status');
const panel = $('#diagnostic-step');
const continuation = $('#diagnostic-whatsapp');
const resultPanel = $('#diagnostic-result');
const resultTitle = $('#diagnostic-result-title');
const resultText = $('#diagnostic-result-text');
const answers = Object.fromEntries(steps.map(step => [step.key, '']));
answers.consent = false;
let index = 0;
let editing = false;
let editReturn = steps.length;
let sending = false;
let typing = false;
let submissionId = crypto.randomUUID();
let sentId = null;
let deliveryMode = 'whatsapp';
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const displayAnswer = step => step.options?.[answers[step.key]] || answers[step.key] || 'Não informado';
const flowText = () => deliveryMode === 'webhook'
  ? 'Ao enviar, sua solicitação será registrada para atendimento. Depois, abriremos o WhatsApp com seu resumo para você continuar a conversa.'
  : 'Ao continuar, abriremos o WhatsApp com seu resumo. Envie a mensagem por lá para a equipe receber sua solicitação.';

fetch('/api/diagnostic', { signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.json() : Promise.reject()).then(data => {
  deliveryMode = data.mode === 'webhook' ? 'webhook' : 'whatsapp';
  if ($('#diagnostic-flow-text')) $('#diagnostic-flow-text').textContent = flowText();
}).catch(() => {});

function showStatus(message = '', state = '') { status.textContent = message; status.dataset.state = state; }
function changed() {
  submissionId = crypto.randomUUID(); sentId = null;
  resultPanel.hidden = true; continuation.hidden = true; showStatus();
}
function focusStep() {
  const messages = $('#diagnostic-messages');
  messages.scrollTop = messages.scrollHeight;
  $('#diagnostic-question').focus({ preventScroll: true });
}
function fieldMarkup(step) {
  const value = answers[step.key];
  const id = `diagnostic-${step.key}`;
  if (step.choices) return `<div class="diagnostic-choice-list" role="radiogroup" aria-labelledby="diagnostic-question" aria-describedby="diagnostic-hint diagnostic-field-error">${Object.entries(step.options).map(([key, label]) => `<label class="diagnostic-choice"><input type="radio" name="${step.key}" value="${esc(key)}" ${key === value ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div>`;
  const attrs = `id="${id}" name="${step.key}" class="diagnostic-input" aria-describedby="diagnostic-hint diagnostic-field-error" ${step.optional ? '' : 'required'} ${step.max ? `maxlength="${step.max}"` : ''}`;
  const label = `<label class="diagnostic-field-label" for="${id}">${step.label}${step.optional ? ' · opcional' : ''}</label>`;
  if (step.options) return `${label}<select ${attrs} autocomplete="address-level1"><option value="">Selecione seu estado</option>${Object.entries(step.options).map(([key, text]) => `<option value="${key}" ${key === value ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select>`;
  if (step.textarea) return `${label}<textarea ${attrs} rows="4" placeholder="${esc(step.placeholder)}">${esc(value)}</textarea>`;
  return `${label}<input ${attrs} type="${step.type || 'text'}" value="${esc(value)}" placeholder="${esc(step.placeholder)}" autocomplete="${step.autocomplete || 'off'}" ${step.key === 'cnpj' ? 'autocapitalize="characters" spellcheck="false"' : ''}>`;
}
function render(focus = true) {
  const review = index === steps.length;
  showStatus(); resultPanel.hidden = true; continuation.hidden = true;
  $('#diagnostic-stage').textContent = editing ? 'Editando sua resposta' : review ? 'Revisão e envio' : index < 5 ? 'Sua empresa' : index < 8 ? 'Seu contato' : 'Sua necessidade';
  $('#diagnostic-count').textContent = review ? '10 de 10 respostas' : (index + 1) + ' de ' + steps.length;
  $('#diagnostic-progress').value = review ? steps.length : index;
  back.hidden = index === 0 && !editing;
  skip.hidden = review || !steps[index]?.optional;
  back.textContent = editing ? 'Voltar à revisão' : 'Voltar';
  submit.textContent = review ? 'Enviar e continuar no WhatsApp' : editing ? 'Salvar resposta' : 'Enviar';
  submit.disabled = back.disabled = skip.disabled = typing;
  const conversation = steps.slice(0, index).map((step, i) => '<div class="chat-message chat-message-fs"><span class="chat-sender">FS Soluções Tributárias</span><div class="chat-bubble"><p>' + step.question + '</p></div></div><div class="chat-message chat-message-you"><span class="chat-sender">Você</span><div class="chat-bubble"><p>' + esc(displayAnswer(step)) + '</p><button type="button" data-edit="' + i + '" aria-label="Editar ' + step.label + '">Editar</button></div></div>').join('');
  const question = review ? 'Tudo certo! Confira suas respostas acima e vamos continuar pelo WhatsApp.' : steps[index].question;
  const hint = review ? 'Para ajustar algum dado, use “Editar” na resposta. Depois, confirme a autorização abaixo.' : steps[index].hint;
  if (typing) {
    $('#diagnostic-messages').innerHTML = conversation + '<div class="chat-message chat-message-fs chat-message-current"><span class="chat-sender">FS Soluções Tributárias</span><div class="chat-bubble chat-typing" role="status" aria-live="polite"><span>Digitando…</span><span class="chat-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></div>';
    $('#diagnostic-messages').querySelectorAll('[data-edit]').forEach(button => { button.disabled = true; });
    panel.innerHTML = '<label class="diagnostic-field-label" for="diagnostic-waiting">Sua resposta</label><input id="diagnostic-waiting" class="diagnostic-input" placeholder="Aguarde a próxima pergunta…" disabled>';
    submit.textContent = 'Aguarde…';
    const messages = $('#diagnostic-messages');
    messages.scrollTop = messages.scrollHeight;
    return;
  }
  $('#diagnostic-messages').innerHTML = conversation + '<div class="chat-message chat-message-fs chat-message-current"><span class="chat-sender">FS Soluções Tributárias</span><div class="chat-bubble">' + (index === 0 ? '<p class="chat-welcome">Olá! Seja bem-vindo à FS. Vamos iniciar seu atendimento.</p>' : '') + '<h2 id="diagnostic-question" class="diagnostic-question" tabindex="-1">' + question + '</h2><p id="diagnostic-hint" class="diagnostic-hint">' + hint + '</p></div></div>';
  if (review) {
    panel.innerHTML = '<label class="diagnostic-consent" for="diagnostic-consent"><input type="checkbox" id="diagnostic-consent" name="consent" ' + (answers.consent ? 'checked' : '') + ' required aria-describedby="diagnostic-field-error"><span>Autorizo a FS a utilizar os dados informados para atender minha solicitação e entrar em contato comigo. Li o <a href="/privacidade/" target="_blank" rel="noopener noreferrer">aviso de privacidade</a>.</span></label><p id="diagnostic-field-error" class="diagnostic-field-error" role="alert"></p><p id="diagnostic-flow-text" class="diagnostic-flow-text">' + flowText() + '</p>';
  } else {
    panel.innerHTML = fieldMarkup(steps[index]) + '<p id="diagnostic-field-error" class="diagnostic-field-error" role="alert"></p>';
  }
  if (focus) focusStep();
}
function advance() {
  const wasEditing = editing;
  index = editing ? editReturn : index + 1;
  editing = false;
  // Editing an existing answer returns immediately; new replies get the chat pause.
  if (wasEditing) { render(); return; }
  typing = true;
  render(false);
  window.setTimeout(() => { typing = false; render(); }, 2000);
}
function showFieldError(key, message) {
  $('#diagnostic-field-error').textContent = message;
  const field = form.elements.namedItem(key);
  const target = field instanceof RadioNodeList ? field[0] : field;
  target?.setAttribute('aria-invalid', 'true');
  target?.focus();
}
form.addEventListener('input', event => {
  const key = event.target.name;
  if (sending || typing || !Object.hasOwn(answers, key)) return;
  answers[key] = key === 'consent' ? event.target.checked : event.target.value;
  event.target.removeAttribute('aria-invalid');
  $('#diagnostic-field-error').textContent = '';
  changed();
});
form.addEventListener('focusout', event => {
  if (event.target.name === 'cnpj') { answers.cnpj = formatCnpj(event.target.value); event.target.value = answers.cnpj; }
});
$('#diagnostic-messages').addEventListener('click', event => {
  const edit = event.target.closest('[data-edit]');
  if (!edit || sending || typing) return;
  editReturn = index; index = Number(edit.dataset.edit); editing = true; render();
});
back.addEventListener('click', () => { if (!sending && !typing) { index = editing ? editReturn : Math.max(0, index - 1); editing = false; render(); } });
skip.addEventListener('click', () => {
  if (sending || typing || !steps[index]?.optional) return;
  answers[steps[index].key] = ''; changed();
  advance();
});
function showContinuation(url, delivery) {
  continuation.href = url; continuation.hidden = false; continuation.textContent = 'Continuar no WhatsApp';
  resultTitle.textContent = delivery === 'webhook' ? 'Solicitação registrada para atendimento.' : 'Seu resumo está pronto.';
  resultText.textContent = delivery === 'webhook' ? 'Continue pelo WhatsApp para conversar com a FS sobre sua empresa.' : 'Envie a mensagem no WhatsApp para a FS receber seus dados e iniciar o atendimento.';
  resultPanel.hidden = false; resultPanel.focus();
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || typing) return;
  if (index < steps.length) {
    const step = steps[index];
    const field = form.elements.namedItem(step.key);
    answers[step.key] = field?.value || '';
    const { values, errors } = validateDiagnostic(answers);
    if (errors[step.key]) { showFieldError(step.key, errors[step.key]); return; }
    answers[step.key] = values[step.key];
    advance(); return;
  }
  answers.consent = form.elements.consent.checked;
  const input = { ...answers, website: form.elements.website.value };
  const { values, errors, valid } = validateDiagnostic(input);
  if (!valid) {
    const first = steps.findIndex(step => errors[step.key]);
    if (first >= 0) { editReturn = steps.length; index = first; editing = true; render(); showFieldError(steps[first].key, errors[steps[first].key]); }
    else showFieldError('consent', errors.consent);
    return;
  }
  const fallbackUrl = diagnosticWhatsappUrl(values);
  if (sentId === submissionId) { showContinuation(fallbackUrl, deliveryMode); window.location.assign(fallbackUrl); return; }
  sending = true; form.setAttribute('aria-busy', 'true');
  const controls = [...form.elements]; controls.forEach(control => { control.disabled = true; });
  submit.textContent = 'Enviando…'; showStatus('Preparando sua solicitação…', 'pending');
  continuation.hidden = true; resultPanel.hidden = true;
  try {
    const response = await fetch('/api/diagnostic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, submissionId }), signal: AbortSignal.timeout(16000) });
    const result = await response.json();
    if (response.status === 422 && result.errors) {
      const first = steps.findIndex(step => result.errors[step.key]);
      if (first >= 0) { editReturn = steps.length; index = first; editing = true; render(); showFieldError(steps[first].key, result.errors[steps[first].key]); }
      else showFieldError('consent', result.errors.consent || 'Revise sua autorização.');
      return;
    }
    if (!response.ok || !result.success) throw new Error('Envio não confirmado');
    const url = new URL(result.whatsappUrl);
    if (url.origin !== 'https://wa.me' || url.pathname !== '/5562992446000') throw new Error('Destino inválido');
    sentId = submissionId; deliveryMode = result.delivery;
    showStatus(); showContinuation(url.href, result.delivery); window.location.assign(url.href);
  } catch {
    showStatus('Não conseguimos confirmar o registro. Suas respostas continuam aqui. Tente novamente ou envie o resumo pelo WhatsApp.', 'error');
    continuation.href = fallbackUrl; continuation.textContent = 'Enviar resumo pelo WhatsApp'; continuation.hidden = false;
    resultPanel.hidden = false; resultTitle.textContent = 'Você também pode falar diretamente com a FS.';
    resultText.textContent = 'O resumo seguirá na mensagem. O registro no sistema ainda não foi confirmado.';
  } finally {
    sending = false; form.removeAttribute('aria-busy'); controls.forEach(control => { control.disabled = false; });
    submit.textContent = index === steps.length ? 'Enviar e continuar no WhatsApp' : editing ? 'Salvar resposta' : 'Enviar';
  }
});
$('#diagnostic-loading').hidden = true;
$('#diagnostic-chat').hidden = false;
render(false);
