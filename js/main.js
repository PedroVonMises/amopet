/* ═══════════════════════════════════════════════════════
   AMOPETS — Main JavaScript (main.js)
   IntersectionObserver, mobile menu, scroll effects
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM Ready ───
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupScrollReveal();
    setupMobileMenu();
    setupHeaderScroll();
    setupSmoothScroll();
    setupNewsletterForm();
    setupCartSync();
    setupAddToCart();
    setupSearchTransition();
  }

  // ═══════════════════════════════════════════
  // Scroll Reveal (IntersectionObserver)
  // ═══════════════════════════════════════════
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

    if (!revealElements.length) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instantly show all elements
      revealElements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ═══════════════════════════════════════════
  // Mobile Menu
  // ═══════════════════════════════════════════
  function setupMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    var backdrop = document.getElementById('mobile-backdrop');
    var mobileLinks = document.querySelectorAll('.mobile-menu__link');

    if (!hamburger || !mobileMenu || !backdrop) return;

    function toggleMenu() {
      var isActive = hamburger.classList.contains('active');

      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      backdrop.classList.toggle('active');

      hamburger.setAttribute('aria-expanded', !isActive);
      document.body.style.overflow = isActive ? '' : 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      backdrop.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ═══════════════════════════════════════════
  // Header Scroll Effect
  // ═══════════════════════════════════════════
  function setupHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;

    var scrollThreshold = 50;
    var ticking = false;

    function updateHeader() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════
  // Smooth Scroll for anchor links
  // ═══════════════════════════════════════════
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var headerHeight = document.getElementById('header').offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  // Newsletter Form
  // ═══════════════════════════════════════════
  function setupNewsletterForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = document.getElementById('newsletter-email');
      var submitBtn = document.getElementById('newsletter-submit');
      var email = emailInput.value.trim();

      if (!email) return;

      // Success feedback
      var originalText = submitBtn.textContent;
      submitBtn.textContent = '🎉 Feito!';
      submitBtn.style.background = '#4CAF50';
      emailInput.value = '';

      setTimeout(function () {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
      }, 2500);
    });
  }
  // ═══════════════════════════════════════════
  // Cart Badge Sync (from localStorage)
  // ═══════════════════════════════════════════
  function setupCartSync() {
    syncCartBadge();

    // Sync when tab becomes visible (user may have added items on another page)
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) syncCartBadge();
    });

    // Sync across tabs via storage event
    window.addEventListener('storage', function (e) {
      if (e.key === 'amopets_cart') syncCartBadge();
    });
  }

  function syncCartBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;

    var count = 0;
    try {
      var saved = localStorage.getItem('amopets_cart');
      if (saved) {
        var cart = JSON.parse(saved);
        if (cart && Array.isArray(cart.items)) {
          cart.items.forEach(function (item) {
            count += item.quantity || 0;
          });
        }
      }
    } catch (e) { /* ignore */ }

    badge.textContent = count;
    badge.setAttribute('aria-label', count + ' itens no carrinho');

    // Show/hide badge visually
    badge.style.display = count > 0 ? '' : 'none';
  }

  // ═══════════════════════════════════════════
  // Add to Cart (from landing page product cards)
  // ═══════════════════════════════════════════
  function setupAddToCart() {
    var grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.product-card__cta');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      var card = btn.closest('.product-card');
      if (!card) return;

      var item = {
        id: card.dataset.id || card.id,
        name: card.dataset.name || 'Produto',
        price: parseFloat(card.dataset.price) || 0,
        quantity: 1,
        image: card.querySelector('.product-card__image') ? card.querySelector('.product-card__image').src : '',
        variant: 'Padrão',
      };

      // Add to localStorage cart
      addItemToCart(item);

      // Animate button
      var originalText = btn.textContent;
      btn.textContent = '✓ Adicionado!';
      btn.style.background = '#27ae60';
      btn.style.color = '#fff';
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 1500);

      // Show toast
      showCartToast();

      // Update badge
      syncCartBadge();
    });
  }

  function addItemToCart(item) {
    var cart;
    try {
      var saved = localStorage.getItem('amopets_cart');
      cart = saved ? JSON.parse(saved) : { items: [], coupon: null, discountRate: 0 };
    } catch (e) {
      cart = { items: [], coupon: null, discountRate: 0 };
    }

    if (!Array.isArray(cart.items)) cart.items = [];

    // Check if item already exists
    var found = false;
    for (var i = 0; i < cart.items.length; i++) {
      if (cart.items[i].id === item.id) {
        cart.items[i].quantity += item.quantity;
        found = true;
        break;
      }
    }

    if (!found) {
      cart.items.push(item);
    }

    try {
      localStorage.setItem('amopets_cart', JSON.stringify(cart));
    } catch (e) { /* ignore */ }
  }

  function showCartToast() {
    var toast = document.getElementById('cart-toast');
    if (!toast) return;

    toast.style.transform = 'translateX(0)';

    setTimeout(function () {
      toast.style.transform = 'translateX(120%)';
    }, 3500);
  }
})();
