/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-swatch
 * Source: https://www.cambriausa.com (.cmp-experiencefragment--4-up)
 * The matched element is the whole experience fragment, which also holds the
 * section's default content (title, intro text, CTA). That default content is
 * kept in place before the block.
 * Rows: [image | linked design name]
 *
 * Also used on the designs template
 * (https://www.cambriausa.com/quartz-countertops/quartz-colors/designs/quintessa,
 * .cmp-similar-designs__cards-container): each a.cmp-similar-designs__card
 * becomes a row [image | linked design name]. The section's title/description
 * are matched as default content separately, so nothing is restored here.
 */
const ORIGIN = 'https://www.cambriausa.com';

function absolute(url) {
  if (!url) return url;
  try {
    return new URL(url, ORIGIN).href;
  } catch (e) {
    return url;
  }
}

function cleanName(text) {
  return (text || '').replace(/\s+/g, ' ').replace(/\s+(?=[®™©])/g, '').trim();
}

function parseSimilarDesigns(element, document) {
  const cells = [];
  element.querySelectorAll('a.cmp-similar-designs__card').forEach((card) => {
    const img = card.querySelector('img');
    const nameEl = card.querySelector('.cmp-similar-designs__card-design-name-text');
    const href = card.getAttribute('href');
    const name = cleanName(nameEl ? nameEl.textContent : '') || (img && img.getAttribute('alt')) || '';
    if (!img && !name) return;

    let imageCell = '';
    if (img) {
      const out = document.createElement('img');
      out.src = absolute(img.getAttribute('src'));
      out.alt = img.getAttribute('alt') || '';
      imageCell = [out];
    }

    let textCell = '';
    if (name) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        // Keep same-site page links relative so they resolve on the migrated site
        a.href = href.startsWith('/') ? href : absolute(href).replace(/^https:\/\/www\.cambriausa\.com/, '');
        a.textContent = name;
        p.append(a);
      } else {
        p.textContent = name;
      }
      textCell = [p];
    }
    cells.push([imageCell, textCell]);
  });
  return cells;
}

/*
 * Collections template (Shopify, https://shop.cambriausa.com/collections/samples,
 * .cc-collection-list .slider__grid): each li.slider__item .card__collection
 * becomes a row [image | linked collection name]. The storefront is not
 * migrated, so links stay absolute to shop.cambriausa.com.
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

function shopAbsolute(url) {
  if (!url) return '';
  const value = url.trim();
  if (/^(mailto|tel|javascript):/i.test(value) || value.startsWith('#')) return value;
  try {
    return new URL(value.startsWith('//') ? `https:${value}` : value, SHOP_ORIGIN).href;
  } catch (e) {
    return value;
  }
}

/** Real URL of a lazy-loaded Shopify image ('' when only a placeholder). */
function shopImageSrc(img) {
  if (!img) return '';
  const real = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
    largestSrcsetCandidate(img.getAttribute('data-srcset')),
    largestSrcsetCandidate(img.getAttribute('srcset')),
    img.currentSrc,
  ].find((c) => c && !isDataUri(c));
  return real ? shopAbsolute(real) : '';
}

function parseShopCollections(element, document) {
  const cells = [];
  element.querySelectorAll('li.slider__item').forEach((item) => {
    const card = item.querySelector('.card__collection') || item;
    const nameLink = card.querySelector('.card__title a[href], .card__info a[href]');
    const name = cleanName(nameLink ? nameLink.textContent : '');
    const img = card.querySelector('.card__media img');
    const src = shopImageSrc(img);
    if (!src && !name) return;

    let imageCell = '';
    if (src) {
      const out = document.createElement('img');
      out.src = src;
      out.alt = (img.getAttribute('alt') || '').trim() || name;
      imageCell = [out];
    }

    let textCell = '';
    if (name) {
      const p = document.createElement('p');
      const href = nameLink.getAttribute('href') || (card.querySelector('.card__media a[href]') || {}).getAttribute?.('href');
      if (href) {
        const a = document.createElement('a');
        a.href = shopAbsolute(href);
        a.textContent = name;
        p.append(a);
      } else {
        p.textContent = name;
      }
      textCell = [p];
    }
    cells.push([imageCell, textCell]);
  });
  return cells;
}

export default function parse(element, { document }) {
  // Collections template (Shopify): shop-by collection tiles
  if (element.querySelector('.card__collection')) {
    const cells = parseShopCollections(element, document);
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-swatch', cells });
    element.replaceWith(block);
    return;
  }

  // Designs template: "Explore Similar Designs" cards
  if (element.matches('.cmp-similar-designs__cards-container')
    || (!element.querySelector('.cmp-container__full-width') && element.querySelector('a.cmp-similar-designs__card'))) {
    const cells = parseSimilarDesigns(element, document);
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-swatch', cells });
    element.replaceWith(block);
    return;
  }

  // Home template: 4-up experience fragment
  const grid = element.querySelector('.cmp-container__fixed-width > .cmp-container > .aem-Grid') || element;

  // Default content preceding the swatches
  const defaults = [];
  const title = grid.querySelector(':scope > .title .cmp-title__text, :scope > .title h1, :scope > .title h2, :scope > .title h3');
  if (title) defaults.push(title);
  grid.querySelectorAll(':scope > .text .cmp-text > *').forEach((el) => defaults.push(el));
  grid.querySelectorAll(':scope > .button a.cmp-button').forEach((link) => {
    const label = link.querySelector('.cmp-button__text');
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = (label || link).textContent.trim();
    p.append(a);
    defaults.push(p);
  });

  // Swatch cards: one full-width container per design
  const cells = [];
  grid.querySelectorAll(':scope > .cmp-container__full-width').forEach((item) => {
    const img = item.querySelector('.cmp-image img');
    const nameLink = item.querySelector('.cmp-text a[href]');
    if (!img && !nameLink) return;

    const imageCell = img ? [img] : [''];
    const textCell = [];
    if (nameLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = nameLink.getAttribute('href');
      a.textContent = nameLink.textContent.trim();
      p.append(a);
      textCell.push(p);
    } else {
      const imgLink = item.querySelector('a.cmp-image__link[href]');
      if (imgLink && img) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = imgLink.getAttribute('href');
        a.textContent = img.getAttribute('alt') || imgLink.getAttribute('href');
        p.append(a);
        textCell.push(p);
      }
    }
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-swatch', cells });
  defaults.forEach((el) => element.before(el));
  element.replaceWith(block);
}
