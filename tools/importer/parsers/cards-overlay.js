/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-overlay
 * Source: https://www.cambriausa.com (.teaser.cmp-teaser__hover-zoom)
 * Each tile is authored as its own teaser, and the teasers sit in sibling
 * full-width containers. The first instance collects every following
 * hover-zoom teaser in the run of adjacent containers into ONE block and
 * removes the later ones, so the page ends up with a single cards-overlay.
 * Rows: [image | h3 with title link]
 */
const TEASER = '.teaser.cmp-teaser__hover-zoom';
const MERGED_ATTR = 'data-cards-overlay-merged';

function isSkippable(el) {
  // Spacers / empty wrappers between the containers do not break the run.
  return el.matches('.separator, hr')
    || (!el.textContent.trim() && !el.querySelector('img, picture, video, a[href]'));
}

function collectTeasers(element) {
  const teasers = [element];
  const container = element.closest('.cmp-container__full-width');

  // Further teasers inside the same container
  if (container) {
    container.querySelectorAll(TEASER).forEach((t) => {
      if (!teasers.includes(t)) teasers.push(t);
    });
  }

  // Teasers in the following sibling containers
  let sibling = (container || element).nextElementSibling;
  while (sibling) {
    let found = [];
    if (sibling.matches(TEASER)) found = [sibling];
    else found = [...sibling.querySelectorAll(TEASER)];

    if (found.length) {
      found.forEach((t) => { if (!teasers.includes(t)) teasers.push(t); });
    } else if (!isSkippable(sibling)) {
      break;
    }
    sibling = sibling.nextElementSibling;
  }
  return teasers;
}

function buildRow(document, teaser) {
  const img = teaser.querySelector('.cmp-teaser__image img, .cmp-image img');
  const titleEl = teaser.querySelector('.cmp-teaser__title');
  const link = teaser.querySelector('a.cmp-teaser__link[href], a[href]');

  const textCell = [];
  if (titleEl) {
    const tag = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h3';
    const heading = document.createElement(tag);
    const text = titleEl.textContent.replace(/\s+/g, ' ').trim();
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = text;
      heading.append(a);
    } else {
      heading.textContent = text;
    }
    textCell.push(heading);
  }

  if (!img && !textCell.length) return null;
  return [img ? [img] : '', textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  // Already folded into the block built from an earlier instance.
  if (element.hasAttribute(MERGED_ATTR)) {
    element.remove();
    return;
  }

  const teasers = collectTeasers(element);
  const cells = [];
  teasers.forEach((teaser) => {
    const row = buildRow(document, teaser);
    if (row) cells.push(row);
  });

  // Drop the later teasers (and the containers they leave empty).
  teasers.slice(1).forEach((teaser) => {
    teaser.setAttribute(MERGED_ATTR, 'true');
    const container = teaser.closest('.cmp-container__full-width');
    teaser.remove();
    if (container && container.isConnected && !container.querySelector(TEASER)
      && !container.textContent.trim() && !container.querySelector('img, picture, video')) {
      container.remove();
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-overlay', cells });
  element.replaceWith(block);
}
