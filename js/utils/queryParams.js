/**
 * AMOPETS — Query Param Parsing
 * URL query string parsing and building utilities.
 */

/**
 * Parse a query string into an object
 * Handles: ?category=coleiras&size=M&sort=price-asc&page=2
 * @param {string} queryString - URL query string (with or without leading "?")
 * @returns {Object.<string, string|string[]>} Parsed key-value pairs
 */
function parseQueryParams(queryString) {
  if (typeof queryString !== 'string') return {};

  var clean = queryString.charAt(0) === '?' ? queryString.slice(1) : queryString;
  if (clean.length === 0) return {};

  var result = {};
  var pairs = clean.split('&');

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    if (pair.length === 0) continue;

    var eqIndex = pair.indexOf('=');
    var key, value;

    if (eqIndex === -1) {
      key = decodeURIComponent(pair);
      value = '';
    } else {
      key = decodeURIComponent(pair.slice(0, eqIndex));
      value = decodeURIComponent(pair.slice(eqIndex + 1));
    }

    if (key.length === 0) continue;

    // Handle array params (e.g., color=red&color=blue)
    if (result.hasOwnProperty(key)) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Build a query string from an object
 * @param {Object.<string, string|number|string[]>} params
 * @returns {string} Query string without leading "?"
 */
function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';

  var parts = [];
  var keys = Object.keys(params);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = params[key];

    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      for (var j = 0; j < value.length; j++) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value[j])));
      }
    } else {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
    }
  }

  return parts.join('&');
}

/**
 * Extract product filter params from a query string
 * @param {string} queryString
 * @returns {object} { category, size, color, priceMin, priceMax, sort, page, search }
 */
function parseProductFilters(queryString) {
  var params = parseQueryParams(queryString);

  return {
    category: params.category || null,
    size: params.size || null,
    color: params.color || null,
    priceMin: params.priceMin ? parseFloat(params.priceMin) : null,
    priceMax: params.priceMax ? parseFloat(params.priceMax) : null,
    sort: params.sort || 'relevance',
    page: params.page ? parseInt(params.page, 10) : 1,
    search: params.q || params.search || null,
  };
}

/**
 * Merge new params with existing query string
 * @param {string} currentQuery - Current query string
 * @param {Object.<string, string|null>} updates - New params (null = remove)
 * @returns {string} Updated query string
 */
function mergeQueryParams(currentQuery, updates) {
  var existing = parseQueryParams(currentQuery);

  var keys = Object.keys(updates);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (updates[key] === null || updates[key] === undefined) {
      delete existing[key];
    } else {
      existing[key] = updates[key];
    }
  }

  return buildQueryString(existing);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseQueryParams: parseQueryParams,
    buildQueryString: buildQueryString,
    parseProductFilters: parseProductFilters,
    mergeQueryParams: mergeQueryParams,
  };
}
