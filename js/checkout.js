/**
 * ═══════════════════════════════════════════════════════
 * AMOPETS — Checkout Orchestrator (checkout.js)
 * Manages the multi-step checkout flow.
 * ═══════════════════════════════════════════════════════
 */

// ─── Shared Imports (R1-R9 refactored) ───
import { formatCurrency, roundTwo } from './utils/formatters.js';
import { loadCart } from './utils/cart.js';
import { announce } from './utils/dom.js';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, VALID_COUPONS } from './data/coupons.js';
import { CATALOG } from './data/products.js';

/* ─── State ─── */
const _state = {
  currentStep: 1,
  maxCompletedStep: 0,
  cart: { items: [], coupon: null, discountRate: 0 },
  address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', errors: {}, touched: {} },
  paymentMethod: null,
};

/* ─── DOM References ─── */
const $cartItemsList = document.getElementById('cart-items-list');
const $emptyCartMsg = document.getElementById('empty-cart-msg');
const $couponSection = document.getElementById('coupon-section');
const $couponInput = document.getElementById('coupon-input');
const $couponApplyBtn = document.getElementById('coupon-apply-btn');
const $couponFeedback = document.getElementById('coupon-feedback');
const $summarySubtotal = document.getElementById('summary-subtotal');
const $summaryDiscount = document.getElementById('summary-discount');
const $summaryDiscountRow = document.getElementById('summary-discount-row');
const $summaryPixRow = document.getElementById('summary-pix-row');
const $summaryPixDiscount = document.getElementById('summary-pix-discount');
const $summaryCouponCode = document.getElementById('summary-coupon-code');
const $summaryShipping = document.getElementById('summary-shipping');
const $summaryTotal = document.getElementById('summary-total');
const $summarySavings = document.getElementById('summary-savings');
const $summarySavingsAmount = document.getElementById('summary-savings-amount');
const $summaryCta = document.getElementById('summary-cta-btn');
const $shippingProgressLabel = document.getElementById('shipping-progress-label');
const $shippingProgressFill = document.getElementById('shipping-progress-fill');
const $stepPanels = [
  document.getElementById('step-1'),
  document.getElementById('step-2'),
  document.getElementById('step-3'),
];
const $stepBtns = [
  document.getElementById('step-btn-1'),
  document.getElementById('step-btn-2'),
  document.getElementById('step-btn-3'),
];
const $connectors = [
  document.getElementById('connector-1-2'),
  document.getElementById('connector-2-3'),
];
const $successScreen = document.getElementById('success-screen');
const $stepper = document.getElementById('stepper');
const $summaryToggle = document.getElementById('summary-toggle');

/* ═════════════════════════════════════════════
   INITIALIZATION
   ═════════════════════════════════════════════ */
function init() {
  loadCartFromStorage();
  renderCart();
  updateSummary();
  bindEvents();
  setupMobileToggle();
  announce('Checkout carregado. Etapa 1: Revise seu carrinho.', 'live-announcements');
}

function loadCartFromStorage() {
  const saved = loadCart();
  if (saved && Array.isArray(saved.items) && saved.items.length > 0) {
    _state.cart = saved;
    return;
  }

  // Demo: pre-populate with 2 items
  _state.cart = {
    items: [
      { id: 'col-001', name: 'Coleira Ametista Brilhante', price: 69.90, quantity: 1, image: 'images/collar-ametista.png', variant: 'Tamanho M • Roxo' },
      { id: 'col-002', name: 'Coleira Girassol Adventure', price: 59.90, quantity: 2, image: 'images/collar-girassol.png', variant: 'Tamanho G • Amarelo' },
    ],
    coupon: null,
    discountRate: 0,
  };
  saveCartToStorage();
}

function saveCartToStorage() {
  try {
    localStorage.setItem('amopets_cart', JSON.stringify(_state.cart));
  } catch (e) { /* ignore */ }
}

/* ═════════════════════════════════════════════
   CART RENDERING
   ═════════════════════════════════════════════ */
function renderCart() {
  if (!_state.cart.items || _state.cart.items.length === 0) {
    $cartItemsList.innerHTML = '';
    $emptyCartMsg.style.display = 'block';
    $couponSection.style.display = 'none';
    $summaryCta.disabled = true;
    $summaryCta.style.opacity = '0.5';
    return;
  }

  $emptyCartMsg.style.display = 'none';
  $couponSection.style.display = 'block';
  $summaryCta.disabled = false;
  $summaryCta.style.opacity = '1';

  let html = '';
  _state.cart.items.forEach(function (item) {
    const lineTotal = roundTwo(item.price * item.quantity);
    html += '<article class="cart-item" id="cart-item-' + item.id + '">' +
      '<div class="cart-item__image"><img src="' + (item.image || '') + '" alt="' + item.name + '" width="80" height="80" loading="lazy" decoding="async"></div>' +
      '<div class="cart-item__info">' +
        '<p class="cart-item__name">' + item.name + '</p>' +
        '<p class="cart-item__variant">' + (item.variant || '') + '</p>' +
        '<p class="cart-item__price">' + formatCurrency(item.price) + '</p>' +
        '<div class="qty-stepper">' +
          '<button class="qty-stepper__btn" data-action="dec" data-id="' + item.id + '" aria-label="Diminuir quantidade"' + (item.quantity <= 1 ? ' disabled' : '') + '>−</button>' +
          '<span class="qty-stepper__value" aria-label="Quantidade: ' + item.quantity + '">' + item.quantity + '</span>' +
          '<button class="qty-stepper__btn" data-action="inc" data-id="' + item.id + '" aria-label="Aumentar quantidade"' + (item.quantity >= 10 ? ' disabled' : '') + '>+</button>' +
        '</div>' +
      '</div>' +
      '<div class="cart-item__actions">' +
        '<span class="cart-item__total">' + formatCurrency(lineTotal) + '</span>' +
        '<button class="cart-item__remove" data-action="remove" data-id="' + item.id + '" aria-label="Remover ' + item.name + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
          'Remover' +
        '</button>' +
      '</div>' +
    '</article>';
  });

  $cartItemsList.innerHTML = html;
}

/* ═════════════════════════════════════════════
   SUMMARY CALCULATION
   ═════════════════════════════════════════════ */
function updateSummary() {
  const subtotal = _calculateSubtotal();
  const discount = roundTwo(subtotal * _state.cart.discountRate);
  const afterDiscount = roundTwo(subtotal - discount);
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const pixDiscount = _state.paymentMethod === 'pix' ? roundTwo((afterDiscount + shipping) * 0.05) : 0;
  const total = roundTwo(afterDiscount + shipping - pixDiscount);
  const totalSavings = roundTwo(discount + (afterDiscount >= FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0) + pixDiscount);

  $summarySubtotal.textContent = formatCurrency(subtotal);

  if (discount > 0) {
    $summaryDiscountRow.style.display = 'flex';
    $summaryDiscount.textContent = '-' + formatCurrency(discount);
    $summaryCouponCode.textContent = _state.cart.coupon;
  } else {
    $summaryDiscountRow.style.display = 'none';
  }

  if (pixDiscount > 0) {
    $summaryPixRow.style.display = 'flex';
    $summaryPixDiscount.textContent = '-' + formatCurrency(pixDiscount);
  } else {
    $summaryPixRow.style.display = 'none';
  }

  if (shipping === 0) {
    $summaryShipping.textContent = 'Grátis 🎉';
    $summaryShipping.classList.add('summary-line__value--free');
  } else {
    $summaryShipping.textContent = formatCurrency(shipping);
    $summaryShipping.classList.remove('summary-line__value--free');
  }

  $summaryTotal.textContent = formatCurrency(total);

  if (totalSavings > 0) {
    $summarySavings.style.display = 'block';
    $summarySavingsAmount.textContent = formatCurrency(totalSavings);
  } else {
    $summarySavings.style.display = 'none';
  }

  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const fillPct = Math.round(progress * 100);
  $shippingProgressFill.style.width = fillPct + '%';
  $shippingProgressFill.setAttribute('aria-valuenow', fillPct);

  if (progress >= 1) {
    $shippingProgressLabel.textContent = '🎉 Você ganhou frete grátis!';
    $shippingProgressFill.classList.add('shipping-progress__fill--complete');
  } else {
    const remaining = roundTwo(FREE_SHIPPING_THRESHOLD - subtotal);
    $shippingProgressLabel.textContent = 'Faltam ' + formatCurrency(remaining) + ' para frete grátis';
    $shippingProgressFill.classList.remove('shipping-progress__fill--complete');
  }

  updateCtaButton();
}

function _calculateSubtotal() {
  let sum = 0;
  _state.cart.items.forEach(function (item) { sum += item.price * item.quantity; });
  return roundTwo(sum);
}

/* ═══════════════════════════════════════════════
   ORDER SUMMARY CALCULATION
   ═══════════════════════════════════════════════ */
function calculateOrderSummary() {
  const subtotal = _calculateSubtotal();
  const discount = roundTwo(subtotal * _state.cart.discountRate);
  const afterDiscount = roundTwo(subtotal - discount);
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const pixDiscount = _state.paymentMethod === 'pix' ? roundTwo((afterDiscount + shipping) * 0.05) : 0;
  const total = roundTwo(afterDiscount + shipping - pixDiscount);
  const totalSavings = roundTwo(discount + (afterDiscount >= FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0) + pixDiscount);

  return {
    subtotal,
    discount,
    afterDiscount,
    shipping,
    pixDiscount,
    total,
    totalSavings
  };
}

/* ═════════════════════════════════════════════
   STEP NAVIGATION
   ═════════════════════════════════════════════ */
function goToStep(step) {
  if (step < 1 || step > 3) return;
  if (step > _state.maxCompletedStep + 1) return;

  _state.currentStep = step;

  $stepPanels.forEach(function (panel, i) {
    if (i + 1 === step) panel.classList.add('step-panel--active');
    else panel.classList.remove('step-panel--active');
  });

  $stepBtns.forEach(function (btn, i) {
    const s = i + 1;
    btn.classList.remove('stepper__step--active', 'stepper__step--completed');
    btn.removeAttribute('aria-current');
    btn.setAttribute('aria-disabled', s > _state.maxCompletedStep + 1 ? 'true' : 'false');

    if (s === step) {
      btn.classList.add('stepper__step--active');
      btn.setAttribute('aria-current', 'step');
    } else if (s <= _state.maxCompletedStep) {
      btn.classList.add('stepper__step--completed');
    }
  });

  $connectors.forEach(function (conn, i) {
    const connStep = i + 1;
    conn.classList.remove('stepper__connector--filled', 'stepper__connector--active');
    if (connStep < step) conn.classList.add('stepper__connector--filled');
    else if (connStep === step - 1) conn.classList.add('stepper__connector--active');
  });

  const sidebarEl = document.getElementById('checkout-sidebar');
  if (step <= 3) {
    sidebarEl.style.display = '';
    $stepper.style.display = '';
    $successScreen.classList.remove('success-screen--active');
  }

  updateSummary();
  announce(getStepAnnouncement(step), 'live-announcements');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getStepAnnouncement(step) {
  const labels = ['Etapa 1: Revise seu carrinho', 'Etapa 2: Preencha o endereço de entrega', 'Etapa 3: Escolha a forma de pagamento'];
  return labels[step - 1] || '';
}

function updateCtaButton() {
  const labels = ['Ir para Endereço →', 'Ir para Pagamento →', 'Confirmar Pedido 🐾'];
  $summaryCta.textContent = labels[_state.currentStep - 1] || 'Continuar';

  if (_state.currentStep === 1 && _state.cart.items.length === 0) {
    $summaryCta.disabled = true;
    $summaryCta.style.opacity = '0.5';
  } else {
    $summaryCta.disabled = false;
    $summaryCta.style.opacity = '1';
  }
}

function handleCtaClick() {
  if (_state.currentStep === 1) {
    if (_state.cart.items.length === 0) return;
    _state.maxCompletedStep = Math.max(_state.maxCompletedStep, 1);
    goToStep(2);
    return;
  }

  if (_state.currentStep === 2) {
    if (!validateAddress()) return;
    _state.maxCompletedStep = Math.max(_state.maxCompletedStep, 2);
    goToStep(3);
    return;
  }

  if (_state.currentStep === 3) {
    if (!_state.paymentMethod) {
      announce('Por favor, selecione uma forma de pagamento.', 'live-announcements');
      return;
    }
    completeOrder();
  }
}

/* ═════════════════════════════════════════════
   ADDRESS VALIDATION
   ═════════════════════════════════════════════ */
function readAddressFromForm() {
  _state.address.cep = (document.getElementById('addr-cep').value || '').trim();
  _state.address.street = (document.getElementById('addr-street').value || '').trim();
  _state.address.number = (document.getElementById('addr-number').value || '').trim();
  _state.address.complement = (document.getElementById('addr-complement').value || '').trim();
  _state.address.neighborhood = (document.getElementById('addr-neighborhood').value || '').trim();
  _state.address.city = (document.getElementById('addr-city').value || '').trim();
  _state.address.state = (document.getElementById('addr-state').value || '').trim();
}

function validateAddress() {
  readAddressFromForm();
  const errors = {};

  const cepDigits = _state.address.cep.replace(/\D/g, '');
  if (cepDigits.length === 0) errors.cep = 'CEP é obrigatório';
  else if (cepDigits.length !== 8) errors.cep = 'CEP deve ter 8 dígitos';

  if (!_state.address.street || _state.address.street.length < 3) errors.street = 'Rua é obrigatória (mín. 3 caracteres)';
  if (!_state.address.number) errors.number = 'Número é obrigatório';
  if (!_state.address.neighborhood) errors.neighborhood = 'Bairro é obrigatório';
  if (!_state.address.city) errors.city = 'Cidade é obrigatória';
  if (!_state.address.state) errors.state = 'Estado é obrigatório';

  _state.address.errors = errors;
  renderAddressErrors(errors);

  if (Object.keys(errors).length > 0) {
    const firstKey = Object.keys(errors)[0];
    const firstField = document.getElementById('addr-' + firstKey);
    if (firstField) firstField.focus();
    announce('Corrija os erros no formulário: ' + Object.values(errors).join('. '), 'live-announcements');
    return false;
  }

  return true;
}

function renderAddressErrors(errors) {
  const fields = ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
  fields.forEach(function (f) {
    const fieldEl = document.getElementById('field-' + f);
    const errorEl = document.getElementById(f + '-error');
    if (!fieldEl || !errorEl) return;

    if (errors[f]) {
      fieldEl.classList.add('form-field--error');
      fieldEl.classList.remove('form-field--success');
      errorEl.textContent = errors[f];
      errorEl.style.display = 'flex';
    } else {
      fieldEl.classList.remove('form-field--error');
      if (document.getElementById('addr-' + f).value.trim()) {
        fieldEl.classList.add('form-field--success');
      }
      errorEl.style.display = 'none';
    }
  });
}

/* ─── CEP Lookup ─── */
function lookupCEP(cep) {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return;

  const wrapper = document.querySelector('.cep-wrapper');
  wrapper.classList.add('cep-wrapper--loading');

  fetch('https://viacep.com.br/ws/' + digits + '/json/')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      wrapper.classList.remove('cep-wrapper--loading');
      if (data.erro) {
        showFieldError('cep', 'CEP não encontrado');
        return;
      }
      if (data.logradouro) document.getElementById('addr-street').value = data.logradouro;
      if (data.bairro) document.getElementById('addr-neighborhood').value = data.bairro;
      if (data.localidade) document.getElementById('addr-city').value = data.localidade;
      if (data.uf) document.getElementById('addr-state').value = data.uf;

      clearFieldError('cep');
      announce('Endereço preenchido automaticamente pelo CEP.', 'live-announcements');
      document.getElementById('addr-number').focus();
    })
    .catch(function () {
      wrapper.classList.remove('cep-wrapper--loading');
    });
}

function showFieldError(field, msg) {
  const fieldEl = document.getElementById('field-' + field);
  const errorEl = document.getElementById(field + '-error');
  if (fieldEl) fieldEl.classList.add('form-field--error');
  if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'flex'; }
}

function clearFieldError(field) {
  const fieldEl = document.getElementById('field-' + field);
  const errorEl = document.getElementById(field + '-error');
  if (fieldEl) { fieldEl.classList.remove('form-field--error'); fieldEl.classList.add('form-field--success'); }
  if (errorEl) errorEl.style.display = 'none';
}

/* ═════════════════════════════════════════════
   PAYMENT
   ═════════════════════════════════════════════ */
function selectPaymentMethod(method) {
  _state.paymentMethod = method;

  document.querySelectorAll('.payment-card').forEach(function (card) {
    const isSelected = card.dataset.method === method;
    card.classList.toggle('payment-card--selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  ['pix', 'card', 'boleto'].forEach(function (m) {
    const detailEl = document.getElementById('payment-details-' + m);
    if (m === method) detailEl.classList.add('payment-details--active');
    else detailEl.classList.remove('payment-details--active');
  });

  updateSummary();
  announce('Forma de pagamento selecionada: ' + method, 'live-announcements');
}

/* ═════════════════════════════════════════════
   ORDER COMPLETION
   ═════════════════════════════════════════════ */
function completeOrder() {
  const orderId = 'AMOPETS-' + String(Math.floor(Math.random() * 9000) + 1000);
  const summary = calculateOrderSummary();

  document.getElementById('order-id-display').textContent = 'Pedido #' + orderId;

  let summaryHtml = '';
  _state.cart.items.forEach(function (item) {
    summaryHtml += '<div class="summary-line"><span>' + item.name + ' × ' + item.quantity + '</span><span>' + formatCurrency(roundTwo(item.price * item.quantity)) + '</span></div>';
  });
  if (summary.discount > 0) {
    summaryHtml += '<div class="summary-line summary-line--discount"><span>Desconto (' + _state.cart.coupon + ')</span><span>-' + formatCurrency(summary.discount) + '</span></div>';
  }
  summaryHtml += '<div class="summary-line"><span>Frete</span><span>' + (summary.shipping === 0 ? 'Grátis' : formatCurrency(summary.shipping)) + '</span></div>';
  if (summary.pixDiscount > 0) {
    summaryHtml += '<div class="summary-line summary-line--discount"><span>Desconto Pix</span><span>-' + formatCurrency(summary.pixDiscount) + '</span></div>';
  }
  summaryHtml += '<div class="summary-line summary-line--total"><span>Total</span><span>' + formatCurrency(summary.total) + '</span></div>';

  document.getElementById('success-summary-lines').innerHTML = summaryHtml;

  $stepPanels.forEach(function (p) { p.classList.remove('step-panel--active'); });
  $stepper.style.display = 'none';
  document.getElementById('checkout-sidebar').style.display = 'none';
  $successScreen.classList.add('success-screen--active');

  launchConfetti();
  localStorage.removeItem('amopets_cart');
  announce('Pedido confirmado! Número do pedido: ' + orderId, 'live-announcements');
}

/* ═════════════════════════════════════════════
   CONFETTI 🎉
   ═════════════════════════════════════════════ */
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';

  const shapes = ['🐾', '✨', '💜', '💛', '⭐'];

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.fontSize = (10 + Math.random() * 16) + 'px';
    container.appendChild(piece);
  }

  setTimeout(function () { container.innerHTML = ''; }, 5000);
}

/* ═════════════════════════════════════════════
   COUPON HANDLING — uses shared VALID_COUPONS
   ═════════════════════════════════════════════ */
function applyCoupon() {
  const code = ($couponInput.value || '').trim().toUpperCase();
  if (!code) {
    showCouponFeedback('Digite um código de cupom', false);
    return;
  }

  if (VALID_COUPONS[code]) {
    _state.cart.coupon = code;
    _state.cart.discountRate = VALID_COUPONS[code];
    saveCartToStorage();
    updateSummary();
    showCouponFeedback('✅ Cupom "' + code + '" aplicado! (' + Math.round(VALID_COUPONS[code] * 100) + '% OFF)', true);
    $couponInput.disabled = true;
    $couponApplyBtn.textContent = 'Remover';
    $couponApplyBtn.onclick = removeCoupon;
    announce('Cupom aplicado com sucesso: ' + code, 'live-announcements');
  } else {
    showCouponFeedback('❌ Cupom inválido. Tente novamente.', false);
  }
}

function removeCoupon() {
  _state.cart.coupon = null;
  _state.cart.discountRate = 0;
  saveCartToStorage();
  updateSummary();
  $couponInput.disabled = false;
  $couponInput.value = '';
  $couponApplyBtn.textContent = 'Aplicar';
  $couponApplyBtn.onclick = applyCoupon;
  showCouponFeedback('', false);
  announce('Cupom removido.', 'live-announcements');
}

function showCouponFeedback(msg, isSuccess) {
  $couponFeedback.textContent = msg;
  $couponFeedback.className = 'coupon-feedback ' + (isSuccess ? 'coupon-feedback--success' : 'coupon-feedback--error');
}

/* ═════════════════════════════════════════════
   CART ACTIONS (qty / remove)
   ═════════════════════════════════════════════ */
function handleCartAction(action, itemId) {
  let itemIndex = -1;
  _state.cart.items.forEach(function (item, i) {
    if (item.id === itemId) itemIndex = i;
  });
  if (itemIndex === -1) return;

  if (action === 'inc') {
    if (_state.cart.items[itemIndex].quantity < 10) _state.cart.items[itemIndex].quantity++;
  } else if (action === 'dec') {
    if (_state.cart.items[itemIndex].quantity > 1) _state.cart.items[itemIndex].quantity--;
  } else if (action === 'remove') {
    const name = _state.cart.items[itemIndex].name;
    _state.cart.items.splice(itemIndex, 1);
    announce(name + ' removido do carrinho.', 'live-announcements');
  }

  saveCartToStorage();
  renderCart();
  updateSummary();
}

/* ═════════════════════════════════════════════
   CEP MASK
   ═════════════════════════════════════════════ */
function maskCEP(value) {
  const digits = value.replace(/\D/g, '').substring(0, 8);
  if (digits.length > 5) return digits.substring(0, 5) + '-' + digits.substring(5);
  return digits;
}

/* ═════════════════════════════════════════════
   EVENT BINDING
   ═════════════════════════════════════════════ */
function bindEvents() {
  $stepBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const step = parseInt(btn.dataset.step);
      if (btn.getAttribute('aria-disabled') !== 'true') goToStep(step);
    });
  });

  $summaryCta.addEventListener('click', handleCtaClick);

  $cartItemsList.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    handleCartAction(btn.dataset.action, btn.dataset.id);
  });

  $couponApplyBtn.addEventListener('click', applyCoupon);
  $couponInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
  });

  const cepInput = document.getElementById('addr-cep');
  cepInput.addEventListener('input', function () {
    cepInput.value = maskCEP(cepInput.value);
    const digits = cepInput.value.replace(/\D/g, '');
    if (digits.length === 8) lookupCEP(digits);
  });

  ['cep', 'street', 'number', 'neighborhood', 'city', 'state'].forEach(function (f) {
    const el = document.getElementById('addr-' + f);
    if (el) {
      el.addEventListener('blur', function () {
        _state.address.touched[f] = true;
        readAddressFromForm();
        const val = _state.address[f];
        if (f === 'cep') {
          const cepDigits = (val || '').replace(/\D/g, '');
          if (cepDigits.length > 0 && cepDigits.length !== 8) showFieldError(f, 'CEP deve ter 8 dígitos');
          else if (cepDigits.length === 8) clearFieldError(f);
        } else if (val && val.trim().length > 0) {
          clearFieldError(f);
        }
      });
    }
  });

  document.querySelectorAll('.payment-card').forEach(function (card) {
    card.addEventListener('click', function () { selectPaymentMethod(card.dataset.method); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPaymentMethod(card.dataset.method); }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && _state.currentStep > 1) goToStep(_state.currentStep - 1);
  });
}

/* ─── Mobile summary toggle ─── */
function setupMobileToggle() {
  const mq = window.matchMedia('(max-width: 900px)');

  function handleMQ(e) {
    if (e.matches) {
      $summaryToggle.style.display = 'flex';
      $summaryToggle.addEventListener('click', toggleSummary);
    } else {
      $summaryToggle.style.display = 'none';
      document.getElementById('summary-card').classList.remove('summary-card--collapsed');
    }
  }

  mq.addEventListener('change', handleMQ);
  handleMQ(mq);
}

function toggleSummary() {
  document.getElementById('summary-card').classList.toggle('summary-card--collapsed');
}

/* ─── Init on DOMContentLoaded ─── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
