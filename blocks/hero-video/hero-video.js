import { fetchPlaceholders } from '../../scripts/shared.js';

const VIDEO_PATTERN = /\.(mp4|webm|ogg|mov)(?:[?#]|$)/i;

function findVideoLink(scope) {
  return [...scope.querySelectorAll('a[href]')].find((a) => VIDEO_PATTERN.test(a.href));
}

function removeLink(link) {
  const parent = link.parentElement;
  link.remove();
  if (parent?.tagName === 'P' && !parent.textContent.trim() && !parent.querySelector('picture, img')) {
    parent.remove();
  }
}

function videoType(href) {
  const ext = new URL(href, window.location.href).pathname.split('.').pop().toLowerCase();
  return ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
}

function whenPageLoaded(callback) {
  if (document.readyState === 'complete') callback();
  else window.addEventListener('load', callback, { once: true });
}

function buildToggle(video, labels) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero-video-toggle';

  const sync = () => {
    const paused = video.paused;
    button.setAttribute('aria-label', paused ? labels.play : labels.pause);
    button.setAttribute('aria-pressed', String(paused));
    button.classList.toggle('is-paused', paused);
  };

  button.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
  return button;
}

/** @param {Element} block The hero-video block element */
export default async function decorate(block) {
  const rows = [...block.children];
  const mediaRow = rows.find((row) => row.querySelector('picture') || findVideoLink(row));
  const contentRows = rows.filter((row) => row !== mediaRow);

  const media = document.createElement('div');
  media.className = 'hero-video-media';
  const content = document.createElement('div');
  content.className = 'hero-video-content';

  let videoHref;
  if (mediaRow) {
    const link = findVideoLink(mediaRow);
    if (link) {
      videoHref = link.href;
      removeLink(link);
    }
    const poster = mediaRow.querySelector('picture');
    if (poster) media.append(poster);
    // Any text left in the media row (e.g. a single-row authoring) belongs to the content.
    [...mediaRow.querySelectorAll(':scope > div > *')].forEach((el) => {
      if (el.textContent.trim() || el.querySelector('picture, img')) content.append(el);
    });
  }

  contentRows.forEach((row) => {
    [...row.querySelectorAll(':scope > div > *')].forEach((el) => content.append(el));
  });

  // A picture before the first heading is the eyebrow/logo image.
  const firstHeading = content.querySelector('h1, h2, h3, h4, h5, h6');
  [...content.children].some((el) => {
    if (el === firstHeading) return true;
    if (el.querySelector('picture')) el.classList.add('hero-video-eyebrow');
    return false;
  });

  const buttons = [...content.querySelectorAll('.button-container')];
  if (buttons.length > 1) {
    const group = document.createElement('div');
    group.className = 'hero-video-buttons';
    buttons[0].before(group);
    buttons.forEach((b) => group.append(b));
  }

  block.replaceChildren(media, content);
  if (!media.children.length && !videoHref) block.classList.add('no-media');

  if (!videoHref) return;

  const posterImg = media.querySelector('img');
  const video = document.createElement('video');
  video.className = 'hero-video-player';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'none';
  if (posterImg) video.poster = posterImg.currentSrc || posterImg.src;

  const placeholders = await fetchPlaceholders();
  const labels = {
    pause: placeholders.pauseVideo || 'Pause background video',
    play: placeholders.playVideo || 'Play background video',
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Attach the video only after the page has loaded so the poster stays the LCP element.
  whenPageLoaded(() => {
    const source = document.createElement('source');
    source.src = videoHref;
    source.type = videoType(videoHref);
    video.append(source);
    media.append(video);
    block.append(buildToggle(video, labels));
    video.addEventListener('playing', () => block.classList.add('is-playing'), { once: true });
    if (!reduceMotion) {
      video.autoplay = true;
      video.play().catch(() => {});
    }
  });
}
