/**
 * AMOPETS — Catalog Orchestrator
 * Handles URL syncing, filtering, pagination, and rendering the product grid.
 */

// ─── Shared Imports (R1-R9 refactored) ───
import { formatCurrency, formatSlug } from './utils/formatters.js';
import { cartReducer, CartActions, loadCart, saveCart } from './utils/cart.js';
import { syncCartBadge, showToast, animateButtonSuccess } from './utils/dom.js';
import { parseProductFilters, buildQueryString } from './utils/queryParams.js';
import { getCatalogProducts } from './data/products.js';
import {
  createFilterState, toggleCategory, toggleSize, toggleColor,
  setSort, setSearch, clearAllFilters, applyFilters
} from './components/sideFilter.js';

const PRODUCTS_PER_PAGE = 6;

let products = [];
const _state = {
  filters: null,
  page: 1,
};

let elements = {};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  initElements();
  buildProducts();
  initFilterState();
  attachListeners();
  render();
}

function initElements() {
  elements = {
    grid: document.getElementById('catalog-products-grid'),
    pagination: document.getElementById('pagination'),
    paginationNumbers: document.getElementById('pagination-numbers'),
    prevBtn: document.getElementById('page-prev'),
    nextBtn: document.getElementById('page-next'),
    emptyState: document.getElementById('empty-state'),
    activeFilters: document.getElementById('active-filters'),
    resultsCount: document.getElementById('results-count'),
    sortDropdown: document.getElementById('sort-dropdown'),
    catalogSearch: document.getElementById('catalog-search'),

    sidebar: document.getElementById('catalog-sidebar'),
    overlay: document.getElementById('sidebar-overlay'),
    btnMobileFilters: document.getElementById('btn-mobile-filters'),
    btnCloseFilters: document.getElementById('btn-close-filters'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    btnEmptyClear: document.getElementById('btn-empty-clear'),

    categoryInputs: document.querySelectorAll('input[name="category"]'),
    sizeInputs: document.querySelectorAll('input[name="size"]'),
    colorInputs: document.querySelectorAll('input[name="color"]'),
  };
}

function buildProducts() {
  // Use shared catalog data, clone to get 18 items for pagination demo
  const baseProducts = getCatalogProducts();
  products = [];
  for (let i = 0; i < 18; i++) {
    const base = baseProducts[i % baseProducts.length];
    products.push(Object.assign({}, base, {
      id: base.id + '-' + i,
      price: base.price + (Math.floor(Math.random() * 10) - 5),
    }));
  }
}

function initFilterState() {
  const rawParams = parseProductFilters(window.location.search);

  _state.filters = createFilterState();

  if (rawParams.category) {
    const cats = Array.isArray(rawParams.category) ? rawParams.category : [rawParams.category];
    cats.forEach(function (c) { _state.filters = toggleCategory(_state.filters, c); });
  }
  if (rawParams.size) {
    const sizes = Array.isArray(rawParams.size) ? rawParams.size : [rawParams.size];
    sizes.forEach(function (s) { _state.filters = toggleSize(_state.filters, s); });
  }
  if (rawParams.color) {
    const colors = Array.isArray(rawParams.color) ? rawParams.color : [rawParams.color];
    colors.forEach(function (c) { _state.filters = toggleColor(_state.filters, c); });
  }

  if (rawParams.sort) {
    _state.filters = setSort(_state.filters, rawParams.sort);
    if (elements.sortDropdown) elements.sortDropdown.value = _state.filters.sort;
  }

  if (rawParams.search) {
    _state.filters = setSearch(_state.filters, rawParams.search);
    if (elements.catalogSearch) elements.catalogSearch.value = _state.filters.search;
  }

  _state.page = rawParams.page || 1;
  syncSidebarInputsToState();
}

function syncSidebarInputsToState() {
  elements.categoryInputs.forEach(function (input) {
    input.checked = _state.filters.categories.indexOf(input.value) >= 0;
  });
  elements.sizeInputs.forEach(function (input) {
    input.checked = _state.filters.sizes.indexOf(input.value) >= 0;
  });
  elements.colorInputs.forEach(function (input) {
    input.checked = _state.filters.colors.indexOf(input.value) >= 0;
  });
}

function attachListeners() {
  if (elements.sortDropdown) {
    elements.sortDropdown.addEventListener('change', function (e) {
      handleStateChange(function () {
        _state.filters = setSort(_state.filters, e.target.value);
      }, true);
    });
  }

  let searchTimeout;
  if (elements.catalogSearch) {
    elements.catalogSearch.addEventListener('input', function (e) {
      const val = e.target.value;
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () {
        handleStateChange(function () {
          _state.filters = setSearch(_state.filters, val);
        }, true);
      }, 300);
    });
  }

  const wrapChange = function (fn) {
    return function (e) {
      handleStateChange(function () { fn(e.target.value); }, true);
    };
  };

  elements.categoryInputs.forEach(function (i) {
    i.addEventListener('change', wrapChange(function (v) { _state.filters = toggleCategory(_state.filters, v); }));
  });
  elements.sizeInputs.forEach(function (i) {
    i.addEventListener('change', wrapChange(function (v) { _state.filters = toggleSize(_state.filters, v); }));
  });
  elements.colorInputs.forEach(function (i) {
    i.addEventListener('change', wrapChange(function (v) { _state.filters = toggleColor(_state.filters, v); }));
  });

  const clearAll = function () {
    handleStateChange(function () { _state.filters = clearAllFilters(); }, true);
    syncSidebarInputsToState();
    if (elements.sortDropdown) elements.sortDropdown.value = 'relevance';
    if (elements.catalogSearch) elements.catalogSearch.value = '';
  };
  if (elements.btnClearFilters) elements.btnClearFilters.addEventListener('click', clearAll);
  if (elements.btnEmptyClear) elements.btnEmptyClear.addEventListener('click', clearAll);

  elements.activeFilters.addEventListener('click', function (e) {
    const btn = e.target.closest('.filter-pill__remove');
    if (!btn) return;
    const type = btn.dataset.type;
    const value = btn.dataset.value;

    handleStateChange(function () {
      if (type === 'cat') _state.filters = toggleCategory(_state.filters, value);
      if (type === 'size') _state.filters = toggleSize(_state.filters, value);
      if (type === 'color') _state.filters = toggleColor(_state.filters, value);
      if (type === 'search') {
        _state.filters = setSearch(_state.filters, '');
        if (elements.catalogSearch) elements.catalogSearch.value = '';
      }
    }, true);
    syncSidebarInputsToState();
  });

  if (elements.btnMobileFilters) {
    elements.btnMobileFilters.addEventListener('click', function () {
      elements.sidebar.classList.add('active');
      elements.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeSidebar = function () {
    elements.sidebar.classList.remove('active');
    elements.overlay.classList.remove('active');
    document.body.style.overflow = '';
  };
  if (elements.btnCloseFilters) elements.btnCloseFilters.addEventListener('click', closeSidebar);
  if (elements.overlay) elements.overlay.addEventListener('click', closeSidebar);

  elements.prevBtn.addEventListener('click', function () {
    if (_state.page > 1) handleStateChange(function () { _state.page--; }, false);
  });
  elements.nextBtn.addEventListener('click', function () {
    handleStateChange(function () { _state.page++; }, false);
  });
  elements.paginationNumbers.addEventListener('click', function (e) {
    const numBtn = e.target.closest('.pagination__num');
    if (!numBtn) return;
    const targetPage = parseInt(numBtn.dataset.page, 10);
    if (targetPage !== _state.page) handleStateChange(function () { _state.page = targetPage; }, false);
  });

  // Add to cart delegation — uses shared cart reducer
  elements.grid.addEventListener('click', function (e) {
    const cta = e.target.closest('.product-card__cta');
    if (!cta) return;
    e.preventDefault();

    const card = cta.closest('.product-card');
    const productId = card ? card.dataset.id : 'unknown';

    // Add to cart
    const item = {
      id: productId,
      name: card ? card.querySelector('.product-card__name').textContent : 'Produto',
      price: 0,
      image: card ? card.querySelector('.product-card__image').src : '',
    };
    // Try to get price from rendered text
    const priceEl = card ? card.querySelector('.product-card__price') : null;
    if (priceEl) {
      const priceText = priceEl.textContent.replace(/[^\d,.-]/g, '').replace(',', '.');
      item.price = parseFloat(priceText) || 0;
    }

    let cart = loadCart();
    cart = cartReducer(cart, { type: CartActions.ADD_ITEM, payload: item });
    saveCart(cart);

    animateButtonSuccess(cta, '✓ Adicionado!');
    showToast('cart-toast');
    syncCartBadge();
  });

  window.addEventListener('popstate', function () {
    initFilterState();
    render();
  });
}

function handleStateChange(updateFn, resetPage) {
  updateFn();
  if (resetPage) _state.page = 1;

  const p = {};
  if (_state.filters.categories.length) p.category = _state.filters.categories;
  if (_state.filters.sizes.length) p.size = _state.filters.sizes;
  if (_state.filters.colors.length) p.color = _state.filters.colors;
  if (_state.filters.sort !== 'relevance') p.sort = _state.filters.sort;
  if (_state.filters.search && _state.filters.search.trim().length > 0) p.q = _state.filters.search.trim();
  if (_state.page > 1) p.page = _state.page;

  const qs = buildQueryString(p);
  const newUrl = window.location.pathname + (qs ? '?' + qs : '');

  window.history.pushState(null, '', newUrl);
  render();
}

function render() {
  const filtered = applyFilters(products, _state.filters);

  renderActiveFilters();

  elements.resultsCount.textContent = 'Exibindo ' + filtered.length + ' produto' + (filtered.length !== 1 ? 's' : '');

  if (filtered.length === 0) {
    elements.grid.style.display = 'none';
    elements.pagination.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.grid.style.display = 'grid';
  elements.emptyState.style.display = 'none';

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  if (_state.page > totalPages) _state.page = totalPages;
  if (_state.page < 1) _state.page = 1;

  const start = (_state.page - 1) * PRODUCTS_PER_PAGE;
  const currentSlice = filtered.slice(start, start + PRODUCTS_PER_PAGE);

  renderGrid(currentSlice);

  if (totalPages > 1) {
    elements.pagination.style.display = 'flex';
    renderPagination(totalPages);
  } else {
    elements.pagination.style.display = 'none';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderActiveFilters() {
  const html = [];
  const f = _state.filters;

  function makePill(label, type, val) {
    return '<div class="filter-pill">' + label +
      '<button class="filter-pill__remove" data-type="' + type + '" data-value="' + val + '" aria-label="Remover filtro ' + label + '">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button></div>';
  }

  if (f.search && f.search.trim().length > 0) {
    html.push(makePill('Busca: "' + f.search + '"', 'search', ''));
  }

  f.categories.forEach(function (c) { html.push(makePill('Cat: ' + c, 'cat', c)); });
  f.sizes.forEach(function (s) { html.push(makePill('Tam: ' + s, 'size', s)); });
  f.colors.forEach(function (c) { html.push(makePill('Cor: ' + c, 'color', c)); });

  elements.activeFilters.innerHTML = html.join('');
}

function renderGrid(slice) {
  elements.grid.innerHTML = slice.map(function (p) {
    let badge = '';
    if (p.isNew) badge = '<span class="badge badge--new">NOVO</span>';
    else if (p.isPopular) badge = '<span class="badge badge--popular">🔥 Popular</span>';

    const formattedPrice = formatCurrency(p.price);
    const slug = formatSlug(p.name);

    return '<article class="product-card" data-id="' + p.id + '">' +
      '<a href="product.html?p=' + slug + '" class="product-card__image-wrapper">' +
        badge +
        '<img class="product-card__image" src="' + p.imageUrl + '" alt="' + p.name + '" loading="lazy" decoding="async" width="400" height="400">' +
      '</a>' +
      '<div class="product-card__body">' +
        '<a href="product.html?p=' + slug + '" class="product-card__name-link">' +
          '<h3 class="product-card__name">' + p.name + '</h3>' +
        '</a>' +
        '<p class="product-card__price">' + formattedPrice + '</p>' +
        '<button class="btn btn-primary btn-small product-card__cta" aria-label="Adicionar ' + p.name + ' ao carrinho">Adicionar 🛒</button>' +
      '</div>' +
    '</article>';
  }).join('');
}

function renderPagination(totalPages) {
  elements.prevBtn.disabled = _state.page === 1;
  elements.nextBtn.disabled = _state.page === totalPages;

  const numHtml = [];
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === _state.page ? 'pagination__num--active' : '';
    const ariaCurrent = i === _state.page ? ' aria-current="page"' : '';
    numHtml.push('<button class="pagination__num ' + isActive + '" data-page="' + i + '"' + ariaCurrent + ' aria-label="Página ' + i + '">' + i + '</button>');
  }

  elements.paginationNumbers.innerHTML = numHtml.join('');
}
