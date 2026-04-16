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
})();
