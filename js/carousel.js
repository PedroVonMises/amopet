/**
 * AMOPETS — Testimonials Carousel
 * Touch/drag, auto-scroll, keyboard support.
 */

function initCarousel() {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');

  if (!track || !prevBtn || !nextBtn) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  function scrollByCard(direction) {
    const card = track.querySelector('.testimonial-card');
    if (!card) return;
    const cardWidth = card.offsetWidth + 24; // gap
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', function () { scrollByCard(-1); });
  nextBtn.addEventListener('click', function () { scrollByCard(1); });

  // Touch/Drag support
  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseleave', function () {
    isDragging = false;
    track.style.cursor = '';
  });

  track.addEventListener('mouseup', function () {
    isDragging = false;
    track.style.cursor = '';
  });

  track.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });

  // Touch events
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].pageX;
    scrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.2;
    track.scrollLeft = scrollLeft - walk;
  }, { passive: true });

  // Keyboard nav
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') scrollByCard(-1);
    if (e.key === 'ArrowRight') scrollByCard(1);
  });
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}
