/**
 * AMOPETS — Badge Rules
 * Business logic for product badge display.
 */

/**
 * Determine which badge (if any) a product should display.
 * Priority: PROMO > NOVO > POPULAR > ESGOTADO > null
 *
 * @param {object} product
 * @param {string} product.id
 * @param {Date|string} product.createdAt - Date the product was added
 * @param {number} product.salesCount - Total units sold
 * @param {number} [product.stock] - Current stock (0 = out of stock)
 * @param {object|null} [product.promo] - Active promotion { label, rate }
 * @param {Date|string} [now] - Current date (for testing)
 * @returns {{ type: string, label: string } | null}
 */
function getProductBadge(product, now) {
  if (!product || typeof product !== 'object') return null;

  // 1. Out of stock — always takes priority visually as a warning
  if (product.stock !== undefined && product.stock <= 0) {
    return { type: 'soldout', label: 'ESGOTADO' };
  }

  // 2. Active promotion
  if (product.promo && product.promo.label) {
    return { type: 'promo', label: product.promo.label };
  }

  // 3. "NOVO" — product created within the last 30 days
  if (product.createdAt) {
    var currentDate = now ? new Date(now) : new Date();
    var createdDate = new Date(product.createdAt);
    if (!isNaN(createdDate.getTime())) {
      var diffMs = currentDate.getTime() - createdDate.getTime();
      var diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 30) {
        return { type: 'new', label: 'NOVO' };
      }
    }
  }

  // 4. "Popular" — sold more than 50 units
  if (typeof product.salesCount === 'number' && product.salesCount > 50) {
    return { type: 'popular', label: '🔥 Popular' };
  }

  return null;
}

/**
 * Get CSS class for a badge type
 * @param {string} type - Badge type from getProductBadge
 * @returns {string} CSS class name
 */
function getBadgeClass(type) {
  var classMap = {
    new: 'badge--new',
    popular: 'badge--popular',
    promo: 'badge--promo',
    soldout: 'badge--soldout',
  };
  return classMap[type] || '';
}

/**
 * Check if a product qualifies for a "best seller" highlight
 * @param {number} salesCount
 * @param {number} [threshold=100]
 * @returns {boolean}
 */
function isBestSeller(salesCount, threshold) {
  if (threshold === undefined) threshold = 100;
  return typeof salesCount === 'number' && salesCount >= threshold;
}

/**
 * Check if free shipping badge should be shown for a product
 * @param {number} price
 * @param {number} [freeShippingMin=150]
 * @returns {boolean}
 */
function showFreeShippingBadge(price, freeShippingMin) {
  if (freeShippingMin === undefined) freeShippingMin = 150;
  return typeof price === 'number' && price >= freeShippingMin;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getProductBadge: getProductBadge,
    getBadgeClass: getBadgeClass,
    isBestSeller: isBestSeller,
    showFreeShippingBadge: showFreeShippingBadge,
  };
}
