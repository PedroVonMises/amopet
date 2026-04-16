/**
 * AMOPETS — Tests: Validators
 * node --test tests/validators.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateEmail,
  validateQuantity,
  validateCouponCode,
  validateCEP,
  validateCollarSize,
} = require('../js/utils/validators');

// ═══════════════════════════════════════════
// validateEmail
// ═══════════════════════════════════════════
describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('user@example.com');
    assert.equal(result.valid, true);
    assert.equal(result.error, null);
  });

  it('should accept email with subdomain', () => {
    assert.equal(validateEmail('user@mail.example.com.br').valid, true);
  });

  it('should accept email with dots in local part', () => {
    assert.equal(validateEmail('first.last@example.com').valid, true);
  });

  it('should accept email with plus', () => {
    assert.equal(validateEmail('user+tag@example.com').valid, true);
  });

  it('should reject empty string', () => {
    const result = validateEmail('');
    assert.equal(result.valid, false);
    assert.equal(result.error, 'E-mail é obrigatório');
  });

  it('should reject whitespace-only', () => {
    assert.equal(validateEmail('   ').valid, false);
  });

  it('should reject missing @', () => {
    const result = validateEmail('userexample.com');
    assert.equal(result.valid, false);
    assert.equal(result.error, 'Formato de e-mail inválido');
  });

  it('should reject missing domain', () => {
    assert.equal(validateEmail('user@').valid, false);
  });

  it('should reject missing TLD', () => {
    assert.equal(validateEmail('user@example').valid, false);
  });

  it('should reject single-char TLD', () => {
    assert.equal(validateEmail('user@example.c').valid, false);
  });

  it('should reject spaces in email', () => {
    assert.equal(validateEmail('user @example.com').valid, false);
  });

  it('should reject non-string input', () => {
    assert.equal(validateEmail(123).valid, false);
    assert.equal(validateEmail(null).valid, false);
  });

  it('should reject excessively long email (>254 chars)', () => {
    const longEmail = 'a'.repeat(250) + '@b.co';
    const result = validateEmail(longEmail);
    assert.equal(result.valid, false);
    assert.equal(result.error, 'E-mail muito longo');
  });

  it('should trim whitespace before validating', () => {
    assert.equal(validateEmail('  user@example.com  ').valid, true);
  });
});

// ═══════════════════════════════════════════
// validateQuantity
// ═══════════════════════════════════════════
describe('validateQuantity', () => {
  it('should accept valid quantity', () => {
    const result = validateQuantity(3);
    assert.equal(result.valid, true);
  });

  it('should accept max stock', () => {
    assert.equal(validateQuantity(10, 10).valid, true);
  });

  it('should reject zero', () => {
    const result = validateQuantity(0);
    assert.equal(result.valid, false);
    assert.equal(result.error, 'Quantidade mínima é 1');
  });

  it('should reject negative', () => {
    assert.equal(validateQuantity(-1).valid, false);
  });

  it('should reject exceeding stock', () => {
    const result = validateQuantity(5, 3);
    assert.equal(result.valid, false);
    assert.match(result.error, /Máximo: 3/);
  });

  it('should reject float', () => {
    assert.equal(validateQuantity(2.5).valid, false);
  });

  it('should reject string', () => {
    assert.equal(validateQuantity('3').valid, false);
  });

  it('should use default maxStock of 99', () => {
    assert.equal(validateQuantity(99).valid, true);
    assert.equal(validateQuantity(100).valid, false);
  });
});

// ═══════════════════════════════════════════
// validateCouponCode
// ═══════════════════════════════════════════
describe('validateCouponCode', () => {
  it('should accept valid coupon', () => {
    assert.equal(validateCouponCode('AMOPETS10').valid, true);
  });

  it('should accept 4-char minimum', () => {
    assert.equal(validateCouponCode('SAVE').valid, true);
  });

  it('should accept numeric coupons', () => {
    assert.equal(validateCouponCode('2025').valid, true);
  });

  it('should reject short coupon (<4)', () => {
    const result = validateCouponCode('ABC');
    assert.equal(result.valid, false);
    assert.match(result.error, /mínimo 4/);
  });

  it('should reject long coupon (>20)', () => {
    const result = validateCouponCode('A'.repeat(21));
    assert.equal(result.valid, false);
    assert.match(result.error, /máximo 20/);
  });

  it('should reject special characters', () => {
    assert.equal(validateCouponCode('SAVE-10%').valid, false);
  });

  it('should reject empty string', () => {
    assert.equal(validateCouponCode('').valid, false);
  });

  it('should reject non-string', () => {
    assert.equal(validateCouponCode(123).valid, false);
  });
});

// ═══════════════════════════════════════════
// validateCEP
// ═══════════════════════════════════════════
describe('validateCEP', () => {
  it('should accept valid CEP with digits only', () => {
    assert.equal(validateCEP('01310100').valid, true);
  });

  it('should accept CEP with hyphen', () => {
    assert.equal(validateCEP('01310-100').valid, true);
  });

  it('should reject short CEP', () => {
    const result = validateCEP('0131');
    assert.equal(result.valid, false);
    assert.match(result.error, /8 dígitos/);
  });

  it('should reject long CEP', () => {
    assert.equal(validateCEP('013101001').valid, false);
  });

  it('should reject all zeros', () => {
    assert.equal(validateCEP('00000000').valid, false);
  });

  it('should reject empty', () => {
    assert.equal(validateCEP('').valid, false);
  });

  it('should reject non-string', () => {
    assert.equal(validateCEP(1310100).valid, false);
  });
});

// ═══════════════════════════════════════════
// validateCollarSize
// ═══════════════════════════════════════════
describe('validateCollarSize', () => {
  it('should accept PP', () => {
    assert.equal(validateCollarSize('PP').valid, true);
  });

  it('should accept P', () => {
    assert.equal(validateCollarSize('P').valid, true);
  });

  it('should accept M', () => {
    assert.equal(validateCollarSize('M').valid, true);
  });

  it('should accept G', () => {
    assert.equal(validateCollarSize('G').valid, true);
  });

  it('should accept GG', () => {
    assert.equal(validateCollarSize('GG').valid, true);
  });

  it('should accept lowercase and trim', () => {
    assert.equal(validateCollarSize(' m ').valid, true);
    assert.equal(validateCollarSize('gg').valid, true);
  });

  it('should reject invalid sizes', () => {
    assert.equal(validateCollarSize('XL').valid, false);
    assert.equal(validateCollarSize('XS').valid, false);
    assert.equal(validateCollarSize('Large').valid, false);
  });

  it('should reject empty string', () => {
    const result = validateCollarSize('');
    assert.equal(result.valid, false);
    assert.equal(result.error, 'Selecione um tamanho');
  });

  it('should reject non-string', () => {
    assert.equal(validateCollarSize(42).valid, false);
  });
});
