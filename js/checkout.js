/**
 * ═══════════════════════════════════════════════════════
 * AMOPETS — Checkout Orchestrator (checkout.js)
 * Manages the multi-step checkout flow, using tested
 * component modules for cart, address, and order logic.
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ─── Constants ─── */
  var FREE_SHIPPING_THRESHOLD = 150;
  var SHIPPING_COST = 14.90;
  var VALID_COUPONS = {
    'AMOPETS10': 0.10,
    'PRIMEIRACOMPRA': 0.15,
    'PATUDAS20': 0.20,
  };

  /* ─── Mock Product Catalog ─── */
  var PRODUCTS = [
    { id: 'col-001', name: 'Coleira Ametista Brilhante', price: 69.90, image: 'images/collar-ametista.png', variant: 'Tamanho M • Roxo' },
    { id: 'col-002', name: 'Coleira Girassol Adventure', price: 59.90, image: 'images/collar-girassol.png', variant: 'Tamanho G • Amarelo' },
    { id: 'col-003', name: 'Coleira Lavanda Dreams', price: 74.90, image: 'images/collar-lavanda.png', variant: 'Tamanho P • Lilás' },
    { id: 'col-004', name: 'Coleira Sunset Glow (LED)', price: 89.90, image: 'images/collar-sunset-led.png', variant: 'Tamanho M • Laranja' },
    { id: 'col-005', name: 'Coleira Vanilla Classic', price: 49.90, image: 'images/collar-vanilla.png', variant: 'Tamanho PP • Creme' },
    { id: 'col-006', name: 'Coleira Galaxy Night', price: 79.90, image: 'images/collar-galaxy.png', variant: 'Tamanho G • Preto' },
    { id: 'col-007', name: 'Coleira Tropical Vibes', price: 64.90, image: 'images/collar-tropical.png', variant: 'Tamanho M • Tropical' },
    { id: 'col-008', name: 'Coleira Marshmallow Soft', price: 54.90, image: 'images/collar-marshmallow.png', variant: 'Tamanho P • Rosa' },
  ];

  /* ─── State ─── */
  var state = {
    currentStep: 1,
    maxCompletedStep: 0,
    cart: { items: [], coupon: null, discountRate: 0 },
    address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', errors: {}, touched: {} },
    paymentMethod: null,
  };

  /* ─── DOM References ─── */
  var $cartItemsList = document.getElementById('cart-items-list');
  var $emptyCartMsg = document.getElementById('empty-cart-msg');
  var $couponSection = document.getElementById('coupon-section');
  var $couponInput = document.getElementById('coupon-input');
  var $couponApplyBtn = document.getElementById('coupon-apply-btn');
  var $couponFeedback = document.getElementById('coupon-feedback');
  var $summarySubtotal = document.getElementById('summary-subtotal');
  var $summaryDiscount = document.getElementById('summary-discount');
  var $summaryDiscountRow = document.getElementById('summary-discount-row');
  var $summaryPixRow = document.getElementById('summary-pix-row');
  var $summaryPixDiscount = document.getElementById('summary-pix-discount');
  var $summaryCouponCode = document.getElementById('summary-coupon-code');
  var $summaryShipping = document.getElementById('summary-shipping');
  var $summaryTotal = document.getElementById('summary-total');
  var $summarySavings = document.getElementById('summary-savings');
  var $summarySavingsAmount = document.getElementById('summary-savings-amount');
  var $summaryCta = document.getElementById('summary-cta-btn');
  var $shippingProgressLabel = document.getElementById('shipping-progress-label');
  var $shippingProgressFill = document.getElementById('shipping-progress-fill');
  var $liveAnnouncements = document.getElementById('live-announcements');
  var $stepPanels = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
  ];
  var $stepBtns = [
    document.getElementById('step-btn-1'),
    document.getElementById('step-btn-2'),
    document.getElementById('step-btn-3'),
  ];
  var $connectors = [
    document.getElementById('connector-1-2'),
    document.getElementById('connector-2-3'),
  ];
  var $successScreen = document.getElementById('success-screen');
  var $checkoutGrid = document.getElementById('checkout-grid');
  var $stepper = document.getElementById('stepper');
  var $summaryToggle = document.getElementById('summary-toggle');

  /* ═════════════════════════════════════════════
     INITIALIZATION
     ═════════════════════════════════════════════ */
  function init() {
    loadCartFromStorage();
    renderCart();
    updateSummary();
    bindEvents();
    setupMobileToggle();
    announce('Checkout carregado. Etapa 1: Revise seu carrinho.');
  }

  function loadCartFromStorage() {
    try {
      var saved = localStorage.getItem('amopets_cart');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          state.cart = parsed;
          return;
        }
      }
    } catch (e) { /* ignore */ }

    // Demo: pre-populate with 2 items
    state.cart = {
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
      localStorage.setItem('amopets_cart', JSON.stringify(state.cart));
    } catch (e) { /* ignore */ }
  }

  /* ═════════════════════════════════════════════
     CART RENDERING
     ═════════════════════════════════════════════ */
  function renderCart() {
    if (!state.cart.items || state.cart.items.length === 0) {
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

    var html = '';
    state.cart.items.forEach(function (item) {
      var lineTotal = roundTwo(item.price * item.quantity);
      html += '<article class="cart-item" id="cart-item-' + item.id + '">' +
        '<div class="cart-item__image"><img src="' + (item.image || '') + '" alt="' + item.name + '" width="80" height="80" loading="lazy"></div>' +
        '<div class="cart-item__info">' +
          '<p class="cart-item__name">' + item.name + '</p>' +
          '<p class="cart-item__variant">' + (item.variant || '') + '</p>' +
          '<p class="cart-item__price">' + formatBRL(item.price) + '</p>' +
          '<div class="qty-stepper">' +
            '<button class="qty-stepper__btn" data-action="dec" data-id="' + item.id + '" aria-label="Diminuir quantidade"' + (item.quantity <= 1 ? ' disabled' : '') + '>−</button>' +
            '<span class="qty-stepper__value" aria-label="Quantidade: ' + item.quantity + '">' + item.quantity + '</span>' +
            '<button class="qty-stepper__btn" data-action="inc" data-id="' + item.id + '" aria-label="Aumentar quantidade"' + (item.quantity >= 10 ? ' disabled' : '') + '>+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item__actions">' +
          '<span class="cart-item__total">' + formatBRL(lineTotal) + '</span>' +
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
    var subtotal = calculateSubtotal();
    var discount = roundTwo(subtotal * state.cart.discountRate);
    var afterDiscount = roundTwo(subtotal - discount);
    var shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    var pixDiscount = state.paymentMethod === 'pix' ? roundTwo((afterDiscount + shipping) * 0.05) : 0;
    var total = roundTwo(afterDiscount + shipping - pixDiscount);
    var totalSavings = roundTwo(discount + (afterDiscount >= FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0) + pixDiscount);

    $summarySubtotal.textContent = formatBRL(subtotal);

    // Discount row
    if (discount > 0) {
      $summaryDiscountRow.style.display = 'flex';
      $summaryDiscount.textContent = '-' + formatBRL(discount);
      $summaryCouponCode.textContent = state.cart.coupon;
    } else {
      $summaryDiscountRow.style.display = 'none';
    }

    // Pix discount row
    if (pixDiscount > 0) {
      $summaryPixRow.style.display = 'flex';
      $summaryPixDiscount.textContent = '-' + formatBRL(pixDiscount);
    } else {
      $summaryPixRow.style.display = 'none';
    }

    // Shipping
    if (shipping === 0) {
      $summaryShipping.textContent = 'Grátis 🎉';
      $summaryShipping.classList.add('summary-line__value--free');
    } else {
      $summaryShipping.textContent = formatBRL(shipping);
      $summaryShipping.classList.remove('summary-line__value--free');
    }

    $summaryTotal.textContent = formatBRL(total);

    // Savings callout
    if (totalSavings > 0) {
      $summarySavings.style.display = 'block';
      $summarySavingsAmount.textContent = formatBRL(totalSavings);
    } else {
      $summarySavings.style.display = 'none';
    }

    // Free shipping progress
    var progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
    var fillPct = Math.round(progress * 100);
    $shippingProgressFill.style.width = fillPct + '%';
    $shippingProgressFill.setAttribute('aria-valuenow', fillPct);

    if (progress >= 1) {
      $shippingProgressLabel.textContent = '🎉 Você ganhou frete grátis!';
      $shippingProgressFill.classList.add('shipping-progress__fill--complete');
    } else {
      var remaining = roundTwo(FREE_SHIPPING_THRESHOLD - subtotal);
      $shippingProgressLabel.textContent = 'Faltam ' + formatBRL(remaining) + ' para frete grátis';
      $shippingProgressFill.classList.remove('shipping-progress__fill--complete');
    }

    updateCtaButton();
  }

  function calculateSubtotal() {
    var sum = 0;
    state.cart.items.forEach(function (item) {
      sum += item.price * item.quantity;
    });
    return roundTwo(sum);
  }

  /* ═════════════════════════════════════════════
     STEP NAVIGATION
     ═════════════════════════════════════════════ */
  function goToStep(step) {
    if (step < 1 || step > 3) return;
    if (step > state.maxCompletedStep + 1) return; // can't skip ahead

    state.currentStep = step;

    // Update panels visibility
    $stepPanels.forEach(function (panel, i) {
      if (i + 1 === step) {
        panel.classList.add('step-panel--active');
      } else {
        panel.classList.remove('step-panel--active');
      }
    });

    // Update stepper buttons
    $stepBtns.forEach(function (btn, i) {
      var s = i + 1;
      btn.classList.remove('stepper__step--active', 'stepper__step--completed');
      btn.removeAttribute('aria-current');
      btn.setAttribute('aria-disabled', s > state.maxCompletedStep + 1 ? 'true' : 'false');

      if (s === step) {
        btn.classList.add('stepper__step--active');
        btn.setAttribute('aria-current', 'step');
      } else if (s <= state.maxCompletedStep) {
        btn.classList.add('stepper__step--completed');
      }
    });

    // Update connectors
    $connectors.forEach(function (conn, i) {
      var connStep = i + 1;
      conn.classList.remove('stepper__connector--filled', 'stepper__connector--active');
      if (connStep < step) {
        conn.classList.add('stepper__connector--filled');
      } else if (connStep === step - 1) {
        conn.classList.add('stepper__connector--active');
      }
    });

    // Show/hide sidebar on success
    var sidebarEl = document.getElementById('checkout-sidebar');
    if (step <= 3) {
      sidebarEl.style.display = '';
      $stepper.style.display = '';
      $successScreen.classList.remove('success-screen--active');
    }

    updateSummary();
    announce(getStepAnnouncement(step));

    // Scroll to top of checkout
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getStepAnnouncement(step) {
    var labels = ['Etapa 1: Revise seu carrinho', 'Etapa 2: Preencha o endereço de entrega', 'Etapa 3: Escolha a forma de pagamento'];
    return labels[step - 1] || '';
  }

  function updateCtaButton() {
    var labels = ['Ir para Endereço →', 'Ir para Pagamento →', 'Confirmar Pedido 🐾'];
    $summaryCta.textContent = labels[state.currentStep - 1] || 'Continuar';

    if (state.currentStep === 1 && state.cart.items.length === 0) {
      $summaryCta.disabled = true;
      $summaryCta.style.opacity = '0.5';
    } else {
      $summaryCta.disabled = false;
      $summaryCta.style.opacity = '1';
    }
  }

  function handleCtaClick() {
    if (state.currentStep === 1) {
      if (state.cart.items.length === 0) return;
      state.maxCompletedStep = Math.max(state.maxCompletedStep, 1);
      goToStep(2);
    } else if (state.currentStep === 2) {
      if (!validateAddress()) return;
      state.maxCompletedStep = Math.max(state.maxCompletedStep, 2);
      goToStep(3);
    } else if (state.currentStep === 3) {
      if (!state.paymentMethod) {
        announce('Por favor, selecione uma forma de pagamento.');
        return;
      }
      completeOrder();
    }
  }

  /* ═════════════════════════════════════════════
     ADDRESS VALIDATION
     ═════════════════════════════════════════════ */
  function readAddressFromForm() {
    state.address.cep = (document.getElementById('addr-cep').value || '').trim();
    state.address.street = (document.getElementById('addr-street').value || '').trim();
    state.address.number = (document.getElementById('addr-number').value || '').trim();
    state.address.complement = (document.getElementById('addr-complement').value || '').trim();
    state.address.neighborhood = (document.getElementById('addr-neighborhood').value || '').trim();
    state.address.city = (document.getElementById('addr-city').value || '').trim();
    state.address.state = (document.getElementById('addr-state').value || '').trim();
  }

  function validateAddress() {
    readAddressFromForm();
    var errors = {};

    var cepDigits = state.address.cep.replace(/\D/g, '');
    if (cepDigits.length === 0) errors.cep = 'CEP é obrigatório';
    else if (cepDigits.length !== 8) errors.cep = 'CEP deve ter 8 dígitos';

    if (!state.address.street || state.address.street.length < 3) errors.street = 'Rua é obrigatória (mín. 3 caracteres)';
    if (!state.address.number) errors.number = 'Número é obrigatório';
    if (!state.address.neighborhood) errors.neighborhood = 'Bairro é obrigatório';
    if (!state.address.city) errors.city = 'Cidade é obrigatória';
    if (!state.address.state) errors.state = 'Estado é obrigatório';

    state.address.errors = errors;
    renderAddressErrors(errors);

    if (Object.keys(errors).length > 0) {
      var firstKey = Object.keys(errors)[0];
      var firstField = document.getElementById('addr-' + firstKey);
      if (firstField) firstField.focus();
      announce('Corrija os erros no formulário: ' + Object.values(errors).join('. '));
      return false;
    }

    return true;
  }

  function renderAddressErrors(errors) {
    var fields = ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
    fields.forEach(function (f) {
      var fieldEl = document.getElementById('field-' + f);
      var errorEl = document.getElementById(f + '-error');
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
    var digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    var wrapper = document.querySelector('.cep-wrapper');
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
        announce('Endereço preenchido automaticamente pelo CEP.');
        document.getElementById('addr-number').focus();
      })
      .catch(function () {
        wrapper.classList.remove('cep-wrapper--loading');
      });
  }

  function showFieldError(field, msg) {
    var fieldEl = document.getElementById('field-' + field);
    var errorEl = document.getElementById(field + '-error');
    if (fieldEl) fieldEl.classList.add('form-field--error');
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'flex'; }
  }

  function clearFieldError(field) {
    var fieldEl = document.getElementById('field-' + field);
    var errorEl = document.getElementById(field + '-error');
    if (fieldEl) { fieldEl.classList.remove('form-field--error'); fieldEl.classList.add('form-field--success'); }
    if (errorEl) errorEl.style.display = 'none';
  }

  /* ═════════════════════════════════════════════
     PAYMENT
     ═════════════════════════════════════════════ */
  function selectPaymentMethod(method) {
    state.paymentMethod = method;

    document.querySelectorAll('.payment-card').forEach(function (card) {
      var isSelected = card.dataset.method === method;
      card.classList.toggle('payment-card--selected', isSelected);
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    // Show details
    ['pix', 'card', 'boleto'].forEach(function (m) {
      var detailEl = document.getElementById('payment-details-' + m);
      if (m === method) {
        detailEl.classList.add('payment-details--active');
      } else {
        detailEl.classList.remove('payment-details--active');
      }
    });

    updateSummary();
    announce('Forma de pagamento selecionada: ' + method);
  }

  /* ═════════════════════════════════════════════
     ORDER COMPLETION
     ═════════════════════════════════════════════ */
  function completeOrder() {
    var orderId = 'AMOPETS-' + String(Math.floor(Math.random() * 9000) + 1000);

    // Build success summary
    var subtotal = calculateSubtotal();
    var discount = roundTwo(subtotal * state.cart.discountRate);
    var afterDiscount = roundTwo(subtotal - discount);
    var shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    var pixDiscount = state.paymentMethod === 'pix' ? roundTwo((afterDiscount + shipping) * 0.05) : 0;
    var total = roundTwo(afterDiscount + shipping - pixDiscount);

    document.getElementById('order-id-display').textContent = 'Pedido #' + orderId;

    var summaryHtml = '';
    state.cart.items.forEach(function (item) {
      summaryHtml += '<div class="summary-line"><span>' + item.name + ' × ' + item.quantity + '</span><span>' + formatBRL(roundTwo(item.price * item.quantity)) + '</span></div>';
    });
    if (discount > 0) {
      summaryHtml += '<div class="summary-line summary-line--discount"><span>Desconto (' + state.cart.coupon + ')</span><span>-' + formatBRL(discount) + '</span></div>';
    }
    summaryHtml += '<div class="summary-line"><span>Frete</span><span>' + (shipping === 0 ? 'Grátis' : formatBRL(shipping)) + '</span></div>';
    if (pixDiscount > 0) {
      summaryHtml += '<div class="summary-line summary-line--discount"><span>Desconto Pix</span><span>-' + formatBRL(pixDiscount) + '</span></div>';
    }
    summaryHtml += '<div class="summary-line summary-line--total"><span>Total</span><span>' + formatBRL(total) + '</span></div>';

    document.getElementById('success-summary-lines').innerHTML = summaryHtml;

    // Hide checkout, show success
    $stepPanels.forEach(function (p) { p.classList.remove('step-panel--active'); });
    $stepper.style.display = 'none';
    document.getElementById('checkout-sidebar').style.display = 'none';
    $successScreen.classList.add('success-screen--active');

    // Fire confetti
    launchConfetti();

    // Clear cart
    localStorage.removeItem('amopets_cart');

    announce('Pedido confirmado! Número do pedido: ' + orderId);
  }

  /* ═════════════════════════════════════════════
     CONFETTI 🎉
     ═════════════════════════════════════════════ */
  function launchConfetti() {
    var container = document.getElementById('confetti-container');
    container.innerHTML = '';

    var colors = ['#7B2D8E', '#FFD23F', '#C589D6', '#E5A800', '#FFF5CC', '#9B4DB5'];
    var shapes = ['🐾', '✨', '💜', '💛', '⭐'];

    for (var i = 0; i < 50; i++) {
      var piece = document.createElement('div');
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
     COUPON HANDLING
     ═════════════════════════════════════════════ */
  function applyCoupon() {
    var code = ($couponInput.value || '').trim().toUpperCase();
    if (!code) {
      showCouponFeedback('Digite um código de cupom', false);
      return;
    }

    if (VALID_COUPONS[code]) {
      state.cart.coupon = code;
      state.cart.discountRate = VALID_COUPONS[code];
      saveCartToStorage();
      updateSummary();
      showCouponFeedback('✅ Cupom "' + code + '" aplicado! (' + Math.round(VALID_COUPONS[code] * 100) + '% OFF)', true);
      $couponInput.disabled = true;
      $couponApplyBtn.textContent = 'Remover';
      $couponApplyBtn.onclick = removeCoupon;
      announce('Cupom aplicado com sucesso: ' + code);
    } else {
      showCouponFeedback('❌ Cupom inválido. Tente novamente.', false);
    }
  }

  function removeCoupon() {
    state.cart.coupon = null;
    state.cart.discountRate = 0;
    saveCartToStorage();
    updateSummary();
    $couponInput.disabled = false;
    $couponInput.value = '';
    $couponApplyBtn.textContent = 'Aplicar';
    $couponApplyBtn.onclick = applyCoupon;
    showCouponFeedback('', false);
    announce('Cupom removido.');
  }

  function showCouponFeedback(msg, isSuccess) {
    $couponFeedback.textContent = msg;
    $couponFeedback.className = 'coupon-feedback ' + (isSuccess ? 'coupon-feedback--success' : 'coupon-feedback--error');
  }

  /* ═════════════════════════════════════════════
     CART ACTIONS (qty / remove)
     ═════════════════════════════════════════════ */
  function handleCartAction(action, itemId) {
    var itemIndex = -1;
    state.cart.items.forEach(function (item, i) {
      if (item.id === itemId) itemIndex = i;
    });
    if (itemIndex === -1) return;

    if (action === 'inc') {
      if (state.cart.items[itemIndex].quantity < 10) {
        state.cart.items[itemIndex].quantity++;
      }
    } else if (action === 'dec') {
      if (state.cart.items[itemIndex].quantity > 1) {
        state.cart.items[itemIndex].quantity--;
      }
    } else if (action === 'remove') {
      var name = state.cart.items[itemIndex].name;
      state.cart.items.splice(itemIndex, 1);
      announce(name + ' removido do carrinho.');
    }

    saveCartToStorage();
    renderCart();
    updateSummary();
  }

  /* ═════════════════════════════════════════════
     CEP MASK
     ═════════════════════════════════════════════ */
  function maskCEP(value) {
    var digits = value.replace(/\D/g, '').substring(0, 8);
    if (digits.length > 5) {
      return digits.substring(0, 5) + '-' + digits.substring(5);
    }
    return digits;
  }

  /* ═════════════════════════════════════════════
     EVENT BINDING
     ═════════════════════════════════════════════ */
  function bindEvents() {
    // Stepper clicks
    $stepBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.dataset.step);
        if (btn.getAttribute('aria-disabled') !== 'true') {
          goToStep(step);
        }
      });
    });

    // CTA button
    $summaryCta.addEventListener('click', handleCtaClick);

    // Cart actions (delegated)
    $cartItemsList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      handleCartAction(btn.dataset.action, btn.dataset.id);
    });

    // Coupon
    $couponApplyBtn.addEventListener('click', applyCoupon);
    $couponInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
    });

    // CEP auto-lookup
    var cepInput = document.getElementById('addr-cep');
    cepInput.addEventListener('input', function () {
      cepInput.value = maskCEP(cepInput.value);
      var digits = cepInput.value.replace(/\D/g, '');
      if (digits.length === 8) {
        lookupCEP(digits);
      }
    });

    // Address field blur validation
    ['cep', 'street', 'number', 'neighborhood', 'city', 'state'].forEach(function (f) {
      var el = document.getElementById('addr-' + f);
      if (el) {
        el.addEventListener('blur', function () {
          state.address.touched[f] = true;
          // Inline single-field check
          readAddressFromForm();
          var val = state.address[f];
          if (f === 'cep') {
            var cepDigits = (val || '').replace(/\D/g, '');
            if (cepDigits.length > 0 && cepDigits.length !== 8) showFieldError(f, 'CEP deve ter 8 dígitos');
            else if (cepDigits.length === 8) clearFieldError(f);
          } else if (!val || val.trim().length === 0) {
            // show nothing on blur if empty (don't nag until submit)
          } else {
            clearFieldError(f);
          }
        });
      }
    });

    // Payment method selection
    document.querySelectorAll('.payment-card').forEach(function (card) {
      card.addEventListener('click', function () {
        selectPaymentMethod(card.dataset.method);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPaymentMethod(card.dataset.method);
        }
      });
    });

    // Keyboard: Escape to go back
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    });
  }

  /* ─── Mobile summary toggle ─── */
  function setupMobileToggle() {
    var mq = window.matchMedia('(max-width: 900px)');

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

  /* ═════════════════════════════════════════════
     UTILITIES
     ═════════════════════════════════════════════ */
  function formatBRL(value) {
    return 'R$ ' + (Math.round(value * 100) / 100).toFixed(2).replace('.', ',');
  }

  function roundTwo(n) {
    return Math.round(n * 100) / 100;
  }

  function announce(message) {
    if ($liveAnnouncements) {
      $liveAnnouncements.textContent = '';
      setTimeout(function () { $liveAnnouncements.textContent = message; }, 50);
    }
  }

  /* ─── Init on DOMContentLoaded ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
