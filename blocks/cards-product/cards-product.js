import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

function stripButton(link) {
  link.classList.remove('button', 'primary', 'secondary');
  link.parentElement?.classList.remove('button-container');
}

/**
 * A promo tile has a bold or heading title (product names are plain links).
 * @param {Element} body
 */
function isPromo(body) {
  if (body.querySelector('h2, h3, h4, h5, h6')) return true;
  return [...body.querySelectorAll('p > strong:only-child')]
    .some((strong) => !strong.querySelector('a') && !strong.closest('a'));
}

/**
 * Product tile: optional badge, vendor, linked product name, price.
 * Any paragraph before the vendor (or any text in the image cell) is a badge.
 */
function decorateProduct(li, image, body, badges) {
  li.classList.add('cards-product-card');

  const nameLink = body.querySelector('a[href]');
  const nameEl = nameLink?.closest('p, h2, h3, h4, h5, h6') || null;
  const items = [...body.children];
  const nameIndex = nameEl ? items.indexOf(nameEl) : -1;

  if (nameEl) {
    stripButton(nameLink);
    nameEl.classList.add('cards-product-card-name');
    nameLink.classList.add('cards-product-card-link');

    const before = items.slice(0, nameIndex);
    const vendor = before.pop();
    if (vendor) vendor.classList.add('cards-product-card-vendor');
    badges.push(...before);

    items.slice(nameIndex + 1).forEach((el) => el.classList.add('cards-product-card-price'));
  }

  if (badges.length) {
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'cards-product-card-badges';
    badges.forEach((el) => {
      const badge = document.createElement('span');
      badge.className = 'cards-product-card-badge';
      badge.textContent = el.textContent.trim();
      badgeWrap.append(badge);
      el.remove();
    });
    image.append(badgeWrap);
  }
}

/** Promo tile: background photo with a bold title and a CTA button overlaid. */
function decoratePromo(li) {
  li.classList.add('cards-product-promo');
}

/** @param {Element} block The cards-product block element */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    const image = document.createElement('div');
    image.className = 'cards-product-card-image';
    const body = document.createElement('div');
    body.className = 'cards-product-card-body';
    const badges = [];

    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !image.querySelector('picture')) {
        image.prepend(picture);
        // text authored next to the picture (e.g. "New") is a badge
        [...cell.children].forEach((el) => {
          if (el.textContent.trim() && !el.querySelector('picture')) badges.push(el);
        });
        return;
      }
      [...cell.children].forEach((el) => {
        if (el.textContent.trim()) body.append(el);
      });
    });

    if (isPromo(body)) {
      decoratePromo(li);
      badges.forEach((el) => body.prepend(el));
    } else {
      decorateProduct(li, image, body, badges);
    }

    if (image.children.length) li.append(image);
    if (body.children.length) li.append(body);
    if (li.children.length) ul.append(li);
  });

  optimizeImages(ul);
  block.replaceChildren(ul);
}
