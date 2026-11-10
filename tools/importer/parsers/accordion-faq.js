/* eslint-disable */
/* global WebImporter */

/**
 * Parser: accordion-faq
 * Source: https://shop.cambriausa.com/collections/samples (.cc-faq .reading-width)
 *
 * One row per <details>: [question (plain text) | answer (paragraphs, links, lists)]
 * Question comes from summary h4.disclosure__title; answer from .disclosure__content.
 * The +/- toggle images in the summary are dropped. Relative storefront links
 * become absolute to shop.cambriausa.com; "tel: 866-..." hrefs lose the space.
 */
const SHOP_ORIGIN = 'https://shop.cambriausa.com';

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function fixHref(href) {
  const value = (href || '').trim();
  if (/^tel:/i.test(value)) return `tel:${value.slice(4).replace(/\s+/g, '')}`;
  if (/^(mailto|javascript):/i.test(value) || value.startsWith('#')) return value;
  try {
    return new URL(value.startsWith('//') ? `https:${value}` : value, SHOP_ORIGIN).href;
  } catch (e) {
    return value;
  }
}

function buildAnswer(content, document) {
  if (!content) return [];
  content.querySelectorAll('img[src^="data:"], .disclosure__toggle').forEach((el) => el.remove());
  content.querySelectorAll('a[href]').forEach((a) => {
    a.setAttribute('href', fixHref(a.getAttribute('href')));
    // Titles here just repeat the URL
    if (a.getAttribute('title') === a.textContent.trim() || /^(tel|https?):/i.test(a.getAttribute('title') || '')) {
      a.removeAttribute('title');
    }
  });

  const blocks = [...content.children].filter((el) => clean(el.textContent) || el.querySelector('img, a[href]'));
  const inlineOnly = blocks.every((el) => !/^(P|UL|OL|H[1-6]|TABLE|BLOCKQUOTE|DIV)$/.test(el.tagName));
  if (blocks.length && !inlineOnly) return blocks;

  // Bare inline content (e.g. an answer that is just a tel: link): wrap in <p>.
  if (!clean(content.textContent)) return [];
  const p = document.createElement('p');
  while (content.firstChild) p.append(content.firstChild);
  return [p];
}

export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll('details').forEach((details) => {
    const titleEl = details.querySelector('summary .disclosure__title') || details.querySelector('summary');
    const question = clean(titleEl && titleEl.textContent);
    if (!question) return;

    const answer = buildAnswer(details.querySelector('.disclosure__content'), document);
    cells.push([question, answer.length ? answer : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
