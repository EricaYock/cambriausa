import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/shared.js';

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '192' }]));
  });
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

/**
 * Horizontal slider behaviour: when the items overflow the track (fewer columns
 * than items), show prev/next buttons that scroll by one item.
 */
function initSlider(block, ul, labels) {
  const prev = createButton('cards-icon-prev', labels.previous);
  const next = createButton('cards-icon-next', labels.next);
  const nav = document.createElement('div');
  nav.className = 'cards-icon-nav';
  nav.hidden = true;
  nav.append(prev, next);
  block.append(nav);

  const update = () => {
    const max = ul.scrollWidth - ul.clientWidth;
    nav.hidden = max <= 1;
    prev.disabled = ul.scrollLeft <= 1;
    next.disabled = ul.scrollLeft >= max - 1;
  };

  const step = (dir) => {
    const item = ul.firstElementChild;
    if (!item) return;
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
    ul.scrollBy({ left: dir * (item.getBoundingClientRect().width + gap) });
  };

  nav.addEventListener('click', (e) => {
    if (e.target.closest('.cards-icon-prev')) step(-1);
    if (e.target.closest('.cards-icon-next')) step(1);
  });
  ul.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(ul);
  update();
}

/** @param {Element} block The cards-icon block element */
export default async function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-icon-card';

    const icon = document.createElement('div');
    icon.className = 'cards-icon-card-icon';
    const body = document.createElement('div');
    body.className = 'cards-icon-card-body';

    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !icon.children.length) icon.append(picture);
      [...cell.children].forEach((el) => {
        if (el.textContent.trim()) body.append(el);
      });
    });

    // The label is the first element when it is bold or a heading.
    const first = body.firstElementChild;
    if (first && (/^H[2-6]$/.test(first.tagName) || first.querySelector(':scope > strong:only-child'))) {
      first.classList.add('cards-icon-card-label');
    }

    if (icon.children.length) li.append(icon);
    if (body.children.length) li.append(body);
    if (li.children.length) ul.append(li);
  });

  optimizeImages(ul);
  block.replaceChildren(ul);

  const placeholders = await fetchPlaceholders();
  initSlider(block, ul, {
    previous: placeholders.previousSlide || 'Previous slide',
    next: placeholders.nextSlide || 'Next slide',
  });
}
