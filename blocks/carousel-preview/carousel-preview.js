import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/shared.js';

let carouselId = 0;

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
  });
}

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-preview-slide:not(.is-clone)')];
}

function centerOffset(track, slide) {
  return slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
}

function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-preview-slide').forEach((slide) => {
    const active = Number(slide.dataset.slideIndex) === slideIndex;
    slide.classList.toggle('is-active', active);
    if (slide.classList.contains('is-clone')) return;
    slide.setAttribute('aria-hidden', String(!active));
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-preview-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function showSlide(block, slideIndex) {
  const slides = getSlides(block);
  if (!slides.length) return;
  const index = (slideIndex + slides.length) % slides.length;
  const track = block.querySelector('.carousel-preview-slides');
  // Wrap through the loop clones so the carousel keeps moving in the same direction.
  let target = slides[index];
  if (slideIndex < 0) target = track.querySelector(`.is-clone[data-clone='before'][data-slide-index='${index}']`) || target;
  if (slideIndex >= slides.length) target = track.querySelector(`.is-clone[data-clone='after'][data-slide-index='${index}']`) || target;
  // Centre the target slide so its neighbours peek in on both sides.
  track.scrollTo({ left: centerOffset(track, target), behavior: scrollBehavior() });
  updateActiveSlide(block, index);
}

/** Re-centre the active slide without animation (after resize or when landing on a clone). */
function snapToActive(block) {
  const track = block.querySelector('.carousel-preview-slides');
  const slide = getSlides(block)[Number(block.dataset.activeSlide) || 0];
  if (slide && track.clientWidth) {
    track.scrollTo({ left: centerOffset(track, slide), behavior: 'instant' });
  }
}

function createClone(slide, position) {
  const clone = slide.cloneNode(true);
  clone.classList.add('is-clone');
  clone.dataset.clone = position;
  ['id', 'role', 'aria-roledescription', 'aria-labelledby'].forEach((attr) => clone.removeAttribute(attr));
  clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  return clone;
}

/** Clone the last/first two slides around the track so neighbours always peek in. */
function addLoopClones(track) {
  const slides = [...track.children];
  const count = Math.min(2, slides.length);
  slides.slice(-count).reverse().forEach((slide) => track.prepend(createClone(slide, 'before')));
  slides.slice(0, count).forEach((slide) => track.append(createClone(slide, 'after')));
}

function bindEvents(block) {
  const track = block.querySelector('.carousel-preview-slides');

  block.querySelectorAll('.carousel-preview-indicator button').forEach((button, idx) => {
    button.addEventListener('click', () => showSlide(block, idx));
  });

  block.querySelector('.carousel-preview-prev').addEventListener('click', () => {
    showSlide(block, Number(block.dataset.activeSlide) - 1);
  });
  block.querySelector('.carousel-preview-next').addEventListener('click', () => {
    showSlide(block, Number(block.dataset.activeSlide) + 1);
  });

  // Keep state in sync when the user swipes or scrolls the track directly.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, Number(entry.target.dataset.slideIndex));
      }
    });
  }, { root: track, threshold: 0.6 });
  track.querySelectorAll('.carousel-preview-slide').forEach((slide) => observer.observe(slide));

  // Once scrolling settles on a loop clone, jump to the real slide it mirrors.
  let settleTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const centre = track.scrollLeft + track.clientWidth / 2;
      const nearest = [...track.children].reduce((best, slide) => {
        const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centre);
        return distance < best.distance ? { slide, distance } : best;
      }, { slide: null, distance: Infinity }).slide;
      if (nearest?.classList.contains('is-clone')) snapToActive(block);
    }, 150);
  }, { passive: true });

  new ResizeObserver(() => snapToActive(block)).observe(track);
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-preview-slide';
  slide.id = `carousel-preview-${id}-slide-${slideIndex}`;
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('role', 'group');

  [...row.children].forEach((column) => {
    const isImage = column.querySelector('picture') && !column.textContent.trim();
    column.className = isImage ? 'carousel-preview-slide-image' : 'carousel-preview-slide-content';
    slide.append(column);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }
  return slide;
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

/** @param {Element} block The carousel-preview block element */
export default async function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = `carousel-preview-${id}`;
  const rows = [...block.children];
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();
  const labels = {
    region: placeholders['carousel'] || 'Carousel',
    slide: placeholders.slide || 'Slide',
    controls: placeholders.carouselSlideControls || 'Carousel slide controls',
    previous: placeholders.previousSlide || 'Previous slide',
    next: placeholders.nextSlide || 'Next slide',
    show: placeholders.showSlide || 'Show slide',
    of: placeholders.of || 'of',
  };

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  const container = document.createElement('div');
  container.className = 'carousel-preview-slides-container';
  const track = document.createElement('ul');
  track.className = 'carousel-preview-slides';

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, id);
    slide.setAttribute('aria-roledescription', labels.slide);
    track.append(slide);
    row.remove();
  });
  optimizeImages(track);
  container.append(track);
  block.replaceChildren(container);

  if (isSingleSlide) {
    block.classList.add('is-single');
    updateActiveSlide(block, 0);
    return;
  }

  addLoopClones(track);

  const nav = document.createElement('div');
  nav.className = 'carousel-preview-navigation';
  nav.append(
    createButton('carousel-preview-prev', labels.previous),
    createButton('carousel-preview-next', labels.next),
  );
  container.append(nav);

  const indicatorsNav = document.createElement('nav');
  indicatorsNav.setAttribute('aria-label', labels.controls);
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-preview-indicators';
  rows.forEach((row, idx) => {
    const li = document.createElement('li');
    li.className = 'carousel-preview-indicator';
    const button = createButton('', `${labels.show} ${idx + 1} ${labels.of} ${rows.length}`);
    button.setAttribute('aria-controls', `carousel-preview-${id}-slide-${idx}`);
    li.append(button);
    indicators.append(li);
  });
  indicatorsNav.append(indicators);
  block.append(indicatorsNav);

  updateActiveSlide(block, 0);
  bindEvents(block);
}
