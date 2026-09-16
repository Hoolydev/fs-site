import { validateContact, formatCnpj } from './contact-validation.js';

const form = document.querySelector('#contact-form');
const status = document.querySelector('#contact-status');
const submit = document.querySelector('#contact-submit');
let submissionId = crypto.randomUUID();
let sending = false;

submit.disabled = true;
fetch('/api/contact', {signal:AbortSignal.timeout(10000)})
  .then(response => response.ok ? response.json() : Promise.reject())
  .then(result => {
    if (result.available) submit.disabled = false;
    else showStatus('O formulário está temporariamente indisponível. Fale com a FS pelo WhatsApp.', 'error');
  })
  .catch(() => showStatus('Não foi possível carregar o envio. Atualize a página ou fale com a FS pelo WhatsApp.', 'error'));

function showStatus(message, state) {
  status.textContent = message;
  status.dataset.state = state;
}

form.elements.cnpj.addEventListener('blur', event => {event.target.value = formatCnpj(event.target.value);});
form.addEventListener('input', event => {
  event.target.setCustomValidity?.('');
  event.target.removeAttribute('aria-invalid');
  submissionId = crypto.randomUUID();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;
  const input = Object.fromEntries(new FormData(form));
  const {errors, valid} = validateContact(input);
  if (!valid) {
    for (const [key, message] of Object.entries(errors)) {
      form.elements[key].setCustomValidity(message);
      form.elements[key].setAttribute('aria-invalid', 'true');
    }
    form.reportValidity();
    return;
  }
  sending = true;
  submit.disabled = true;
  submit.textContent = 'Enviando…';
  showStatus('', 'pending');
  try {
    const response = await fetch('/api/contact', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...input,submissionId}),signal:AbortSignal.timeout(18000)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Não foi possível enviar agora. Tente novamente ou fale com a FS pelo WhatsApp.');
    form.reset();
    submissionId = crypto.randomUUID();
    showStatus('Mensagem enviada. A equipe da FS entrará em contato com você.', 'success');
  } catch (error) {
    showStatus(error.name === 'TimeoutError' || error instanceof TypeError ? 'Não foi possível confirmar o envio. Tente novamente ou fale com a FS pelo WhatsApp.' : error.message, 'error');
  } finally {
    sending = false;
    submit.disabled = false;
    submit.textContent = 'Enviar mensagem';
  }
});
