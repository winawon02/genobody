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
    const progressIndicator = slider.closest('.geno-mom-comparison-frame')?.querySelector('.geno-mom-comparison-progress span');

    const getSlideStep = () => {
      const firstSlide = slider.querySelector('.geno-mom-comparison-slide');
      const secondSlide = slider.querySelector('.geno-mom-comparison-slide + .geno-mom-comparison-slide');
      if (!firstSlide) return 0;
      if (secondSlide) return secondSlide.offsetLeft - firstSlide.offsetLeft;
      return firstSlide.getBoundingClientRect().width;
    };

    const updateProgress = () => {
      if (!progressIndicator) return;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const thumbSize = maxScroll > 0 ? (slider.clientWidth / slider.scrollWidth) * 100 : 100;
      const travel = 100 - thumbSize;
      const position = maxScroll > 0 ? (slider.scrollLeft / maxScroll) * travel : 0;
      progressIndicator.style.width = `${thumbSize}%`;
      progressIndicator.style.left = `${position}%`;
    };

    slider.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      startX = event.clientX;
      startScrollLeft = slider.scrollLeft;
      slider.classList.add('geno-mom-is-dragging');
      slider.setPointerCapture(event.pointerId);
    });

    slider.addEventListener('pointermove', (event) => {
      if (!slider.classList.contains('geno-mom-is-dragging')) return;
      slider.scrollLeft = startScrollLeft - (event.clientX - startX);
    });
    slider.addEventListener('scroll', updateProgress, { passive:true });
    slider.addEventListener('dragstart', (event) => event.preventDefault());
    window.addEventListener('resize', updateProgress);
    updateProgress();

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
      const step = getSlideStep();
      slider.scrollBy({ left: event.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
    });
  });

  const mapContainer = page.querySelector('#geno-mom-kakao-map');
  const mapAddress = '인천 연수구 첨단대로 40';

  const initKakaoMap = () => {
    if (!window.kakao?.maps) {
      mapContainer.textContent = '지도를 불러오지 못했습니다.';
      return;
    }

    window.kakao.maps.load(() => {
      if (!window.kakao.maps.services) {
        mapContainer.textContent = '지도를 불러오지 못했습니다.';
        return;
      }
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(mapAddress, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
          mapContainer.textContent = '지도를 불러오지 못했습니다.';
          return;
        }

        const position = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        mapContainer.textContent = '';
        const map = new window.kakao.maps.Map(mapContainer, {
          center: position,
          level: 3
        });

        new window.kakao.maps.Marker({ map, position });
      });
    });
  };

  const loadKakaoMapSdk = () => {
    if (window.kakao?.maps) {
      initKakaoMap();
      return;
    }

    const existingScript = document.querySelector('script[data-geno-mom-kakao-sdk], script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', initKakaoMap, { once:true });
      existingScript.addEventListener('error', () => {
        mapContainer.textContent = '지도를 불러오지 못했습니다.';
      }, { once:true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.genoMomKakaoSdk = 'true';
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=817245a2c8d4c6dba8b8da968cfd09cc&autoload=false&libraries=services';
    script.async = true;
    script.addEventListener('load', initKakaoMap, { once:true });
    script.addEventListener('error', () => {
      mapContainer.textContent = '지도를 불러오지 못했습니다.';
    }, { once:true });
    document.head.appendChild(script);
  };

  if (mapContainer) loadKakaoMapSdk();
}
