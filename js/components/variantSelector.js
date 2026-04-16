/**
 * AMOPETS — Variant Selector Component Logic
 * Size/color selection with cross-referencing availability.
 */

/**
 * Create initial variant selector state
 * @param {object} product - Product with variants info
 * @returns {object} Variant state
 */
function createVariantState(product) {
  if (!product) return { selectedSize: null, selectedColor: null, variants: [], availableColors: [], availableSizes: [] };
  var variants = Array.isArray(product.variants) ? product.variants : [];
  return {
    selectedSize: null,
    selectedColor: null,
    variants: variants,
    availableColors: _getUniqueValues(variants, 'color'),
    availableSizes: _getUniqueValues(variants, 'size'),
  };
}

/**
 * Select a size — updates available colors based on selected size
 * @param {object} state
 * @param {string} size
 * @returns {object} New state
 */
function selectSize(state, size) {
  if (!state || typeof size !== 'string') return state;
  var s = size.toUpperCase().trim();
  // If same size, deselect
  if (state.selectedSize === s) {
    return Object.assign({}, state, {
      selectedSize: null,
      availableColors: _getUniqueValues(state.variants, 'color'),
    });
  }
  // Filter colors available for this size
  var colorsForSize = state.variants
    .filter(function (v) { return v.size === s && v.stock > 0; })
    .map(function (v) { return v.color; });
  var uniqueColors = colorsForSize.filter(function (c, i) { return colorsForSize.indexOf(c) === i; });
  // If currently selected color is not available in new size, clear it
  var newColor = state.selectedColor;
  if (newColor && uniqueColors.indexOf(newColor) === -1) {
    newColor = null;
  }
  return Object.assign({}, state, {
    selectedSize: s,
    selectedColor: newColor,
    availableColors: uniqueColors,
  });
}

/**
 * Select a color — updates available sizes based on selected color
 * @param {object} state
 * @param {string} color
 * @returns {object} New state
 */
function selectColor(state, color) {
  if (!state || typeof color !== 'string') return state;
  var c = color.toLowerCase().trim();
  // If same color, deselect
  if (state.selectedColor === c) {
    return Object.assign({}, state, {
      selectedColor: null,
      availableSizes: _getUniqueValues(state.variants, 'size'),
    });
  }
  // Filter sizes available for this color
  var sizesForColor = state.variants
    .filter(function (v) { return v.color === c && v.stock > 0; })
    .map(function (v) { return v.size; });
  var uniqueSizes = sizesForColor.filter(function (s, i) { return sizesForColor.indexOf(s) === i; });
  // If currently selected size is not available in new color, clear it
  var newSize = state.selectedSize;
  if (newSize && uniqueSizes.indexOf(newSize) === -1) {
    newSize = null;
  }
  return Object.assign({}, state, {
    selectedColor: c,
    selectedSize: newSize,
    availableSizes: uniqueSizes,
  });
}

/**
 * Get the specific variant matching current selections
 * @param {object} state
 * @returns {object|null} Matching variant or null
 */
function getSelectedVariant(state) {
  if (!state || !state.selectedSize || !state.selectedColor) return null;
  var match = state.variants.find(function (v) {
    return v.size === state.selectedSize && v.color === state.selectedColor;
  });
  return match || null;
}

/**
 * Check if the current selection is complete (both size & color chosen)
 * @param {object} state
 * @returns {boolean}
 */
function isSelectionComplete(state) {
  return state !== null && state.selectedSize !== null && state.selectedColor !== null;
}

/**
 * Get validation state for the variant selector
 * @param {object} state
 * @returns {{ valid: boolean, message: string }}
 */
function getSelectionValidation(state) {
  if (!state) return { valid: false, message: 'Selecione um produto' };
  if (!state.selectedSize && !state.selectedColor) {
    return { valid: false, message: 'Selecione o tamanho e a cor' };
  }
  if (!state.selectedSize) {
    return { valid: false, message: 'Selecione o tamanho' };
  }
  if (!state.selectedColor) {
    return { valid: false, message: 'Selecione a cor' };
  }
  var variant = getSelectedVariant(state);
  if (!variant) {
    return { valid: false, message: 'Combinação indisponível' };
  }
  if (variant.stock <= 0) {
    return { valid: false, message: 'Variante esgotada' };
  }
  return { valid: true, message: 'Pronto para adicionar' };
}

function _getUniqueValues(variants, key) {
  var values = variants.map(function (v) { return v[key]; });
  return values.filter(function (v, i) { return v !== undefined && values.indexOf(v) === i; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createVariantState: createVariantState,
    selectSize: selectSize,
    selectColor: selectColor,
    getSelectedVariant: getSelectedVariant,
    isSelectionComplete: isSelectionComplete,
    getSelectionValidation: getSelectionValidation,
  };
}
