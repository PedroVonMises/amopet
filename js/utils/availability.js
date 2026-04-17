/**
 * AMOPETS — Availability
 * Stock and product availability logic.
 */

/**
 * Check if a product is available in a specific size
 * @param {object} stockInfo
 * @param {string} size
 * @returns {{ available: boolean, stock: number }}
 */
export function checkSizeAvailability(stockInfo, size) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object' || !size) {
    return { available: false, stock: 0 };
  }
  const upperSize = size.toUpperCase().trim();
  const stock = stockInfo.sizes[upperSize];
  if (typeof stock !== 'number' || stock < 0) {
    return { available: false, stock: 0 };
  }
  return { available: stock > 0, stock: stock };
}

/**
 * Get all available sizes for a product
 * @param {object} stockInfo
 * @returns {string[]}
 */
export function getAvailableSizes(stockInfo) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object') {
    return [];
  }
  const sizeOrder = ['PP', 'P', 'M', 'G', 'GG'];
  return sizeOrder.filter(function (size) {
    return typeof stockInfo.sizes[size] === 'number' && stockInfo.sizes[size] > 0;
  });
}

/**
 * Get total stock across all sizes
 * @param {object} stockInfo
 * @returns {number}
 */
export function getTotalStock(stockInfo) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object') {
    return 0;
  }
  return Object.keys(stockInfo.sizes).reduce(function (sum, size) {
    const val = stockInfo.sizes[size];
    return sum + (typeof val === 'number' && val > 0 ? val : 0);
  }, 0);
}

/**
 * Check if stock is low (below threshold)
 * @param {object} stockInfo
 * @param {string} size
 * @param {number} [threshold=3]
 * @returns {boolean}
 */
export function isLowStock(stockInfo, size, threshold) {
  if (threshold === undefined) threshold = 3;
  const info = checkSizeAvailability(stockInfo, size);
  return info.available && info.stock <= threshold;
}

/**
 * Determine stock status label
 * @param {object} stockInfo
 * @param {string} size
 * @returns {{ status: string, label: string }}
 */
export function getStockStatus(stockInfo, size) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object') {
    return { status: 'unknown', label: 'Indisponível' };
  }
  const info = checkSizeAvailability(stockInfo, size);
  if (!info.available) {
    return { status: 'out', label: 'Esgotado' };
  }
  if (info.stock <= 3) {
    return { status: 'low', label: 'Últimas ' + info.stock + ' unidades!' };
  }
  return { status: 'available', label: 'Em estoque' };
}

/**
 * Check if a product can be added to cart
 * @param {object} stockInfo
 * @param {string} size
 * @param {number} requestedQty
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function canAddToCart(stockInfo, size, requestedQty) {
  if (!size) {
    return { allowed: false, reason: 'Selecione um tamanho' };
  }
  const info = checkSizeAvailability(stockInfo, size);
  if (!info.available) {
    return { allowed: false, reason: 'Tamanho esgotado' };
  }
  if (requestedQty > info.stock) {
    return { allowed: false, reason: 'Apenas ' + info.stock + ' disponíveis' };
  }
  return { allowed: true, reason: null };
}
