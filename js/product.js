/**
 * ═══════════════════════════════════════════════════════
 * AMOPETS — Product Detail Page Orchestrator (product.js)
 * Wires gallery, variant selector, quantity stepper,
 * and cart integration to the PDP DOM.
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ─── Color Hex Map ─── */
  var COLOR_MAP = {
    roxo: '#7B2D8E',
    amarelo: '#FFD23F',
    lilás: '#C589D6',
    laranja: '#E67E22',
    creme: '#F5E6C8',
    preto: '#2D1B36',
    tropical: '#2ECC71',
    rosa: '#FF8ED4',
  };

  /* ─── Product Catalog (simulated API) ─── */
  var CATALOG = {
    'coleira-ametista-brilhante': {
      id: 'col-001',
      name: 'Coleira Ametista Brilhante',
      price: 69.90,
      badge: 'NOVO',
      rating: 4.8,
      reviewCount: 127,
      description: 'A Coleira Ametista Brilhante é perfeita para pets que adoram passeios com estilo. Feita com nylon de alta resistência, detalhes em dourado e acabamento premium.',
      images: [
        'images/collar-ametista.png',
        'images/collar-lavanda.png',
        'images/collar-galaxy.png',
        'images/collar-marshmallow.png',
      ],
      variants: [
        { size: 'PP', color: 'roxo', stock: 8, sku: 'AME-PP-ROX' },
        { size: 'P', color: 'roxo', stock: 12, sku: 'AME-P-ROX' },
        { size: 'M', color: 'roxo', stock: 5, sku: 'AME-M-ROX' },
        { size: 'G', color: 'roxo', stock: 3, sku: 'AME-G-ROX' },
        { size: 'PP', color: 'lilás', stock: 6, sku: 'AME-PP-LIL' },
        { size: 'P', color: 'lilás', stock: 9, sku: 'AME-P-LIL' },
        { size: 'M', color: 'lilás', stock: 0, sku: 'AME-M-LIL' },
        { size: 'G', color: 'lilás', stock: 2, sku: 'AME-G-LIL' },
        { size: 'PP', color: 'rosa', stock: 10, sku: 'AME-PP-ROS' },
        { size: 'P', color: 'rosa', stock: 7, sku: 'AME-P-ROS' },
        { size: 'M', color: 'rosa', stock: 4, sku: 'AME-M-ROS' },
      ],
    },
    'coleira-girassol-adventure': {
      id: 'col-002',
      name: 'Coleira Girassol Adventure',
      price: 59.90,
      rating: 4.6,
      reviewCount: 89,
      images: ['images/collar-girassol.png'],
      variants: [
        { size: 'P', color: 'amarelo', stock: 15, sku: 'GIR-P-AMA' },
        { size: 'M', color: 'amarelo', stock: 10, sku: 'GIR-M-AMA' },
        { size: 'G', color: 'amarelo', stock: 8, sku: 'GIR-G-AMA' },
      ],
    },
    'coleira-lavanda-dreams': {
      id: 'col-003',
      name: 'Coleira Lavanda Dreams',
      price: 74.90,
      badge: 'POPULAR',
      rating: 4.9,
      reviewCount: 203,
      images: ['images/collar-lavanda.png'],
      variants: [
        { size: 'PP', color: 'lilás', stock: 4, sku: 'LAV-PP-LIL' },
        { size: 'P', color: 'lilás', stock: 11, sku: 'LAV-P-LIL' },
        { size: 'M', color: 'lilás', stock: 7, sku: 'LAV-M-LIL' },
        { size: 'G', color: 'lilás', stock: 2, sku: 'LAV-G-LIL' },
      ],
    },
    'coleira-sunset-glow-led': {
      id: 'col-004',
      name: 'Coleira Sunset Glow (LED)',
      price: 89.90,
      rating: 4.7,
      reviewCount: 76,
      images: ['images/collar-sunset-led.png'],
      variants: [
        { size: 'P', color: 'laranja', stock: 6, sku: 'SUN-P-LAR' },
        { size: 'M', color: 'laranja', stock: 9, sku: 'SUN-M-LAR' },
        { size: 'G', color: 'laranja', stock: 5, sku: 'SUN-G-LAR' },
      ],
    },
    'coleira-vanilla-classic': {
      id: 'col-005',
      name: 'Coleira Vanilla Classic',
      price: 49.90,
      rating: 4.5,
      reviewCount: 52,
      images: ['images/collar-vanilla.png'],
      variants: [
        { size: 'PP', color: 'creme', stock: 20, sku: 'VAN-PP-CRE' },
        { size: 'P', color: 'creme', stock: 15, sku: 'VAN-P-CRE' },
        { size: 'M', color: 'creme', stock: 12, sku: 'VAN-M-CRE' },
      ],
    },
    'coleira-galaxy-night': {
      id: 'col-006',
      name: 'Coleira Galaxy Night',
      price: 79.90,
      badge: 'PREMIUM',
      rating: 4.9,
      reviewCount: 165,
      images: ['images/collar-galaxy.png'],
      variants: [
        { size: 'P', color: 'preto', stock: 8, sku: 'GAL-P-PRE' },
        { size: 'M', color: 'preto', stock: 6, sku: 'GAL-M-PRE' },
        { size: 'G', color: 'preto', stock: 3, sku: 'GAL-G-PRE' },
      ],
    },
    'coleira-tropical-vibes': {
      id: 'col-007',
      name: 'Coleira Tropical Vibes',
      price: 64.90,
      rating: 4.4,
      reviewCount: 41,
      images: ['images/collar-tropical.png'],
      variants: [
        { size: 'P', color: 'tropical', stock: 10, sku: 'TRO-P-TRO' },
        { size: 'M', color: 'tropical', stock: 7, sku: 'TRO-M-TRO' },
        { size: 'G', color: 'tropical', stock: 5, sku: 'TRO-G-TRO' },
      ],
    },
    'coleira-marshmallow-soft': {
      id: 'col-008',
      name: 'Coleira Marshmallow Soft',
      price: 54.90,
      rating: 4.6,
      reviewCount: 94,
      images: ['images/collar-marshmallow.png'],
      variants: [
        { size: 'PP', color: 'rosa', stock: 14, sku: 'MAR-PP-ROS' },
        { size: 'P', color: 'rosa', stock: 11, sku: 'MAR-P-ROS' },
        { size: 'M', color: 'rosa', stock: 8, sku: 'MAR-M-ROS' },
      ],
    },
  };

  /* ─── State ─── */
  var product = null;
  var galleryState = null;
  var variantState = null;
  var stepperState = null;
  var cart = null;

  /* ─── DOM References ─── */
  var $ = function (id) { return document.getElementById(id); };

  /* ═════════════════════════════════════════════
     INITIALIZATION
     ═════════════════════════════════════════════ */
  function init() {
    var slug = getProductSlug();
    product = CATALOG[slug] || CATALOG['coleira-ametista-brilhante'];

    // Load cart from localStorage
    cart = loadCart();

    // Initialize component states
    galleryState = createGalleryState(product.images);
    variantState = createVariantState(product);
    stepperState = createStepperState(1, 1, 10);

    // Render everything
    renderPageMeta();
    renderGallery();
    renderProductInfo();
    renderSizeOptions();
    renderColorOptions();
    renderVariantMessage();
    updateAddToCartButton();
    renderRelatedProducts();
    updateCartBadge();

    // Bind all events
    bindGalleryEvents();
    bindVariantEvents();
    bindStepperEvents();
    bindCartEvents();
    bindAccordionEvents();

    announce('Página do produto carregada: ' + product.name);
  }

  function getProductSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get('p') || 'coleira-ametista-brilhante';
  }

  /* ═════════════════════════════════════════════
     PAGE META
     ═════════════════════════════════════════════ */
  function renderPageMeta() {
    document.title = product.name + ' | AMOPETS';
    $('breadcrumb-product').textContent = product.name;
    $('product-name').textContent = product.name;
  }

  /* ═════════════════════════════════════════════
     GALLERY
     ═════════════════════════════════════════════ */
  function renderGallery() {
    var current = getCurrentImage(galleryState);
    var nav = getNavigationInfo(galleryState);

    // Main image
    $('gallery-main-img').src = current || '';
    $('gallery-main-img').alt = product.name + ' - foto ' + nav.current;

    // Counter
    $('gallery-counter').textContent = nav.current + ' / ' + nav.total;

    // Show/hide arrows
    $('gallery-prev').style.display = nav.total > 1 ? '' : 'none';
    $('gallery-next').style.display = nav.total > 1 ? '' : 'none';

    // Thumbnails
    var thumbsHtml = '';
    galleryState.images.forEach(function (img, i) {
      var isActive = i === galleryState.currentIndex;
      thumbsHtml += '<button class="gallery__thumb' + (isActive ? ' gallery__thumb--active' : '') + '" ' +
        'data-index="' + i + '" role="listitem" aria-label="Foto ' + (i + 1) + ' de ' + nav.total + '"' +
        (isActive ? ' aria-current="true"' : '') + '>' +
        '<img src="' + img + '" alt="Miniatura ' + (i + 1) + '" width="72" height="72" loading="lazy" decoding="async">' +
        '</button>';
    });
    $('gallery-thumbs').innerHTML = thumbsHtml;
  }

  function bindGalleryEvents() {
    $('gallery-prev').addEventListener('click', function () {
      galleryState = goToPrev(galleryState);
      renderGallery();
    });

    $('gallery-next').addEventListener('click', function () {
      galleryState = goToNext(galleryState);
      renderGallery();
    });

    $('gallery-thumbs').addEventListener('click', function (e) {
      var thumb = e.target.closest('[data-index]');
      if (!thumb) return;
      galleryState = goToIndex(galleryState, parseInt(thumb.dataset.index));
      renderGallery();
    });

    // Zoom toggle
    $('gallery-main').addEventListener('click', function () {
      galleryState = toggleZoom(galleryState);
      $('gallery-main').classList.toggle('gallery__main--zoomed', galleryState.isZoomed);
    });

    // Zoom follow cursor
    $('gallery-main').addEventListener('mousemove', function (e) {
      if (!galleryState.isZoomed) return;
      var rect = e.currentTarget.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      galleryState = updateZoomPosition(galleryState, x, y);
      var img = $('gallery-main-img');
      img.style.transformOrigin = (x * 100) + '% ' + (y * 100) + '%';
    });

    // Keyboard nav
    document.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') {
        galleryState = goToPrev(galleryState);
        renderGallery();
      } else if (e.key === 'ArrowRight') {
        galleryState = goToNext(galleryState);
        renderGallery();
      }
    });
  }

  /* ═════════════════════════════════════════════
     PRODUCT INFO (price, rating, badges)
     ═════════════════════════════════════════════ */
  function renderProductInfo() {
    var price = product.price;
    var pixPrice = roundTwo(price * 0.95);

    $('price-current').textContent = formatBRL(price);
    $('price-pix').textContent = '💲 ' + formatBRL(pixPrice) + ' no Pix (5% OFF)';

    // Installments
    var installments = calculateInstallments(price);
    if (installments) {
      $('price-installments').textContent = 'ou ' + installments.count + 'x de ' + formatBRL(installments.value) + ' sem juros';
    }

    // Rating stars
    renderStars(product.rating || 0);
    $('review-count').textContent = '(' + (product.reviewCount || 0) + ' avaliações)';

    // Badge
    if (product.badge) {
      $('badge-novo').textContent = product.badge;
      $('badge-novo').style.display = '';
    } else {
      $('badge-novo').style.display = 'none';
    }
  }

  function renderStars(rating) {
    var container = $('rating-stars');
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<span>★</span>';
      } else if (i - 0.5 <= rating) {
        html += '<span>★</span>'; // half-star shown as full for simplicity
      } else {
        html += '<span class="star--empty">★</span>';
      }
    }
    container.innerHTML = html;
    container.setAttribute('aria-label', rating.toFixed(1) + ' de 5 estrelas');
  }

  function calculateInstallments(price) {
    if (price < 30) return null;
    var count = price < 100 ? 2 : price < 200 ? 3 : 6;
    return { count: count, value: roundTwo(price / count) };
  }

  /* ═════════════════════════════════════════════
     VARIANT SELECTOR
     ═════════════════════════════════════════════ */
  function renderSizeOptions() {
    var allSizes = getUniqueSizes(product.variants);
    var html = '';
    allSizes.forEach(function (size) {
      var isAvailable = variantState.availableSizes.indexOf(size) !== -1;
      var isActive = variantState.selectedSize === size;
      var cls = 'size-btn';
      if (isActive) cls += ' size-btn--active';
      if (!isAvailable && variantState.selectedColor) cls += ' size-btn--disabled';

      html += '<button class="' + cls + '" data-size="' + size + '" role="radio" ' +
        'aria-checked="' + isActive + '" ' +
        ((!isAvailable && variantState.selectedColor) ? 'aria-disabled="true"' : '') + '>' +
        size + '</button>';
    });
    $('size-options').innerHTML = html;
    $('selected-size-label').textContent = variantState.selectedSize || '—';
  }

  function renderColorOptions() {
    var allColors = getUniqueColors(product.variants);
    var html = '';
    allColors.forEach(function (color) {
      var isAvailable = variantState.availableColors.indexOf(color) !== -1;
      var isActive = variantState.selectedColor === color;
      var cls = 'color-swatch';
      if (isActive) cls += ' color-swatch--active';
      if (!isAvailable && variantState.selectedSize) cls += ' color-swatch--disabled';
      var hex = COLOR_MAP[color] || '#ccc';
      var label = color.charAt(0).toUpperCase() + color.slice(1);

      html += '<button class="' + cls + '" data-color="' + color + '" role="radio" ' +
        'aria-checked="' + isActive + '" aria-label="Cor: ' + label + '"' +
        ((!isAvailable && variantState.selectedSize) ? ' aria-disabled="true"' : '') + '>' +
        '<span class="color-swatch__inner" style="background-color:' + hex + ';"></span>' +
        '<span class="color-swatch__check" aria-hidden="true">✓</span>' +
        '</button>';
    });
    $('color-options').innerHTML = html;
    var colorLabel = variantState.selectedColor
      ? variantState.selectedColor.charAt(0).toUpperCase() + variantState.selectedColor.slice(1)
      : '—';
    $('selected-color-label').textContent = colorLabel;
  }

  function renderVariantMessage() {
    var validation = getSelectionValidation(variantState);
    var el = $('variant-message');
    el.textContent = validation.message;
    el.className = 'variant-message';
    if (validation.valid) {
      el.classList.add('variant-message--success');
    } else if (variantState.selectedSize || variantState.selectedColor) {
      el.classList.add('variant-message--error');
    }
  }

  function bindVariantEvents() {
    $('size-options').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-size]');
      if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
      variantState = selectSize(variantState, btn.dataset.size);
      renderSizeOptions();
      renderColorOptions();
      renderVariantMessage();
      updateStockIndicator();
      updateAddToCartButton();
      updatePrice();
    });

    $('color-options').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-color]');
      if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
      variantState = selectColor(variantState, btn.dataset.color);
      renderSizeOptions();
      renderColorOptions();
      renderVariantMessage();
      updateStockIndicator();
      updateAddToCartButton();
      updatePrice();
    });
  }

  function updateStockIndicator() {
    var variant = getSelectedVariant(variantState);
    var el = $('stock-indicator');
    if (!variant) {
      el.textContent = 'Em estoque';
      el.className = 'pdp-stepper__stock';
      return;
    }
    if (variant.stock <= 3) {
      el.textContent = 'Apenas ' + variant.stock + ' restantes!';
      el.className = 'pdp-stepper__stock pdp-stepper__stock--low';
    } else {
      el.textContent = variant.stock + ' em estoque';
      el.className = 'pdp-stepper__stock';
    }
    // Update stepper max
    stepperState = createStepperState(stepperState.value, 1, variant.stock);
    renderStepper();
  }

  function updatePrice() {
    // Price stays same for all variants in this demo
    // but we update the Pix price to reflect variant availability
  }

  /* ═════════════════════════════════════════════
     QUANTITY STEPPER
     ═════════════════════════════════════════════ */
  function renderStepper() {
    $('qty-value').textContent = stepperState.value;
    $('qty-value').setAttribute('aria-label', 'Quantidade: ' + stepperState.value);
    $('qty-dec').disabled = !canDecrement(stepperState);
    $('qty-inc').disabled = !canIncrement(stepperState);
  }

  function bindStepperEvents() {
    $('qty-dec').addEventListener('click', function () {
      stepperState = decrement(stepperState);
      renderStepper();
    });
    $('qty-inc').addEventListener('click', function () {
      stepperState = increment(stepperState);
      renderStepper();
    });
  }

  /* ═════════════════════════════════════════════
     ADD TO CART
     ═════════════════════════════════════════════ */
  function updateAddToCartButton() {
    var validation = getSelectionValidation(variantState);
    var btn = $('add-to-cart-btn');
    var text = $('add-to-cart-text');

    if (validation.valid) {
      btn.disabled = false;
      text.textContent = 'Adicionar ao carrinho';
    } else {
      btn.disabled = true;
      text.textContent = validation.message;
    }
  }

  function bindCartEvents() {
    $('add-to-cart-btn').addEventListener('click', function () {
      var validation = getSelectionValidation(variantState);
      if (!validation.valid) return;

      var variant = getSelectedVariant(variantState);
      var item = {
        id: product.id + '-' + variant.sku,
        name: product.name,
        price: product.price,
        quantity: stepperState.value,
        image: product.images[0],
        variant: 'Tamanho ' + variant.size + ' • ' + variant.color.charAt(0).toUpperCase() + variant.color.slice(1),
      };

      addToCart(item);
      showAddedAnimation();
      showToast();
      announce(product.name + ' adicionado ao carrinho. Quantidade: ' + stepperState.value);
    });

    // Wishlist toggle
    $('wishlist-btn').addEventListener('click', function () {
      var btn = $('wishlist-btn');
      var isActive = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', !isActive);
      btn.classList.toggle('wishlist-btn--active', !isActive);
      btn.textContent = isActive ? '♡' : '♥';
      announce(isActive ? 'Removido da lista de desejos' : 'Adicionado à lista de desejos');
    });
  }

  function showAddedAnimation() {
    var btn = $('add-to-cart-btn');
    var text = $('add-to-cart-text');
    btn.classList.add('add-to-cart-btn--adding');
    text.textContent = '✓ Adicionado!';

    setTimeout(function () {
      btn.classList.remove('add-to-cart-btn--adding');
      text.textContent = 'Adicionar ao carrinho';
    }, 1500);
  }

  function showToast() {
    var toast = $('cart-toast');
    toast.classList.add('cart-toast--visible');
    setTimeout(function () {
      toast.classList.remove('cart-toast--visible');
    }, 3500);
  }

  /* ═════════════════════════════════════════════
     CART PERSISTENCE
     ═════════════════════════════════════════════ */
  function loadCart() {
    try {
      var saved = localStorage.getItem('amopets_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return { items: [], coupon: null, discountRate: 0 };
  }

  function saveCart() {
    try { localStorage.setItem('amopets_cart', JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }

  function addToCart(item) {
    var existing = -1;
    cart.items.forEach(function (ci, i) {
      if (ci.id === item.id) existing = i;
    });

    if (existing >= 0) {
      cart.items[existing].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    saveCart();
    updateCartBadge();
  }

  function updateCartBadge() {
    var count = 0;
    cart.items.forEach(function (item) { count += item.quantity; });
    var badge = $('cart-count');
    badge.textContent = count;
    badge.setAttribute('aria-label', count + ' itens no carrinho');
  }

  /* ═════════════════════════════════════════════
     ACCORDION
     ═════════════════════════════════════════════ */
  function bindAccordionEvents() {
    var triggers = document.querySelectorAll('.detail-accordion__trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var accordion = trigger.closest('.detail-accordion');
        var isOpen = accordion.classList.contains('detail-accordion--open');
        accordion.classList.toggle('detail-accordion--open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  /* ═════════════════════════════════════════════
     RELATED PRODUCTS
     ═════════════════════════════════════════════ */
  function renderRelatedProducts() {
    var slugs = Object.keys(CATALOG);
    var currentSlug = getProductSlug();
    var related = slugs.filter(function (s) { return s !== currentSlug; }).slice(0, 4);

    var html = '';
    related.forEach(function (slug) {
      var p = CATALOG[slug];
      html += '<a class="related-card" href="product.html?p=' + slug + '" id="related-' + p.id + '">' +
        '<div class="related-card__image">' +
          '<img src="' + p.images[0] + '" alt="' + p.name + '" width="300" height="300" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="related-card__body">' +
          '<p class="related-card__name">' + p.name + '</p>' +
          '<p class="related-card__price">' + formatBRL(p.price) + '</p>' +
        '</div>' +
      '</a>';
    });

    $('related-grid').innerHTML = html;
  }

  /* ═════════════════════════════════════════════
     HELPERS (inlined to avoid module deps in browser)
     ═════════════════════════════════════════════ */

  // --- Gallery (from gallery.js) ---
  function createGalleryState(images) {
    var valid = Array.isArray(images) ? images.filter(function (img) { return typeof img === 'string' && img.length > 0; }) : [];
    return { images: valid, currentIndex: 0, isZoomed: false, zoomPosition: { x: 0, y: 0 }, thumbnailScrollOffset: 0 };
  }
  function goToNext(s) { if (!s || s.images.length <= 1) return s; return Object.assign({}, s, { currentIndex: (s.currentIndex + 1) % s.images.length, isZoomed: false }); }
  function goToPrev(s) { if (!s || s.images.length <= 1) return s; var i = s.currentIndex === 0 ? s.images.length - 1 : s.currentIndex - 1; return Object.assign({}, s, { currentIndex: i, isZoomed: false }); }
  function goToIndex(s, i) { if (!s || typeof i !== 'number' || i < 0 || i >= s.images.length) return s; return Object.assign({}, s, { currentIndex: i, isZoomed: false }); }
  function toggleZoom(s) { if (!s || s.images.length === 0) return s; return Object.assign({}, s, { isZoomed: !s.isZoomed, zoomPosition: s.isZoomed ? { x: 0, y: 0 } : s.zoomPosition }); }
  function updateZoomPosition(s, x, y) { if (!s || !s.isZoomed) return s; return Object.assign({}, s, { zoomPosition: { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) } }); }
  function getCurrentImage(s) { return (!s || s.images.length === 0) ? null : s.images[s.currentIndex] || null; }
  function getNavigationInfo(s) { if (!s || s.images.length === 0) return { hasPrev: false, hasNext: false, total: 0, current: 0 }; return { hasPrev: s.images.length > 1, hasNext: s.images.length > 1, total: s.images.length, current: s.currentIndex + 1 }; }

  // --- Variant Selector (from variantSelector.js) ---
  function createVariantState(p) { if (!p) return { selectedSize: null, selectedColor: null, variants: [], availableColors: [], availableSizes: [] }; var v = Array.isArray(p.variants) ? p.variants : []; return { selectedSize: null, selectedColor: null, variants: v, availableColors: _unique(v, 'color'), availableSizes: _unique(v, 'size') }; }
  function selectSize(st, sz) { if (!st || typeof sz !== 'string') return st; var s = sz.toUpperCase().trim(); if (st.selectedSize === s) return Object.assign({}, st, { selectedSize: null, availableColors: _unique(st.variants, 'color') }); var colors = st.variants.filter(function (v) { return v.size === s && v.stock > 0; }).map(function (v) { return v.color; }); var uc = colors.filter(function (c, i) { return colors.indexOf(c) === i; }); var nc = st.selectedColor && uc.indexOf(st.selectedColor) === -1 ? null : st.selectedColor; return Object.assign({}, st, { selectedSize: s, selectedColor: nc, availableColors: uc }); }
  function selectColor(st, color) { if (!st || typeof color !== 'string') return st; var c = color.toLowerCase().trim(); if (st.selectedColor === c) return Object.assign({}, st, { selectedColor: null, availableSizes: _unique(st.variants, 'size') }); var sizes = st.variants.filter(function (v) { return v.color === c && v.stock > 0; }).map(function (v) { return v.size; }); var us = sizes.filter(function (s, i) { return sizes.indexOf(s) === i; }); var ns = st.selectedSize && us.indexOf(st.selectedSize) === -1 ? null : st.selectedSize; return Object.assign({}, st, { selectedColor: c, selectedSize: ns, availableSizes: us }); }
  function getSelectedVariant(st) { if (!st || !st.selectedSize || !st.selectedColor) return null; return st.variants.find(function (v) { return v.size === st.selectedSize && v.color === st.selectedColor; }) || null; }
  function isSelectionComplete(st) { return st !== null && st.selectedSize !== null && st.selectedColor !== null; }
  function getSelectionValidation(st) { if (!st) return { valid: false, message: 'Selecione um produto' }; if (!st.selectedSize && !st.selectedColor) return { valid: false, message: 'Selecione o tamanho e a cor' }; if (!st.selectedSize) return { valid: false, message: 'Selecione o tamanho' }; if (!st.selectedColor) return { valid: false, message: 'Selecione a cor' }; var v = getSelectedVariant(st); if (!v) return { valid: false, message: 'Combinação indisponível' }; if (v.stock <= 0) return { valid: false, message: 'Variante esgotada' }; return { valid: true, message: 'Pronto para adicionar ✓' }; }
  function _unique(variants, key) { var vals = variants.map(function (v) { return v[key]; }); return vals.filter(function (v, i) { return v !== undefined && vals.indexOf(v) === i; }); }

  // --- Stepper (from quantityStepper.js) ---
  function createStepperState(initial, min, max) { var _min = typeof min === 'number' && min >= 0 ? min : 1; var _max = typeof max === 'number' && max > 0 ? max : 99; if (_min > _max) _max = _min; var _val = typeof initial === 'number' ? initial : _min; _val = Math.max(_min, Math.min(_max, _val)); return { value: _val, min: _min, max: _max }; }
  function increment(s, step) { if (!s) return s; var st = typeof step === 'number' && step > 0 ? step : 1; return Object.assign({}, s, { value: Math.min(s.max, s.value + st) }); }
  function decrement(s, step) { if (!s) return s; var st = typeof step === 'number' && step > 0 ? step : 1; return Object.assign({}, s, { value: Math.max(s.min, s.value - st) }); }
  function canIncrement(s) { return s ? s.value < s.max : false; }
  function canDecrement(s) { return s ? s.value > s.min : false; }

  // --- Utility helpers ---
  function getUniqueSizes(variants) { return _unique(variants, 'size'); }
  function getUniqueColors(variants) { return _unique(variants, 'color'); }
  function formatBRL(v) { return 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
  function roundTwo(n) { return Math.round(n * 100) / 100; }
  function announce(msg) { var el = $('live-announcements'); if (el) { el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 50); } }

  /* ─── Init ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
