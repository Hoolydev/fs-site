export const states = new Set(['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']);

export function formatCnpj(value) {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);
  return raw.replace(/^(.{2})(.{3})(.{3})(.{4})(.{0,2})$/, '$1.$2.$3/$4-$5');
}

export function validCnpj(value) {
  const raw = value.toUpperCase().replace(/[.\s/-]/g, '');
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(raw) || /^(.)\1{13}$/.test(raw)) return false;
  const digit = input => {
    let weight = 2;
    let sum = 0;
    for (let index = input.length - 1; index >= 0; index--) {
      sum += (input.charCodeAt(index) - 48) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? '0' : String(11 - remainder);
  };
  const first = digit(raw.slice(0, 12));
  return raw.slice(12) === first + digit(raw.slice(0, 12) + first);
}

export function validateContact(input) {
  const values = {};
  const errors = {};
  for (const [key, max] of Object.entries({name:120,email:180,phone:25,state:2,company:160,cnpj:18,message:5000})) {
    const value = typeof input?.[key] === 'string' ? input[key].trim() : '';
    values[key] = value;
    if (value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) errors[key] = 'Revise este campo.';
  }
  if (values.name.length < 2) errors.name = 'Informe seu nome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Informe um e-mail válido.';
  if (!/^[+()\s\d-]+$/.test(values.phone) || !/^\d{10,15}$/.test(values.phone.replace(/\D/g, ''))) errors.phone = 'Informe um WhatsApp válido com DDD.';
  if (values.state && !states.has(values.state)) errors.state = 'Selecione um estado válido.';
  if (values.cnpj && !validCnpj(values.cnpj)) errors.cnpj = 'Confira o CNPJ informado.';
  return { values, errors, valid: Object.keys(errors).length === 0 };
}
