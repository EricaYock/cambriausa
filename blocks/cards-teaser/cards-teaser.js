import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/** @param {Element} block The cards-teaser block element */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-teaser-card';

    const image = document.createElement('div');
    image.className = 'cards-teaser-card-image';
    const body = document.createElement('div');
    body.className = 'cards-teaser-card-body';

    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !image.children.length) image.append(picture);
      [...cell.children].forEach((el) => {
        if (el.textContent.trim()) body.append(el);
      });
    });

    // The CTA always renders as the default Cambria text link (a.button), never filled/outlined.
    body.querySelectorAll('.button-container').forEach((container) => {
      container.classList.remove('button-container');
      container.classList.add('cards-teaser-card-cta');
      container.querySelectorAll('a').forEach((a) => a.classList.remove('primary', 'secondary'));
    });

    if (image.children.length) li.append(image);
    if (body.children.length) li.append(body);
    if (li.children.length) ul.append(li);
  });

  optimizeImages(ul);
  block.replaceChildren(ul);
}
