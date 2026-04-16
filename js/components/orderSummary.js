/**
 * AMOPETS — Order Summary Component Logic
 * Build the final order summary view model for checkout.
 */

/**
 * Create order summary view model
 * @param {object} cartState - Cart reducer state
 * @param {object} totals - From calculateCartTotals
 * @param {object} address - Address form state (validated)
 * @param {string} [paymentMethod] - 'pix' | 'card' | 'boleto'
 * @returns {object} Order summary
 */
function createOrderSummary(cartState, totals, address, paymentMethod) {
  if (!cartState || !totals) {
    return { valid: false, error: 'Carrinho vazio' };
  }

  var lineItems = (cartState.items || []).map(function (item) {
    var lineTotal = Math.round(item.price * item.quantity * 100) / 100;
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      unitPriceFormatted: _fmt(item.price),
      lineTotal: lineTotal,
      lineTotalFormatted: _fmt(lineTotal),
    };
  });

  var pixDiscount = paymentMethod === 'pix' ? Math.round(totals.total * 0.05 * 100) / 100 : 0;
  var finalTotal = Math.round((totals.total - pixDiscount) * 100) / 100;

  return {
    valid: true,
    lineItems: lineItems,
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    subtotalFormatted: _fmt(totals.subtotal),
    coupon: cartState.coupon || null,
    discount: totals.discount,
    discountFormatted: totals.discount > 0 ? '-' + _fmt(totals.discount) : null,
    shipping: totals.shipping,
    shippingFormatted: totals.freeShipping ? 'Grátis' : _fmt(totals.shipping),
    freeShipping: totals.freeShipping,
    pixDiscount: pixDiscount,
    pixDiscountFormatted: pixDiscount > 0 ? '-' + _fmt(pixDiscount) : null,
    total: finalTotal,
    totalFormatted: _fmt(finalTotal),
    paymentMethod: paymentMethod || null,
    shippingAddress: address ? _formatAddress(address) : null,
    estimatedDelivery: _getEstimatedDelivery(address),
  };
}

/**
 * Check if the order is ready to be placed
 * @param {object} summary - From createOrderSummary
 * @param {object} address - Address form state
 * @param {string} paymentMethod
 * @returns {{ ready: boolean, issues: string[] }}
 */
function validateOrder(summary, address, paymentMethod) {
  var issues = [];

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
 * @returns {object}
 */
function getPaymentMethodInfo(method) {
  var methods = {
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
function calculateSavings(summary) {
  if (!summary) return { totalSavings: 0, formatted: 'R$ 0,00', breakdown: [] };

  var breakdown = [];
  var totalSavings = 0;

  if (summary.discount > 0) {
    totalSavings += summary.discount;
    breakdown.push('Cupom: -' + _fmt(summary.discount));
  }
  if (summary.freeShipping) {
    totalSavings += 14.90; // default shipping cost
    breakdown.push('Frete grátis: -R$ 14,90');
  }
  if (summary.pixDiscount > 0) {
    totalSavings += summary.pixDiscount;
    breakdown.push('Desconto Pix: -' + _fmt(summary.pixDiscount));
  }

  return {
    totalSavings: Math.round(totalSavings * 100) / 100,
    formatted: _fmt(totalSavings),
    breakdown: breakdown,
  };
}

function _fmt(value) {
  return 'R$ ' + (Math.round(value * 100) / 100).toFixed(2).replace('.', ',');
}

function _formatAddress(address) {
  if (!address) return '';
  var parts = [];
  if (address.street) parts.push(address.street);
  if (address.number) parts.push(address.number);
  if (address.complement) parts.push(address.complement);
  if (address.neighborhood) parts.push(address.neighborhood);
  var cityState = [];
  if (address.city) cityState.push(address.city);
  if (address.state) cityState.push(address.state);
  if (cityState.length) parts.push(cityState.join('/'));
  if (address.cep) parts.push('CEP: ' + address.cep);
  return parts.join(', ');
}

function _getEstimatedDelivery(address) {
  if (!address || !address.state) return null;
  var days = { SP: 3, RJ: 4, MG: 5, PR: 5, SC: 6, RS: 6 };
  var d = days[address.state.toUpperCase()] || 8;
  return d + '-' + (d + 3) + ' dias úteis';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createOrderSummary: createOrderSummary,
    validateOrder: validateOrder,
    getPaymentMethodInfo: getPaymentMethodInfo,
    calculateSavings: calculateSavings,
  };
}
