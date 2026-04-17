/**
 * ═══════════════════════════════════════════════════════
 * AMOPETS — Product Detail Page Orchestrator (product.js)
 * Wires gallery, variant selector, quantity stepper,
 * and cart integration to the PDP DOM.
 * ═══════════════════════════════════════════════════════
 */

// ─── Shared Imports (R1-R9 refactored) ───
import { CATALOG, COLOR_MAP } from './data/products.js';
import { formatCurrency, roundTwo, calculateInstallments } from './utils/formatters.js';
import { cartReducer, CartActions, loadCart, saveCart } from './utils/cart.js';
import { announce, syncCartBadge, showToast } from './utils/dom.js';
import { createGalleryState, goToNext, goToPrev, goToIndex, toggleZoom, updateZoomPosition, getCurrentImage, getNavigationInfo } from './components/gallery.js';
import { createVariantState, selectSize, selectColor, getSelectedVariant, getSelectionValidation } from './components/variantSelector.js';
import { createStepperState, increment, decrement, canIncrement, canDecrement } from './components/quantityStepper.js';

/* ─── State ─── */
let product = null;
let galleryState = null;
let variantState = null;
let stepperState = null;

/* ─── DOM References ─── */
const $ = function (id) { return document.getElementById(id); };

/* ═════════════════════════════════════════════
   INITIALIZATION
   ═════════════════════════════════════════════ */
function init() {
  const slug = getProductSlug();
  product = CATALOG[slug] || CATALOG['coleira-ametista-brilhante'];

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
  syncCartBadge();

  // Bind all events
  bindGalleryEvents();
  bindVariantEvents();
  bindStepperEvents();
  bindCartEvents();
  bindAccordionEvents();

  announce('Página do produto carregada: ' + product.name, 'live-announcements');
}

function getProductSlug() {
  const params = new URLSearchParams(window.location.search);
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
  const current = getCurrentImage(galleryState);
  const nav = getNavigationInfo(galleryState);

  $('gallery-main-img').src = current || '';
  $('gallery-main-img').alt = product.name + ' - foto ' + nav.current;
  $('gallery-counter').textContent = nav.current + ' / ' + nav.total;
  $('gallery-prev').style.display = nav.total > 1 ? '' : 'none';
  $('gallery-next').style.display = nav.total > 1 ? '' : 'none';

  let thumbsHtml = '';
  galleryState.images.forEach(function (img, i) {
    const isActive = i === galleryState.currentIndex;
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
    const thumb = e.target.closest('[data-index]');
    if (!thumb) return;
    galleryState = goToIndex(galleryState, parseInt(thumb.dataset.index));
    renderGallery();
  });

  $('gallery-main').addEventListener('click', function () {
    galleryState = toggleZoom(galleryState);
    $('gallery-main').classList.toggle('gallery__main--zoomed', galleryState.isZoomed);
  });

  $('gallery-main').addEventListener('mousemove', function (e) {
    if (!galleryState.isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    galleryState = updateZoomPosition(galleryState, x, y);
    const img = $('gallery-main-img');
    img.style.transformOrigin = (x * 100) + '% ' + (y * 100) + '%';
  });

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
  const price = product.price;
  const pixPrice = roundTwo(price * 0.95);

  $('price-current').textContent = formatCurrency(price);
  $('price-pix').textContent = '💲 ' + formatCurrency(pixPrice) + ' no Pix (5% OFF)';

  const installments = calculateInstallments(price);
  if (installments) {
    $('price-installments').textContent = 'ou ' + installments.count + 'x de ' + formatCurrency(installments.value) + ' sem juros';
  }

  renderStars(product.rating || 0);
  $('review-count').textContent = '(' + (product.reviewCount || 0) + ' avaliações)';

  if (product.badge) {
    $('badge-novo').textContent = product.badge;
    $('badge-novo').style.display = '';
  } else {
    $('badge-novo').style.display = 'none';
  }
}

function renderStars(rating) {
  const container = $('rating-stars');
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span>★</span>';
    } else if (i - 0.5 <= rating) {
      html += '<span>★</span>';
    } else {
      html += '<span class="star--empty">★</span>';
    }
  }
  container.innerHTML = html;
  container.setAttribute('aria-label', rating.toFixed(1) + ' de 5 estrelas');
}

/* ═════════════════════════════════════════════
   VARIANT SELECTOR
   ═════════════════════════════════════════════ */
function getUniqueSizes(variants) { return _unique(variants, 'size'); }
function getUniqueColors(variants) { return _unique(variants, 'color'); }
function _unique(variants, key) {
  const vals = variants.map(function (v) { return v[key]; });
  return vals.filter(function (v, i) { return v !== undefined && vals.indexOf(v) === i; });
}

function renderSizeOptions() {
  const allSizes = getUniqueSizes(product.variants);
  let html = '';
  allSizes.forEach(function (size) {
    const isAvailable = variantState.availableSizes.indexOf(size) !== -1;
    const isActive = variantState.selectedSize === size;
    let cls = 'size-btn';
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
  const allColors = getUniqueColors(product.variants);
  let html = '';
  allColors.forEach(function (color) {
    const isAvailable = variantState.availableColors.indexOf(color) !== -1;
    const isActive = variantState.selectedColor === color;
    let cls = 'color-swatch';
    if (isActive) cls += ' color-swatch--active';
    if (!isAvailable && variantState.selectedSize) cls += ' color-swatch--disabled';
    const hex = COLOR_MAP[color] || '#ccc';
    const label = color.charAt(0).toUpperCase() + color.slice(1);

    html += '<button class="' + cls + '" data-color="' + color + '" role="radio" ' +
      'aria-checked="' + isActive + '" aria-label="Cor: ' + label + '"' +
      ((!isAvailable && variantState.selectedSize) ? ' aria-disabled="true"' : '') + '>' +
      '<span class="color-swatch__inner" style="background-color:' + hex + ';"></span>' +
      '<span class="color-swatch__check" aria-hidden="true">✓</span>' +
      '</button>';
  });
  $('color-options').innerHTML = html;
  const colorLabel = variantState.selectedColor
    ? variantState.selectedColor.charAt(0).toUpperCase() + variantState.selectedColor.slice(1)
    : '—';
  $('selected-color-label').textContent = colorLabel;
}

function renderVariantMessage() {
  const validation = getSelectionValidation(variantState);
  const el = $('variant-message');
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
    const btn = e.target.closest('[data-size]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    variantState = selectSize(variantState, btn.dataset.size);
    renderSizeOptions();
    renderColorOptions();
    renderVariantMessage();
    updateStockIndicator();
    updateAddToCartButton();
  });

  $('color-options').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-color]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    variantState = selectColor(variantState, btn.dataset.color);
    renderSizeOptions();
    renderColorOptions();
    renderVariantMessage();
    updateStockIndicator();
    updateAddToCartButton();
  });
}

function updateStockIndicator() {
  const variant = getSelectedVariant(variantState);
  const el = $('stock-indicator');
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
  stepperState = createStepperState(stepperState.value, 1, variant.stock);
  renderStepper();
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
   ADD TO CART — uses shared cart reducer
   ═════════════════════════════════════════════ */
function updateAddToCartButton() {
  const validation = getSelectionValidation(variantState);
  const btn = $('add-to-cart-btn');
  const text = $('add-to-cart-text');

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
    const validation = getSelectionValidation(variantState);
    if (!validation.valid) return;

    const variant = getSelectedVariant(variantState);
    const item = {
      id: product.id + '-' + variant.sku,
      name: product.name,
      price: product.price,
      image: product.images[0],
    };

    // Use shared cart reducer
    let cart = loadCart();
    // Add the requested quantity
    for (let i = 0; i < stepperState.value; i++) {
      cart = cartReducer(cart, { type: CartActions.ADD_ITEM, payload: item });
    }
    saveCart(cart);

    showAddedAnimation();
    showToast('cart-toast');
    syncCartBadge();
    announce(product.name + ' adicionado ao carrinho. Quantidade: ' + stepperState.value, 'live-announcements');
  });

  $('wishlist-btn').addEventListener('click', function () {
    const btn = $('wishlist-btn');
    const isActive = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', !isActive);
    btn.classList.toggle('wishlist-btn--active', !isActive);
    btn.textContent = isActive ? '♡' : '♥';
    announce(isActive ? 'Removido da lista de desejos' : 'Adicionado à lista de desejos', 'live-announcements');
  });
}

function showAddedAnimation() {
  const btn = $('add-to-cart-btn');
  const text = $('add-to-cart-text');
  btn.classList.add('add-to-cart-btn--adding');
  text.textContent = '✓ Adicionado!';

  setTimeout(function () {
    btn.classList.remove('add-to-cart-btn--adding');
    text.textContent = 'Adicionar ao carrinho';
  }, 1500);
}

/* ═════════════════════════════════════════════
   ACCORDION
   ═════════════════════════════════════════════ */
function bindAccordionEvents() {
  const triggers = document.querySelectorAll('.detail-accordion__trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const accordion = trigger.closest('.detail-accordion');
      const isOpen = accordion.classList.contains('detail-accordion--open');
      accordion.classList.toggle('detail-accordion--open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  });
}

/* ═════════════════════════════════════════════
   RELATED PRODUCTS
   ═════════════════════════════════════════════ */
function renderRelatedProducts() {
  const slugs = Object.keys(CATALOG);
  const currentSlug = getProductSlug();
  const related = slugs.filter(function (s) { return s !== currentSlug; }).slice(0, 4);

  let html = '';
  related.forEach(function (slug) {
    const p = CATALOG[slug];
    html += '<a class="related-card" href="product.html?p=' + slug + '" id="related-' + p.id + '">' +
      '<div class="related-card__image">' +
        '<img src="' + p.images[0] + '" alt="' + p.name + '" width="300" height="300" loading="lazy" decoding="async">' +
      '</div>' +
      '<div class="related-card__body">' +
        '<p class="related-card__name">' + p.name + '</p>' +
        '<p class="related-card__price">' + formatCurrency(p.price) + '</p>' +
      '</div>' +
    '</a>';
  });

  $('related-grid').innerHTML = html;
}

/* ─── Init ─── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
