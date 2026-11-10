/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-product
 * Source: https://shop.cambriausa.com/collections/samples
 * (.main-products-grid__results > ul.grid)
 *
 * Rows (2 columns: image | text), per blocks/cards-product/README.md:
 * - Promo tile (li.promo-item--grid_list):
 *   [image (omitted when only a placeholder) | bold title paragraph, CTA link]
 * - Product tile (li > product-card):
 *   [main image | optional "New" badge, vendor, linked product name, price]
 * Product names stay plain links (not bold) so the block does not treat
 * them as a promo. Storefront links stay absolute to shop.cambriausa.com.
 */
const SHOP_ORIGIN = 'https://shop.cambriausa.com';

function isDataUri(value) {
  return /^data:/i.test((value || '').trim());
}

function largestSrcsetCandidate(srcset) {
  if (!srcset) return '';
  let best = '';
  let bestSize = -1;
  srcset.split(/,\s+(?=\S)/).forEach((part) => {
    const [url, descriptor = ''] = part.trim().split(/\s+/);
    if (!url || isDataUri(url)) return;
    const size = parseFloat(descriptor) || 0;
    if (size >= bestSize) {
      best = url;
      bestSize = size;
    }
  });
  return best;
}

function absolute(url) {
  if (!url) return '';
  const value = url.trim();
  if (/^(mailto|tel|javascript):/i.test(value) || value.startsWith('#')) return value;
  try {
    return new URL(value.startsWith('//') ? `https:${value}` : value, SHOP_ORIGIN).href;
  } catch (e) {
    return value;
  }
}

/** Real image URL of a (possibly lazy-loaded) image, or '' for placeholders. */
function imageSrc(img) {
  if (!img) return '';
  const candidates = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
    largestSrcsetCandidate(img.getAttribute('data-srcset')),
    largestSrcsetCandidate(img.getAttribute('srcset')),
    img.currentSrc,
  ];
  const real = candidates.find((c) => c && !isDataUri(c));
  return real ? absolute(real) : '';
}

function buildImage(document, img, alt) {
  const src = imageSrc(img);
  if (!src) return '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = (img.getAttribute('alt') || '').trim() || alt || '';
  return [out];
}

function linkParagraph(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = absolute(href);
  a.textContent = text;
  p.append(a);
  return p;
}

function textParagraph(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function parsePromo(li, document) {
  const textCell = [];
  const title = li.querySelector('.promo__content .rte strong')
    || li.querySelector('.promo__content .rte h2, .promo__content .rte h3')
    || li.querySelector('.promo__content .rte p');
  const titleText = clean(title && title.textContent);
  if (titleText) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = titleText;
    p.append(strong);
    textCell.push(p);
  }
  li.querySelectorAll('.promo__content a[href]').forEach((link) => {
    const label = clean(link.textContent);
    if (label) textCell.push(linkParagraph(document, link.getAttribute('href'), label));
  });
  if (!textCell.length) return null;
  // Background photo behind the title: decorative unless the source gives an alt.
  const imageCell = buildImage(document, li.querySelector('.media img'), '');
  return [imageCell, textCell];
}

function parseProduct(li, document) {
  const nameLink = li.querySelector('.card__title a[href]');
  const name = clean(nameLink && nameLink.textContent);
  const img = li.querySelector('img.card__main-image');
  if (!name && !img) return null;

  const textCell = [];
  const badge = li.querySelector('.product-label');
  if (badge && clean(badge.textContent)) textCell.push(textParagraph(document, clean(badge.textContent)));

  const vendor = li.querySelector('.card__vendor');
  if (vendor && clean(vendor.textContent)) textCell.push(textParagraph(document, clean(vendor.textContent)));

  if (name) textCell.push(linkParagraph(document, nameLink.getAttribute('href'), name));

  const price = li.querySelector('.price__default .price__current');
  if (price && clean(price.textContent)) textCell.push(textParagraph(document, clean(price.textContent)));

  return [buildImage(document, img, name), textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll(':scope > li').forEach((li) => {
    const row = li.matches('.promo-item--grid_list') || li.querySelector('.promo')
      ? parsePromo(li, document)
      : parseProduct(li, document);
    if (row) cells.push(row);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
