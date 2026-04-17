/* ═══════════════════════════════════════════════════════
   AMOPETS — Main JavaScript (main.js)
   IntersectionObserver, mobile menu, scroll effects
   ═══════════════════════════════════════════════════════ */

import { cartReducer, CartActions, loadCart, saveCart } from './utils/cart.js';
import { syncCartBadge, showToast, animateButtonSuccess } from './utils/dom.js';

// ─── DOM Ready ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealElements.forEach(function (el) { el.classList.add('revealed'); });
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
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach(function (el) { observer.observe(el); });
}

// ═══════════════════════════════════════════
// Mobile Menu
// ═══════════════════════════════════════════
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (!hamburger || !mobileMenu || !backdrop) return;

  function toggleMenu() {
    const isActive = hamburger.classList.contains('active');
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
  mobileLinks.forEach(function (link) { link.addEventListener('click', closeMenu); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
  });
}

// ═══════════════════════════════════════════
// Header Scroll Effect
// ═══════════════════════════════════════════
function setupHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const scrollThreshold = 50;
  let ticking = false;

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
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = document.getElementById('header').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}

// ═══════════════════════════════════════════
// Newsletter Form
// ═══════════════════════════════════════════
function setupNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const submitBtn = document.getElementById('newsletter-submit');
    const email = emailInput.value.trim();
    if (!email) return;

    const originalText = submitBtn.textContent;
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
// Cart Badge Sync — uses shared syncCartBadge()
// ═══════════════════════════════════════════
function setupCartSync() {
  syncCartBadge();

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) syncCartBadge();
  });

  window.addEventListener('storage', function (e) {
    if (e.key === 'amopets_cart') syncCartBadge();
  });
}

// ═══════════════════════════════════════════
// Add to Cart — uses shared cart reducer
// ═══════════════════════════════════════════
function setupAddToCart() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.product-card__cta');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest('.product-card');
    if (!card) return;

    const item = {
      id: card.dataset.id || card.id,
      name: card.dataset.name || 'Produto',
      price: parseFloat(card.dataset.price) || 0,
      image: card.querySelector('.product-card__image') ? card.querySelector('.product-card__image').src : '',
    };

    // Use shared cart reducer
    let cart = loadCart();
    cart = cartReducer(cart, { type: CartActions.ADD_ITEM, payload: item });
    saveCart(cart);

    // Animate button
    animateButtonSuccess(btn, '✓ Adicionado!');

    // Show toast & update badge
    showToast('cart-toast');
    syncCartBadge();
  });
}

// ═══════════════════════════════════════════
// Search Transition (Lupa → Expanding Bar)
// ═══════════════════════════════════════════
function setupSearchTransition() {
  const btnSearch = document.getElementById('btn-search');
  if (!btnSearch) return;

  if (window.location.pathname.indexOf('catalog') >= 0) {
    btnSearch.addEventListener('click', function () {
      const catSearch = document.getElementById('catalog-search');
      if (catSearch) catSearch.focus();
    });
    return;
  }

  let isOpen = false;
  let overlay = null;
  let bar = null;
  let input = null;

  function openSearch() {
    if (isOpen) return;
    isOpen = true;

    const rect = btnSearch.getBoundingClientRect();

    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    document.body.appendChild(overlay);

    bar = document.createElement('div');
    bar.className = 'search-expand';
    bar.setAttribute('role', 'search');
    bar.innerHTML =
      '<svg class="search-expand__icon" viewBox="0 0 24 24">' +
        '<circle cx="11" cy="11" r="8"/>' +
        '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
      '</svg>' +
      '<input type="search" class="search-expand__input" placeholder="O que seu pet precisa?" autocomplete="off" />' +
      '<button class="search-expand__close" aria-label="Fechar busca">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
          '<line x1="18" y1="6" x2="6" y2="18"/>' +
          '<line x1="6" y1="6" x2="18" y2="18"/>' +
        '</svg>' +
      '</button>' +
      '<span class="search-expand__hint">Pressione Enter para buscar 🐾</span>';

    bar.style.top = rect.top + 'px';
    bar.style.left = rect.left + 'px';
    bar.style.width = rect.width + 'px';
    bar.style.height = rect.height + 'px';
    bar.style.borderRadius = '50%';

    document.body.appendChild(bar);
    input = bar.querySelector('.search-expand__input');

    void bar.offsetWidth;

    const targetWidth = Math.min(window.innerWidth * 0.9, 640);
    const targetHeight = 56;
    const targetTop = rect.top + (rect.height / 2) - (targetHeight / 2);
    const targetLeft = (window.innerWidth - targetWidth) / 2;

    bar.style.top = targetTop + 'px';
    bar.style.left = targetLeft + 'px';
    bar.style.width = targetWidth + 'px';
    bar.style.height = targetHeight + 'px';
    bar.style.borderRadius = '';

    overlay.classList.add('active');

    setTimeout(function () {
      bar.classList.add('expanded');
      input.focus();
    }, 150);

    bar.querySelector('.search-expand__close').addEventListener('click', closeSearch);
    overlay.addEventListener('click', closeSearch);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim().length > 0) {
        e.preventDefault();
        navigateToCatalog(input.value.trim());
      }
      if (e.key === 'Escape') closeSearch();
    });

    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    if (!isOpen) return;
    isOpen = false;

    const rect = btnSearch.getBoundingClientRect();
    bar.classList.remove('expanded');
    bar.style.top = rect.top + 'px';
    bar.style.left = rect.left + 'px';
    bar.style.width = rect.width + 'px';
    bar.style.height = rect.height + 'px';
    bar.style.borderRadius = '50%';

    overlay.classList.remove('active');
    document.body.style.overflow = '';

    setTimeout(function () {
      if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      bar = null;
      overlay = null;
      input = null;
      btnSearch.focus();
    }, 500);
  }

  function navigateToCatalog(query) {
    if (input) input.style.color = 'var(--color-yellow-primary)';
    setTimeout(function () {
      window.location.href = 'catalog.html?q=' + encodeURIComponent(query);
    }, 300);
  }

  btnSearch.addEventListener('click', openSearch);
}

// Auto-focus catalog search if arriving with ?q=
(function autoFocusCatalogSearch() {
  if (window.location.pathname.indexOf('catalog') < 0) return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    const catSearch = document.getElementById('catalog-search');
    if (catSearch) {
      catSearch.value = q;
      catSearch.focus();
    }
  }
})();
