/**
 * AMOPETS — Availability
 * Stock and product availability logic.
 */

/**
 * @typedef {Object} StockInfo
 * @property {string} id - Product ID
 * @property {Object.<string, number>} sizes - Stock per size { PP: 5, P: 10, ... }
 */

/**
 * Check if a product is available in a specific size
 * @param {StockInfo} stockInfo
 * @param {string} size - Collar size (PP, P, M, G, GG)
 * @returns {{ available: boolean, stock: number }}
 */
function checkSizeAvailability(stockInfo, size) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object' || !size) {
    return { available: false, stock: 0 };
  }
  var upperSize = size.toUpperCase().trim();
  var stock = stockInfo.sizes[upperSize];
  if (typeof stock !== 'number' || stock < 0) {
    return { available: false, stock: 0 };
  }
  return { available: stock > 0, stock: stock };
}

/**
 * Get all available sizes for a product
 * @param {StockInfo} stockInfo
 * @returns {string[]} Array of available size codes
 */
function getAvailableSizes(stockInfo) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object') {
    return [];
  }
  var sizeOrder = ['PP', 'P', 'M', 'G', 'GG'];
  return sizeOrder.filter(function (size) {
    return typeof stockInfo.sizes[size] === 'number' && stockInfo.sizes[size] > 0;
  });
}

/**
 * Get total stock across all sizes
 * @param {StockInfo} stockInfo
 * @returns {number}
 */
function getTotalStock(stockInfo) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object') {
    return 0;
  }
  return Object.keys(stockInfo.sizes).reduce(function (sum, size) {
    var val = stockInfo.sizes[size];
    return sum + (typeof val === 'number' && val > 0 ? val : 0);
  }, 0);
}

/**
 * Check if stock is low (below threshold)
 * @param {StockInfo} stockInfo
 * @param {string} size
 * @param {number} [threshold=3]
 * @returns {boolean}
 */
function isLowStock(stockInfo, size, threshold) {
  if (threshold === undefined) threshold = 3;
  var info = checkSizeAvailability(stockInfo, size);
  return info.available && info.stock <= threshold;
}

/**
 * Determine stock status label
 * @param {StockInfo} stockInfo
 * @param {string} size
 * @returns {{ status: string, label: string }}
 *   status: 'available' | 'low' | 'out' | 'unknown'
 */
function getStockStatus(stockInfo, size) {
  if (!stockInfo || typeof stockInfo.sizes !== 'object') {
    return { status: 'unknown', label: 'Indisponível' };
  }
  var info = checkSizeAvailability(stockInfo, size);
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
 * @param {StockInfo} stockInfo
 * @param {string} size
 * @param {number} requestedQty
 * @returns {{ allowed: boolean, reason: string | null }}
 */
function canAddToCart(stockInfo, size, requestedQty) {
  if (!size) {
    return { allowed: false, reason: 'Selecione um tamanho' };
  }
  var info = checkSizeAvailability(stockInfo, size);
  if (!info.available) {
    return { allowed: false, reason: 'Tamanho esgotado' };
  }
  if (requestedQty > info.stock) {
    return { allowed: false, reason: 'Apenas ' + info.stock + ' disponíveis' };
  }
  return { allowed: true, reason: null };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkSizeAvailability: checkSizeAvailability,
    getAvailableSizes: getAvailableSizes,
    getTotalStock: getTotalStock,
    isLowStock: isLowStock,
    getStockStatus: getStockStatus,
    canAddToCart: canAddToCart,
  };
}
