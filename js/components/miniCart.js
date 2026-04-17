/**
 * AMOPETS — Mini Cart Component Logic
 * Sidebar cart summary, empty state, totals display.
 */

import { formatCurrency } from '../utils/formatters.js';
import { FREE_SHIPPING_THRESHOLD } from '../data/coupons.js';

/**
 * Create mini cart view model from cart state
 * @param {object} cartState
 * @param {object} totals
 * @returns {object}
 */
export function createMiniCartViewModel(cartState, totals) {
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

  const isEmpty = !cartState.items || cartState.items.length === 0;
  const amountToFreeShipping = isEmpty ? FREE_SHIPPING_THRESHOLD : Math.max(0, FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.discount));

  return {
    isEmpty: isEmpty,
    items: (cartState.items || []).map(function (item) {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null,
        lineTotal: Math.round(item.price * item.quantity * 100) / 100,
        lineTotalFormatted: formatCurrency(item.price * item.quantity),
        priceFormatted: formatCurrency(item.price),
      };
    }),
    itemCount: totals.itemCount,
    subtotalFormatted: formatCurrency(totals.subtotal),
    discountFormatted: totals.discount > 0 ? '-' + formatCurrency(totals.discount) : null,
    shippingFormatted: totals.freeShipping ? 'Grátis' : formatCurrency(totals.shipping),
    totalFormatted: formatCurrency(totals.total),
    freeShippingMessage: !totals.freeShipping && amountToFreeShipping > 0
      ? 'Faltam ' + formatCurrency(amountToFreeShipping) + ' para frete grátis!'
      : totals.freeShipping ? '🎉 Você ganhou frete grátis!' : null,
    couponApplied: cartState.coupon || null,
  };
}

/**
 * Get empty state message
 * @returns {object}
 */
export function getEmptyCartMessage() {
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
 * @param {number} [threshold]
 * @returns {number}
 */
export function getFreeShippingProgress(subtotal, threshold) {
  const t = typeof threshold === 'number' ? threshold : FREE_SHIPPING_THRESHOLD;
  if (typeof subtotal !== 'number' || subtotal <= 0) return 0;
  return Math.min(1, subtotal / t);
}
