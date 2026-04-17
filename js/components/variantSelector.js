/**
 * AMOPETS — Variant Selector Component Logic
 * Size/color selection with cross-referencing availability.
 */

/**
 * Create initial variant selector state
 * @param {object} product
 * @returns {object}
 */
export function createVariantState(product) {
  if (!product) return { selectedSize: null, selectedColor: null, variants: [], availableColors: [], availableSizes: [] };
  const variants = Array.isArray(product.variants) ? product.variants : [];
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
 * @returns {object}
 */
export function selectSize(state, size) {
  if (!state || typeof size !== 'string') return state;
  const s = size.toUpperCase().trim();
  if (state.selectedSize === s) {
    return Object.assign({}, state, {
      selectedSize: null,
      availableColors: _getUniqueValues(state.variants, 'color'),
    });
  }
  const colorsForSize = state.variants
    .filter(function (v) { return v.size === s && v.stock > 0; })
    .map(function (v) { return v.color; });
  const uniqueColors = colorsForSize.filter(function (c, i) { return colorsForSize.indexOf(c) === i; });
  let newColor = state.selectedColor;
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
 * @returns {object}
 */
export function selectColor(state, color) {
  if (!state || typeof color !== 'string') return state;
  const c = color.toLowerCase().trim();
  if (state.selectedColor === c) {
    return Object.assign({}, state, {
      selectedColor: null,
      availableSizes: _getUniqueValues(state.variants, 'size'),
    });
  }
  const sizesForColor = state.variants
    .filter(function (v) { return v.color === c && v.stock > 0; })
    .map(function (v) { return v.size; });
  const uniqueSizes = sizesForColor.filter(function (s, i) { return sizesForColor.indexOf(s) === i; });
  let newSize = state.selectedSize;
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
 * @returns {object|null}
 */
export function getSelectedVariant(state) {
  if (!state || !state.selectedSize || !state.selectedColor) return null;
  const match = state.variants.find(function (v) {
    return v.size === state.selectedSize && v.color === state.selectedColor;
  });
  return match || null;
}

/**
 * Check if the current selection is complete
 * @param {object} state
 * @returns {boolean}
 */
export function isSelectionComplete(state) {
  return state !== null && state.selectedSize !== null && state.selectedColor !== null;
}

/**
 * Get validation state for the variant selector
 * @param {object} state
 * @returns {{ valid: boolean, message: string }}
 */
export function getSelectionValidation(state) {
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
  const variant = getSelectedVariant(state);
  if (!variant) {
    return { valid: false, message: 'Combinação indisponível' };
  }
  if (variant.stock <= 0) {
    return { valid: false, message: 'Variante esgotada' };
  }
  return { valid: true, message: 'Pronto para adicionar' };
}

function _getUniqueValues(variants, key) {
  const values = variants.map(function (v) { return v[key]; });
  return values.filter(function (v, i) { return v !== undefined && values.indexOf(v) === i; });
}
