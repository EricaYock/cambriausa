/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon
 * Source: https://shop.cambriausa.com/collections/samples
 * (.cc-icons-with-text .slider__grid)
 *
 * One row per li.slider__item: [icon image | bold label paragraph, description paragraph]
 * Source label and description share one <p> split by <br>
 * ("AMERICAN MADE<br>Driven by values..."). Icons are decorative (alt="").
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

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

/** Split a paragraph's inline content at <br> into text lines. */
function lines(p) {
  const out = [''];
  p.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') out.push('');
    else out[out.length - 1] += node.textContent;
  });
  return out.map(clean).filter(Boolean);
}

export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll(':scope > li').forEach((li) => {
    const img = li.querySelector('img');
    const src = imageSrc(img);
    let imageCell = '';
    if (src) {
      const out = document.createElement('img');
      out.src = src;
      out.alt = (img.getAttribute('alt') || '').trim();
      imageCell = [out];
    }

    const textCell = [];
    const paragraphs = [...li.querySelectorAll('.icons-with-text__text p')];
    const textLines = paragraphs.length
      ? paragraphs.flatMap((p) => lines(p))
      : [clean(li.textContent)].filter(Boolean);
    const [label, ...rest] = textLines;
    if (label) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label;
      p.append(strong);
      textCell.push(p);
    }
    if (rest.length) {
      const p = document.createElement('p');
      p.textContent = rest.join(' ');
      textCell.push(p);
    }

    if (!imageCell && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
