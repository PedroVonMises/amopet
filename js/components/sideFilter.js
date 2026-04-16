/**
 * AMOPETS — Side Filter Component Logic
 * Filter state management, active filters, price range.
 */

var VALID_SORT_OPTIONS = ['relevance', 'price-asc', 'price-desc', 'newest', 'popular'];
var VALID_SIZES = ['PP', 'P', 'M', 'G', 'GG'];
var VALID_CATEGORIES = ['coleiras', 'coleiras-led', 'coleiras-couro', 'coleiras-nylon'];

/**
 * Create initial filter state
 * @returns {object} Filter state
 */
function createFilterState() {
  return {
    categories: [],
    sizes: [],
    colors: [],
    priceRange: { min: null, max: null },
    sort: 'relevance',
    search: '',
    petType: null, // 'dog' | 'cat' | null
  };
}

/**
 * Toggle a category filter
 * @param {object} state
 * @param {string} category
 * @returns {object}
 */
function toggleCategory(state, category) {
  if (!state || typeof category !== 'string') return state;
  var cat = category.toLowerCase().trim();
  var idx = state.categories.indexOf(cat);
  var newCats = idx >= 0
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
function toggleSize(state, size) {
  if (!state || typeof size !== 'string') return state;
  var s = size.toUpperCase().trim();
  if (VALID_SIZES.indexOf(s) === -1) return state;
  var idx = state.sizes.indexOf(s);
  var newSizes = idx >= 0
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
function toggleColor(state, color) {
  if (!state || typeof color !== 'string') return state;
  var c = color.toLowerCase().trim();
  if (c.length === 0) return state;
  var idx = state.colors.indexOf(c);
  var newColors = idx >= 0
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
function setPriceRange(state, min, max) {
  if (!state) return state;
  var cleanMin = (typeof min === 'number' && min >= 0) ? min : null;
  var cleanMax = (typeof max === 'number' && max > 0) ? max : null;
  if (cleanMin !== null && cleanMax !== null && cleanMin > cleanMax) {
    return state; // Invalid range
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
function setSort(state, sortBy) {
  if (!state || VALID_SORT_OPTIONS.indexOf(sortBy) === -1) return state;
  return Object.assign({}, state, { sort: sortBy });
}

/**
 * Set search term
 * @param {object} state
 * @param {string} term
 * @returns {object}
 */
function setSearch(state, term) {
  if (!state) return state;
  return Object.assign({}, state, { search: typeof term === 'string' ? term.trim() : '' });
}

/**
 * Set pet type filter
 * @param {object} state
 * @param {string|null} petType - 'dog', 'cat', or null
 * @returns {object}
 */
function setPetType(state, petType) {
  if (!state) return state;
  var valid = [null, 'dog', 'cat'];
  if (valid.indexOf(petType) === -1) return state;
  return Object.assign({}, state, { petType: petType });
}

/**
 * Clear all filters (reset to initial state)
 * @returns {object}
 */
function clearAllFilters() {
  return createFilterState();
}

/**
 * Get count of active filters
 * @param {object} state
 * @returns {number}
 */
function getActiveFilterCount(state) {
  if (!state) return 0;
  var count = 0;
  count += state.categories.length;
  count += state.sizes.length;
  count += state.colors.length;
  if (state.priceRange.min !== null || state.priceRange.max !== null) count++;
  if (state.search && state.search.length > 0) count++;
  if (state.petType !== null) count++;
  // sort is not counted as a "filter"
  return count;
}

/**
 * Check if any filter is active
 * @param {object} state
 * @returns {boolean}
 */
function hasActiveFilters(state) {
  return getActiveFilterCount(state) > 0;
}

/**
 * Apply filters to a product list
 * @param {object[]} products
 * @param {object} filterState
 * @returns {object[]} Filtered products
 */
function applyFilters(products, filterState) {
  if (!Array.isArray(products) || !filterState) return [];

  var results = products.filter(function (p) {
    // Category filter
    if (filterState.categories.length > 0 && filterState.categories.indexOf(p.category) === -1) return false;
    // Size filter
    if (filterState.sizes.length > 0) {
      var productSizes = Array.isArray(p.sizes) ? p.sizes : [];
      var hasMatchingSize = filterState.sizes.some(function (s) { return productSizes.indexOf(s) >= 0; });
      if (!hasMatchingSize) return false;
    }
    // Color filter
    if (filterState.colors.length > 0) {
      var productColors = Array.isArray(p.colors) ? p.colors : [];
      var hasMatchingColor = filterState.colors.some(function (c) { return productColors.indexOf(c) >= 0; });
      if (!hasMatchingColor) return false;
    }
    // Price range
    if (filterState.priceRange.min !== null && p.price < filterState.priceRange.min) return false;
    if (filterState.priceRange.max !== null && p.price > filterState.priceRange.max) return false;
    // Pet type
    if (filterState.petType !== null && p.petType !== filterState.petType) return false;
    // Search
    if (filterState.search && filterState.search.length > 0) {
      var term = filterState.search.toLowerCase();
      var nameMatch = p.name && p.name.toLowerCase().indexOf(term) >= 0;
      var descMatch = p.description && p.description.toLowerCase().indexOf(term) >= 0;
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  // Sort
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createFilterState: createFilterState,
    toggleCategory: toggleCategory,
    toggleSize: toggleSize,
    toggleColor: toggleColor,
    setPriceRange: setPriceRange,
    setSort: setSort,
    setSearch: setSearch,
    setPetType: setPetType,
    clearAllFilters: clearAllFilters,
    getActiveFilterCount: getActiveFilterCount,
    hasActiveFilters: hasActiveFilters,
    applyFilters: applyFilters,
    VALID_SORT_OPTIONS: VALID_SORT_OPTIONS,
    VALID_SIZES: VALID_SIZES,
  };
}
