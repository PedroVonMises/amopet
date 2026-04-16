/**
 * AMOPETS — Cart Reducer & Price Calculation
 * Immutable state management for the shopping cart.
 */

// ─── Action Types ───
var CartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON',
  CLEAR_CART: 'CLEAR_CART',
};

/**
 * Create an empty cart state
 * @returns {object}
 */
function createEmptyCart() {
  return {
    items: [],
    coupon: null,
    discountRate: 0,
  };
}

/**
 * Cart reducer — pure function, returns new state
 * @param {object} state - Current cart state
 * @param {object} action - { type, payload }
 * @returns {object} New cart state
 */
function cartReducer(state, action) {
  if (!state) state = createEmptyCart();

  switch (action.type) {
    case CartActions.ADD_ITEM: {
      var product = action.payload;
      if (!product || !product.id || typeof product.price !== 'number') {
        return state;
      }
      var existingIndex = -1;
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === product.id) {
          existingIndex = i;
          break;
        }
      }
      var newItems;
      if (existingIndex >= 0) {
        newItems = state.items.map(function (item, idx) {
          if (idx === existingIndex) {
            return Object.assign({}, item, { quantity: item.quantity + 1 });
          }
          return item;
        });
      } else {
        newItems = state.items.concat([
          { id: product.id, name: product.name, price: product.price, quantity: 1 },
        ]);
      }
      return Object.assign({}, state, { items: newItems });
    }

    case CartActions.REMOVE_ITEM: {
      var itemId = action.payload;
      return Object.assign({}, state, {
        items: state.items.filter(function (item) {
          return item.id !== itemId;
        }),
      });
    }

    case CartActions.UPDATE_QUANTITY: {
      var _id = action.payload.id;
      var qty = action.payload.quantity;
      if (typeof qty !== 'number' || qty < 0) return state;
      if (qty === 0) {
        return Object.assign({}, state, {
          items: state.items.filter(function (item) {
            return item.id !== _id;
          }),
        });
      }
      return Object.assign({}, state, {
        items: state.items.map(function (item) {
          if (item.id === _id) {
            return Object.assign({}, item, { quantity: qty });
          }
          return item;
        }),
      });
    }

    case CartActions.APPLY_COUPON: {
      var coupon = action.payload;
      if (!coupon || typeof coupon.code !== 'string' || typeof coupon.rate !== 'number') {
        return state;
      }
      return Object.assign({}, state, {
        coupon: coupon.code,
        discountRate: coupon.rate,
      });
    }

    case CartActions.REMOVE_COUPON: {
      return Object.assign({}, state, { coupon: null, discountRate: 0 });
    }

    case CartActions.CLEAR_CART: {
      return createEmptyCart();
    }

    default:
      return state;
  }
}

// ─── Price Calculation ───

var FREE_SHIPPING_THRESHOLD = 150;
var SHIPPING_COST = 14.90;

/**
 * Calculate cart subtotal (before discounts)
 * @param {Array} items
 * @returns {number}
 */
function calculateSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
}

/**
 * Calculate discount value
 * @param {number} subtotal
 * @param {number} discountRate - 0 to 1
 * @returns {number}
 */
function calculateDiscount(subtotal, discountRate) {
  if (typeof subtotal !== 'number' || typeof discountRate !== 'number') return 0;
  if (discountRate < 0 || discountRate > 1) return 0;
  return Math.round(subtotal * discountRate * 100) / 100;
}

/**
 * Calculate shipping cost
 * @param {number} subtotal - After discount
 * @returns {number}
 */
function calculateShipping(subtotal) {
  if (typeof subtotal !== 'number' || subtotal < 0) return SHIPPING_COST;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/**
 * Calculate full cart totals
 * @param {object} cartState
 * @returns {object} { subtotal, discount, shipping, total, itemCount, freeShipping }
 */
function calculateCartTotals(cartState) {
  if (!cartState || !Array.isArray(cartState.items)) {
    return { subtotal: 0, discount: 0, shipping: SHIPPING_COST, total: SHIPPING_COST, itemCount: 0, freeShipping: false };
  }

  var subtotal = calculateSubtotal(cartState.items);
  var discount = calculateDiscount(subtotal, cartState.discountRate || 0);
  var afterDiscount = subtotal - discount;
  var shipping = calculateShipping(afterDiscount);
  var total = afterDiscount + shipping;
  var itemCount = cartState.items.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: itemCount,
    freeShipping: shipping === 0,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CartActions: CartActions,
    createEmptyCart: createEmptyCart,
    cartReducer: cartReducer,
    calculateSubtotal: calculateSubtotal,
    calculateDiscount: calculateDiscount,
    calculateShipping: calculateShipping,
    calculateCartTotals: calculateCartTotals,
    FREE_SHIPPING_THRESHOLD: FREE_SHIPPING_THRESHOLD,
    SHIPPING_COST: SHIPPING_COST,
  };
}
