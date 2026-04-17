/**
 * AMOPETS — Tests: Cart Reducer & Price Calculation
 * node --test tests/cart.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
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

// ─── Test data ───
const coleira1 = { id: 'col-001', name: 'Coleira Deepblue', price: 69.90 };
const coleira2 = { id: 'col-002', name: 'Coleira Girassol', price: 59.90 };
const coleira3 = { id: 'col-003', name: 'Coleira Sunset LED', price: 89.90 };

// ═══════════════════════════════════════════
// createEmptyCart
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// cartReducer — ADD_ITEM
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// cartReducer — REMOVE_ITEM
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// cartReducer — UPDATE_QUANTITY
// ═══════════════════════════════════════════
describe('cartReducer — UPDATE_QUANTITY', () => {
  it('should update item quantity', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, {
      type: CartActions.UPDATE_QUANTITY,
      payload: { id: 'col-001', quantity: 5 },
    });
    assert.equal(state.items[0].quantity, 5);
  });

  it('should remove item when quantity set to 0', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, {
      type: CartActions.UPDATE_QUANTITY,
      payload: { id: 'col-001', quantity: 0 },
    });
    assert.equal(state.items.length, 0);
  });

  it('should ignore negative quantity', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    const next = cartReducer(state, {
      type: CartActions.UPDATE_QUANTITY,
      payload: { id: 'col-001', quantity: -1 },
    });
    assert.equal(next.items[0].quantity, 1);
  });
});

// ═══════════════════════════════════════════
// cartReducer — COUPON actions
// ═══════════════════════════════════════════
describe('cartReducer — APPLY/REMOVE_COUPON', () => {
  it('should apply a coupon', () => {
    const state = createEmptyCart();
    const next = cartReducer(state, {
      type: CartActions.APPLY_COUPON,
      payload: { code: 'AMOPETS10', rate: 0.10 },
    });
    assert.equal(next.coupon, 'AMOPETS10');
    assert.equal(next.discountRate, 0.10);
  });

  it('should remove coupon', () => {
    let state = createEmptyCart();
    state = cartReducer(state, {
      type: CartActions.APPLY_COUPON,
      payload: { code: 'SAVE', rate: 0.15 },
    });
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

// ═══════════════════════════════════════════
// cartReducer — CLEAR_CART
// ═══════════════════════════════════════════
describe('cartReducer — CLEAR_CART', () => {
  it('should reset to empty state', () => {
    let state = createEmptyCart();
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira1 });
    state = cartReducer(state, { type: CartActions.ADD_ITEM, payload: coleira2 });
    state = cartReducer(state, {
      type: CartActions.APPLY_COUPON,
      payload: { code: 'TEST', rate: 0.1 },
    });
    state = cartReducer(state, { type: CartActions.CLEAR_CART });
    assert.deepEqual(state.items, []);
    assert.equal(state.coupon, null);
    assert.equal(state.discountRate, 0);
  });
});

// ═══════════════════════════════════════════
// cartReducer — Unknown action
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// calculateSubtotal
// ═══════════════════════════════════════════
describe('calculateSubtotal', () => {
  it('should sum items correctly', () => {
    const items = [
      { price: 69.90, quantity: 1 },
      { price: 59.90, quantity: 2 },
    ];
    // 69.90 + 119.80 = 189.70
    const result = calculateSubtotal(items);
    assert.equal(Math.round(result * 100) / 100, 189.70);
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

// ═══════════════════════════════════════════
// calculateDiscount
// ═══════════════════════════════════════════
describe('calculateDiscount', () => {
  it('should calculate 10% discount', () => {
    assert.equal(calculateDiscount(100, 0.10), 10);
  });

  it('should return 0 for 0% rate', () => {
    assert.equal(calculateDiscount(100, 0), 0);
  });

  it('should round to 2 decimal places', () => {
    // 189.70 * 0.10 = 18.97
    assert.equal(calculateDiscount(189.70, 0.10), 18.97);
  });

  it('should return 0 for invalid inputs', () => {
    assert.equal(calculateDiscount('abc', 0.1), 0);
    assert.equal(calculateDiscount(100, -1), 0);
    assert.equal(calculateDiscount(100, 1.5), 0);
  });
});

// ═══════════════════════════════════════════
// calculateShipping
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// calculateCartTotals
// ═══════════════════════════════════════════
describe('calculateCartTotals', () => {
  it('should calculate full totals without coupon', () => {
    const cart = {
      items: [
        { id: '1', price: 69.90, quantity: 1 },
        { id: '2', price: 59.90, quantity: 1 },
      ],
      coupon: null,
      discountRate: 0,
    };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 129.80);
    assert.equal(totals.discount, 0);
    assert.equal(totals.shipping, SHIPPING_COST);
    assert.equal(totals.total, Math.round((129.80 + SHIPPING_COST) * 100) / 100);
    assert.equal(totals.itemCount, 2);
    assert.equal(totals.freeShipping, false);
  });

  it('should calculate with free shipping', () => {
    const cart = {
      items: [
        { id: '1', price: 89.90, quantity: 2 }, // 179.80
      ],
      coupon: null,
      discountRate: 0,
    };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 179.80);
    assert.equal(totals.shipping, 0);
    assert.equal(totals.freeShipping, true);
    assert.equal(totals.total, 179.80);
  });

  it('should calculate with coupon discount', () => {
    const cart = {
      items: [{ id: '1', price: 100, quantity: 2 }], // 200
      coupon: 'AMOPETS10',
      discountRate: 0.10,
    };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 200);
    assert.equal(totals.discount, 20);
    // afterDiscount = 180, shipping = 0 (>= 150)
    assert.equal(totals.shipping, 0);
    assert.equal(totals.total, 180);
    assert.equal(totals.freeShipping, true);
  });

  it('should add shipping when discount drops below threshold', () => {
    const cart = {
      items: [{ id: '1', price: 160, quantity: 1 }], // 160
      coupon: 'BIG',
      discountRate: 0.10, // -16 = 144
    };
    const totals = calculateCartTotals(cart);
    assert.equal(totals.subtotal, 160);
    assert.equal(totals.discount, 16);
    // afterDiscount = 144, below 150, shipping charged
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
