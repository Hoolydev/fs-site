import { validateContact, formatCnpj, validCnpj } from './contact-validation.js';

export const regimes = Object.freeze({ simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real', mei: 'MEI', desconhecido: 'Não sei informar' });
export const needs = Object.freeze({ diagnostico: 'Diagnóstico tributário completo', debitos: 'Débitos e regularização', creditos: 'Recuperação de créditos', planejamento: 'Planejamento tributário', outra: 'Outra necessidade' });
export const consentVersion = 'diagnostico-v1-2026-09-15';

export function validateDiagnostic(input) {
  const { values, errors } = validateContact(input);
  for (const [key, max] of Object.entries({ city: 100, regime: 20, need: 20 })) {
    values[key] = typeof input?.[key] === 'string' ? input[key].trim() : '';
    if (values[key].length > max || /[\x00-\x1f\x7f]/.test(values[key])) errors[key] = 'Revise este campo.';
  }
  if (values.company.length < 2) errors.company = 'Informe a razão social ou o nome da empresa.';
  if (!values.cnpj || !validCnpj(values.cnpj)) errors.cnpj = 'Informe um CNPJ válido.';
  if (values.regime && !Object.hasOwn(regimes, values.regime)) errors.regime = 'Selecione uma opção válida.';
  if (!Object.hasOwn(needs, values.need)) errors.need = 'Selecione o que sua empresa precisa.';
  if (values.message.length > 1000) errors.message = 'Use até 1.000 caracteres.';
  if (input?.consent !== true && input?.consent !== 'on') errors.consent = 'Confirme a autorização para continuarmos com seu atendimento.';
  for (const key of ['company', 'name', 'email', 'phone', 'cnpj']) {
    if (/[\r\n\t\x7f]/.test(values[key])) errors[key] = 'Revise este campo.';
  }
  values.cnpj = formatCnpj(values.cnpj);
  values.consent = input?.consent === true || input?.consent === 'on';
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function diagnosticWhatsappUrl(values) {
  const lines = [
    'Olá! Quero fazer o diagnóstico tributário da minha empresa.', '',
    `Empresa: ${values.company}`, `CNPJ: ${values.cnpj}`, `Responsável: ${values.name}`,
    `E-mail: ${values.email}`, `WhatsApp: ${values.phone}`,
    values.city || values.state ? `Localização: ${[values.city, values.state].filter(Boolean).join(' / ')}` : '',
    values.regime ? `Regime tributário: ${regimes[values.regime]}` : '',
    `Necessidade: ${needs[values.need]}`,
    values.message ? `Informações adicionais: ${values.message}` : ''
  ].filter(Boolean);
  return `https://wa.me/5562992446000?text=${encodeURIComponent(lines.join('\n'))}`;
}
