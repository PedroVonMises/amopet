/**
 * AMOPETS — Global Mini-Cart Drawer
 * Injects drawer UI via JS and syncs with localStorage using cart reducer.
 */

import { cartReducer, CartActions, calculateCartTotals, loadCart, saveCart, FREE_SHIPPING_THRESHOLD } from '../utils/cart.js';
import { createMiniCartViewModel, getFreeShippingProgress, getEmptyCartMessage } from './miniCart.js';

let drawerEl, overlayEl;

function init() {
  // Exclude checkout page from drawer
  if (window.location.pathname.indexOf('checkout.html') >= 0) return;

  injectDrawerDOM();
  bindEvents();
  render();
}

function injectDrawerDOM() {
  // Overlay
  overlayEl = document.createElement('div');
  overlayEl.className = 'cart-drawer-overlay';
  overlayEl.id = 'cart-drawer-overlay';

  // Drawer
  drawerEl = document.createElement('aside');
  drawerEl.className = 'cart-drawer';
  drawerEl.id = 'cart-drawer';
  drawerEl.setAttribute('aria-label', 'Carrinho de compras');

  drawerEl.innerHTML = `
    <div class="cart-drawer__header">
      <h2 class="cart-drawer__title">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <span style="margin-left: 8px;">Carrinho</span>
        <span class="cart-drawer__title-count" id="drawer-item-count">0</span>
      </h2>
      <button class="cart-drawer__close" id="drawer-close" aria-label="Fechar carrinho">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="cart-shipping-bar" id="drawer-shipping-bar" aria-live="polite">
    </div>

    <div class="cart-drawer__body" id="drawer-body">
    </div>

    <div class="cart-drawer__footer" id="drawer-footer">
      <div class="cart-summary__line">
        <span>Subtotal</span>
        <span id="drawer-subtotal">R$ 0,00</span>
      </div>
      <div class="cart-summary__line" id="drawer-shipping-line">
        <span>Frete</span>
        <span id="drawer-shipping">Calculado no checkout</span>
      </div>
      <div class="cart-summary__line cart-summary__line--total">
        <span>Total</span>
        <span id="drawer-total">R$ 0,00</span>
      </div>
      <a href="checkout.html" class="btn btn-primary cart-drawer__btn">Ir para o Pagamento →</a>
    </div>
  `;

  document.body.appendChild(overlayEl);
  document.body.appendChild(drawerEl);
}

function bindEvents() {
  // Open Drawer (hook all cart buttons)
  const openCartBtns = document.querySelectorAll('a[href="checkout.html"]#btn-cart, button#btn-cart');
  openCartBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openDrawer();
    });
  });

  // Close
  const closeBtn = document.getElementById('drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlayEl) overlayEl.addEventListener('click', closeDrawer);

  // Sync from other tabs/add-to-cart operations
  window.addEventListener('storage', function (e) {
    if (e.key === 'amopets_cart') {
      render();
    }
  });

  // Item Actions (Delegation)
  const bodyArea = document.getElementById('drawer-body');
  if (bodyArea) {
    bodyArea.addEventListener('click', function (e) {
      // Remove
      const removeBtn = e.target.closest('.cart-item__remove');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        let state = loadCart();
        state = cartReducer(state, { type: CartActions.REMOVE_ITEM, payload: id });
        saveCart(state);
        render();
        return;
      }

      // Stepper
      const stepBtn = e.target.closest('.cart-stepper__btn');
      if (stepBtn) {
        const id = stepBtn.dataset.id;
        const diff = parseInt(stepBtn.dataset.diff, 10);
        const input = stepBtn.parentElement.querySelector('.cart-stepper__input');
        let newQty = parseInt(input.value, 10) + diff;
        if (newQty < 1) newQty = 1;

        let state = loadCart();
        state = cartReducer(state, { type: CartActions.UPDATE_QUANTITY, payload: { id: id, quantity: newQty } });
        saveCart(state);
        render();
        return;
      }
    });

    // Direct Input Changes
    bodyArea.addEventListener('change', function (e) {
      if (e.target.classList.contains('cart-stepper__input')) {
        const id = e.target.dataset.id;
        const newQty = Math.max(1, parseInt(e.target.value, 10) || 1);
        let state = loadCart();
        state = cartReducer(state, { type: CartActions.UPDATE_QUANTITY, payload: { id: id, quantity: newQty } });
        saveCart(state);
        render();
      }
    });
  }
}

function openDrawer() {
  render();
  overlayEl.classList.add('active');
  drawerEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  overlayEl.classList.remove('active');
  drawerEl.classList.remove('active');
  document.body.style.overflow = '';
}

function render() {
  const cartState = loadCart();
  const totals = calculateCartTotals(cartState);
  const vm = createMiniCartViewModel(cartState, totals);

  // Header Count
  const countEl = document.getElementById('drawer-item-count');
  if (countEl) countEl.textContent = vm.itemCount;

  // Shipping Bar
  const barEl = document.getElementById('drawer-shipping-bar');
  if (barEl) {
    if (vm.isEmpty) {
      barEl.style.display = 'none';
    } else {
      barEl.style.display = 'block';
      const progress = getFreeShippingProgress(totals.subtotal - totals.discount, FREE_SHIPPING_THRESHOLD);
      const fillClass = progress >= 1 ? 'cart-shipping-bar__fill cart-shipping-bar__fill--success' : 'cart-shipping-bar__fill';

      barEl.innerHTML = `
        <div class="cart-shipping-bar__text">${vm.freeShippingMessage}</div>
        <div class="cart-shipping-bar__track">
          <div class="${fillClass}" style="width: ${progress * 100}%"></div>
        </div>
      `;
    }
  }

  // Body (Items / Empty state)
  const bodyEl = document.getElementById('drawer-body');
  if (bodyEl) {
    if (vm.isEmpty) {
      const emptyMsg = getEmptyCartMessage();
      bodyEl.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty__icon">🐾</span>
          <h3 class="cart-empty__title">${emptyMsg.title}</h3>
          <p class="cart-empty__desc">${emptyMsg.description}</p>
          <a href="${emptyMsg.ctaHref}" class="btn btn-primary" onclick="document.body.style.overflow=''; document.querySelector('.cart-drawer').classList.remove('active'); document.querySelector('.cart-drawer-overlay').classList.remove('active');">${emptyMsg.ctaText}</a>
        </div>
      `;
      document.getElementById('drawer-footer').style.display = 'none';
    } else {
      bodyEl.innerHTML = vm.items.map(function (item) {
        const img = item.image || 'images/hero-collar.png';

        return `
          <div class="cart-item">
            <div class="cart-item__image-wrapper">
              <img src="${img}" alt="${item.name}" class="cart-item__image" loading="lazy" decoding="async">
            </div>
            <div class="cart-item__details">
              <span class="cart-item__brand">Coleira</span>
              <h4 class="cart-item__title">${item.name}</h4>
              <div class="cart-item__price">${item.priceFormatted}</div>
              <div class="cart-item__controls">
                <div class="cart-stepper">
                  <button class="cart-stepper__btn" data-diff="-1" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
                  <input type="number" class="cart-stepper__input" data-id="${item.id}" value="${item.quantity}" min="1" aria-label="Quantidade">
                  <button class="cart-stepper__btn" data-diff="1" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
                </div>
                <button class="cart-item__remove" data-id="${item.id}">Remover</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      document.getElementById('drawer-footer').style.display = 'block';
    }
  }

  // Footer Totals
  const subEl = document.getElementById('drawer-subtotal');
  if (subEl) subEl.textContent = vm.subtotalFormatted;

  const shipEl = document.getElementById('drawer-shipping');
  if (shipEl) shipEl.textContent = vm.shippingFormatted;

  const totalEl = document.getElementById('drawer-total');
  if (totalEl) totalEl.textContent = vm.totalFormatted;
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
