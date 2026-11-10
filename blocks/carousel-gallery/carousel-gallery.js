import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/shared.js';

const VIDEO_PATTERN = /\.(mp4|webm|ogg|mov)(?:[?#]|$)/i;

let galleryId = 0;

function isOptimizable(src) {
  const url = new URL(src, window.location.href);
  return url.origin === window.location.origin && !/\.svg$/i.test(url.pathname);
}

function optimizeImages(scope, width) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    if (!isOptimizable(img.src)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width }]));
  });
}

function findVideoLink(scope) {
  return [...scope.querySelectorAll('a[href]')].find((a) => VIDEO_PATTERN.test(a.href));
}

function videoType(href) {
  const ext = new URL(href, window.location.href).pathname.split('.').pop().toLowerCase();
  return ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-gallery-slide')];
}

function stopVideos(block, exceptSlide) {
  block.querySelectorAll('.carousel-gallery-slide video').forEach((video) => {
    if (!exceptSlide || !exceptSlide.contains(video)) video.pause();
  });
}

function updateActiveSlide(block, slideIndex) {
  const slides = getSlides(block);
  block.dataset.activeSlide = slideIndex;

  slides.forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.querySelectorAll('a, button, video').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  stopVideos(block, slides[slideIndex]);

  block.querySelectorAll('.carousel-gallery-thumbnail button').forEach((button, idx) => {
    if (idx === slideIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });

  const progress = block.querySelector('.carousel-gallery-progress');
  if (progress) {
    progress.style.setProperty('--carousel-gallery-index', slideIndex);
    progress.style.setProperty('--carousel-gallery-count', slides.length);
    progress.setAttribute('aria-valuenow', String(slideIndex + 1));
  }

  const counter = block.querySelector('.carousel-gallery-counter');
  if (counter) counter.textContent = `${slideIndex + 1} ${counter.dataset.of} ${slides.length}`;

  // Keep the active thumbnail visible in the (clipped) thumbnail strip.
  const strip = block.querySelector('.carousel-gallery-thumbnails');
  const activeThumb = strip?.children[slideIndex];
  if (strip && activeThumb && strip.clientWidth) {
    const { offsetLeft, offsetWidth } = activeThumb;
    let left = strip.scrollLeft;
    if (offsetLeft < left) left = offsetLeft;
    else if (offsetLeft + offsetWidth > left + strip.clientWidth) {
      left = offsetLeft + offsetWidth - strip.clientWidth;
    }
    if (left !== strip.scrollLeft) strip.scrollTo({ left, behavior: 'smooth' });
  }
}

function showSlide(block, slideIndex) {
  const slides = getSlides(block);
  if (!slides.length) return;
  const index = (slideIndex + slides.length) % slides.length;
  const track = block.querySelector('.carousel-gallery-slides');
  track.scrollTo({
    left: slides[index].offsetLeft,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
  updateActiveSlide(block, index);
}

function setupVideoSlide(slide, href, labels) {
  slide.classList.add('is-video');
  const media = slide.querySelector('.carousel-gallery-slide-media');
  const play = createButton('carousel-gallery-play', labels.play);
  play.addEventListener('click', () => {
    const poster = media.querySelector('img');
    const video = document.createElement('video');
    video.className = 'carousel-gallery-video';
    video.controls = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    if (poster) video.poster = poster.currentSrc || poster.src;
    const source = document.createElement('source');
    source.src = href;
    source.type = videoType(href);
    video.append(source);
    media.replaceChildren(video);
    play.remove();
    slide.classList.add('is-playing');
    video.play().catch(() => {});
    video.focus();
  }, { once: true });
  media.append(play);
}

function createSlide(row, slideIndex, id, labels) {
  const slide = document.createElement('li');
  slide.className = 'carousel-gallery-slide';
  slide.id = `carousel-gallery-${id}-slide-${slideIndex}`;
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', labels.slide);

  const media = document.createElement('div');
  media.className = 'carousel-gallery-slide-media';
  const picture = row.querySelector('picture');
  if (picture) media.append(picture);
  slide.append(media);

  const videoLink = findVideoLink(row);
  if (videoLink) setupVideoSlide(slide, videoLink.href, labels);

  // Any remaining text (optional caption) is kept below the media.
  const caption = document.createElement('div');
  caption.className = 'carousel-gallery-slide-caption';
  row.querySelectorAll(':scope > div > *').forEach((el) => {
    if (videoLink && el.contains(videoLink)) return;
    if (el.textContent.trim()) caption.append(el);
  });
  if (caption.children.length) slide.append(caption);

  return slide;
}

function createThumbnail(slide, idx, total, id, labels) {
  const li = document.createElement('li');
  li.className = 'carousel-gallery-thumbnail';
  if (slide.classList.contains('is-video')) li.classList.add('is-video');

  const img = slide.querySelector('.carousel-gallery-slide-media img');
  const name = img?.alt ? `: ${img.alt}` : '';
  const button = createButton('', `${labels.show} ${idx + 1} ${labels.of} ${total}${name}`);
  button.setAttribute('aria-controls', `carousel-gallery-${id}-slide-${idx}`);
  if (img) {
    const src = img.getAttribute('src');
    let thumb;
    if (isOptimizable(src)) {
      thumb = createOptimizedPicture(src, '', false, [{ width: '200' }]);
    } else {
      thumb = img.closest('picture').cloneNode(true);
      thumb.querySelector('img').alt = '';
    }
    thumb.querySelector('img').loading = 'lazy';
    button.append(thumb);
  }
  li.append(button);
  return li;
}

function bindEvents(block) {
  const track = block.querySelector('.carousel-gallery-slides');

  block.querySelectorAll('.carousel-gallery-thumbnail button').forEach((button, idx) => {
    button.addEventListener('click', () => showSlide(block, idx));
  });
  block.querySelector('.carousel-gallery-prev').addEventListener('click', () => {
    showSlide(block, Number(block.dataset.activeSlide) - 1);
  });
  block.querySelector('.carousel-gallery-next').addEventListener('click', () => {
    showSlide(block, Number(block.dataset.activeSlide) + 1);
  });

  block.addEventListener('keydown', (e) => {
    if (e.target.closest('video')) return;
    if (e.key === 'ArrowLeft') showSlide(block, Number(block.dataset.activeSlide) - 1);
    if (e.key === 'ArrowRight') showSlide(block, Number(block.dataset.activeSlide) + 1);
  });

  // Keep state in sync when the user swipes the track directly.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, Number(entry.target.dataset.slideIndex));
    });
  }, { root: track, threshold: 0.6 });
  getSlides(block).forEach((slide) => observer.observe(slide));
}

function toggleFullscreen(block) {
  if (document.fullscreenElement === block) document.exitFullscreen();
  else block.requestFullscreen().catch(() => {});
}

function createExpandButton(block, labels) {
  if (!document.fullscreenEnabled) return null;
  const button = createButton('carousel-gallery-expand', labels.expand);
  button.addEventListener('click', () => toggleFullscreen(block));
  document.addEventListener('fullscreenchange', () => {
    const expanded = document.fullscreenElement === block;
    block.classList.toggle('is-fullscreen', expanded);
    button.setAttribute('aria-label', expanded ? labels.collapse : labels.expand);
    button.setAttribute('aria-pressed', String(expanded));
  });
  return button;
}

function createViewAllButton(block, labels) {
  if (!document.fullscreenEnabled) return null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'carousel-gallery-view-all';
  button.textContent = labels.viewAll;
  button.addEventListener('click', () => toggleFullscreen(block));
  return button;
}

/** @param {Element} block The carousel-gallery block element */
export default async function decorate(block) {
  galleryId += 1;
  const id = galleryId;
  block.id = `carousel-gallery-${id}`;
  const rows = [...block.children].filter((row) => row.querySelector('picture') || findVideoLink(row));

  const placeholders = await fetchPlaceholders();
  const labels = {
    region: placeholders.gallery || 'Gallery',
    slide: placeholders.slide || 'Slide',
    controls: placeholders.gallerySlideControls || 'Gallery slide controls',
    previous: placeholders.previousSlide || 'Previous slide',
    next: placeholders.nextSlide || 'Next slide',
    show: placeholders.showSlide || 'Show slide',
    of: placeholders.of || 'of',
    play: placeholders.playVideo || 'Play video',
    expand: placeholders.viewFullscreen || 'View full screen',
    collapse: placeholders.exitFullscreen || 'Exit full screen',
    progress: placeholders.galleryProgress || 'Gallery progress',
    viewAll: placeholders.viewAll || 'View All',
  };

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  const stage = document.createElement('div');
  stage.className = 'carousel-gallery-stage';
  const track = document.createElement('ul');
  track.className = 'carousel-gallery-slides';
  rows.forEach((row, idx) => track.append(createSlide(row, idx, id, labels)));
  optimizeImages(track, '1200');
  stage.append(track);
  block.replaceChildren(stage);

  const expand = createExpandButton(block, labels);
  if (expand) stage.append(expand);

  if (rows.length < 2) {
    block.classList.add('is-single');
    updateActiveSlide(block, 0);
    return;
  }

  const nav = document.createElement('div');
  nav.className = 'carousel-gallery-navigation';
  nav.append(
    createButton('carousel-gallery-prev', labels.previous),
    createButton('carousel-gallery-next', labels.next),
  );
  stage.append(nav);

  const counter = document.createElement('p');
  counter.className = 'carousel-gallery-counter';
  counter.dataset.of = labels.of;
  counter.setAttribute('aria-hidden', 'true');
  stage.append(counter);

  const progress = document.createElement('div');
  progress.className = 'carousel-gallery-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', labels.progress);
  progress.setAttribute('aria-valuemin', '1');
  progress.setAttribute('aria-valuemax', String(rows.length));
  block.append(progress);

  const thumbsNav = document.createElement('nav');
  thumbsNav.className = 'carousel-gallery-thumbnails-nav';
  thumbsNav.setAttribute('aria-label', labels.controls);
  const thumbs = document.createElement('ol');
  thumbs.className = 'carousel-gallery-thumbnails';
  getSlides(block).forEach((slide, idx) => {
    thumbs.append(createThumbnail(slide, idx, rows.length, id, labels));
  });
  thumbsNav.append(thumbs);
  const viewAll = createViewAllButton(block, labels);
  if (viewAll) thumbsNav.append(viewAll);
  block.append(thumbsNav);

  updateActiveSlide(block, 0);
  bindEvents(block);
}
