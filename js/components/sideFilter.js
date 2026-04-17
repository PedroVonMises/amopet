/**
 * AMOPETS — Side Filter Component Logic
 * Filter state management, active filters, price range.
 */

export const VALID_SORT_OPTIONS = ['relevance', 'price-asc', 'price-desc', 'newest', 'popular'];
export const VALID_SIZES = ['PP', 'P', 'M', 'G', 'GG'];
export const VALID_CATEGORIES = ['coleiras', 'coleiras-led', 'coleiras-couro', 'coleiras-nylon'];

/**
 * Create initial filter state
 * @returns {object}
 */
export function createFilterState() {
  return {
    categories: [],
    sizes: [],
    colors: [],
    priceRange: { min: null, max: null },
    sort: 'relevance',
    search: '',
    petType: null,
  };
}

/**
 * Toggle a category filter
 * @param {object} state
 * @param {string} category
 * @returns {object}
 */
export function toggleCategory(state, category) {
  if (!state || typeof category !== 'string') return state;
  const cat = category.toLowerCase().trim();
  const idx = state.categories.indexOf(cat);
  const newCats = idx >= 0
    ? state.categories.filter(function (c) { return c !== cat; })
    : state.categories.concat([cat]);
  return Object.assign({}, state, { categories: newCats });
}

/**
 * Toggle a size filter
 * @param {object} state
 * @param {string} size
 * @returns {object}
 */
export function toggleSize(state, size) {
  if (!state || typeof size !== 'string') return state;
  const s = size.toUpperCase().trim();
  if (VALID_SIZES.indexOf(s) === -1) return state;
  const idx = state.sizes.indexOf(s);
  const newSizes = idx >= 0
    ? state.sizes.filter(function (x) { return x !== s; })
    : state.sizes.concat([s]);
  return Object.assign({}, state, { sizes: newSizes });
}

/**
 * Toggle a color filter
 * @param {object} state
 * @param {string} color
 * @returns {object}
 */
export function toggleColor(state, color) {
  if (!state || typeof color !== 'string') return state;
  const c = color.toLowerCase().trim();
  if (c.length === 0) return state;
  const idx = state.colors.indexOf(c);
  const newColors = idx >= 0
    ? state.colors.filter(function (x) { return x !== c; })
    : state.colors.concat([c]);
  return Object.assign({}, state, { colors: newColors });
}

/**
 * Set price range
 * @param {object} state
 * @param {number|null} min
 * @param {number|null} max
 * @returns {object}
 */
export function setPriceRange(state, min, max) {
  if (!state) return state;
  const cleanMin = (typeof min === 'number' && min >= 0) ? min : null;
  const cleanMax = (typeof max === 'number' && max > 0) ? max : null;
  if (cleanMin !== null && cleanMax !== null && cleanMin > cleanMax) {
    return state;
  }
  return Object.assign({}, state, {
    priceRange: { min: cleanMin, max: cleanMax },
  });
}

/**
 * Set sort option
 * @param {object} state
 * @param {string} sortBy
 * @returns {object}
 */
export function setSort(state, sortBy) {
  if (!state || VALID_SORT_OPTIONS.indexOf(sortBy) === -1) return state;
  return Object.assign({}, state, { sort: sortBy });
}

/**
 * Set search term
 * @param {object} state
 * @param {string} term
 * @returns {object}
 */
export function setSearch(state, term) {
  if (!state) return state;
  return Object.assign({}, state, { search: typeof term === 'string' ? term.trim() : '' });
}

/**
 * Set pet type filter
 * @param {object} state
 * @param {string|null} petType
 * @returns {object}
 */
export function setPetType(state, petType) {
  if (!state) return state;
  const valid = [null, 'dog', 'cat'];
  if (valid.indexOf(petType) === -1) return state;
  return Object.assign({}, state, { petType: petType });
}

/**
 * Clear all filters
 * @returns {object}
 */
export function clearAllFilters() {
  return createFilterState();
}

/**
 * Get count of active filters
 * @param {object} state
 * @returns {number}
 */
export function getActiveFilterCount(state) {
  if (!state) return 0;
  let count = 0;
  count += state.categories.length;
  count += state.sizes.length;
  count += state.colors.length;
  if (state.priceRange.min !== null || state.priceRange.max !== null) count++;
  if (state.search && state.search.length > 0) count++;
  if (state.petType !== null) count++;
  return count;
}

/**
 * Check if any filter is active
 * @param {object} state
 * @returns {boolean}
 */
export function hasActiveFilters(state) {
  return getActiveFilterCount(state) > 0;
}

/**
 * Apply filters to a product list
 * @param {object[]} products
 * @param {object} filterState
 * @returns {object[]}
 */
export function applyFilters(products, filterState) {
  if (!Array.isArray(products) || !filterState) return [];

  let results = products.filter(function (p) {
    if (filterState.categories.length > 0 && filterState.categories.indexOf(p.category) === -1) return false;
    if (filterState.sizes.length > 0) {
      const productSizes = Array.isArray(p.sizes) ? p.sizes : [];
      const hasMatchingSize = filterState.sizes.some(function (s) { return productSizes.indexOf(s) >= 0; });
      if (!hasMatchingSize) return false;
    }
    if (filterState.colors.length > 0) {
      const productColors = Array.isArray(p.colors) ? p.colors : [];
      const hasMatchingColor = filterState.colors.some(function (c) { return productColors.indexOf(c) >= 0; });
      if (!hasMatchingColor) return false;
    }
    if (filterState.priceRange.min !== null && p.price < filterState.priceRange.min) return false;
    if (filterState.priceRange.max !== null && p.price > filterState.priceRange.max) return false;
    if (filterState.petType !== null && p.petType !== filterState.petType) return false;
    if (filterState.search && filterState.search.length > 0) {
      const term = filterState.search.toLowerCase();
      const nameMatch = p.name && p.name.toLowerCase().indexOf(term) >= 0;
      const descMatch = p.description && p.description.toLowerCase().indexOf(term) >= 0;
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  if (filterState.sort === 'price-asc') {
    results.sort(function (a, b) { return a.price - b.price; });
  } else if (filterState.sort === 'price-desc') {
    results.sort(function (a, b) { return b.price - a.price; });
  } else if (filterState.sort === 'newest') {
    results.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  } else if (filterState.sort === 'popular') {
    results.sort(function (a, b) { return (b.salesCount || 0) - (a.salesCount || 0); });
  }

  return results;
}
