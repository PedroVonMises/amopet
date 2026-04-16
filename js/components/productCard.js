/**
 * AMOPETS — Product Card Component Logic
 * Data transformation and state management for product cards.
 */

/**
 * Transform raw product data into the shape needed by the card UI
 * @param {object} product - Raw product data from API/DB
 * @returns {object} Transformed card view model
 */
function createCardViewModel(product) {
  if (!product || typeof product !== 'object') {
    throw new TypeError('Product is required');
  }
  if (!product.id || !product.name || typeof product.price !== 'number') {
    throw new TypeError('Product must have id, name, and numeric price');
  }

  var basePrice = product.price;
  var hasPromo = product.promo && typeof product.promo.rate === 'number' && product.promo.rate > 0;
  var finalPrice = hasPromo ? Math.round(basePrice * (1 - product.promo.rate) * 100) / 100 : basePrice;
  var savings = hasPromo ? Math.round((basePrice - finalPrice) * 100) / 100 : 0;

  return {
    id: product.id,
    name: product.name,
    slug: _slugify(product.name),
    imageUrl: product.imageUrl || null,
    imageAlt: product.imageAlt || product.name,
    basePrice: basePrice,
    finalPrice: finalPrice,
    hasDiscount: hasPromo,
    savings: savings,
    installments: _calculateInstallments(finalPrice),
    isAvailable: product.stock === undefined || product.stock > 0,
    rating: typeof product.rating === 'number' ? Math.min(5, Math.max(0, product.rating)) : null,
    reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : 0,
  };
}

/**
 * Calculate installment options
 * @param {number} price
 * @returns {{ count: number, value: number, hasFees: boolean } | null}
 */
function _calculateInstallments(price) {
  if (price <= 0) return null;
  if (price < 30) return null; // Min for installments
  var maxInstallments = price < 100 ? 2 : price < 200 ? 3 : 6;
  var installmentValue = Math.round((price / maxInstallments) * 100) / 100;
  return {
    count: maxInstallments,
    value: installmentValue,
    hasFees: false,
  };
}

/**
 * Get interactive state for a product card
 * @param {boolean} isHovered
 * @param {boolean} isFocused
 * @param {boolean} isAddingToCart
 * @returns {object} State flags for UI rendering
 */
function getCardInteractiveState(isHovered, isFocused, isAddingToCart) {
  return {
    isElevated: isHovered || isFocused,
    showQuickAdd: (isHovered || isFocused) && !isAddingToCart,
    isAnimating: isAddingToCart,
    ariaExpanded: isHovered || isFocused,
  };
}

/**
 * Determine which images to show in a product card (with color variants)
 * @param {object} product
 * @param {string} [selectedColor]
 * @returns {{ primary: string, hover: string | null }}
 */
function getCardImages(product, selectedColor) {
  if (!product || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return { primary: '', hover: null };
  }

  if (selectedColor && product.colorImages && product.colorImages[selectedColor]) {
    var colorImgs = product.colorImages[selectedColor];
    return {
      primary: colorImgs[0] || product.images[0],
      hover: colorImgs[1] || null,
    };
  }

  return {
    primary: product.images[0],
    hover: product.images.length > 1 ? product.images[1] : null,
  };
}

function _slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createCardViewModel: createCardViewModel,
    getCardInteractiveState: getCardInteractiveState,
    getCardImages: getCardImages,
    _calculateInstallments: _calculateInstallments,
  };
}
