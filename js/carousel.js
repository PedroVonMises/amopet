/* ═══════════════════════════════════════════════════════
   AMOPETS — Carousel JavaScript (carousel.js)
   Testimonials horizontal scroll-snap carousel
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initCarousel);

  function initCarousel() {
    var track = document.getElementById('testimonials-track');
    var prevBtn = document.getElementById('testimonials-prev');
    var nextBtn = document.getElementById('testimonials-next');

    if (!track || !prevBtn || !nextBtn) return;

    var scrollAmount = 340; // card width + gap

    prevBtn.addEventListener('click', function () {
      track.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    });

    nextBtn.addEventListener('click', function () {
      track.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    });

    // Touch / drag support for desktop
    var isDown = false;
    var startX;
    var scrollLeft;

    track.addEventListener('mousedown', function (e) {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', function () {
      isDown = false;
      track.style.cursor = '';
    });

    track.addEventListener('mouseup', function () {
      isDown = false;
      track.style.cursor = '';
    });

    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Keyboard accessibility
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });
  }
})();
