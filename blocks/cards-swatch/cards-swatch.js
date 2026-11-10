import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/** @param {Element} block The cards-swatch block element */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-swatch-card';

    const image = document.createElement('div');
    image.className = 'cards-swatch-card-image';
    const body = document.createElement('div');
    body.className = 'cards-swatch-card-body';

    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !image.children.length) {
        image.append(picture);
      }
      [...cell.children].forEach((el) => {
        if (el.textContent.trim()) body.append(el);
      });
    });

    // The caption is a plain text link, not a button; it also covers the whole tile.
    const link = body.querySelector('a[href]') || image.querySelector('a[href]');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      link.parentElement.classList.remove('button-container');
      link.classList.add('cards-swatch-card-link');
    }

    if (image.children.length) li.append(image);
    if (body.children.length) li.append(body);
    if (li.children.length) ul.append(li);
  });

  optimizeImages(ul);
  block.replaceChildren(ul);
}
