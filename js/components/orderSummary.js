/**
 * AMOPETS — Order Summary Component Logic
 * Build the final order summary view model for checkout.
 */

import { formatCurrency } from '../utils/formatters.js';
import { SHIPPING_COST } from '../data/coupons.js';

/**
 * Create order summary view model
 * @param {object} cartState
 * @param {object} totals
 * @param {object} address
 * @param {string} [paymentMethod]
 * @returns {object}
 */
export function createOrderSummary(cartState, totals, address, paymentMethod) {
  if (!cartState || !totals) {
    return { valid: false, error: 'Carrinho vazio' };
  }

  const lineItems = (cartState.items || []).map(function (item) {
    const lineTotal = Math.round(item.price * item.quantity * 100) / 100;
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      unitPriceFormatted: formatCurrency(item.price),
      lineTotal: lineTotal,
      lineTotalFormatted: formatCurrency(lineTotal),
    };
  });

  const pixDiscount = paymentMethod === 'pix' ? Math.round(totals.total * 0.05 * 100) / 100 : 0;
  const finalTotal = Math.round((totals.total - pixDiscount) * 100) / 100;

  return {
    valid: true,
    lineItems: lineItems,
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    subtotalFormatted: formatCurrency(totals.subtotal),
    coupon: cartState.coupon || null,
    discount: totals.discount,
    discountFormatted: totals.discount > 0 ? '-' + formatCurrency(totals.discount) : null,
    shipping: totals.shipping,
    shippingFormatted: totals.freeShipping ? 'Grátis' : formatCurrency(totals.shipping),
    freeShipping: totals.freeShipping,
    pixDiscount: pixDiscount,
    pixDiscountFormatted: pixDiscount > 0 ? '-' + formatCurrency(pixDiscount) : null,
    total: finalTotal,
    totalFormatted: formatCurrency(finalTotal),
    paymentMethod: paymentMethod || null,
    shippingAddress: address ? _formatAddress(address) : null,
    estimatedDelivery: _getEstimatedDelivery(address),
  };
}

/**
 * Check if the order is ready to be placed
 * @param {object} summary
 * @param {object} address
 * @param {string} paymentMethod
 * @returns {{ ready: boolean, issues: string[] }}
 */
export function validateOrder(summary, address, paymentMethod) {
  const issues = [];

  if (!summary || !summary.valid) {
    issues.push('Carrinho está vazio');
  }

  if (!address || !address.cep || !address.street || !address.number || !address.city || !address.state) {
    issues.push('Endereço incompleto');
  }

  if (!paymentMethod) {
    issues.push('Selecione uma forma de pagamento');
  } else if (['pix', 'card', 'boleto'].indexOf(paymentMethod) === -1) {
    issues.push('Forma de pagamento inválida');
  }

  return {
    ready: issues.length === 0,
    issues: issues,
  };
}

/**
 * Get payment method display info
 * @param {string} method
 * @returns {object|null}
 */
export function getPaymentMethodInfo(method) {
  const methods = {
    pix: { label: 'Pix', icon: '💲', description: '5% de desconto, aprovação instantânea', discount: true },
    card: { label: 'Cartão de Crédito', icon: '💳', description: 'Até 6x sem juros', discount: false },
    boleto: { label: 'Boleto Bancário', icon: '📄', description: 'Aprovação em até 3 dias úteis', discount: false },
  };
  return methods[method] || null;
}

/**
 * Calculate savings summary
 * @param {object} summary
 * @returns {{ totalSavings: number, formatted: string, breakdown: string[] }}
 */
export function calculateSavings(summary) {
  if (!summary) return { totalSavings: 0, formatted: 'R$ 0,00', breakdown: [] };

  const breakdown = [];
  let totalSavings = 0;

  if (summary.discount > 0) {
    totalSavings += summary.discount;
    breakdown.push('Cupom: -' + formatCurrency(summary.discount));
  }
  if (summary.freeShipping) {
    totalSavings += SHIPPING_COST;
    breakdown.push('Frete grátis: -' + formatCurrency(SHIPPING_COST));
  }
  if (summary.pixDiscount > 0) {
    totalSavings += summary.pixDiscount;
    breakdown.push('Desconto Pix: -' + formatCurrency(summary.pixDiscount));
  }

  return {
    totalSavings: Math.round(totalSavings * 100) / 100,
    formatted: formatCurrency(totalSavings),
    breakdown: breakdown,
  };
}

function _formatAddress(address) {
  if (!address) return '';
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.number) parts.push(address.number);
  if (address.complement) parts.push(address.complement);
  if (address.neighborhood) parts.push(address.neighborhood);
  const cityState = [];
  if (address.city) cityState.push(address.city);
  if (address.state) cityState.push(address.state);
  if (cityState.length) parts.push(cityState.join('/'));
  if (address.cep) parts.push('CEP: ' + address.cep);
  return parts.join(', ');
}

function _getEstimatedDelivery(address) {
  if (!address || !address.state) return null;
  const days = { SP: 3, RJ: 4, MG: 5, PR: 5, SC: 6, RS: 6 };
  const d = days[address.state.toUpperCase()] || 8;
  return d + '-' + (d + 3) + ' dias úteis';
}
