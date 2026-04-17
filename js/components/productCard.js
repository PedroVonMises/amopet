/**
 * AMOPETS — Product Card Component Logic
 * Data transformation and state management for product cards.
 */

import { formatSlug, calculateInstallments } from '../utils/formatters.js';

export function _calculateInstallments(price) {
  return calculateInstallments(price);
}

/**
 * Transform raw product data into the shape needed by the card UI
 * @param {object} product
 * @returns {object}
 */
export function createCardViewModel(product) {
  if (!product || typeof product !== 'object') {
    throw new TypeError('Product is required');
  }
  if (!product.id || !product.name || typeof product.price !== 'number') {
    throw new TypeError('Product must have id, name, and numeric price');
  }

  const basePrice = product.price;
  const hasPromo = !!(product.promo && typeof product.promo.rate === 'number' && product.promo.rate > 0);
  const finalPrice = hasPromo ? Math.round(basePrice * (1 - product.promo.rate) * 100) / 100 : basePrice;
  const savings = hasPromo ? Math.round((basePrice - finalPrice) * 100) / 100 : 0;

  return {
    id: product.id,
    name: product.name,
    slug: formatSlug(product.name),
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
 * Get interactive state for a product card
 * @param {boolean} isHovered
 * @param {boolean} isFocused
 * @param {boolean} isAddingToCart
 * @returns {object}
 */
export function getCardInteractiveState(isHovered, isFocused, isAddingToCart) {
  return {
    isElevated: isHovered || isFocused,
    showQuickAdd: (isHovered || isFocused) && !isAddingToCart,
    isAnimating: isAddingToCart,
    ariaExpanded: isHovered || isFocused,
  };
}

/**
 * Determine which images to show in a product card
 * @param {object} product
 * @param {string} [selectedColor]
 * @returns {{ primary: string, hover: string | null }}
 */
export function getCardImages(product, selectedColor) {
  if (!product || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return { primary: '', hover: null };
  }

  if (selectedColor && product.colorImages && product.colorImages[selectedColor]) {
    const colorImgs = product.colorImages[selectedColor];
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
