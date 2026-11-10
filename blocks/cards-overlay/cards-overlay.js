import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}

/** @param {Element} block The cards-overlay block element */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-overlay-card';

    const image = document.createElement('div');
    image.className = 'cards-overlay-card-image';
    const body = document.createElement('div');
    body.className = 'cards-overlay-card-body';

    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !image.children.length) image.append(picture);
      [...cell.children].forEach((el) => {
        if (el.textContent.trim()) body.append(el);
      });
    });

    // The title link covers the whole tile (stretched link) and is not styled as a button.
    const link = body.querySelector('a[href]') || image.querySelector('a[href]');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      link.parentElement.classList.remove('button-container');
      link.classList.add('cards-overlay-card-link');
      const chevron = document.createElement('span');
      chevron.className = 'cards-overlay-card-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      link.append(chevron);
      if (!body.contains(link)) body.append(link);
    }

    if (image.children.length) li.append(image);
    else li.classList.add('no-image');
    if (body.children.length) li.append(body);
    if (li.children.length) ul.append(li);
  });

  optimizeImages(ul);
  block.replaceChildren(ul);
}
