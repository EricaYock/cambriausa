/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-teaser
 * Source: https://www.cambriausa.com/quartz-countertops/quartz-colors/designs/quintessa (.cmp-pdp-teaser-50-50)
 * One row, two columns: [H2 + paragraphs + CTA link | image]
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

/*
 * Collections template (Shopify, https://shop.cambriausa.com/collections/samples,
 * .cc-media-with-text .media-with-text): same shape as the designs output,
 * [.media-with-text__text: H2 + paragraphs + CTA link | .media-with-text__media image],
 * regardless of the source's media-first order. Relative storefront links
 * become absolute to shop.cambriausa.com (the storefront is not migrated).
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

function parseShopMediaWithText(element, document) {
  const textCell = [];
  const text = element.querySelector('.media-with-text__text') || element;

  const heading = text.querySelector('.section__block--heading, h1, h2, h3');
  if (heading && heading.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    textCell.push(h2);
  }

  text.querySelectorAll('.rte > p, .rte > ul, .rte > ol').forEach((el) => {
    if (!el.textContent.trim()) return;
    el.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', shopAbsolute(a.getAttribute('href'))));
    textCell.push(el);
  });

  text.querySelectorAll('.section__block--button a[href], .section__block--buttons a[href]').forEach((link) => {
    const label = link.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = shopAbsolute(link.getAttribute('href'));
    a.textContent = label;
    p.append(a);
    textCell.push(p);
  });

  const imageCell = [];
  const img = element.querySelector('.media-with-text__media img');
  const src = shopImageSrc(img);
  if (src) {
    const out = document.createElement('img');
    out.src = src;
    out.alt = (img.getAttribute('alt') || '').trim();
    imageCell.push(out);
  }

  return [[textCell.length ? textCell : '', imageCell.length ? imageCell : '']];
}

export default function parse(element, { document }) {
  // Collections template (Shopify): media-with-text promo
  if (element.matches('.media-with-text') || element.querySelector('.media-with-text__text')) {
    const shopCells = parseShopMediaWithText(element, document);
    const shopBlock = WebImporter.Blocks.createBlock(document, { name: 'columns-teaser', cells: shopCells });
    element.replaceWith(shopBlock);
    return;
  }

  // Designs template: PDP 50/50 teaser
  const textCell = [];

  const title = element.querySelector('.cmp-pdp-teaser-50-50__title');
  if (title && title.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.trim();
    textCell.push(h2);
  }

  const description = element.querySelector('.cmp-pdp-teaser-50-50__description')
    || element.querySelector('.cmp-pdp-teaser-50-50__description-container .cmp-text');
  if (description) {
    const paras = [...description.querySelectorAll(':scope > p, :scope > ul, :scope > ol')];
    if (paras.length) {
      paras.forEach((p) => textCell.push(p));
    } else if (description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textCell.push(p);
    }
  }

  element.querySelectorAll('.cmp-pdp-teaser-50-50__cta-button a[href]').forEach((link) => {
    const label = link.querySelector('.cmp-button__text') || link;
    const text = label.textContent.trim();
    if (!text) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = absolute(link.getAttribute('href'));
    a.textContent = text;
    p.append(a);
    textCell.push(p);
  });

  const imageCell = [];
  const img = element.querySelector('.cmp-pdp-teaser-50-50__image-container img');
  if (img) {
    const out = document.createElement('img');
    out.src = absolute(img.getAttribute('src'));
    out.alt = img.getAttribute('alt') || '';
    imageCell.push(out);
  }

  const cells = [[textCell.length ? textCell : '', imageCell.length ? imageCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-teaser', cells });
  element.replaceWith(block);
}
