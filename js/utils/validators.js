/**
 * AMOPETS — Validators
 * Pure validation functions for forms, inputs, and business rules.
 */

/**
 * Validate an email address
 * @param {string} email
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, error: 'E-mail deve ser uma string' };
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'E-mail é obrigatório' };
  }
  if (trimmed.length > 254) {
    return { valid: false, error: 'E-mail muito longo' };
  }
  // RFC 5322 simplified
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: 'Formato de e-mail inválido' };
  }
  return { valid: true, error: null };
}

/**
 * Validate cart item quantity
 * @param {number} quantity
 * @param {number} [maxStock=99] - Maximum stock available
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateQuantity(quantity, maxStock) {
  if (maxStock === undefined) maxStock = 99;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return { valid: false, error: 'Quantidade deve ser um número inteiro' };
  }
  if (quantity < 1) {
    return { valid: false, error: 'Quantidade mínima é 1' };
  }
  if (quantity > maxStock) {
    return { valid: false, error: 'Estoque insuficiente. Máximo: ' + maxStock };
  }
  return { valid: true, error: null };
}

/**
 * Validate a coupon code format (uppercased, alphanumeric, 4-20 chars)
 * @param {string} code
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateCouponCode(code) {
  if (typeof code !== 'string') {
    return { valid: false, error: 'Código deve ser uma string' };
  }
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Código do cupom é obrigatório' };
  }
  if (trimmed.length < 4) {
    return { valid: false, error: 'Código deve ter no mínimo 4 caracteres' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Código deve ter no máximo 20 caracteres' };
  }
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Código deve conter apenas letras e números' };
  }
  return { valid: true, error: null };
}

/**
 * Validate a Brazilian CEP (postal code)
 * @param {string} cep
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateCEP(cep) {
  if (typeof cep !== 'string') {
    return { valid: false, error: 'CEP deve ser uma string' };
  }
  const digits = cep.replace(/\D/g, '');
  if (digits.length === 0) {
    return { valid: false, error: 'CEP é obrigatório' };
  }
  if (digits.length !== 8) {
    return { valid: false, error: 'CEP deve ter 8 dígitos' };
  }
  if (/^0{8}$/.test(digits)) {
    return { valid: false, error: 'CEP inválido' };
  }
  return { valid: true, error: null };
}

/**
 * Validate a pet collar size selection
 * @param {string} size - One of: PP, P, M, G, GG
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateCollarSize(size) {
  const validSizes = ['PP', 'P', 'M', 'G', 'GG'];
  if (typeof size !== 'string') {
    return { valid: false, error: 'Tamanho deve ser uma string' };
  }
  const upper = size.trim().toUpperCase();
  if (upper.length === 0) {
    return { valid: false, error: 'Selecione um tamanho' };
  }
  if (validSizes.indexOf(upper) === -1) {
    return { valid: false, error: 'Tamanho inválido. Válidos: ' + validSizes.join(', ') };
  }
  return { valid: true, error: null };
}
