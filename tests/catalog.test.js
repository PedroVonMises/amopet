// tests/catalog.test.js
const test = require('node:test');
const assert = require('node:assert');
const { 
  createFilterState, 
  toggleCategory, 
  applyFilters 
} = require('../js/components/sideFilter.js');

test('Catalog Pagination Logic', async (t) => {
  // Mock 18 products
  const products = [];
  for (let i = 1; i <= 18; i++) {
    products.push({ id: `p${i}`, name: `Prod ${i}`, price: 50, category: i % 2 === 0 ? 'even' : 'odd' });
  }

  await t.test('calculates correct total pages', () => {
    let state = createFilterState();
    let filtered = applyFilters(products, state);
    
    let ITEMS_PER_PAGE = 6;
    let totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    
    assert.strictEqual(totalPages, 3);
  });

  await t.test('slices correct items for page 2', () => {
    let state = createFilterState();
    let filtered = applyFilters(products, state);
    
    let ITEMS_PER_PAGE = 6;
    let page = 2;
    let start = (page - 1) * ITEMS_PER_PAGE;
    let slice = filtered.slice(start, start + ITEMS_PER_PAGE);

    assert.strictEqual(slice.length, 6);
    assert.strictEqual(slice[0].id, 'p7');
    assert.strictEqual(slice[5].id, 'p12');
  });

  await t.test('filters down and recalculates pagination', () => {
    let state = createFilterState();
    state = toggleCategory(state, 'even'); // should yield 9 products

    let filtered = applyFilters(products, state);
    assert.strictEqual(filtered.length, 9);
    
    let ITEMS_PER_PAGE = 6;
    let totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    assert.strictEqual(totalPages, 2);

    // Page 2 should have 3 items
    let page = 2;
    let start = (page - 1) * ITEMS_PER_PAGE;
    let slice = filtered.slice(start, start + ITEMS_PER_PAGE);

    assert.strictEqual(slice.length, 3);
  });
});
