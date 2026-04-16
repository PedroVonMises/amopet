/**
 * AMOPETS — Tests: Query Param Parsing
 * node --test tests/queryParams.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  parseQueryParams,
  buildQueryString,
  parseProductFilters,
  mergeQueryParams,
} = require('../js/utils/queryParams');

// ═══════════════════════════════════════════
// parseQueryParams
// ═══════════════════════════════════════════
describe('parseQueryParams', () => {
  it('should parse simple key=value pairs', () => {
    const result = parseQueryParams('?category=coleiras&size=M');
    assert.deepEqual(result, { category: 'coleiras', size: 'M' });
  });

  it('should handle query string without leading ?', () => {
    const result = parseQueryParams('color=roxo&price=69');
    assert.deepEqual(result, { color: 'roxo', price: '69' });
  });

  it('should handle empty query string', () => {
    assert.deepEqual(parseQueryParams(''), {});
    assert.deepEqual(parseQueryParams('?'), {});
  });

  it('should handle key without value', () => {
    const result = parseQueryParams('?featured');
    assert.deepEqual(result, { featured: '' });
  });

  it('should decode URI components', () => {
    const result = parseQueryParams('?q=coleira%20ametista&tag=%F0%9F%94%A5');
    assert.equal(result.q, 'coleira ametista');
    assert.equal(result.tag, '🔥');
  });

  it('should handle duplicate keys as arrays', () => {
    const result = parseQueryParams('?color=roxo&color=amarelo&color=rosa');
    assert.deepEqual(result.color, ['roxo', 'amarelo', 'rosa']);
  });

  it('should handle two duplicate keys as array', () => {
    const result = parseQueryParams('?size=P&size=M');
    assert.deepEqual(result.size, ['P', 'M']);
  });

  it('should skip empty pairs (double &)', () => {
    const result = parseQueryParams('?a=1&&b=2');
    assert.deepEqual(result, { a: '1', b: '2' });
  });

  it('should handle value with equals sign', () => {
    const result = parseQueryParams('?formula=a=b');
    assert.equal(result.formula, 'a=b');
  });

  it('should return empty object for non-string input', () => {
    assert.deepEqual(parseQueryParams(null), {});
    assert.deepEqual(parseQueryParams(123), {});
    assert.deepEqual(parseQueryParams(undefined), {});
  });

  it('should skip empty key', () => {
    const result = parseQueryParams('?=value');
    assert.deepEqual(result, {});
  });
});

// ═══════════════════════════════════════════
// buildQueryString
// ═══════════════════════════════════════════
describe('buildQueryString', () => {
  it('should build from simple object', () => {
    const result = buildQueryString({ category: 'coleiras', size: 'M' });
    assert.equal(result, 'category=coleiras&size=M');
  });

  it('should encode special characters', () => {
    const result = buildQueryString({ q: 'coleira ametista' });
    assert.equal(result, 'q=coleira%20ametista');
  });

  it('should handle array values', () => {
    const result = buildQueryString({ color: ['roxo', 'amarelo'] });
    assert.equal(result, 'color=roxo&color=amarelo');
  });

  it('should convert numbers to strings', () => {
    const result = buildQueryString({ page: 2, price: 69.90 });
    assert.equal(result, 'page=2&price=69.9');
  });

  it('should skip null/undefined values', () => {
    const result = buildQueryString({ a: 'keep', b: null, c: undefined, d: 'also' });
    assert.equal(result, 'a=keep&d=also');
  });

  it('should return empty string for empty object', () => {
    assert.equal(buildQueryString({}), '');
  });

  it('should return empty string for null', () => {
    assert.equal(buildQueryString(null), '');
  });
});

// ═══════════════════════════════════════════
// parseProductFilters
// ═══════════════════════════════════════════
describe('parseProductFilters', () => {
  it('should parse full filter query', () => {
    const result = parseProductFilters('?category=coleiras&size=M&sort=price-asc&page=2&q=ametista');
    assert.equal(result.category, 'coleiras');
    assert.equal(result.size, 'M');
    assert.equal(result.sort, 'price-asc');
    assert.equal(result.page, 2);
    assert.equal(result.search, 'ametista');
  });

  it('should default sort to "relevance"', () => {
    const result = parseProductFilters('?category=coleiras');
    assert.equal(result.sort, 'relevance');
  });

  it('should default page to 1', () => {
    const result = parseProductFilters('?category=coleiras');
    assert.equal(result.page, 1);
  });

  it('should parse price range', () => {
    const result = parseProductFilters('?priceMin=50&priceMax=100');
    assert.equal(result.priceMin, 50);
    assert.equal(result.priceMax, 100);
  });

  it('should return nulls for missing optional params', () => {
    const result = parseProductFilters('');
    assert.equal(result.category, null);
    assert.equal(result.size, null);
    assert.equal(result.color, null);
    assert.equal(result.priceMin, null);
    assert.equal(result.priceMax, null);
    assert.equal(result.search, null);
  });

  it('should handle "search" as alias for "q"', () => {
    const result = parseProductFilters('?search=galaxy');
    assert.equal(result.search, 'galaxy');
  });

  it('should prefer "q" over "search"', () => {
    const result = parseProductFilters('?q=ametista&search=galaxy');
    assert.equal(result.search, 'ametista');
  });

  it('should parse float prices', () => {
    const result = parseProductFilters('?priceMin=49.90&priceMax=89.90');
    assert.equal(result.priceMin, 49.90);
    assert.equal(result.priceMax, 89.90);
  });
});

// ═══════════════════════════════════════════
// mergeQueryParams
// ═══════════════════════════════════════════
describe('mergeQueryParams', () => {
  it('should add new params to existing', () => {
    const result = mergeQueryParams('?category=coleiras', { size: 'M' });
    assert.match(result, /category=coleiras/);
    assert.match(result, /size=M/);
  });

  it('should update existing param', () => {
    const result = mergeQueryParams('?page=1', { page: '2' });
    assert.equal(result, 'page=2');
  });

  it('should remove param when set to null', () => {
    const result = mergeQueryParams('?category=coleiras&size=M', { size: null });
    assert.equal(result, 'category=coleiras');
  });

  it('should remove param when set to undefined', () => {
    const result = mergeQueryParams('?a=1&b=2', { b: undefined });
    assert.equal(result, 'a=1');
  });

  it('should handle empty current query', () => {
    const result = mergeQueryParams('', { page: '1' });
    assert.equal(result, 'page=1');
  });

  it('should handle empty updates', () => {
    const result = mergeQueryParams('?a=1', {});
    assert.equal(result, 'a=1');
  });

  it('should handle multiple operations at once', () => {
    const result = mergeQueryParams('?a=1&b=2&c=3', {
      a: null, // remove
      b: '20', // update
      d: '4',  // add
    });
    assert.ok(!result.includes('a='));
    assert.match(result, /b=20/);
    assert.match(result, /c=3/);
    assert.match(result, /d=4/);
  });
});
