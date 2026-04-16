/**
 * AMOPETS — Mini Cart Component Logic
 * Sidebar cart summary, empty state, totals display.
 */

/**
 * Create mini cart view model from cart state
 * @param {object} cartState - From cart reducer
 * @param {object} totals - From calculateCartTotals
 * @returns {object} Mini cart view model
 */
function createMiniCartViewModel(cartState, totals) {
  if (!cartState || !totals) {
    return {
      isEmpty: true,
      items: [],
      itemCount: 0,
      subtotalFormatted: 'R$ 0,00',
      discountFormatted: null,
      shippingFormatted: '',
      totalFormatted: 'R$ 0,00',
      freeShippingMessage: null,
      couponApplied: null,
    };
  }

  var isEmpty = !cartState.items || cartState.items.length === 0;
  var freeShippingThreshold = 150;
  var amountToFreeShipping = isEmpty ? freeShippingThreshold : Math.max(0, freeShippingThreshold - (totals.subtotal - totals.discount));

  return {
    isEmpty: isEmpty,
    items: (cartState.items || []).map(function (item) {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        lineTotal: Math.round(item.price * item.quantity * 100) / 100,
        lineTotalFormatted: _fmt(item.price * item.quantity),
        priceFormatted: _fmt(item.price),
      };
    }),
    itemCount: totals.itemCount,
    subtotalFormatted: _fmt(totals.subtotal),
    discountFormatted: totals.discount > 0 ? '-' + _fmt(totals.discount) : null,
    shippingFormatted: totals.freeShipping ? 'Grátis' : _fmt(totals.shipping),
    totalFormatted: _fmt(totals.total),
    freeShippingMessage: !totals.freeShipping && amountToFreeShipping > 0
      ? 'Faltam ' + _fmt(amountToFreeShipping) + ' para frete grátis!'
      : totals.freeShipping ? '🎉 Você ganhou frete grátis!' : null,
    couponApplied: cartState.coupon || null,
  };
}

/**
 * Get empty state message
 * @returns {object}
 */
function getEmptyCartMessage() {
  return {
    title: 'Seu carrinho está vazio 🐾',
    description: 'Que tal escolher uma coleira linda pro seu pet?',
    ctaText: 'Ver Coleiras',
    ctaHref: '#products',
  };
}

/**
 * Calculate progress toward free shipping (0 to 1)
 * @param {number} subtotal
 * @param {number} [threshold=150]
 * @returns {number} 0 to 1
 */
function getFreeShippingProgress(subtotal, threshold) {
  var t = typeof threshold === 'number' ? threshold : 150;
  if (typeof subtotal !== 'number' || subtotal <= 0) return 0;
  return Math.min(1, subtotal / t);
}

function _fmt(value) {
  return 'R$ ' + (Math.round(value * 100) / 100).toFixed(2).replace('.', ',');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createMiniCartViewModel: createMiniCartViewModel,
    getEmptyCartMessage: getEmptyCartMessage,
    getFreeShippingProgress: getFreeShippingProgress,
  };
}
