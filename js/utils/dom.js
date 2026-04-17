/**
 * AMOPETS — Shared DOM Utilities
 * Reusable DOM helpers: accessibility announcements, toast notifications, cart badge sync.
 */

/**
 * Announce a message to screen readers via aria-live region
 * @param {string} message
 * @param {string} [elementId='live-announcements']
 */
export function announce(message, elementId) {
  const el = document.getElementById(elementId || 'live-announcements');
  if (!el) return;
  el.textContent = '';
  setTimeout(function () {
    el.textContent = message;
  }, 50);
}

/**
 * Show a toast notification with auto-hide
 * @param {string} [toastId='cart-toast']
 * @param {number} [duration=3500]
 */
export function showToast(toastId, duration) {
  const toast = document.getElementById(toastId || 'cart-toast');
  if (!toast) return;

  // Support both CSS class and inline transform approaches
  if (toast.classList.contains('cart-toast')) {
    toast.classList.add('cart-toast--visible');
    setTimeout(function () {
      toast.classList.remove('cart-toast--visible');
    }, duration || 3500);
  } else {
    toast.style.transform = 'translateX(0)';
    setTimeout(function () {
      toast.style.transform = 'translateX(120%)';
    }, duration || 3500);
  }
}

/**
 * Sync the cart badge count from localStorage
 * @param {string} [badgeId='cart-count']
 */
export function syncCartBadge(badgeId) {
  const badge = document.getElementById(badgeId || 'cart-count');
  if (!badge) return;

  let count = 0;
  try {
    const saved = localStorage.getItem('amopets_cart');
    if (saved) {
      const cart = JSON.parse(saved);
      if (cart && Array.isArray(cart.items)) {
        cart.items.forEach(function (item) {
          count += item.quantity || 0;
        });
      }
    }
  } catch (e) { /* ignore */ }

  badge.textContent = count;
  badge.setAttribute('aria-label', count + ' itens no carrinho');
  badge.style.display = count > 0 ? '' : 'none';
}

/**
 * Animate a button with success feedback and auto-restore
 * @param {HTMLElement} btn
 * @param {string} successText
 * @param {number} [duration=1500]
 */
export function animateButtonSuccess(btn, successText, duration) {
  if (!btn) return;
  const originalText = btn.textContent;
  const originalBg = btn.style.background;
  const originalColor = btn.style.color;

  btn.textContent = successText;
  btn.style.background = '#27ae60';
  btn.style.color = '#fff';
  btn.disabled = true;

  setTimeout(function () {
    btn.textContent = originalText;
    btn.style.background = originalBg;
    btn.style.color = originalColor;
    btn.disabled = false;
  }, duration || 1500);
}
