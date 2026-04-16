/**
 * AMOPETS — Tests: Badge Rules
 * node --test tests/badges.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  getProductBadge,
  getBadgeClass,
  isBestSeller,
  showFreeShippingBadge,
} = require('../js/utils/badges');

// ═══════════════════════════════════════════
// getProductBadge
// ═══════════════════════════════════════════
describe('getProductBadge', () => {
  const now = '2026-04-16T12:00:00Z';

  it('should return "NOVO" for product created within 30 days', () => {
    const product = {
      id: 'col-001',
      createdAt: '2026-04-01T00:00:00Z',
      salesCount: 10,
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'new', label: 'NOVO' });
  });

  it('should return "Popular" for > 50 sales (and older than 30 days)', () => {
    const product = {
      id: 'col-002',
      createdAt: '2026-01-01T00:00:00Z', // older than 30 days
      salesCount: 75,
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'popular', label: '🔥 Popular' });
  });

  it('should return null for old product with few sales', () => {
    const product = {
      id: 'col-003',
      createdAt: '2025-12-01T00:00:00Z',
      salesCount: 20,
    };
    const badge = getProductBadge(product, now);
    assert.equal(badge, null);
  });

  it('should prioritize ESGOTADO over everything', () => {
    const product = {
      id: 'col-004',
      createdAt: '2026-04-10T00:00:00Z', // new
      salesCount: 100, // popular
      stock: 0, // out of stock
      promo: { label: 'SALE 20%', rate: 0.2 }, // has promo too
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'soldout', label: 'ESGOTADO' });
  });

  it('should prioritize PROMO over NOVO and Popular', () => {
    const product = {
      id: 'col-005',
      createdAt: '2026-04-10T00:00:00Z', // new
      salesCount: 80, // popular
      stock: 5,
      promo: { label: '🎁 Compre 2 Leve 3', rate: 0.33 },
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'promo', label: '🎁 Compre 2 Leve 3' });
  });

  it('should prioritize NOVO over Popular', () => {
    const product = {
      id: 'col-006',
      createdAt: '2026-04-05T00:00:00Z',
      salesCount: 80,
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'new', label: 'NOVO' });
  });

  it('should handle exactly 30 days old as NOVO', () => {
    const product = {
      id: 'col-007',
      createdAt: '2026-03-17T12:00:00Z', // exactly 30 days before now
      salesCount: 5,
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'new', label: 'NOVO' });
  });

  it('should handle 31 days old as NOT new', () => {
    const product = {
      id: 'col-008',
      createdAt: '2026-03-16T11:00:00Z', // 31 days
      salesCount: 5,
    };
    const badge = getProductBadge(product, now);
    assert.equal(badge, null);
  });

  it('should return null for null product', () => {
    assert.equal(getProductBadge(null), null);
    assert.equal(getProductBadge(undefined), null);
  });

  it('should return null for product without createdAt or salesCount', () => {
    assert.equal(getProductBadge({ id: 'x' }), null);
  });

  it('should handle invalid date gracefully', () => {
    const product = { id: 'x', createdAt: 'not-a-date', salesCount: 5 };
    const badge = getProductBadge(product, now);
    assert.equal(badge, null);
  });

  it('should return "Popular" for exactly 51 sales', () => {
    const product = {
      id: 'col-009',
      createdAt: '2025-01-01T00:00:00Z',
      salesCount: 51,
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'popular', label: '🔥 Popular' });
  });

  it('should NOT return "Popular" for exactly 50 sales', () => {
    const product = {
      id: 'col-010',
      createdAt: '2025-01-01T00:00:00Z',
      salesCount: 50,
    };
    assert.equal(getProductBadge(product, now), null);
  });

  it('should skip stock check when stock is undefined', () => {
    const product = {
      id: 'col-011',
      createdAt: '2026-04-10T00:00:00Z',
      salesCount: 5,
      // stock is undefined — should not be "esgotado"
    };
    const badge = getProductBadge(product, now);
    assert.deepEqual(badge, { type: 'new', label: 'NOVO' });
  });
});

// ═══════════════════════════════════════════
// getBadgeClass
// ═══════════════════════════════════════════
describe('getBadgeClass', () => {
  it('should return correct class for "new"', () => {
    assert.equal(getBadgeClass('new'), 'badge--new');
  });

  it('should return correct class for "popular"', () => {
    assert.equal(getBadgeClass('popular'), 'badge--popular');
  });

  it('should return correct class for "promo"', () => {
    assert.equal(getBadgeClass('promo'), 'badge--promo');
  });

  it('should return correct class for "soldout"', () => {
    assert.equal(getBadgeClass('soldout'), 'badge--soldout');
  });

  it('should return empty string for unknown type', () => {
    assert.equal(getBadgeClass('unknown'), '');
    assert.equal(getBadgeClass(''), '');
  });
});

// ═══════════════════════════════════════════
// isBestSeller
// ═══════════════════════════════════════════
describe('isBestSeller', () => {
  it('should return true for >= 100 sales (default)', () => {
    assert.equal(isBestSeller(100), true);
    assert.equal(isBestSeller(200), true);
  });

  it('should return false for < 100 sales (default)', () => {
    assert.equal(isBestSeller(99), false);
  });

  it('should work with custom threshold', () => {
    assert.equal(isBestSeller(50, 50), true);
    assert.equal(isBestSeller(49, 50), false);
  });

  it('should return false for non-number', () => {
    assert.equal(isBestSeller('100'), false);
    assert.equal(isBestSeller(null), false);
  });
});

// ═══════════════════════════════════════════
// showFreeShippingBadge
// ═══════════════════════════════════════════
describe('showFreeShippingBadge', () => {
  it('should return true for price >= 150', () => {
    assert.equal(showFreeShippingBadge(150), true);
    assert.equal(showFreeShippingBadge(200), true);
  });

  it('should return false for price < 150', () => {
    assert.equal(showFreeShippingBadge(149.99), false);
  });

  it('should work with custom threshold', () => {
    assert.equal(showFreeShippingBadge(100, 100), true);
    assert.equal(showFreeShippingBadge(99, 100), false);
  });

  it('should return false for non-number', () => {
    assert.equal(showFreeShippingBadge('150'), false);
  });
});
