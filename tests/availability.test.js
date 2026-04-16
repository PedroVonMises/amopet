/**
 * AMOPETS — Tests: Availability
 * node --test tests/availability.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  checkSizeAvailability,
  getAvailableSizes,
  getTotalStock,
  isLowStock,
  getStockStatus,
  canAddToCart,
} = require('../js/utils/availability');

// ─── Test fixtures ───
const fullStock = {
  id: 'col-001',
  sizes: { PP: 5, P: 10, M: 15, G: 8, GG: 3 },
};

const partialStock = {
  id: 'col-002',
  sizes: { PP: 0, P: 2, M: 0, G: 1, GG: 0 },
};

const emptyStock = {
  id: 'col-003',
  sizes: { PP: 0, P: 0, M: 0, G: 0, GG: 0 },
};

const lowStock = {
  id: 'col-004',
  sizes: { PP: 1, P: 3, M: 2, G: 0, GG: 0 },
};

// ═══════════════════════════════════════════
// checkSizeAvailability
// ═══════════════════════════════════════════
describe('checkSizeAvailability', () => {
  it('should return available for in-stock size', () => {
    const result = checkSizeAvailability(fullStock, 'M');
    assert.equal(result.available, true);
    assert.equal(result.stock, 15);
  });

  it('should return unavailable for out-of-stock size', () => {
    const result = checkSizeAvailability(partialStock, 'PP');
    assert.equal(result.available, false);
    assert.equal(result.stock, 0);
  });

  it('should handle case-insensitive size', () => {
    const result = checkSizeAvailability(fullStock, 'gg');
    assert.equal(result.available, true);
    assert.equal(result.stock, 3);
  });

  it('should return unavailable for non-existent size', () => {
    const result = checkSizeAvailability(fullStock, 'XL');
    assert.equal(result.available, false);
    assert.equal(result.stock, 0);
  });

  it('should handle null stockInfo', () => {
    const result = checkSizeAvailability(null, 'M');
    assert.equal(result.available, false);
  });

  it('should handle null size', () => {
    const result = checkSizeAvailability(fullStock, null);
    assert.equal(result.available, false);
  });

  it('should handle missing sizes object', () => {
    const result = checkSizeAvailability({ id: 'x' }, 'M');
    assert.equal(result.available, false);
  });
});

// ═══════════════════════════════════════════
// getAvailableSizes
// ═══════════════════════════════════════════
describe('getAvailableSizes', () => {
  it('should return all sizes for full stock', () => {
    const sizes = getAvailableSizes(fullStock);
    assert.deepEqual(sizes, ['PP', 'P', 'M', 'G', 'GG']);
  });

  it('should return only in-stock sizes', () => {
    const sizes = getAvailableSizes(partialStock);
    assert.deepEqual(sizes, ['P', 'G']);
  });

  it('should return empty array for empty stock', () => {
    assert.deepEqual(getAvailableSizes(emptyStock), []);
  });

  it('should return ordered sizes (PP → GG)', () => {
    const unordered = { id: 'x', sizes: { GG: 1, PP: 1 } };
    assert.deepEqual(getAvailableSizes(unordered), ['PP', 'GG']);
  });

  it('should return empty array for null', () => {
    assert.deepEqual(getAvailableSizes(null), []);
  });
});

// ═══════════════════════════════════════════
// getTotalStock
// ═══════════════════════════════════════════
describe('getTotalStock', () => {
  it('should sum all sizes', () => {
    assert.equal(getTotalStock(fullStock), 41); // 5+10+15+8+3
  });

  it('should ignore zero-stock sizes', () => {
    assert.equal(getTotalStock(partialStock), 3); // 2+1
  });

  it('should return 0 for empty stock', () => {
    assert.equal(getTotalStock(emptyStock), 0);
  });

  it('should return 0 for null', () => {
    assert.equal(getTotalStock(null), 0);
  });

  it('should ignore negative values', () => {
    const bad = { id: 'x', sizes: { M: -5, G: 3 } };
    assert.equal(getTotalStock(bad), 3);
  });
});

// ═══════════════════════════════════════════
// isLowStock
// ═══════════════════════════════════════════
describe('isLowStock', () => {
  it('should return true when stock <= 3 (default threshold)', () => {
    assert.equal(isLowStock(lowStock, 'PP'), true); // stock: 1
    assert.equal(isLowStock(lowStock, 'P'), true);  // stock: 3
    assert.equal(isLowStock(lowStock, 'M'), true);  // stock: 2
  });

  it('should return false when stock > threshold', () => {
    assert.equal(isLowStock(fullStock, 'M'), false); // stock: 15
  });

  it('should return false when out of stock (not "low", it is "out")', () => {
    assert.equal(isLowStock(lowStock, 'G'), false); // stock: 0, not available
  });

  it('should work with custom threshold', () => {
    assert.equal(isLowStock(fullStock, 'PP', 10), true);  // 5 <= 10
    assert.equal(isLowStock(fullStock, 'M', 10), false);  // 15 > 10
  });
});

// ═══════════════════════════════════════════
// getStockStatus
// ═══════════════════════════════════════════
describe('getStockStatus', () => {
  it('should return "available" for normal stock', () => {
    const result = getStockStatus(fullStock, 'M');
    assert.equal(result.status, 'available');
    assert.equal(result.label, 'Em estoque');
  });

  it('should return "low" for low stock', () => {
    const result = getStockStatus(lowStock, 'PP');
    assert.equal(result.status, 'low');
    assert.match(result.label, /Últimas 1 unidades/);
  });

  it('should return "out" for zero stock', () => {
    const result = getStockStatus(emptyStock, 'M');
    assert.equal(result.status, 'out');
    assert.equal(result.label, 'Esgotado');
  });

  it('should return "unknown" for null stockInfo', () => {
    const result = getStockStatus(null, 'M');
    assert.equal(result.status, 'unknown');
    assert.equal(result.label, 'Indisponível');
  });

  it('should return low with count=3', () => {
    const result = getStockStatus(lowStock, 'P'); // stock: 3
    assert.equal(result.status, 'low');
    assert.match(result.label, /3 unidades/);
  });

  it('should return available for stock=4 (above low threshold)', () => {
    const stock = { id: 'x', sizes: { M: 4 } };
    const result = getStockStatus(stock, 'M');
    assert.equal(result.status, 'available');
  });
});

// ═══════════════════════════════════════════
// canAddToCart
// ═══════════════════════════════════════════
describe('canAddToCart', () => {
  it('should allow adding when in stock', () => {
    const result = canAddToCart(fullStock, 'M', 3);
    assert.equal(result.allowed, true);
    assert.equal(result.reason, null);
  });

  it('should deny when no size selected', () => {
    const result = canAddToCart(fullStock, '', 1);
    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'Selecione um tamanho');
  });

  it('should deny when null size', () => {
    const result = canAddToCart(fullStock, null, 1);
    assert.equal(result.allowed, false);
  });

  it('should deny when size is out of stock', () => {
    const result = canAddToCart(partialStock, 'PP', 1);
    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'Tamanho esgotado');
  });

  it('should deny when requested qty exceeds stock', () => {
    const result = canAddToCart(fullStock, 'GG', 5); // only 3 in stock
    assert.equal(result.allowed, false);
    assert.match(result.reason, /3 disponíveis/);
  });

  it('should allow exact stock quantity', () => {
    const result = canAddToCart(fullStock, 'GG', 3);
    assert.equal(result.allowed, true);
  });
});
