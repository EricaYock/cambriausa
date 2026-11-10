import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
  });
}

/** @param {Element} block The columns-teaser block element */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-teaser-row');
    [...row.children].forEach((cell) => {
      const isImage = cell.querySelector('picture') && !cell.textContent.trim();
      cell.classList.add(isImage ? 'columns-teaser-image' : 'columns-teaser-content');
      // Drop the paragraph wrapper so the photo can fill the cell height.
      if (isImage) cell.replaceChildren(cell.querySelector('picture'));
      if (!cell.children.length && !cell.textContent.trim()) cell.remove();
    });
  });
  optimizeImages(block);
}
