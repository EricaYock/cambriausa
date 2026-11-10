/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-moodboard
 * Source: https://www.cambriausa.com/quartz-countertops/quartz-colors/designs/quintessa (.cmp-moodboard__wrapper)
 * One row, two columns:
 *   Cell 1: slab images (featured slab first), each followed by a caption
 *           paragraph (linked when the source slab card is linked).
 *   Cell 2: paint swatches as a list (<strong>Name</strong><br>Brand<br>#hex),
 *           then hardware images each followed by a caption paragraph.
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

function imageParagraph(img, document) {
  const p = document.createElement('p');
  const out = document.createElement('img');
  out.src = absolute(img.getAttribute('src'));
  out.alt = img.getAttribute('alt') || '';
  p.append(out);
  return p;
}

function captionParagraph(source, href, document) {
  if (!source || !source.textContent.trim()) return null;
  const p = document.createElement('p');
  let target = p;
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    p.append(a);
    target = a;
  }
  [...source.childNodes].forEach((n) => target.append(n.cloneNode(true)));
  return p;
}

function toHex(value) {
  if (!value) return '';
  const hex = value.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/i);
  if (hex) return hex[0].toLowerCase();
  const rgb = value.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!rgb) return '';
  return `#${rgb.slice(1, 4).map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`;
}

function swatchColor(paint) {
  const chip = paint.querySelector('.hex') || paint.querySelector('.cmp-moodboard__block-paint-swatch');
  const candidates = [];
  [chip, chip && chip.parentElement].forEach((el) => {
    if (!el) return;
    candidates.push(el.getAttribute('style'), el.getAttribute('data-hex'), el.getAttribute('data-color'), el.textContent);
  });
  for (let i = 0; i < candidates.length; i += 1) {
    const hex = toHex(candidates[i]);
    if (hex) return hex;
  }
  return '';
}

export default function parse(element, { document }) {
  // Cell 1: slabs
  const slabCell = [];
  const slabs = element.querySelector('.cmp-moodboard__block-slabs');
  if (slabs) {
    const featured = slabs.querySelector('.cmp-moodboard__featured-slab');
    const cards = [
      ...(featured ? [featured] : []),
      ...slabs.querySelectorAll('.cmp-moodboard__detailed-slab-container .cmp-design-card'),
    ];
    cards.forEach((card) => {
      const img = card.querySelector('img');
      if (!img) return;
      slabCell.push(imageParagraph(img, document));
      const link = card.querySelector('a[href]');
      const href = link ? absolute(link.getAttribute('href')) : null;
      const caption = captionParagraph(card.querySelector('.cmp-design-card__design-name-text'), href, document);
      if (caption) slabCell.push(caption);
    });
  }

  // Cell 2: paint swatches + hardware
  const sideCell = [];
  const paints = [...element.querySelectorAll('.cmp-moodboard__block-paint')];
  if (paints.length) {
    const ul = document.createElement('ul');
    paints.forEach((paint) => {
      const name = paint.querySelector('.shade-name');
      const brand = paint.querySelector('.brand');
      const hex = swatchColor(paint);
      const li = document.createElement('li');
      if (name) {
        const strong = document.createElement('strong');
        strong.textContent = name.textContent.trim();
        li.append(strong);
      }
      [brand && brand.textContent.trim(), hex].forEach((text) => {
        if (!text) return;
        if (li.childNodes.length) li.append(document.createElement('br'));
        li.append(document.createTextNode(text));
      });
      if (li.childNodes.length) ul.append(li);
    });
    if (ul.children.length) sideCell.push(ul);
  }

  element.querySelectorAll('.cmp-moodboard__block-hardware').forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;
    sideCell.push(imageParagraph(img, document));
    const link = item.querySelector('a[href]');
    const href = link ? absolute(link.getAttribute('href')) : null;
    const caption = captionParagraph(item.querySelector('.hardware-name'), href, document);
    if (caption) sideCell.push(caption);
  });

  const cells = [[slabCell.length ? slabCell : '', sideCell.length ? sideCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-moodboard', cells });
  element.replaceWith(block);
}
