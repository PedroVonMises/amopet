/**
 * AMOPETS — Tests: Formatters
 * node --test tests/formatters.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  formatCurrency,
  formatPriceCompact,
  formatSlug,
  formatQuantity,
  formatWhatsAppNumber,
  formatDiscount,
} = require('../js/utils/formatters');

// ═══════════════════════════════════════════
// formatCurrency
// ═══════════════════════════════════════════
describe('formatCurrency', () => {
  it('should format a normal price', () => {
    assert.equal(formatCurrency(69.9), 'R$ 69,90');
  });

  it('should format zero', () => {
    assert.equal(formatCurrency(0), 'R$ 0,00');
  });

  it('should format integer prices with decimals', () => {
    assert.equal(formatCurrency(50), 'R$ 50,00');
  });

  it('should format large values', () => {
    assert.equal(formatCurrency(1299.99), 'R$ 1299,99');
  });

  it('should format negative values with minus sign', () => {
    assert.equal(formatCurrency(-15.5), '-R$ 15,50');
  });

  it('should round to 2 decimal places', () => {
    assert.equal(formatCurrency(49.999), 'R$ 50,00');
  });

  it('should throw TypeError for non-number', () => {
    assert.throws(() => formatCurrency('abc'), TypeError);
    assert.throws(() => formatCurrency(null), TypeError);
    assert.throws(() => formatCurrency(undefined), TypeError);
    assert.throws(() => formatCurrency(NaN), TypeError);
  });
});

// ═══════════════════════════════════════════
// formatPriceCompact
// ═══════════════════════════════════════════
describe('formatPriceCompact', () => {
  it('should remove decimals when .00', () => {
    assert.equal(formatPriceCompact(70), 'R$ 70');
  });

  it('should keep decimals otherwise', () => {
    assert.equal(formatPriceCompact(69.9), 'R$ 69,90');
  });

  it('should format 0 as compact', () => {
    assert.equal(formatPriceCompact(0), 'R$ 0');
  });

  it('should handle negative compact', () => {
    assert.equal(formatPriceCompact(-100), '-R$ 100');
    assert.equal(formatPriceCompact(-79.9), '-R$ 79,90');
  });

  it('should throw TypeError for invalid input', () => {
    assert.throws(() => formatPriceCompact('50'), TypeError);
  });
});

// ═══════════════════════════════════════════
// formatSlug
// ═══════════════════════════════════════════
describe('formatSlug', () => {
  it('should create slug from product name', () => {
    assert.equal(formatSlug('Coleira Deepblue'), 'coleira-deepblue');
  });

  it('should remove accents', () => {
    assert.equal(formatSlug('Coleção Verão Edição'), 'colecao-verao-edicao');
  });

  it('should remove special characters', () => {
    assert.equal(formatSlug('Coleira (LED) Night!'), 'coleira-led-night');
  });

  it('should collapse multiple spaces/hyphens', () => {
    assert.equal(formatSlug('Coleira   --  Deepgreen'), 'coleira-deepgreen');
  });

  it('should trim whitespace', () => {
    assert.equal(formatSlug('  Coleira Soft  '), 'coleira-soft');
  });

  it('should handle empty string', () => {
    assert.equal(formatSlug(''), '');
  });

  it('should handle emojis by removing them', () => {
    assert.equal(formatSlug('Gradient 🌈'), 'gradient');
  });

  it('should throw TypeError for non-string', () => {
    assert.throws(() => formatSlug(123), TypeError);
  });
});

// ═══════════════════════════════════════════
// formatQuantity
// ═══════════════════════════════════════════
describe('formatQuantity', () => {
  it('should format zero items', () => {
    assert.equal(formatQuantity(0), 'Nenhum item');
  });

  it('should format singular', () => {
    assert.equal(formatQuantity(1), '1 item');
  });

  it('should format plural', () => {
    assert.equal(formatQuantity(5), '5 itens');
  });

  it('should handle large quantities', () => {
    assert.equal(formatQuantity(100), '100 itens');
  });

  it('should throw for negative numbers', () => {
    assert.throws(() => formatQuantity(-1), TypeError);
  });

  it('should throw for floats', () => {
    assert.throws(() => formatQuantity(2.5), TypeError);
  });

  it('should throw for non-numbers', () => {
    assert.throws(() => formatQuantity('3'), TypeError);
  });
});

// ═══════════════════════════════════════════
// formatWhatsAppNumber
// ═══════════════════════════════════════════
describe('formatWhatsAppNumber', () => {
  it('should format a standard phone number', () => {
    assert.equal(formatWhatsAppNumber('(11) 98765-4321'), '5511987654321');
  });

  it('should not double-add country code', () => {
    assert.equal(formatWhatsAppNumber('5511987654321'), '5511987654321');
  });

  it('should handle plain digits', () => {
    assert.equal(formatWhatsAppNumber('21999887766'), '5521999887766');
  });

  it('should throw for non-string', () => {
    assert.throws(() => formatWhatsAppNumber(11987654321), TypeError);
  });
});

// ═══════════════════════════════════════════
// formatDiscount
// ═══════════════════════════════════════════
describe('formatDiscount', () => {
  it('should format 10% discount', () => {
    assert.equal(formatDiscount(0.10), '10% OFF');
  });

  it('should format 50% discount', () => {
    assert.equal(formatDiscount(0.5), '50% OFF');
  });

  it('should format 0% (no discount)', () => {
    assert.equal(formatDiscount(0), '0% OFF');
  });

  it('should format 100% discount', () => {
    assert.equal(formatDiscount(1), '100% OFF');
  });

  it('should throw RangeError for value > 1', () => {
    assert.throws(() => formatDiscount(1.5), RangeError);
  });

  it('should throw RangeError for negative value', () => {
    assert.throws(() => formatDiscount(-0.1), RangeError);
  });
});
