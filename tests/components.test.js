/**
 * ═══════════════════════════════════════════════════════════════
 * AMOPETS — COMPONENT TESTS
 * Run: node --test tests/components.test.js
 *
 * Components covered:
 *   1. Product Card     (createCardViewModel, getCardInteractiveState, getCardImages)
 *   2. Gallery          (navigation, zoom, thumbnails)
 *   3. Side Filter      (toggles, price range, search, applyFilters)
 *   4. Variant Selector (size/color cross-reference, validation)
 *   5. Quantity Stepper  (increment, decrement, bounds)
 *   6. Mini Cart        (view model, empty state, free shipping progress)
 *   7. Address Form     (field updates, CEP lookup, validation)
 *   8. Order Summary    (line items, Pix discount, savings, order validation)
 * ═══════════════════════════════════════════════════════════════
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ─── Component imports ───
const { createCardViewModel, getCardInteractiveState, getCardImages, _calculateInstallments } = require('../js/components/productCard');
const { createGalleryState, goToNext, goToPrev, goToIndex, toggleZoom, updateZoomPosition, getCurrentImage, getNavigationInfo } = require('../js/components/gallery');
const { createFilterState, toggleCategory, toggleSize, toggleColor, setPriceRange, setSort, setSearch, setPetType, clearAllFilters, getActiveFilterCount, hasActiveFilters, applyFilters } = require('../js/components/sideFilter');
const { createVariantState, selectSize, selectColor, getSelectedVariant, isSelectionComplete, getSelectionValidation } = require('../js/components/variantSelector');
const { createStepperState, increment, decrement, setValue, canIncrement, canDecrement, getStepperAriaLabel } = require('../js/components/quantityStepper');
const { createMiniCartViewModel, getEmptyCartMessage, getFreeShippingProgress } = require('../js/components/miniCart');
const { createAddressFormState, updateField, applyCepLookup, setCepLoading, validateAddressForm, getFieldError, applyValidationErrors, isFormSubmittable } = require('../js/components/addressForm');
const { createOrderSummary, validateOrder, getPaymentMethodInfo, calculateSavings } = require('../js/components/orderSummary');


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  1. PRODUCT CARD                                              ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('ProductCard — createCardViewModel', () => {
  const baseProduct = { id: 'col-001', name: 'Coleira Deepblue', price: 69.90, imageUrl: '/img/deepblue.png' };

  it('should create view model with required fields', () => {
    const vm = createCardViewModel(baseProduct);
    assert.equal(vm.id, 'col-001');
    assert.equal(vm.name, 'Coleira Deepblue');
    assert.equal(vm.slug, 'coleira-deepblue');
    assert.equal(vm.basePrice, 69.90);
    assert.equal(vm.finalPrice, 69.90);
    assert.equal(vm.hasDiscount, false);
    assert.equal(vm.savings, 0);
    assert.equal(vm.isAvailable, true);
    assert.equal(vm.imageUrl, '/img/deepblue.png');
  });

  it('should calculate discounted price on promo', () => {
    const promo = Object.assign({}, baseProduct, { promo: { rate: 0.20, label: '20% OFF' } });
    const vm = createCardViewModel(promo);
    assert.equal(vm.hasDiscount, true);
    assert.equal(vm.finalPrice, 55.92); // 69.90 * 0.80
    assert.equal(vm.savings, 13.98);
  });

  it('should mark unavailable when stock=0', () => {
    const out = Object.assign({}, baseProduct, { stock: 0 });
    assert.equal(createCardViewModel(out).isAvailable, false);
  });

  it('should be available when stock undefined', () => {
    assert.equal(createCardViewModel(baseProduct).isAvailable, true);
  });

  it('should clamp rating between 0-5', () => {
    assert.equal(createCardViewModel(Object.assign({}, baseProduct, { rating: 4.5 })).rating, 4.5);
    assert.equal(createCardViewModel(Object.assign({}, baseProduct, { rating: 7 })).rating, 5);
    assert.equal(createCardViewModel(Object.assign({}, baseProduct, { rating: -2 })).rating, 0);
  });

  it('should use name as default imageAlt', () => {
    assert.equal(createCardViewModel(baseProduct).imageAlt, 'Coleira Deepblue');
  });

  it('should throw for null product', () => {
    assert.throws(() => createCardViewModel(null), TypeError);
  });

  it('should throw for product missing id', () => {
    assert.throws(() => createCardViewModel({ name: 'X', price: 10 }), TypeError);
  });

  it('should throw for product missing price', () => {
    assert.throws(() => createCardViewModel({ id: 'x', name: 'X' }), TypeError);
  });
});

describe('ProductCard — _calculateInstallments', () => {
  it('should return null for price <= 0', () => {
    assert.equal(_calculateInstallments(0), null);
    assert.equal(_calculateInstallments(-10), null);
  });
  it('should return null for price < 30', () => {
    assert.equal(_calculateInstallments(25), null);
  });
  it('should return 2x for price 30-99', () => {
    const r = _calculateInstallments(60);
    assert.equal(r.count, 2);
    assert.equal(r.value, 30);
    assert.equal(r.hasFees, false);
  });
  it('should return 3x for price 100-199', () => {
    const r = _calculateInstallments(150);
    assert.equal(r.count, 3);
    assert.equal(r.value, 50);
  });
  it('should return 6x for price >= 200', () => {
    const r = _calculateInstallments(240);
    assert.equal(r.count, 6);
    assert.equal(r.value, 40);
  });
});

describe('ProductCard — getCardInteractiveState', () => {
  it('should elevate on hover', () => {
    assert.equal(getCardInteractiveState(true, false, false).isElevated, true);
  });
  it('should elevate on focus', () => {
    assert.equal(getCardInteractiveState(false, true, false).isElevated, true);
  });
  it('should not elevate when idle', () => {
    assert.equal(getCardInteractiveState(false, false, false).isElevated, false);
  });
  it('should show quick-add on hover but not while adding', () => {
    assert.equal(getCardInteractiveState(true, false, false).showQuickAdd, true);
    assert.equal(getCardInteractiveState(true, false, true).showQuickAdd, false);
  });
  it('should set isAnimating when adding to cart', () => {
    assert.equal(getCardInteractiveState(false, false, true).isAnimating, true);
  });
});

describe('ProductCard — getCardImages', () => {
  it('should return primary and hover from images array', () => {
    const p = { images: ['a.jpg', 'b.jpg'] };
    const r = getCardImages(p);
    assert.equal(r.primary, 'a.jpg');
    assert.equal(r.hover, 'b.jpg');
  });
  it('should return null hover when single image', () => {
    const r = getCardImages({ images: ['a.jpg'] });
    assert.equal(r.hover, null);
  });
  it('should return color-specific images', () => {
    const p = { images: ['default.jpg'], colorImages: { roxo: ['roxo1.jpg', 'roxo2.jpg'] } };
    const r = getCardImages(p, 'roxo');
    assert.equal(r.primary, 'roxo1.jpg');
    assert.equal(r.hover, 'roxo2.jpg');
  });
  it('should fallback to default images if color not found', () => {
    const p = { images: ['default.jpg', 'default2.jpg'] };
    const r = getCardImages(p, 'azul');
    assert.equal(r.primary, 'default.jpg');
  });
  it('should handle empty images', () => {
    const r = getCardImages({ images: [] });
    assert.equal(r.primary, '');
    assert.equal(r.hover, null);
  });
  it('should handle null product', () => {
    const r = getCardImages(null);
    assert.equal(r.primary, '');
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  2. GALLERY                                                   ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('Gallery — createGalleryState', () => {
  it('should initialize with images', () => {
    const s = createGalleryState(['a.jpg', 'b.jpg', 'c.jpg']);
    assert.equal(s.images.length, 3);
    assert.equal(s.currentIndex, 0);
    assert.equal(s.isZoomed, false);
  });
  it('should filter out invalid images', () => {
    const s = createGalleryState(['a.jpg', '', null, 'b.jpg']);
    assert.equal(s.images.length, 2);
  });
  it('should handle null input', () => {
    const s = createGalleryState(null);
    assert.equal(s.images.length, 0);
  });
});

describe('Gallery — navigation', () => {
  it('should go to next image', () => {
    let s = createGalleryState(['a', 'b', 'c']);
    s = goToNext(s);
    assert.equal(s.currentIndex, 1);
  });
  it('should wrap around from last to first', () => {
    let s = createGalleryState(['a', 'b']);
    s = goToNext(s);
    s = goToNext(s);
    assert.equal(s.currentIndex, 0);
  });
  it('should go to previous image', () => {
    let s = createGalleryState(['a', 'b', 'c']);
    s = goToNext(s);
    s = goToPrev(s);
    assert.equal(s.currentIndex, 0);
  });
  it('should wrap around from first to last on prev', () => {
    let s = createGalleryState(['a', 'b', 'c']);
    s = goToPrev(s);
    assert.equal(s.currentIndex, 2);
  });
  it('should jump to index', () => {
    let s = createGalleryState(['a', 'b', 'c']);
    s = goToIndex(s, 2);
    assert.equal(s.currentIndex, 2);
  });
  it('should ignore invalid index', () => {
    let s = createGalleryState(['a', 'b']);
    const next = goToIndex(s, 5);
    assert.equal(next.currentIndex, 0);
  });
  it('should ignore negative index', () => {
    let s = createGalleryState(['a', 'b']);
    assert.equal(goToIndex(s, -1).currentIndex, 0);
  });
  it('should not navigate single image', () => {
    let s = createGalleryState(['a']);
    assert.equal(goToNext(s).currentIndex, 0);
    assert.equal(goToPrev(s).currentIndex, 0);
  });
  it('should close zoom on navigation', () => {
    let s = createGalleryState(['a', 'b']);
    s = toggleZoom(s);
    s = goToNext(s);
    assert.equal(s.isZoomed, false);
  });
});

describe('Gallery — zoom', () => {
  it('should toggle zoom on', () => {
    let s = createGalleryState(['a']);
    s = toggleZoom(s);
    assert.equal(s.isZoomed, true);
  });
  it('should toggle zoom off', () => {
    let s = createGalleryState(['a']);
    s = toggleZoom(s);
    s = toggleZoom(s);
    assert.equal(s.isZoomed, false);
  });
  it('should not zoom empty gallery', () => {
    let s = createGalleryState([]);
    s = toggleZoom(s);
    assert.equal(s.isZoomed, false);
  });
  it('should update zoom position', () => {
    let s = createGalleryState(['a']);
    s = toggleZoom(s);
    s = updateZoomPosition(s, 0.5, 0.7);
    assert.equal(s.zoomPosition.x, 0.5);
    assert.equal(s.zoomPosition.y, 0.7);
  });
  it('should clamp zoom position to 0-1', () => {
    let s = createGalleryState(['a']);
    s = toggleZoom(s);
    s = updateZoomPosition(s, -0.5, 1.5);
    assert.equal(s.zoomPosition.x, 0);
    assert.equal(s.zoomPosition.y, 1);
  });
  it('should not update position when not zoomed', () => {
    let s = createGalleryState(['a']);
    const next = updateZoomPosition(s, 0.5, 0.5);
    assert.deepEqual(next.zoomPosition, { x: 0, y: 0 });
  });
});

describe('Gallery — getCurrentImage / getNavigationInfo', () => {
  it('should return current image URL', () => {
    let s = createGalleryState(['a.jpg', 'b.jpg']);
    assert.equal(getCurrentImage(s), 'a.jpg');
    s = goToNext(s);
    assert.equal(getCurrentImage(s), 'b.jpg');
  });
  it('should return null for empty gallery', () => {
    assert.equal(getCurrentImage(createGalleryState([])), null);
  });
  it('should return navigation info', () => {
    const info = getNavigationInfo(createGalleryState(['a', 'b', 'c']));
    assert.equal(info.hasPrev, true);
    assert.equal(info.hasNext, true);
    assert.equal(info.total, 3);
    assert.equal(info.current, 1);
  });
  it('should handle single image nav info', () => {
    const info = getNavigationInfo(createGalleryState(['a']));
    assert.equal(info.hasPrev, false);
    assert.equal(info.hasNext, false);
  });
  it('should handle empty gallery nav info', () => {
    const info = getNavigationInfo(createGalleryState([]));
    assert.equal(info.total, 0);
    assert.equal(info.current, 0);
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  3. SIDE FILTER                                               ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('SideFilter — createFilterState', () => {
  it('should create empty filter state', () => {
    const s = createFilterState();
    assert.deepEqual(s.categories, []);
    assert.deepEqual(s.sizes, []);
    assert.deepEqual(s.colors, []);
    assert.deepEqual(s.priceRange, { min: null, max: null });
    assert.equal(s.sort, 'relevance');
    assert.equal(s.search, '');
    assert.equal(s.petType, null);
  });
});

describe('SideFilter — toggleCategory', () => {
  it('should add category', () => {
    let s = createFilterState();
    s = toggleCategory(s, 'coleiras');
    assert.deepEqual(s.categories, ['coleiras']);
  });
  it('should remove category on second toggle', () => {
    let s = createFilterState();
    s = toggleCategory(s, 'coleiras');
    s = toggleCategory(s, 'coleiras');
    assert.deepEqual(s.categories, []);
  });
  it('should handle multiple categories', () => {
    let s = createFilterState();
    s = toggleCategory(s, 'coleiras');
    s = toggleCategory(s, 'coleiras-led');
    assert.deepEqual(s.categories, ['coleiras', 'coleiras-led']);
  });
});

describe('SideFilter — toggleSize', () => {
  it('should add valid size', () => {
    let s = createFilterState();
    s = toggleSize(s, 'M');
    assert.deepEqual(s.sizes, ['M']);
  });
  it('should ignore invalid size', () => {
    let s = createFilterState();
    s = toggleSize(s, 'XL');
    assert.deepEqual(s.sizes, []);
  });
  it('should accept lowercase', () => {
    let s = createFilterState();
    s = toggleSize(s, 'gg');
    assert.deepEqual(s.sizes, ['GG']);
  });
});

describe('SideFilter — toggleColor', () => {
  it('should add color', () => {
    let s = createFilterState();
    s = toggleColor(s, 'Roxo');
    assert.deepEqual(s.colors, ['roxo']);
  });
  it('should remove on re-toggle', () => {
    let s = createFilterState();
    s = toggleColor(s, 'roxo');
    s = toggleColor(s, 'roxo');
    assert.deepEqual(s.colors, []);
  });
  it('should ignore empty string', () => {
    let s = createFilterState();
    s = toggleColor(s, '');
    assert.deepEqual(s.colors, []);
  });
});

describe('SideFilter — setPriceRange', () => {
  it('should set valid range', () => {
    let s = createFilterState();
    s = setPriceRange(s, 50, 100);
    assert.deepEqual(s.priceRange, { min: 50, max: 100 });
  });
  it('should reject inverted range (min > max)', () => {
    let s = createFilterState();
    const next = setPriceRange(s, 100, 50);
    assert.deepEqual(next.priceRange, { min: null, max: null }); // unchanged
  });
  it('should allow null min (no lower bound)', () => {
    let s = createFilterState();
    s = setPriceRange(s, null, 100);
    assert.deepEqual(s.priceRange, { min: null, max: 100 });
  });
  it('should allow null max (no upper bound)', () => {
    let s = createFilterState();
    s = setPriceRange(s, 50, null);
    assert.deepEqual(s.priceRange, { min: 50, max: null });
  });
});

describe('SideFilter — setSort', () => {
  it('should set valid sort', () => {
    let s = createFilterState();
    s = setSort(s, 'price-asc');
    assert.equal(s.sort, 'price-asc');
  });
  it('should ignore invalid sort', () => {
    let s = createFilterState();
    s = setSort(s, 'invalid');
    assert.equal(s.sort, 'relevance'); // unchanged
  });
});

describe('SideFilter — setSearch / setPetType', () => {
  it('should set search term', () => {
    let s = createFilterState();
    s = setSearch(s, '  deepblue  ');
    assert.equal(s.search, 'deepblue');
  });
  it('should set pet type', () => {
    let s = createFilterState();
    s = setPetType(s, 'dog');
    assert.equal(s.petType, 'dog');
  });
  it('should clear pet type with null', () => {
    let s = createFilterState();
    s = setPetType(s, 'cat');
    s = setPetType(s, null);
    assert.equal(s.petType, null);
  });
  it('should ignore invalid pet type', () => {
    let s = createFilterState();
    const next = setPetType(s, 'bird');
    assert.equal(next.petType, null);
  });
});

describe('SideFilter — getActiveFilterCount / hasActiveFilters', () => {
  it('should return 0 for empty state', () => {
    assert.equal(getActiveFilterCount(createFilterState()), 0);
    assert.equal(hasActiveFilters(createFilterState()), false);
  });
  it('should count categories', () => {
    let s = toggleCategory(createFilterState(), 'coleiras');
    s = toggleCategory(s, 'coleiras-led');
    assert.equal(getActiveFilterCount(s), 2);
  });
  it('should count price range as 1', () => {
    let s = setPriceRange(createFilterState(), 50, 100);
    assert.equal(getActiveFilterCount(s), 1);
  });
  it('should count search', () => {
    let s = setSearch(createFilterState(), 'deepgreen');
    assert.equal(getActiveFilterCount(s), 1);
    assert.equal(hasActiveFilters(s), true);
  });
  it('should NOT count sort', () => {
    let s = setSort(createFilterState(), 'price-asc');
    assert.equal(getActiveFilterCount(s), 0);
  });
});

describe('SideFilter — clearAllFilters', () => {
  it('should reset everything', () => {
    let s = createFilterState();
    s = toggleCategory(s, 'coleiras');
    s = toggleSize(s, 'M');
    s = setSearch(s, 'foo');
    const cleared = clearAllFilters();
    assert.deepEqual(cleared.categories, []);
    assert.deepEqual(cleared.sizes, []);
    assert.equal(cleared.search, '');
  });
});

describe('SideFilter — applyFilters', () => {
  const products = [
    { id: '1', name: 'Coleira Deepblue', price: 69.90, category: 'coleiras', sizes: ['P', 'M', 'G'], colors: ['roxo'], petType: 'dog', salesCount: 100, createdAt: '2026-04-01' },
    { id: '2', name: 'Coleira Girassol', price: 59.90, category: 'coleiras', sizes: ['M', 'G'], colors: ['amarelo'], petType: 'dog', salesCount: 50, createdAt: '2026-03-01' },
    { id: '3', name: 'Coleira Deepgreen', price: 79.90, category: 'coleiras-led', sizes: ['P', 'M'], colors: ['roxo'], petType: 'cat', salesCount: 75, createdAt: '2026-04-10' },
    { id: '4', name: 'Coleira Sunset LED', price: 89.90, category: 'coleiras-led', sizes: ['G', 'GG'], colors: ['laranja'], petType: 'dog', salesCount: 30, createdAt: '2026-02-01' },
  ];

  it('should return all products with empty filters', () => {
    assert.equal(applyFilters(products, createFilterState()).length, 4);
  });
  it('should filter by category', () => {
    let s = toggleCategory(createFilterState(), 'coleiras-led');
    const result = applyFilters(products, s);
    assert.equal(result.length, 2);
    assert.ok(result.every(p => p.category === 'coleiras-led'));
  });
  it('should filter by size', () => {
    let s = toggleSize(createFilterState(), 'GG');
    const result = applyFilters(products, s);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '4');
  });
  it('should filter by color', () => {
    let s = toggleColor(createFilterState(), 'roxo');
    const result = applyFilters(products, s);
    assert.equal(result.length, 2);
  });
  it('should filter by price range', () => {
    let s = setPriceRange(createFilterState(), 70, 100);
    const result = applyFilters(products, s);
    assert.equal(result.length, 2); // Deepgreen 79.90, Sunset 89.90
  });
  it('should filter by pet type', () => {
    let s = setPetType(createFilterState(), 'cat');
    const result = applyFilters(products, s);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '3');
  });
  it('should filter by search term in name', () => {
    let s = setSearch(createFilterState(), 'deepgreen');
    const result = applyFilters(products, s);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '3');
  });
  it('should sort by price ascending', () => {
    let s = setSort(createFilterState(), 'price-asc');
    const result = applyFilters(products, s);
    assert.equal(result[0].price, 59.90);
    assert.equal(result[3].price, 89.90);
  });
  it('should sort by price descending', () => {
    let s = setSort(createFilterState(), 'price-desc');
    const result = applyFilters(products, s);
    assert.equal(result[0].price, 89.90);
    assert.equal(result[3].price, 59.90);
  });
  it('should sort by popular (salesCount)', () => {
    let s = setSort(createFilterState(), 'popular');
    const result = applyFilters(products, s);
    assert.equal(result[0].id, '1'); // 100 sales
  });
  it('should combine multiple filters', () => {
    let s = createFilterState();
    s = toggleColor(s, 'roxo');
    s = setPetType(s, 'dog');
    const result = applyFilters(products, s);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '1');
  });
  it('should return empty for non-array products', () => {
    assert.deepEqual(applyFilters(null, createFilterState()), []);
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  4. VARIANT SELECTOR                                          ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const variantFixture = {
  variants: [
    { size: 'P', color: 'roxo', stock: 5, sku: 'COL-P-ROX' },
    { size: 'M', color: 'roxo', stock: 10, sku: 'COL-M-ROX' },
    { size: 'M', color: 'amarelo', stock: 3, sku: 'COL-M-AMA' },
    { size: 'G', color: 'roxo', stock: 0, sku: 'COL-G-ROX' }, // out of stock
    { size: 'G', color: 'amarelo', stock: 7, sku: 'COL-G-AMA' },
  ],
};

describe('VariantSelector — createVariantState', () => {
  it('should initialize with all available sizes and colors', () => {
    const s = createVariantState(variantFixture);
    assert.equal(s.selectedSize, null);
    assert.equal(s.selectedColor, null);
    assert.ok(s.availableSizes.includes('P'));
    assert.ok(s.availableSizes.includes('M'));
    assert.ok(s.availableSizes.includes('G'));
    assert.ok(s.availableColors.includes('roxo'));
    assert.ok(s.availableColors.includes('amarelo'));
  });
  it('should handle null product', () => {
    const s = createVariantState(null);
    assert.equal(s.selectedSize, null);
    assert.deepEqual(s.variants, []);
  });
});

describe('VariantSelector — selectSize', () => {
  it('should select a size and filter available colors', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'P');
    assert.equal(s.selectedSize, 'P');
    // Only roxo is available in P with stock > 0
    assert.deepEqual(s.availableColors, ['roxo']);
  });
  it('should deselect on re-click', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'M');
    s = selectSize(s, 'M');
    assert.equal(s.selectedSize, null);
  });
  it('should clear incompatible color when switching sizes', () => {
    let s = createVariantState(variantFixture);
    s = selectColor(s, 'amarelo');
    s = selectSize(s, 'P'); // amarelo not available in P
    assert.equal(s.selectedColor, null);
  });
  it('should keep compatible color when switching sizes', () => {
    let s = createVariantState(variantFixture);
    s = selectColor(s, 'roxo');
    s = selectSize(s, 'M'); // roxo IS available in M
    assert.equal(s.selectedColor, 'roxo');
  });
  it('G+roxo is OUT of stock, so only amarelo should be available for G', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'G');
    // G+roxo has stock=0, so only amarelo
    assert.deepEqual(s.availableColors, ['amarelo']);
  });
});

describe('VariantSelector — selectColor', () => {
  it('should select a color and filter available sizes', () => {
    let s = createVariantState(variantFixture);
    s = selectColor(s, 'amarelo');
    assert.equal(s.selectedColor, 'amarelo');
    // amarelo available in M (stock 3) and G (stock 7) — not P
    assert.ok(s.availableSizes.includes('M'));
    assert.ok(s.availableSizes.includes('G'));
    assert.ok(!s.availableSizes.includes('P'));
  });
  it('should deselect on re-click', () => {
    let s = createVariantState(variantFixture);
    s = selectColor(s, 'roxo');
    s = selectColor(s, 'roxo');
    assert.equal(s.selectedColor, null);
  });
});

describe('VariantSelector — getSelectedVariant', () => {
  it('should return matching variant', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'M');
    s = selectColor(s, 'roxo');
    const v = getSelectedVariant(s);
    assert.equal(v.sku, 'COL-M-ROX');
    assert.equal(v.stock, 10);
  });
  it('should return null when selection incomplete', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'M');
    assert.equal(getSelectedVariant(s), null);
  });
});

describe('VariantSelector — isSelectionComplete / getSelectionValidation', () => {
  it('should be incomplete initially', () => {
    assert.equal(isSelectionComplete(createVariantState(variantFixture)), false);
  });
  it('should be complete when both selected', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'M');
    s = selectColor(s, 'roxo');
    assert.equal(isSelectionComplete(s), true);
  });
  it('should validate: missing both', () => {
    const v = getSelectionValidation(createVariantState(variantFixture));
    assert.equal(v.valid, false);
    assert.equal(v.message, 'Selecione o tamanho e a cor');
  });
  it('should validate: missing color', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'M');
    const v = getSelectionValidation(s);
    assert.equal(v.valid, false);
    assert.equal(v.message, 'Selecione a cor');
  });
  it('should validate: valid selection', () => {
    let s = createVariantState(variantFixture);
    s = selectSize(s, 'M');
    s = selectColor(s, 'amarelo');
    const v = getSelectionValidation(s);
    assert.equal(v.valid, true);
    assert.equal(v.message, 'Pronto para adicionar');
  });
  it('should validate: out of stock variant', () => {
    let s = createVariantState(variantFixture);
    s = Object.assign({}, s, { selectedSize: 'G', selectedColor: 'roxo' }); // force OOS combo
    const v = getSelectionValidation(s);
    assert.equal(v.valid, false);
    assert.equal(v.message, 'Variante esgotada');
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  5. QUANTITY STEPPER                                          ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('QuantityStepper — createStepperState', () => {
  it('should create default state (1, min=1, max=99)', () => {
    const s = createStepperState();
    assert.equal(s.value, 1);
    assert.equal(s.min, 1);
    assert.equal(s.max, 99);
  });
  it('should accept custom initial/min/max', () => {
    const s = createStepperState(3, 1, 10);
    assert.equal(s.value, 3);
    assert.equal(s.min, 1);
    assert.equal(s.max, 10);
  });
  it('should clamp initial to bounds', () => {
    assert.equal(createStepperState(0, 1, 10).value, 1);
    assert.equal(createStepperState(15, 1, 10).value, 10);
  });
  it('should fix inverted min/max', () => {
    const s = createStepperState(1, 5, 3);
    assert.equal(s.min, 5);
    assert.equal(s.max, 5); // max corrected to min
  });
});

describe('QuantityStepper — increment / decrement', () => {
  it('should increment by 1', () => {
    const s = increment(createStepperState(1, 1, 10));
    assert.equal(s.value, 2);
  });
  it('should not exceed max', () => {
    const s = increment(createStepperState(10, 1, 10));
    assert.equal(s.value, 10);
  });
  it('should decrement by 1', () => {
    const s = decrement(createStepperState(5, 1, 10));
    assert.equal(s.value, 4);
  });
  it('should not go below min', () => {
    const s = decrement(createStepperState(1, 1, 10));
    assert.equal(s.value, 1);
  });
  it('should increment by custom step', () => {
    const s = increment(createStepperState(1, 1, 10), 3);
    assert.equal(s.value, 4);
  });
  it('should decrement by custom step', () => {
    const s = decrement(createStepperState(5, 1, 10), 2);
    assert.equal(s.value, 3);
  });
  it('should clamp increment to max', () => {
    const s = increment(createStepperState(8, 1, 10), 5);
    assert.equal(s.value, 10);
  });
});

describe('QuantityStepper — setValue', () => {
  it('should set value directly', () => {
    const s = setValue(createStepperState(1, 1, 10), 7);
    assert.equal(s.value, 7);
  });
  it('should clamp to min', () => {
    const s = setValue(createStepperState(5, 1, 10), -3);
    assert.equal(s.value, 1);
  });
  it('should clamp to max', () => {
    const s = setValue(createStepperState(5, 1, 10), 999);
    assert.equal(s.value, 10);
  });
  it('should round float to integer', () => {
    const s = setValue(createStepperState(1, 1, 10), 3.7);
    assert.equal(s.value, 4);
  });
  it('should ignore NaN', () => {
    const s = setValue(createStepperState(5, 1, 10), NaN);
    assert.equal(s.value, 5);
  });
});

describe('QuantityStepper — canIncrement / canDecrement', () => {
  it('canIncrement when below max', () => {
    assert.equal(canIncrement(createStepperState(5, 1, 10)), true);
  });
  it('cannot increment at max', () => {
    assert.equal(canIncrement(createStepperState(10, 1, 10)), false);
  });
  it('canDecrement when above min', () => {
    assert.equal(canDecrement(createStepperState(5, 1, 10)), true);
  });
  it('cannot decrement at min', () => {
    assert.equal(canDecrement(createStepperState(1, 1, 10)), false);
  });
  it('should handle null state', () => {
    assert.equal(canIncrement(null), false);
    assert.equal(canDecrement(null), false);
  });
});

describe('QuantityStepper — getStepperAriaLabel', () => {
  it('should generate accessible label', () => {
    const label = getStepperAriaLabel(createStepperState(3, 1, 10));
    assert.equal(label, 'Quantidade: 3 (mínimo 1, máximo 10)');
  });
  it('should handle null', () => {
    assert.equal(getStepperAriaLabel(null), 'Quantidade');
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  6. MINI CART                                                 ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('MiniCart — createMiniCartViewModel', () => {
  it('should create view model for cart with items', () => {
    const cart = { items: [{ id: '1', name: 'Deepblue', price: 69.90, quantity: 2 }], coupon: 'AMOPETS10', discountRate: 0.10 };
    const totals = { subtotal: 139.80, discount: 13.98, shipping: 0, total: 125.82, itemCount: 2, freeShipping: true };
    const vm = createMiniCartViewModel(cart, totals);
    assert.equal(vm.isEmpty, false);
    assert.equal(vm.items.length, 1);
    assert.equal(vm.itemCount, 2);
    assert.equal(vm.couponApplied, 'AMOPETS10');
    assert.equal(vm.freeShippingMessage, '🎉 Você ganhou frete grátis!');
    assert.ok(vm.discountFormatted.includes('13,98'));
    assert.equal(vm.shippingFormatted, 'Grátis');
  });

  it('should show empty state for null input', () => {
    const vm = createMiniCartViewModel(null, null);
    assert.equal(vm.isEmpty, true);
    assert.equal(vm.items.length, 0);
  });

  it('should show empty state for cart with no items', () => {
    const cart = { items: [], coupon: null, discountRate: 0 };
    const totals = { subtotal: 0, discount: 0, shipping: 14.90, total: 14.90, itemCount: 0, freeShipping: false };
    const vm = createMiniCartViewModel(cart, totals);
    assert.equal(vm.isEmpty, true);
  });

  it('should show how much left for free shipping', () => {
    const cart = { items: [{ id: '1', name: 'X', price: 50, quantity: 1 }], coupon: null, discountRate: 0 };
    const totals = { subtotal: 50, discount: 0, shipping: 14.90, total: 64.90, itemCount: 1, freeShipping: false };
    const vm = createMiniCartViewModel(cart, totals);
    assert.ok(vm.freeShippingMessage.includes('100,00')); // 150-50 = 100
    assert.ok(vm.freeShippingMessage.includes('frete grátis'));
  });

  it('should format line totals correctly', () => {
    const cart = { items: [{ id: '1', name: 'X', price: 69.90, quantity: 3 }], coupon: null, discountRate: 0 };
    const totals = { subtotal: 209.70, discount: 0, shipping: 0, total: 209.70, itemCount: 3, freeShipping: true };
    const vm = createMiniCartViewModel(cart, totals);
    assert.equal(vm.items[0].lineTotal, 209.70);
    assert.ok(vm.items[0].lineTotalFormatted.includes('209,70'));
  });
});

describe('MiniCart — getEmptyCartMessage', () => {
  it('should return empty cart message', () => {
    const msg = getEmptyCartMessage();
    assert.ok(msg.title.includes('vazio'));
    assert.ok(msg.description.includes('coleira'));
    assert.equal(msg.ctaText, 'Ver Coleiras');
    assert.equal(msg.ctaHref, '#products');
  });
});

describe('MiniCart — getFreeShippingProgress', () => {
  it('should return 0 for no items', () => {
    assert.equal(getFreeShippingProgress(0), 0);
  });
  it('should return 0.5 for half way', () => {
    assert.equal(getFreeShippingProgress(75), 0.5);
  });
  it('should cap at 1', () => {
    assert.equal(getFreeShippingProgress(200), 1);
  });
  it('should return exactly 1 at threshold', () => {
    assert.equal(getFreeShippingProgress(150), 1);
  });
  it('should work with custom threshold', () => {
    assert.equal(getFreeShippingProgress(50, 100), 0.5);
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  7. ADDRESS FORM                                             ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('AddressForm — createAddressFormState', () => {
  it('should create empty state', () => {
    const s = createAddressFormState();
    assert.equal(s.cep, '');
    assert.equal(s.street, '');
    assert.equal(s.number, '');
    assert.equal(s.complement, '');
    assert.equal(s.neighborhood, '');
    assert.equal(s.city, '');
    assert.equal(s.state, '');
    assert.equal(s.isLookingUpCep, false);
    assert.deepEqual(s.errors, {});
    assert.deepEqual(s.touched, {});
  });
});

describe('AddressForm — updateField', () => {
  it('should update field value', () => {
    let s = createAddressFormState();
    s = updateField(s, 'cep', '01310-100');
    assert.equal(s.cep, '01310-100');
  });
  it('should mark field as touched', () => {
    let s = createAddressFormState();
    s = updateField(s, 'street', 'Rua das Flores');
    assert.equal(s.touched.street, true);
  });
  it('should clear error on field change', () => {
    let s = createAddressFormState();
    s.errors = { street: 'Rua é obrigatória' };
    s = updateField(s, 'street', 'Rua Nova');
    assert.equal(s.errors.street, undefined);
  });
  it('should not mutate original state', () => {
    const s = createAddressFormState();
    const next = updateField(s, 'city', 'São Paulo');
    assert.equal(s.city, '');
    assert.equal(next.city, 'São Paulo');
  });
});

describe('AddressForm — applyCepLookup', () => {
  it('should auto-fill from CEP data', () => {
    let s = createAddressFormState();
    s = updateField(s, 'cep', '01310-100');
    s = applyCepLookup(s, { street: 'Av. Paulista', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' });
    assert.equal(s.street, 'Av. Paulista');
    assert.equal(s.neighborhood, 'Bela Vista');
    assert.equal(s.city, 'São Paulo');
    assert.equal(s.state, 'SP');
    assert.equal(s.cepLookedUp, true);
    assert.equal(s.isLookingUpCep, false);
  });
  it('should keep existing values if CEP data is partial', () => {
    let s = createAddressFormState();
    s = updateField(s, 'neighborhood', 'Meu Bairro');
    s = applyCepLookup(s, { street: 'Rua X', city: 'Y', state: 'RJ' }); // no neighborhood
    assert.equal(s.neighborhood, 'Meu Bairro'); // preserved
    assert.equal(s.street, 'Rua X'); // updated
  });
});

describe('AddressForm — setCepLoading', () => {
  it('should set loading state', () => {
    let s = createAddressFormState();
    s = setCepLoading(s, true);
    assert.equal(s.isLookingUpCep, true);
    s = setCepLoading(s, false);
    assert.equal(s.isLookingUpCep, false);
  });
});

describe('AddressForm — validateAddressForm', () => {
  const validAddress = { cep: '01310100', street: 'Av. Paulista', number: '1000', complement: '', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', errors: {}, touched: {} };

  it('should pass for valid address', () => {
    const r = validateAddressForm(validAddress);
    assert.equal(r.valid, true);
    assert.deepEqual(r.errors, {});
  });
  it('should fail for missing CEP', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { cep: '' }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.cep);
  });
  it('should fail for short CEP', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { cep: '0131' }));
    assert.equal(r.valid, false);
    assert.match(r.errors.cep, /8 dígitos/);
  });
  it('should fail for missing street', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { street: '' }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.street);
  });
  it('should fail for short street', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { street: 'Ab' }));
    assert.equal(r.valid, false);
    assert.match(r.errors.street, /3 caracteres/);
  });
  it('should fail for missing number', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { number: '' }));
    assert.equal(r.valid, false);
  });
  it('should fail for missing city', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { city: '' }));
    assert.equal(r.valid, false);
  });
  it('should fail for invalid state', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { state: 'XX' }));
    assert.equal(r.valid, false);
    assert.match(r.errors.state, /inválido/);
  });
  it('should accept complement as optional', () => {
    const r = validateAddressForm(Object.assign({}, validAddress, { complement: '' }));
    assert.equal(r.valid, true);
  });
  it('should return multiple errors at once', () => {
    const r = validateAddressForm(createAddressFormState());
    assert.equal(r.valid, false);
    assert.ok(Object.keys(r.errors).length >= 5); // cep, street, number, neighborhood, city, state
  });
});

describe('AddressForm — getFieldError', () => {
  it('should return null for untouched field', () => {
    let s = createAddressFormState();
    s.errors = { street: 'Rua é obrigatória' };
    assert.equal(getFieldError(s, 'street'), null); // not touched
  });
  it('should return error for touched field', () => {
    let s = createAddressFormState();
    s.errors = { street: 'Rua é obrigatória' };
    s.touched = { street: true };
    assert.equal(getFieldError(s, 'street'), 'Rua é obrigatória');
  });
  it('should return null for field without error', () => {
    let s = createAddressFormState();
    s.touched = { street: true };
    assert.equal(getFieldError(s, 'street'), null);
  });
});

describe('AddressForm — isFormSubmittable', () => {
  it('should return false for empty form', () => {
    assert.equal(isFormSubmittable(createAddressFormState()), false);
  });
  it('should return true for valid form', () => {
    const valid = { cep: '01310100', street: 'Av. Paulista', number: '1000', complement: '', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', errors: {}, touched: {} };
    assert.equal(isFormSubmittable(valid), true);
  });
});


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  8. ORDER SUMMARY                                            ║
   ╚═══════════════════════════════════════════════════════════════╝ */

describe('OrderSummary — createOrderSummary', () => {
  const mockCart = { items: [{ id: '1', name: 'Deepblue', price: 69.90, quantity: 2 }, { id: '2', name: 'Girassol', price: 59.90, quantity: 1 }], coupon: 'AMOPETS10', discountRate: 0.10 };
  const mockTotals = { subtotal: 199.70, discount: 19.97, shipping: 0, total: 179.73, itemCount: 3, freeShipping: true };
  const mockAddress = { cep: '01310100', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' };

  it('should create complete order summary', () => {
    const s = createOrderSummary(mockCart, mockTotals, mockAddress, 'card');
    assert.equal(s.valid, true);
    assert.equal(s.lineItems.length, 2);
    assert.equal(s.itemCount, 3);
    assert.ok(s.subtotalFormatted.includes('199,70'));
    assert.ok(s.discountFormatted.includes('19,97'));
    assert.equal(s.shippingFormatted, 'Grátis');
    assert.equal(s.freeShipping, true);
    assert.equal(s.coupon, 'AMOPETS10');
    assert.equal(s.paymentMethod, 'card');
    assert.equal(s.pixDiscount, 0);
    assert.ok(s.shippingAddress.includes('Av. Paulista'));
    assert.ok(s.estimatedDelivery.includes('3'));
  });

  it('should apply 5% Pix discount', () => {
    const s = createOrderSummary(mockCart, mockTotals, mockAddress, 'pix');
    assert.ok(s.pixDiscount > 0);
    assert.equal(s.pixDiscount, Math.round(179.73 * 0.05 * 100) / 100);
    assert.ok(s.total < mockTotals.total);
  });

  it('should not apply Pix discount for card payment', () => {
    const s = createOrderSummary(mockCart, mockTotals, mockAddress, 'card');
    assert.equal(s.pixDiscount, 0);
    assert.equal(s.pixDiscountFormatted, null);
  });

  it('should format line items', () => {
    const s = createOrderSummary(mockCart, mockTotals, mockAddress, 'card');
    assert.equal(s.lineItems[0].unitPrice, 69.90);
    assert.equal(s.lineItems[0].quantity, 2);
    assert.equal(s.lineItems[0].lineTotal, 139.80);
    assert.ok(s.lineItems[0].lineTotalFormatted.includes('139,80'));
  });

  it('should handle null cart', () => {
    const s = createOrderSummary(null, null, null, null);
    assert.equal(s.valid, false);
    assert.equal(s.error, 'Carrinho vazio');
  });

  it('should format shipping address', () => {
    const s = createOrderSummary(mockCart, mockTotals, mockAddress, 'card');
    assert.ok(s.shippingAddress.includes('Av. Paulista'));
    assert.ok(s.shippingAddress.includes('1000'));
    assert.ok(s.shippingAddress.includes('São Paulo'));
    assert.ok(s.shippingAddress.includes('SP'));
    assert.ok(s.shippingAddress.includes('01310100'));
  });

  it('should estimate delivery by state', () => {
    const sp = createOrderSummary(mockCart, mockTotals, Object.assign({}, mockAddress, { state: 'SP' }), 'card');
    assert.ok(sp.estimatedDelivery.includes('3'));
    const rs = createOrderSummary(mockCart, mockTotals, Object.assign({}, mockAddress, { state: 'RS' }), 'card');
    assert.ok(rs.estimatedDelivery.includes('6'));
  });
});

describe('OrderSummary — validateOrder', () => {
  const validSummary = { valid: true, lineItems: [{ id: '1' }] };
  const validAddress = { cep: '01310100', street: 'Rua X', number: '10', neighborhood: 'Y', city: 'Z', state: 'SP' };

  it('should pass for valid order', () => {
    const r = validateOrder(validSummary, validAddress, 'pix');
    assert.equal(r.ready, true);
    assert.deepEqual(r.issues, []);
  });
  it('should fail for empty cart', () => {
    const r = validateOrder(null, validAddress, 'pix');
    assert.equal(r.ready, false);
    assert.ok(r.issues.includes('Carrinho está vazio'));
  });
  it('should fail for missing address', () => {
    const r = validateOrder(validSummary, null, 'pix');
    assert.equal(r.ready, false);
    assert.ok(r.issues.includes('Endereço incompleto'));
  });
  it('should fail for incomplete address', () => {
    const r = validateOrder(validSummary, { cep: '123' }, 'pix');
    assert.equal(r.ready, false);
    assert.ok(r.issues.includes('Endereço incompleto'));
  });
  it('should fail for missing payment method', () => {
    const r = validateOrder(validSummary, validAddress, null);
    assert.equal(r.ready, false);
    assert.ok(r.issues.includes('Selecione uma forma de pagamento'));
  });
  it('should fail for invalid payment method', () => {
    const r = validateOrder(validSummary, validAddress, 'bitcoin');
    assert.equal(r.ready, false);
    assert.ok(r.issues.includes('Forma de pagamento inválida'));
  });
  it('should collect multiple issues', () => {
    const r = validateOrder(null, null, null);
    assert.equal(r.issues.length, 3);
  });
});

describe('OrderSummary — getPaymentMethodInfo', () => {
  it('should return Pix info with discount flag', () => {
    const info = getPaymentMethodInfo('pix');
    assert.equal(info.label, 'Pix');
    assert.equal(info.discount, true);
  });
  it('should return card info', () => {
    const info = getPaymentMethodInfo('card');
    assert.equal(info.label, 'Cartão de Crédito');
    assert.equal(info.discount, false);
  });
  it('should return boleto info', () => {
    const info = getPaymentMethodInfo('boleto');
    assert.equal(info.label, 'Boleto Bancário');
    assert.equal(info.discount, false);
  });
  it('should return null for unknown method', () => {
    assert.equal(getPaymentMethodInfo('bitcoin'), null);
  });
});

describe('OrderSummary — calculateSavings', () => {
  it('should calculate savings with coupon + freeShipping + pix', () => {
    const summary = { discount: 20, freeShipping: true, pixDiscount: 9 };
    const s = calculateSavings(summary);
    assert.equal(s.totalSavings, 43.90); // 20 + 14.90 + 9
    assert.equal(s.breakdown.length, 3);
  });
  it('should return zero for no savings', () => {
    const summary = { discount: 0, freeShipping: false, pixDiscount: 0 };
    const s = calculateSavings(summary);
    assert.equal(s.totalSavings, 0);
    assert.equal(s.breakdown.length, 0);
  });
  it('should handle null', () => {
    const s = calculateSavings(null);
    assert.equal(s.totalSavings, 0);
  });
  it('should include free shipping in breakdown', () => {
    const summary = { discount: 0, freeShipping: true, pixDiscount: 0 };
    const s = calculateSavings(summary);
    assert.equal(s.totalSavings, 14.90);
    assert.ok(s.breakdown[0].includes('Frete'));
  });
});
