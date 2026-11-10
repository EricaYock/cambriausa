/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-gradient
 * Source: https://www.cambriausa.com (.teaser-hero)
 * Row 1: background image (desktop rendition, mobile as fallback)
 * Row 2: heading, text, CTA link
 */
function buildHeading(document, source) {
  const tag = /^H[1-6]$/.test(source.tagName) ? source.tagName.toLowerCase() : 'h2';
  const heading = document.createElement(tag);
  const inner = source.querySelector(':scope > p');
  heading.innerHTML = (inner || source).innerHTML.trim();
  return heading;
}

export default function parse(element, { document }) {
  const img = element.querySelector('.cmp-teaser__image--desktop img')
    || element.querySelector('.cmp-teaser__image--mobile img')
    || element.querySelector('.cmp-teaser__image img');

  const contentCell = [];
  const content = element.querySelector('.cmp-teaser__content');
  if (content) {
    const title = content.querySelector('.cmp-teaser__title');
    if (title) contentCell.push(buildHeading(document, title));

    content.querySelectorAll('.cmp-teaser__description > *').forEach((el) => contentCell.push(el));

    content.querySelectorAll('.cmp-teaser__action-container a.cmp-teaser__action-link').forEach((link) => {
      const label = link.querySelector('.cmp-button__text');
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = (label || link).textContent.trim();
      p.append(a);
      contentCell.push(p);
    });
  }

  const cells = [];
  if (img) cells.push([[img]]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-gradient', cells });
  element.replaceWith(block);
}
