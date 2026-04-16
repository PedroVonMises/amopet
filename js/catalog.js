/**
 * AMOPETS — Catalog Orchestrator
 * Handles URL syncing, filtering, pagination, and rendering the product grid.
 */

(function () {
  'use strict';

  // Requires existing components: sideFilter, queryParams, productCard (if using its VM layer format, though here we'll define raw data).
  var products = [];
  var PRODUCTS_PER_PAGE = 6; // Because we'll mock 18 items to show pagination

  var state = {
    filters: null, // from sideFilter.js
    page: 1
  };

  var elements = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initElements();
    mockProducts();
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
      
      // Sidebar
      sidebar: document.getElementById('catalog-sidebar'),
      overlay: document.getElementById('sidebar-overlay'),
      btnMobileFilters: document.getElementById('btn-mobile-filters'),
      btnCloseFilters: document.getElementById('btn-close-filters'),
      btnClearFilters: document.getElementById('btn-clear-filters'),
      btnEmptyClear: document.getElementById('btn-empty-clear'),
      
      // Checkboxes
      categoryInputs: document.querySelectorAll('input[name="category"]'),
      sizeInputs: document.querySelectorAll('input[name="size"]'),
      colorInputs: document.querySelectorAll('input[name="color"]')
    };
  }

  function mockProducts() {
    // We have 8 real ones, let's clone them to make 18 for pagination
    var baseProducts = [
      { id: 'p1', name: 'Coleira Ametista Brilhante', price: 69.90, category: 'coleiras', sizes: ['P','M'], colors: ['roxo','preto'], imageUrl: 'images/collar-ametista.png', isNew: true, isPopular: false },
      { id: 'p2', name: 'Coleira Girassol Adventure', price: 59.90, category: 'coleiras', sizes: ['M','G'], colors: ['amarelo','preto'], imageUrl: 'images/collar-girassol.png', isPopular: true },
      { id: 'p3', name: 'Coleira Lavanda Dreams', price: 74.90, category: 'coleiras', sizes: ['PP','P','M'], colors: ['roxo','rosa'], imageUrl: 'images/collar-lavanda.png' },
      { id: 'p4', name: 'Coleira Sunset Glow (LED)', price: 89.90, category: 'coleiras-led', sizes: ['M','G','GG'], colors: ['amarelo','roxo'], imageUrl: 'images/collar-sunset-led.png', isNew: true },
      { id: 'p5', name: 'Coleira Vanilla Classic', price: 49.90, category: 'coleiras-couro', sizes: ['P','M','G'], colors: ['branco','azul'], imageUrl: 'images/collar-vanilla.png' },
      { id: 'p6', name: 'Coleira Galaxy Night', price: 79.90, category: 'coleiras', sizes: ['M','G'], colors: ['azul','preto'], imageUrl: 'images/collar-galaxy.png' },
      { id: 'p7', name: 'Coleira Tropical Vibes', price: 64.90, category: 'coleiras-nylon', sizes: ['P','M'], colors: ['amarelo','rosa'], imageUrl: 'images/collar-tropical.png', isPopular: true },
      { id: 'p8', name: 'Coleira Marshmallow Soft', price: 54.90, category: 'coleiras', sizes: ['PP','P'], colors: ['rosa','branco'], imageUrl: 'images/collar-marshmallow.png' },
    ];

    // Clone base to get 18 items
    for (var i = 0; i < 18; i++) {
      var base = baseProducts[i % baseProducts.length];
      products.push(Object.assign({}, base, {
        id: base.id + '-' + i,
        // Make prices slightly different to test sorting
        price: base.price + (Math.floor(Math.random() * 10) - 5)
      }));
    }
  }

  function initFilterState() {
    var rawParams = window.parseProductFilters(window.location.search);
    
    // Seed the state
    state.filters = window.createFilterState();
    
    if (rawParams.category) {
      var cats = Array.isArray(rawParams.category) ? rawParams.category : [rawParams.category];
      cats.forEach(function(c) { state.filters = window.toggleCategory(state.filters, c); });
    }
    if (rawParams.size) {
      var sizes = Array.isArray(rawParams.size) ? rawParams.size : [rawParams.size];
      sizes.forEach(function(s) { state.filters = window.toggleSize(state.filters, s); });
    }
    if (rawParams.color) {
      var colors = Array.isArray(rawParams.color) ? rawParams.color : [rawParams.color];
      colors.forEach(function(c) { state.filters = window.toggleColor(state.filters, c); });
    }
    
    if (rawParams.sort) {
      state.filters = window.setSort(state.filters, rawParams.sort);
      if (elements.sortDropdown) elements.sortDropdown.value = state.filters.sort;
    }
    
    if (rawParams.q) {
      state.filters = window.setSearch(state.filters, rawParams.q);
      if (elements.catalogSearch) elements.catalogSearch.value = state.filters.search;
    }

    state.page = rawParams.page || 1;

    syncSidebarInputsToState();
  }

  function syncSidebarInputsToState() {
    elements.categoryInputs.forEach(function(input) {
      input.checked = state.filters.categories.indexOf(input.value) >= 0;
    });
    elements.sizeInputs.forEach(function(input) {
      input.checked = state.filters.sizes.indexOf(input.value) >= 0;
    });
    elements.colorInputs.forEach(function(input) {
      input.checked = state.filters.colors.indexOf(input.value) >= 0;
    });
  }

  function attachListeners() {
    // Sort
    if (elements.sortDropdown) {
      elements.sortDropdown.addEventListener('change', function(e) {
        handleStateChange(function() {
          state.filters = window.setSort(state.filters, e.target.value);
        }, true);
      });
    }

    // Search with debounce
    var searchTimeout;
    if (elements.catalogSearch) {
      elements.catalogSearch.addEventListener('input', function(e) {
        var val = e.target.value;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
          handleStateChange(function() {
            state.filters = window.setSearch(state.filters, val);
          }, true);
        }, 300);
      });
    }

    // Filters
    var wrapChange = function(fn) {
      return function(e) {
        handleStateChange(function() { fn(e.target.value); }, true);
      };
    };

    elements.categoryInputs.forEach(function(i) {
      i.addEventListener('change', wrapChange(function(v) { state.filters = window.toggleCategory(state.filters, v); }));
    });
    elements.sizeInputs.forEach(function(i) {
      i.addEventListener('change', wrapChange(function(v) { state.filters = window.toggleSize(state.filters, v); }));
    });
    elements.colorInputs.forEach(function(i) {
      i.addEventListener('change', wrapChange(function(v) { state.filters = window.toggleColor(state.filters, v); }));
    });

    // Clear
    var clearAll = function() {
      handleStateChange(function() { state.filters = window.clearAllFilters(); }, true);
      syncSidebarInputsToState();
      if (elements.sortDropdown) elements.sortDropdown.value = 'relevance';
      if (elements.catalogSearch) elements.catalogSearch.value = '';
    };
    if (elements.btnClearFilters) elements.btnClearFilters.addEventListener('click', clearAll);
    if (elements.btnEmptyClear) elements.btnEmptyClear.addEventListener('click', clearAll);

    // Active Pills delegation
    elements.activeFilters.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-pill__remove');
      if (!btn) return;
      var type = btn.dataset.type;
      var value = btn.dataset.value;
      
      handleStateChange(function() {
        if (type === 'cat') state.filters = window.toggleCategory(state.filters, value);
        if (type === 'size') state.filters = window.toggleSize(state.filters, value);
        if (type === 'color') state.filters = window.toggleColor(state.filters, value);
        if (type === 'search') {
          state.filters = window.setSearch(state.filters, '');
          if (elements.catalogSearch) elements.catalogSearch.value = '';
        }
      }, true);
      syncSidebarInputsToState();
    });

    // Mobile Sidebar
    if (elements.btnMobileFilters) {
      elements.btnMobileFilters.addEventListener('click', function() {
        elements.sidebar.classList.add('active');
        elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
    
    var closeSidebar = function() {
      elements.sidebar.classList.remove('active');
      elements.overlay.classList.remove('active');
      document.body.style.overflow = '';
    };
    if (elements.btnCloseFilters) elements.btnCloseFilters.addEventListener('click', closeSidebar);
    if (elements.overlay) elements.overlay.addEventListener('click', closeSidebar);

    // Pagination
    elements.prevBtn.addEventListener('click', function() {
      if (state.page > 1) {
        handleStateChange(function() { state.page--; }, false);
      }
    });
    elements.nextBtn.addEventListener('click', function() {
      // we check upper bound in render
      handleStateChange(function() { state.page++; }, false);
    });
    elements.paginationNumbers.addEventListener('click', function(e) {
      var numBtn = e.target.closest('.pagination__num');
      if (!numBtn) return;
      var targetPage = parseInt(numBtn.dataset.page, 10);
      if (targetPage !== state.page) {
        handleStateChange(function() { state.page = targetPage; }, false);
      }
    });

    // Add to cart delegation
    elements.grid.addEventListener('click', function(e) {
      var cta = e.target.closest('.product-card__cta');
      if (!cta) return;
      e.preventDefault();
      
      var card = cta.closest('.product-card');
      var originalText = cta.textContent;
      cta.textContent = '✓ Adicionado!';
      cta.style.background = '#27ae60';
      cta.style.color = '#fff';
      
      setTimeout(function() {
        cta.textContent = originalText;
        cta.style.background = '';
        cta.style.color = '';
      }, 1500);

      var toast = document.getElementById('cart-toast');
      if (toast) {
        toast.style.transform = 'translateX(0)';
        setTimeout(function() { toast.style.transform = 'translateX(120%)'; }, 3500);
      }

      // Update badge via storage proxy hack locally
      var countLabel = document.getElementById('cart-count');
      if (countLabel) {
        var p = parseInt(countLabel.textContent) || 0;
        countLabel.textContent = p + 1;
        countLabel.style.display = '';
      }
    });

    // Popstate
    window.addEventListener('popstate', function() {
      initFilterState();
      render();
    });
  }

  function handleStateChange(updateFn, resetPage) {
    updateFn();
    if (resetPage) state.page = 1;
    
    // Build query params
    var paramsString = '';
    var p = {};
    if (state.filters.categories.length) p.category = state.filters.categories;
    if (state.filters.sizes.length) p.size = state.filters.sizes;
    if (state.filters.colors.length) p.color = state.filters.colors;
    if (state.filters.sort !== 'relevance') p.sort = state.filters.sort;
    if (state.filters.search && state.filters.search.trim().length > 0) p.q = state.filters.search.trim();
    if (state.page > 1) p.page = state.page;
    
    var qs = window.buildQueryString(p);
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    
    window.history.pushState(null, '', newUrl);
    render();
  }

  function render() {
    var filtered = window.applyFilters(products, state.filters);
    
    // Render Active Pills
    renderActiveFilters();

    elements.resultsCount.textContent = `Exibindo ${filtered.length} produto${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      elements.grid.style.display = 'none';
      elements.pagination.style.display = 'none';
      elements.emptyState.style.display = 'block';
      return;
    }

    elements.grid.style.display = 'grid';
    elements.emptyState.style.display = 'none';

    // Pagination Slice
    var totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    var start = (state.page - 1) * PRODUCTS_PER_PAGE;
    var currentSlice = filtered.slice(start, start + PRODUCTS_PER_PAGE);

    // Render Grid
    renderGrid(currentSlice);

    // Render Pagination Controls
    if (totalPages > 1) {
      elements.pagination.style.display = 'flex';
      renderPagination(totalPages);
    } else {
      elements.pagination.style.display = 'none';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderActiveFilters() {
    var html = [];
    var f = state.filters;
    
    var makePill = (label, type, val) => `
      <div class="filter-pill">
        ${label}
        <button class="filter-pill__remove" data-type="${type}" data-value="${val}" aria-label="Remover filtro ${label}">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;

    if (f.search && f.search.trim().length > 0) {
      html.push(makePill(`Busca: "${f.search}"`, 'search', ''));
    }

    f.categories.forEach(c => html.push(makePill(`Cat: ${c}`, 'cat', c)));
    f.sizes.forEach(s => html.push(makePill(`Tam: ${s}`, 'size', s)));
    f.colors.forEach(c => html.push(makePill(`Cor: ${c}`, 'color', c)));

    elements.activeFilters.innerHTML = html.join('');
  }

  function renderGrid(slice) {
    elements.grid.innerHTML = slice.map(function(p) {
      var badge = '';
      if (p.isNew) badge = '<span class="badge badge--new">NOVO</span>';
      else if (p.isPopular) badge = '<span class="badge badge--popular">🔥 Popular</span>';

      var formattedPrice = p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      var slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return `
        <article class="product-card" data-id="${p.id}">
          <a href="product.html?p=${slug}" class="product-card__image-wrapper">
            ${badge}
            <img class="product-card__image" src="${p.imageUrl}" alt="${p.name}" loading="lazy" decoding="async" width="400" height="400">
          </a>
          <div class="product-card__body">
            <a href="product.html?p=${slug}" class="product-card__name-link">
              <h3 class="product-card__name">${p.name}</h3>
            </a>
            <p class="product-card__price">${formattedPrice}</p>
            <button class="btn btn-primary btn-small product-card__cta" aria-label="Adicionar ${p.name} ao carrinho">Adicionar 🛒</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderPagination(totalPages) {
    elements.prevBtn.disabled = state.page === 1;
    elements.nextBtn.disabled = state.page === totalPages;

    var numHtml = [];
    for (var i = 1; i <= totalPages; i++) {
      var isActive = i === state.page ? 'pagination__num--active' : '';
      var ariaCurrent = i === state.page ? 'aria-current="page"' : '';
      numHtml.push(`
        <button class="pagination__num ${isActive}" data-page="${i}" ${ariaCurrent} aria-label="Página ${i}">
          ${i}
        </button>
      `);
    }
    
    elements.paginationNumbers.innerHTML = numHtml.join('');
  }

})();
