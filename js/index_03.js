const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('[data-reveal]');

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll('.comparison').forEach((slider) => {
  let startX = 0;
  let startScrollLeft = 0;

  slider.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startScrollLeft = slider.scrollLeft;
    slider.classList.add('is-dragging');
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener('pointermove', (event) => {
    if (!slider.classList.contains('is-dragging')) return;
    slider.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const stopDragging = (event) => {
    if (!slider.classList.contains('is-dragging')) return;
    slider.classList.remove('is-dragging');
    if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
  };

  slider.addEventListener('pointerup', stopDragging);
  slider.addEventListener('pointercancel', stopDragging);
  slider.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    slider.scrollBy({ left: event.key === 'ArrowRight' ? 240 : -240, behavior: 'smooth' });
  });
});
