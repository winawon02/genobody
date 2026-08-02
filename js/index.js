const page = document.querySelector('#geno-mom-page');

if (page) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = page.querySelectorAll('[data-geno-mom-reveal]');

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('geno-mom-is-visible'));
  } else {
    page.classList.add('geno-mom-motion-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('geno-mom-is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .16, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  page.querySelectorAll('.geno-mom-comparison').forEach((slider) => {
    let startX = 0;
    let startScrollLeft = 0;

    slider.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
      startScrollLeft = slider.scrollLeft;
      slider.classList.add('geno-mom-is-dragging');
      slider.setPointerCapture(event.pointerId);
    });

    slider.addEventListener('pointermove', (event) => {
      if (!slider.classList.contains('geno-mom-is-dragging')) return;
      slider.scrollLeft = startScrollLeft - (event.clientX - startX);
    });

    const stopDragging = (event) => {
      if (!slider.classList.contains('geno-mom-is-dragging')) return;
      slider.classList.remove('geno-mom-is-dragging');
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
}
