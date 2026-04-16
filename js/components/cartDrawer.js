/**
 * AMOPETS — Global Mini-Cart Drawer
 * Injects drawer UI via JS and syncs with localStorage using cart reducer.
 */

(function () {
  'use strict';

  var drawerEl, overlayEl;

  document.addEventListener('DOMContentLoaded', init);

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
    
    // Will be populated dynamically
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
        <!-- Dyn -->
      </div>

      <div class="cart-drawer__body" id="drawer-body">
        <!-- Dyn Items or Empty state -->
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

  function getCartState() {
    try {
      var saved = localStorage.getItem('amopets_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return window.createEmptyCart ? window.createEmptyCart() : { items: [], coupon: null, discountRate: 0 };
  }

  function saveCartState(state) {
    localStorage.setItem('amopets_cart', JSON.stringify(state));
    // Dispatch storage event artificially so current tab updates badge immediately
    window.dispatchEvent(new StorageEvent('storage', { key: 'amopets_cart' }));
    render();
  }

  function bindEvents() {
    // Open Drawer (hook all cart buttons)
    var openCartBtns = document.querySelectorAll('a[href="checkout.html"]#btn-cart, button#btn-cart');
    openCartBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openDrawer();
      });
    });

    // Close
    var closeBtn = document.getElementById('drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlayEl) overlayEl.addEventListener('click', closeDrawer);

    // Sync from other tabs/add-to-cart operations
    window.addEventListener('storage', function (e) {
      if (e.key === 'amopets_cart') {
        render(); // Re-render silently 
      }
    });

    // Item Actions (Delegation)
    var bodyArea = document.getElementById('drawer-body');
    if (bodyArea) {
      bodyArea.addEventListener('click', function(e) {
        // Remove
        var removeBtn = e.target.closest('.cart-item__remove');
        if (removeBtn) {
          var id = removeBtn.dataset.id;
          var state = getCartState();
          state = window.cartReducer(state, { type: window.CartActions.REMOVE_ITEM, payload: id });
          saveCartState(state);
          return;
        }

        // Stepper
        var stepBtn = e.target.closest('.cart-stepper__btn');
        if (stepBtn) {
          var id = stepBtn.dataset.id;
          var diff = parseInt(stepBtn.dataset.diff, 10);
          var input = stepBtn.parentElement.querySelector('.cart-stepper__input');
          var newQty = parseInt(input.value, 10) + diff;
          if (newQty < 1) newQty = 1; // don't zero out via minus btn to prevent accidental deletes
          
          var state = getCartState();
          state = window.cartReducer(state, { type: window.CartActions.UPDATE_QUANTITY, payload: { id: id, quantity: newQty } });
          saveCartState(state);
          return;
        }
      });

      // Direct Input Changes
      bodyArea.addEventListener('change', function(e) {
        if (e.target.classList.contains('cart-stepper__input')) {
          var id = e.target.dataset.id;
          var newQty = Math.max(1, parseInt(e.target.value, 10) || 1);
          var state = getCartState();
          state = window.cartReducer(state, { type: window.CartActions.UPDATE_QUANTITY, payload: { id: id, quantity: newQty } });
          saveCartState(state);
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
    var cartState = getCartState();
    var totals = window.calculateCartTotals ? window.calculateCartTotals(cartState) : null;
    if (!totals) return;

    var vm = window.createMiniCartViewModel ? window.createMiniCartViewModel(cartState, totals) : null;
    if (!vm) return;

    // Header Count
    var countEl = document.getElementById('drawer-item-count');
    if (countEl) countEl.textContent = vm.itemCount;

    // Shipping Bar
    var barEl = document.getElementById('drawer-shipping-bar');
    if (barEl) {
      if (vm.isEmpty) {
        barEl.style.display = 'none';
      } else {
        barEl.style.display = 'block';
        var progress = window.getFreeShippingProgress(totals.subtotal - totals.discount, window.FREE_SHIPPING_THRESHOLD);
        var fillClass = progress >= 1 ? 'cart-shipping-bar__fill cart-shipping-bar__fill--success' : 'cart-shipping-bar__fill';
        
        barEl.innerHTML = `
          <div class="cart-shipping-bar__text">${vm.freeShippingMessage}</div>
          <div class="cart-shipping-bar__track">
            <div class="${fillClass}" style="width: ${progress * 100}%"></div>
          </div>
        `;
      }
    }

    // Body (Items / Empty state)
    var bodyEl = document.getElementById('drawer-body');
    if (bodyEl) {
      if (vm.isEmpty) {
        var emptyMsg = window.getEmptyCartMessage();
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
        bodyEl.innerHTML = vm.items.map(function(item) {
          // Use item.image if stored, otherwise placeholder
          var img = item.image || 'images/hero-collar.png'; 
          
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
    var subEl = document.getElementById('drawer-subtotal');
    if (subEl) subEl.textContent = vm.subtotalFormatted;

    var shipEl = document.getElementById('drawer-shipping');
    if (shipEl) shipEl.textContent = vm.shippingFormatted;

    var totalEl = document.getElementById('drawer-total');
    if (totalEl) totalEl.textContent = vm.totalFormatted;
  }

})();
