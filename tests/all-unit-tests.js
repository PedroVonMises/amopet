/**
 * ═══════════════════════════════════════════════════════════════
 * AMOPETS — ALL UNIT TESTS (Consolidated)
 * Run: node --test tests/all-unit-tests.js
 *
 * Modules covered:
 *   1. Formatters   (formatCurrency, formatPriceCompact, formatSlug, formatQuantity, formatWhatsAppNumber, formatDiscount)
 *   2. Validators   (validateEmail, validateQuantity, validateCouponCode, validateCEP, validateCollarSize)
 *   3. Cart         (cartReducer, calculateSubtotal, calculateDiscount, calculateShipping, calculateCartTotals)
 *   4. Badges       (getProductBadge, getBadgeClass, isBestSeller, showFreeShippingBadge)
 *   5. Availability (checkSizeAvailability, getAvailableSizes, getTotalStock, isLowStock, getStockStatus, canAddToCart)
 *   6. QueryParams  (parseQueryParams, buildQueryString, parseProductFilters, mergeQueryParams)
 * ═══════════════════════════════════════════════════════════════
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ─── Module imports ───
const {
  formatCurrency,
  formatPriceCompact,
  formatSlug,
  formatQuantity,
  formatWhatsAppNumber,
  formatDiscount,
} = require('../js/utils/formatters');

const {
  validateEmail,
  validateQuantity,
  validateCouponCode,
  validateCEP,
  validateCollarSize,
} = require('../js/utils/validators');

const {
  CartActions,
  createEmptyCart,
  cartReducer,
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateCartTotals,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} = require('../js/utils/cart');

const {
  getProductBadge,
  getBadgeClass,
  isBestSeller,
  showFreeShippingBadge,
} = require('../js/utils/badges');

const {
  checkSizeAvailability,
  getAvailableSizes,
  getTotalStock,
  isLowStock,
  getStockStatus,
  canAddToCart,
} = require('../js/utils/availability');

const {
  parseQueryParams,
  buildQueryString,
  parseProductFilters,
  mergeQueryParams,
} = require('../js/utils/queryParams');


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  1. FORMATTERS                                                ║
   ╚═══════════════════════════════════════════════════════════════╝ */

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

describe('formatSlug', () => {
  it('should create slug from product name', () => {
    assert.equal(formatSlug('Coleira Ametista Brilhante'), 'coleira-ametista-brilhante');
  });
  it('should remove accents', () => {
    assert.equal(formatSlug('Coleção Verão Edição'), 'colecao-verao-edicao');
  });
  it('should remove special characters', () => {
    assert.equal(formatSlug('Coleira (LED) Night!'), 'coleira-led-night');
  });
  it('should collapse multiple spaces/hyphens', () => {
    assert.equal(formatSlug('Coleira   --  Galaxy'), 'coleira-galaxy');
  });
  it('should trim whitespace', () => {
    assert.equal(formatSlug('  Coleira Soft  '), 'coleira-soft');
  });
  it('should handle empty string', () => {
    assert.equal(formatSlug(''), '');
  });
  it('should handle emojis by removing them', () => {
    assert.equal(formatSlug('Night Glow 🌙'), 'night-glow');
  });
  it('should throw TypeError for non-string', () => {
    assert.throws(() => formatSlug(123), TypeError);
  });
});

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


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  2. VALIDATORS                                                ║
   ╚═══════════════════════════════════════════════════════════════╝ */

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

describe('validateQuantity', () => {
  it('should accept valid quantity', () => {
    assert.equal(validateQuantity(3).valid, true);
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


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  3. CART REDUCER & PRICE CALCULATION                          ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const coleira1 = { id: 'col-001', name: 'Coleira Ametista', price: 69.90 };
const coleira2 = { id: 'col-002', name: 'Coleira Girassol', price: 59.90 };
const coleira3 = { id: 'col-003', name: 'Coleira Sunset LED', price: 89.90 };

describe('createEmptyCart', () => {
  it('should return empty state', () => {
    const cart = createEmptyCart();
    assert.deepEqual(cart.items, []);
    assert.equal(cart.coupon, null);
    assert.equal(cart.discountRate, 0);
  });
  it('should return a new object each time', () => {
    const a = createEmptyCart();
    const b = createEmptyCart();
    assert.notEqual(a, b);
  });
});

describe('cartReducer — ADD_ITEM', () => {
  it('should add first item', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    assert.equal(next.items.length, 1);
    assert.equal(next.items[0].id, 'col-001');
    assert.equal(next.items[0].quantity, 1);
    assert.equal(next.items[0].price, 69.90);
  });
  it('should increment quantity on duplicate add', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 2);
  });
  it('should add different items separately', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira2 });
    assert.equal(state.items.length, 2);
  });
  it('should not mutate original state', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    assert.equal(state.items.length, 0);
    assert.equal(next.items.length, 1);
  });
  it('should ignore invalid product (no id)', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: CartActions.ADD_ITEM, payload: { name: 'Bad' } });
    assert.equal(next.items.length, 0);
  });
  it('should ignore invalid product (no price)', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: CartActions.ADD_ITEM, payload: { id: 'x', name: 'X' } });
    assert.equal(next.items.length, 0);
  });
});

describe('cartReducer — REMOVE_ITEM', () => {
  it('should remove an item by id', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira2 });
    state = cartReducer(state, { type: CartActions.REMOVE_ITEM, payload: 'col-001' });
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].id, 'col-002');
  });
  it('should do nothing if item not found', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    const next = cartReducer(state, { type: CartActions.REMOVE_ITEM, payload: 'nonexistent' });
    assert.equal(next.items.length, 1);
  });
});

describe('cartReducer — UPDATE_QUANTITY', () => {
  it('should update item quantity', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.UPDATE_QUANTITY, payload: { id: 'col-001', quantity: 5 } });
    assert.equal(state.items[0].quantity, 5);
  });
  it('should remove item when quantity set to 0', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.UPDATE_QUANTITY, payload: { id: 'col-001', quantity: 0 } });
    assert.equal(state.items.length, 0);
  });
  it('should ignore negative quantity', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    const next = cartReducer(state, { type: CartActions.UPDATE_QUANTITY, payload: { id: 'col-001', quantity: -1 } });
    assert.equal(next.items[0].quantity, 1);
  });
});

describe('cartReducer — APPLY/REMOVE_COUPON', () => {
  it('should apply a coupon', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: CartActions.APPLY_COUPON, payload: { code: 'AMOPETS10', rate: 0.10 } });
    assert.equal(next.coupon, 'AMOPETS10');
    assert.equal(next.discountRate, 0.10);
  });
  it('should remove coupon', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.APPLY_COUPON, payload: { code: 'SAVE', rate: 0.15 } });
    state = cartReducer(state, { type: CartActions.REMOVE_COUPON });
    assert.equal(state.coupon, null);
    assert.equal(state.discountRate, 0);
  });
  it('should ignore invalid coupon payload', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: CartActions.APPLY_COUPON, payload: { code: 'BAD' } });
    assert.equal(next.coupon, null);
  });
});

describe('cartReducer — CLEAR_CART', () => {
  it('should reset to empty state', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira2 });
    state = cartReducer(state, { type: CartActions.APPLY_COUPON, payload: { code: 'TEST', rate: 0.1 } });
    state = cartReducer(state, { type: CartActions.CLEAR_CART });
    assert.deepEqual(state.items, []);
    assert.equal(state.coupon, null);
    assert.equal(state.discountRate, 0);
  });
});

describe('cartReducer — unknown action', () => {
  it('should return same state for unknown action', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, { type: 'UNKNOWN_ACTION' });
    assert.deepEqual(next, state);
  });
  it('should initialize with default state for null', () => {
    const next = cartReducer(null, { type: 'INIT' });
    assert.deepEqual(next.items, []);
  });
});

describe('calculateSubtotal', () => {
  it('should sum items correctly', () => {
    const items = [{ price: 69.90, quantity: 1 }, { price: 59.90, quantity: 2 }];
    assert.equal(Math.round(calculateSubtotal(items) * 100) / 100, 189.70);
  });
  it('should return 0 for empty array', () => {
    assert.equal(calculateSubtotal([]), 0);
  });
  it('should return 0 for non-array', () => {
    assert.equal(calculateSubtotal(null), 0);
    assert.equal(calculateSubtotal(undefined), 0);
  });
  it('should handle single item', () => {
    assert.equal(calculateSubtotal([{ price: 49.90, quantity: 1 }]), 49.90);
  });
});

describe('calculateDiscount', () => {
  it('should calculate 10% discount', () => {
    assert.equal(calculateDiscount(100, 0.10), 10);
  });
  it('should return 0 for 0% rate', () => {
    assert.equal(calculateDiscount(100, 0), 0);
  });
  it('should round to 2 decimal places', () => {
    assert.equal(calculateDiscount(189.70, 0.10), 18.97);
  });
  it('should return 0 for invalid inputs', () => {
    assert.equal(calculateDiscount('abc', 0.1), 0);
    assert.equal(calculateDiscount(100, -1), 0);
    assert.equal(calculateDiscount(100, 1.5), 0);
  });
});

describe('calculateShipping', () => {
  it('should charge shipping below threshold', () => {
    assert.equal(calculateShipping(100), SHIPPING_COST);
  });
  it('should give free shipping at threshold', () => {
    assert.equal(calculateShipping(150), 0);
  });
  it('should give free shipping above threshold', () => {
    assert.equal(calculateShipping(200), 0);
  });
  it('should charge shipping for 0', () => {
    assert.equal(calculateShipping(0), SHIPPING_COST);
  });
  it('should charge shipping for negative (safety)', () => {
    assert.equal(calculateShipping(-10), SHIPPING_COST);
  });
  it('threshold should be R$150', () => {
    assert.equal(FREE_SHIPPING_THRESHOLD, 150);
  });
});

describe('calculateCartTotals', () => {
  it('should calculate full totals without coupon', () => {
    const cart = { items: [{ id: '1', price: 69.90, quantity: 1 }, { id: '2', price: 59.90, quantity: 1 }], coupon: null, discountRate: 0 };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 129.80);
    assert.equal(totals.discount, 0);
    assert.equal(totals.shipping, SHIPPING_COST);
    assert.equal(totals.total, Math.round((129.80 + SHIPPING_COST) * 100) / 100);
    assert.equal(totals.itemCount, 2);
    assert.equal(totals.freeShipping, false);
  });
  it('should calculate with free shipping', () => {
    const cart = { items: [{ id: '1', price: 89.90, quantity: 2 }], coupon: null, discountRate: 0 };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 179.80);
    assert.equal(totals.shipping, 0);
    assert.equal(totals.freeShipping, true);
    assert.equal(totals.total, 179.80);
  });
  it('should calculate with coupon discount', () => {
    const cart = { items: [{ id: '1', price: 100, quantity: 2 }], coupon: 'AMOPETS10', discountRate: 0.10 };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 200);
    assert.equal(totals.discount, 20);
    assert.equal(totals.shipping, 0);
    assert.equal(totals.total, 180);
    assert.equal(totals.freeShipping, true);
  });
  it('should add shipping when discount drops below threshold', () => {
    const cart = { items: [{ id: '1', price: 160, quantity: 1 }], coupon: 'BIG', discountRate: 0.10 };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 160);
    assert.equal(totals.discount, 16);
    assert.equal(totals.shipping, SHIPPING_COST);
    assert.equal(totals.freeShipping, false);
    assert.equal(totals.total, 144 + SHIPPING_COST);
  });
  it('should handle empty cart', () => {
    const totals = calculateCartTotals(createEmptyCart());
    assert.equal(totals.subtotal, 0);
    assert.equal(totals.itemCount, 0);
    assert.equal(totals.shipping, SHIPPING_COST);
  });
  it('should handle null input', () => {
    const totals = calculateCartTotals(null);
    assert.equal(totals.subtotal, 0);
    assert.equal(totals.itemCount, 0);
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  4. BADGES                                                    ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('getProductBadge', () => {
  const now = '2026-04-16T12:00:00Z';
  it('should return "NOVO" for product created within 30 days', () => {
    assert.deepEqual(getProductBadge({ id: 'col-001', createdAt: '2026-04-01T00:00:00Z', salesCount: 10 }, now), { type: 'new', label: 'NOVO' });
  });
  it('should return "Popular" for > 50 sales (and older than 30 days)', () => {
    assert.deepEqual(getProductBadge({ id: 'col-002', createdAt: '2026-01-01T00:00:00Z', salesCount: 75 }, now), { type: 'popular', label: '🔥 Popular' });
  });
  it('should return null for old product with few sales', () => {
    assert.equal(getProductBadge({ id: 'col-003', createdAt: '2025-12-01T00:00:00Z', salesCount: 20 }, now), null);
  });
  it('should prioritize ESGOTADO over everything', () => {
    assert.deepEqual(getProductBadge({ id: 'col-004', createdAt: '2026-04-10T00:00:00Z', salesCount: 100, stock: 0, promo: { label: 'SALE', rate: 0.2 } }, now), { type: 'soldout', label: 'ESGOTADO' });
  });
  it('should prioritize PROMO over NOVO and Popular', () => {
    assert.deepEqual(getProductBadge({ id: 'col-005', createdAt: '2026-04-10T00:00:00Z', salesCount: 80, stock: 5, promo: { label: '🎁 Compre 2 Leve 3', rate: 0.33 } }, now), { type: 'promo', label: '🎁 Compre 2 Leve 3' });
  });
  it('should prioritize NOVO over Popular', () => {
    assert.deepEqual(getProductBadge({ id: 'col-006', createdAt: '2026-04-05T00:00:00Z', salesCount: 80 }, now), { type: 'new', label: 'NOVO' });
  });
  it('should handle exactly 30 days old as NOVO', () => {
    assert.deepEqual(getProductBadge({ id: 'col-007', createdAt: '2026-03-17T12:00:00Z', salesCount: 5 }, now), { type: 'new', label: 'NOVO' });
  });
  it('should handle 31 days old as NOT new', () => {
    assert.equal(getProductBadge({ id: 'col-008', createdAt: '2026-03-16T11:00:00Z', salesCount: 5 }, now), null);
  });
  it('should return null for null product', () => {
    assert.equal(getProductBadge(null), null);
    assert.equal(getProductBadge(undefined), null);
  });
  it('should return null for product without createdAt or salesCount', () => {
    assert.equal(getProductBadge({ id: 'x' }), null);
  });
  it('should handle invalid date gracefully', () => {
    assert.equal(getProductBadge({ id: 'x', createdAt: 'not-a-date', salesCount: 5 }, now), null);
  });
  it('should return "Popular" for exactly 51 sales', () => {
    assert.deepEqual(getProductBadge({ id: 'col-009', createdAt: '2025-01-01T00:00:00Z', salesCount: 51 }, now), { type: 'popular', label: '🔥 Popular' });
  });
  it('should NOT return "Popular" for exactly 50 sales', () => {
    assert.equal(getProductBadge({ id: 'col-010', createdAt: '2025-01-01T00:00:00Z', salesCount: 50 }, now), null);
  });
  it('should skip stock check when stock is undefined', () => {
    assert.deepEqual(getProductBadge({ id: 'col-011', createdAt: '2026-04-10T00:00:00Z', salesCount: 5 }, now), { type: 'new', label: 'NOVO' });
  });
});

describe('getBadgeClass', () => {
  it('should return correct class for "new"', () => { assert.equal(getBadgeClass('new'), 'badge--new'); });
  it('should return correct class for "popular"', () => { assert.equal(getBadgeClass('popular'), 'badge--popular'); });
  it('should return correct class for "promo"', () => { assert.equal(getBadgeClass('promo'), 'badge--promo'); });
  it('should return correct class for "soldout"', () => { assert.equal(getBadgeClass('soldout'), 'badge--soldout'); });
  it('should return empty string for unknown type', () => { assert.equal(getBadgeClass('unknown'), ''); assert.equal(getBadgeClass(''), ''); });
});

describe('isBestSeller', () => {
  it('should return true for >= 100 sales (default)', () => { assert.equal(isBestSeller(100), true); assert.equal(isBestSeller(200), true); });
  it('should return false for < 100 sales (default)', () => { assert.equal(isBestSeller(99), false); });
  it('should work with custom threshold', () => { assert.equal(isBestSeller(50, 50), true); assert.equal(isBestSeller(49, 50), false); });
  it('should return false for non-number', () => { assert.equal(isBestSeller('100'), false); assert.equal(isBestSeller(null), false); });
});

describe('showFreeShippingBadge', () => {
  it('should return true for price >= 150', () => { assert.equal(showFreeShippingBadge(150), true); assert.equal(showFreeShippingBadge(200), true); });
  it('should return false for price < 150', () => { assert.equal(showFreeShippingBadge(149.99), false); });
  it('should work with custom threshold', () => { assert.equal(showFreeShippingBadge(100, 100), true); assert.equal(showFreeShippingBadge(99, 100), false); });
  it('should return false for non-number', () => { assert.equal(showFreeShippingBadge('150'), false); });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  5. AVAILABILITY                                              ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const fullStock = { id: 'col-001', sizes: { PP: 5, P: 10, M: 15, G: 8, GG: 3 } };
const partialStock = { id: 'col-002', sizes: { PP: 0, P: 2, M: 0, G: 1, GG: 0 } };
const emptyStock = { id: 'col-003', sizes: { PP: 0, P: 0, M: 0, G: 0, GG: 0 } };
const lowStockFixture = { id: 'col-004', sizes: { PP: 1, P: 3, M: 2, G: 0, GG: 0 } };

describe('checkSizeAvailability', () => {
  it('should return available for in-stock size', () => { const r = checkSizeAvailability(fullStock, 'M'); assert.equal(r.available, true); assert.equal(r.stock, 15); });
  it('should return unavailable for out-of-stock size', () => { const r = checkSizeAvailability(partialStock, 'PP'); assert.equal(r.available, false); assert.equal(r.stock, 0); });
  it('should handle case-insensitive size', () => { const r = checkSizeAvailability(fullStock, 'gg'); assert.equal(r.available, true); assert.equal(r.stock, 3); });
  it('should return unavailable for non-existent size', () => { assert.equal(checkSizeAvailability(fullStock, 'XL').available, false); });
  it('should handle null stockInfo', () => { assert.equal(checkSizeAvailability(null, 'M').available, false); });
  it('should handle null size', () => { assert.equal(checkSizeAvailability(fullStock, null).available, false); });
  it('should handle missing sizes object', () => { assert.equal(checkSizeAvailability({ id: 'x' }, 'M').available, false); });
});

describe('getAvailableSizes', () => {
  it('should return all sizes for full stock', () => { assert.deepEqual(getAvailableSizes(fullStock), ['PP', 'P', 'M', 'G', 'GG']); });
  it('should return only in-stock sizes', () => { assert.deepEqual(getAvailableSizes(partialStock), ['P', 'G']); });
  it('should return empty array for empty stock', () => { assert.deepEqual(getAvailableSizes(emptyStock), []); });
  it('should return ordered sizes (PP → GG)', () => { assert.deepEqual(getAvailableSizes({ id: 'x', sizes: { GG: 1, PP: 1 } }), ['PP', 'GG']); });
  it('should return empty array for null', () => { assert.deepEqual(getAvailableSizes(null), []); });
});

describe('getTotalStock', () => {
  it('should sum all sizes', () => { assert.equal(getTotalStock(fullStock), 41); });
  it('should ignore zero-stock sizes', () => { assert.equal(getTotalStock(partialStock), 3); });
  it('should return 0 for empty stock', () => { assert.equal(getTotalStock(emptyStock), 0); });
  it('should return 0 for null', () => { assert.equal(getTotalStock(null), 0); });
  it('should ignore negative values', () => { assert.equal(getTotalStock({ id: 'x', sizes: { M: -5, G: 3 } }), 3); });
});

describe('isLowStock', () => {
  it('should return true when stock <= 3 (default)', () => { assert.equal(isLowStock(lowStockFixture, 'PP'), true); assert.equal(isLowStock(lowStockFixture, 'P'), true); assert.equal(isLowStock(lowStockFixture, 'M'), true); });
  it('should return false when stock > threshold', () => { assert.equal(isLowStock(fullStock, 'M'), false); });
  it('should return false when out of stock', () => { assert.equal(isLowStock(lowStockFixture, 'G'), false); });
  it('should work with custom threshold', () => { assert.equal(isLowStock(fullStock, 'PP', 10), true); assert.equal(isLowStock(fullStock, 'M', 10), false); });
});

describe('getStockStatus', () => {
  it('should return "available" for normal stock', () => { const r = getStockStatus(fullStock, 'M'); assert.equal(r.status, 'available'); assert.equal(r.label, 'Em estoque'); });
  it('should return "low" for low stock', () => { const r = getStockStatus(lowStockFixture, 'PP'); assert.equal(r.status, 'low'); assert.match(r.label, /Últimas 1 unidades/); });
  it('should return "out" for zero stock', () => { const r = getStockStatus(emptyStock, 'M'); assert.equal(r.status, 'out'); assert.equal(r.label, 'Esgotado'); });
  it('should return "unknown" for null stockInfo', () => { const r = getStockStatus(null, 'M'); assert.equal(r.status, 'unknown'); assert.equal(r.label, 'Indisponível'); });
  it('should return low with count=3', () => { const r = getStockStatus(lowStockFixture, 'P'); assert.equal(r.status, 'low'); assert.match(r.label, /3 unidades/); });
  it('should return available for stock=4', () => { assert.equal(getStockStatus({ id: 'x', sizes: { M: 4 } }, 'M').status, 'available'); });
});

describe('canAddToCart', () => {
  it('should allow adding when in stock', () => { const r = canAddToCart(fullStock, 'M', 3); assert.equal(r.allowed, true); assert.equal(r.reason, null); });
  it('should deny when no size selected', () => { assert.equal(canAddToCart(fullStock, '', 1).allowed, false); assert.equal(canAddToCart(fullStock, '', 1).reason, 'Selecione um tamanho'); });
  it('should deny when null size', () => { assert.equal(canAddToCart(fullStock, null, 1).allowed, false); });
  it('should deny when size is out of stock', () => { assert.equal(canAddToCart(partialStock, 'PP', 1).allowed, false); assert.equal(canAddToCart(partialStock, 'PP', 1).reason, 'Tamanho esgotado'); });
  it('should deny when requested qty exceeds stock', () => { const r = canAddToCart(fullStock, 'GG', 5); assert.equal(r.allowed, false); assert.match(r.reason, /3 disponíveis/); });
  it('should allow exact stock quantity', () => { assert.equal(canAddToCart(fullStock, 'GG', 3).allowed, true); });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  6. QUERY PARAMS                                              ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('parseQueryParams', () => {
  it('should parse simple key=value pairs', () => { assert.deepEqual(parseQueryParams('?category=coleiras&size=M'), { category: 'coleiras', size: 'M' }); });
  it('should handle query string without leading ?', () => { assert.deepEqual(parseQueryParams('color=roxo&price=69'), { color: 'roxo', price: '69' }); });
  it('should handle empty query string', () => { assert.deepEqual(parseQueryParams(''), {}); assert.deepEqual(parseQueryParams('?'), {}); });
  it('should handle key without value', () => { assert.deepEqual(parseQueryParams('?featured'), { featured: '' }); });
  it('should decode URI components', () => { const r = parseQueryParams('?q=coleira%20ametista&tag=%F0%9F%94%A5'); assert.equal(r.q, 'coleira ametista'); assert.equal(r.tag, '🔥'); });
  it('should handle duplicate keys as arrays', () => { assert.deepEqual(parseQueryParams('?color=roxo&color=amarelo&color=rosa').color, ['roxo', 'amarelo', 'rosa']); });
  it('should handle two duplicate keys as array', () => { assert.deepEqual(parseQueryParams('?size=P&size=M').size, ['P', 'M']); });
  it('should skip empty pairs (double &)', () => { assert.deepEqual(parseQueryParams('?a=1&&b=2'), { a: '1', b: '2' }); });
  it('should handle value with equals sign', () => { assert.equal(parseQueryParams('?formula=a=b').formula, 'a=b'); });
  it('should return empty object for non-string input', () => { assert.deepEqual(parseQueryParams(null), {}); assert.deepEqual(parseQueryParams(123), {}); assert.deepEqual(parseQueryParams(undefined), {}); });
  it('should skip empty key', () => { assert.deepEqual(parseQueryParams('?=value'), {}); });
});

describe('buildQueryString', () => {
  it('should build from simple object', () => { assert.equal(buildQueryString({ category: 'coleiras', size: 'M' }), 'category=coleiras&size=M'); });
  it('should encode special characters', () => { assert.equal(buildQueryString({ q: 'coleira ametista' }), 'q=coleira%20ametista'); });
  it('should handle array values', () => { assert.equal(buildQueryString({ color: ['roxo', 'amarelo'] }), 'color=roxo&color=amarelo'); });
  it('should convert numbers to strings', () => { assert.equal(buildQueryString({ page: 2, price: 69.90 }), 'page=2&price=69.9'); });
  it('should skip null/undefined values', () => { assert.equal(buildQueryString({ a: 'keep', b: null, c: undefined, d: 'also' }), 'a=keep&d=also'); });
  it('should return empty string for empty object', () => { assert.equal(buildQueryString({}), ''); });
  it('should return empty string for null', () => { assert.equal(buildQueryString(null), ''); });
});

describe('parseProductFilters', () => {
  it('should parse full filter query', () => { const r = parseProductFilters('?category=coleiras&size=M&sort=price-asc&page=2&q=ametista'); assert.equal(r.category, 'coleiras'); assert.equal(r.size, 'M'); assert.equal(r.sort, 'price-asc'); assert.equal(r.page, 2); assert.equal(r.search, 'ametista'); });
  it('should default sort to "relevance"', () => { assert.equal(parseProductFilters('?category=coleiras').sort, 'relevance'); });
  it('should default page to 1', () => { assert.equal(parseProductFilters('?category=coleiras').page, 1); });
  it('should parse price range', () => { const r = parseProductFilters('?priceMin=50&priceMax=100'); assert.equal(r.priceMin, 50); assert.equal(r.priceMax, 100); });
  it('should return nulls for missing optional params', () => { const r = parseProductFilters(''); assert.equal(r.category, null); assert.equal(r.size, null); assert.equal(r.color, null); assert.equal(r.priceMin, null); assert.equal(r.priceMax, null); assert.equal(r.search, null); });
  it('should handle "search" as alias for "q"', () => { assert.equal(parseProductFilters('?search=galaxy').search, 'galaxy'); });
  it('should prefer "q" over "search"', () => { assert.equal(parseProductFilters('?q=ametista&search=galaxy').search, 'ametista'); });
  it('should parse float prices', () => { const r = parseProductFilters('?priceMin=49.90&priceMax=89.90'); assert.equal(r.priceMin, 49.90); assert.equal(r.priceMax, 89.90); });
});

describe('mergeQueryParams', () => {
  it('should add new params to existing', () => { const r = mergeQueryParams('?category=coleiras', { size: 'M' }); assert.match(r, /category=coleiras/); assert.match(r, /size=M/); });
  it('should update existing param', () => { assert.equal(mergeQueryParams('?page=1', { page: '2' }), 'page=2'); });
  it('should remove param when set to null', () => { assert.equal(mergeQueryParams('?category=coleiras&size=M', { size: null }), 'category=coleiras'); });
  it('should remove param when set to undefined', () => { assert.equal(mergeQueryParams('?a=1&b=2', { b: undefined }), 'a=1'); });
  it('should handle empty current query', () => { assert.equal(mergeQueryParams('', { page: '1' }), 'page=1'); });
  it('should handle empty updates', () => { assert.equal(mergeQueryParams('?a=1', {}), 'a=1'); });
  it('should handle multiple operations at once', () => { const r = mergeQueryParams('?a=1&b=2&c=3', { a: null, b: '20', d: '4' }); assert.ok(!r.includes('a=')); assert.match(r, /b=20/); assert.match(r, /c=3/); assert.match(r, /d=4/); });
});
