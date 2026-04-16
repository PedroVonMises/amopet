/**
 * AMOPETS — Formatters
 * Pure functions for formatting currency, dates, product names, etc.
 */

/**
 * Format a number as Brazilian Real currency (R$ XX,XX)
 * @param {number} value - The numeric value
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new TypeError('Value must be a valid number');
  }
  if (value < 0) {
    return '-R$ ' + Math.abs(value).toFixed(2).replace('.', ',');
  }
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

/**
 * Format a number as a compact price (no decimals if .00)
 * e.g. 69.90 → "R$ 69,90" / 70.00 → "R$ 70"
 * @param {number} value
 * @returns {string}
 */
function formatPriceCompact(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new TypeError('Value must be a valid number');
  }
  if (value < 0) {
    const abs = Math.abs(value);
    const formatted = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2).replace('.', ',');
    return '-R$ ' + formatted;
  }
  if (value % 1 === 0) {
    return 'R$ ' + value.toFixed(0);
  }
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

/**
 * Format a product name for URL slug
 * e.g. "Coleira Ametista Brilhante" → "coleira-ametista-brilhante"
 * @param {string} name
 * @returns {string}
 */
function formatSlug(name) {
  if (typeof name !== 'string') {
    throw new TypeError('Name must be a string');
  }
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-');            // collapse multiple hyphens
}

/**
 * Format a quantity with unit label
 * e.g. 1 → "1 item", 3 → "3 itens"
 * @param {number} quantity
 * @returns {string}
 */
function formatQuantity(quantity) {
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
    throw new TypeError('Quantity must be a non-negative integer');
  }
  if (quantity === 0) return 'Nenhum item';
  if (quantity === 1) return '1 item';
  return quantity + ' itens';
}

/**
 * Format a phone number for WhatsApp link
 * e.g. "(11) 98765-4321" → "5511987654321"
 * @param {string} phone
 * @returns {string}
 */
function formatWhatsAppNumber(phone) {
  if (typeof phone !== 'string') {
    throw new TypeError('Phone must be a string');
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  return '55' + digits;
}

/**
 * Format a discount percentage label
 * e.g. 0.10 → "10% OFF"
 * @param {number} rate - Discount rate between 0 and 1
 * @returns {string}
 */
function formatDiscount(rate) {
  if (typeof rate !== 'number' || rate < 0 || rate > 1) {
    throw new RangeError('Discount rate must be between 0 and 1');
  }
  const pct = Math.round(rate * 100);
  return pct + '% OFF';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatPriceCompact,
    formatSlug,
    formatQuantity,
    formatWhatsAppNumber,
    formatDiscount,
  };
}
