/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-teaser
 * Source: https://www.cambriausa.com (.cmp-container__flex-container)
 * One row per .teaser: [image | h3, description, text link]
 * Also handles the Shopify collections template (see parseShopCards).
 */
/*
 * Collections template (Shopify, https://shop.cambriausa.com/collections/samples,
 * .cc-multi-column ul:has(> li.multi-column)): one row per li.multi-column .card:
 * [image | heading, text, link]. The link is either a `p > a` inside .card__rte
 * or an `a.card__button`. Relative storefront links become absolute to
 * shop.cambriausa.com (the storefront is not migrated).
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

function shopLinkParagraph(document, link) {
  const text = link.textContent.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = shopAbsolute(link.getAttribute('href'));
  a.textContent = text;
  p.append(a);
  return p;
}

function parseShopCards(element, document) {
  const cells = [];
  element.querySelectorAll(':scope > li.multi-column').forEach((li) => {
    const card = li.querySelector('.card') || li;
    const img = card.querySelector('img');
    const src = shopImageSrc(img);
    let imageCell = '';
    if (src) {
      const out = document.createElement('img');
      out.src = src;
      out.alt = (img.getAttribute('alt') || '').trim();
      imageCell = [out];
    }

    const textCell = [];
    const title = card.querySelector('.card__title');
    if (title && title.textContent.trim()) {
      const tag = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h3';
      const heading = document.createElement(tag);
      heading.textContent = title.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(heading);
    }

    const rte = card.querySelector('.card__rte');
    if (rte) {
      rte.querySelectorAll(':scope > p, :scope > ul, :scope > ol').forEach((el) => {
        const links = [...el.querySelectorAll('a[href]')];
        const linkOnly = el.tagName === 'P' && links.length === 1
          && links[0].textContent.trim() === el.textContent.trim();
        if (linkOnly) {
          const p = shopLinkParagraph(document, links[0]);
          if (p) textCell.push(p);
          return;
        }
        if (!el.textContent.trim()) return;
        links.forEach((a) => a.setAttribute('href', shopAbsolute(a.getAttribute('href'))));
        textCell.push(el);
      });
    }

    card.querySelectorAll('a.card__button[href]').forEach((link) => {
      if (link.closest('p')) return; // already handled as a paragraph link
      const p = shopLinkParagraph(document, link);
      if (p) textCell.push(p);
    });

    if (!imageCell && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });
  return cells;
}

export default function parse(element, { document }) {
  // Collections template (Shopify): multi-column cards
  if (element.querySelector(':scope > li.multi-column')) {
    const shopCells = parseShopCards(element, document);
    const shopBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells: shopCells });
    element.replaceWith(shopBlock);
    return;
  }

  // Home template: AEM teasers
  const cells = [];

  element.querySelectorAll('.teaser').forEach((teaser) => {
    const img = teaser.querySelector('.cmp-teaser__image img, .cmp-image img');
    const title = teaser.querySelector('.cmp-teaser__title');
    const descriptions = teaser.querySelectorAll('.cmp-teaser__description > *');
    const links = teaser.querySelectorAll('.cmp-teaser__action-container a.cmp-teaser__action-link[href]');

    const textCell = [];
    if (title) {
      const tag = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h3';
      const heading = document.createElement(tag);
      heading.textContent = title.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(heading);
    }
    descriptions.forEach((el) => textCell.push(el));
    links.forEach((link) => {
      // Label only: drop the "chevron_right" icon-font ligature.
      const label = link.querySelector('.cmp-button__text');
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = (label || link).textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      textCell.push(p);
    });

    if (!img && !textCell.length) return;
    cells.push([img ? [img] : '', textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
