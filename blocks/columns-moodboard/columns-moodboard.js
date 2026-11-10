import { createOptimizedPicture } from '../../scripts/aem.js';

const HEX_PATTERN = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/i;

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]));
  });
}

/**
 * Turns an element holding a hex colour (e.g. "Mocha Cream, Benjamin Moore, #d3c9bd")
 * into a swatch item: a round chip filled with the colour, then the remaining text.
 */
function buildSwatch(source) {
  const li = document.createElement('li');
  li.className = 'columns-moodboard-swatch';

  const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  let color;
  for (let node = walker.nextNode(); node && !color; node = walker.nextNode()) {
    const match = node.textContent.match(HEX_PATTERN);
    if (match) {
      [color] = match;
      const code = document.createElement('span');
      code.className = 'columns-moodboard-swatch-code';
      code.textContent = color;
      const rest = node.splitText(match.index);
      rest.textContent = rest.textContent.slice(color.length);
      rest.before(code);
    }
  }

  const chip = document.createElement('span');
  chip.className = 'columns-moodboard-swatch-chip';
  chip.style.backgroundColor = color;
  chip.setAttribute('aria-hidden', 'true');

  const label = document.createElement('div');
  label.className = 'columns-moodboard-swatch-label';
  label.append(...source.childNodes);
  // Remove stray line breaks left at the edges once the hex code moved.
  while (label.lastChild?.nodeName === 'BR') label.lastChild.remove();
  li.append(chip, label);
  return li;
}

function hasHex(el) {
  return HEX_PATTERN.test(el.textContent) && !el.querySelector('picture');
}

function getSwatchSources(el) {
  if (el.matches('ul, ol')) return [...el.children].filter(hasHex);
  if (el.matches('p') && hasHex(el)) return [el];
  return [];
}

function createFigure(el) {
  const figure = document.createElement('figure');
  figure.className = 'columns-moodboard-tile';
  const media = document.createElement('div');
  media.className = 'columns-moodboard-tile-media';
  const picture = el.querySelector('picture');
  const link = picture.closest('a');
  media.append(link && el.contains(link) ? link : picture);
  figure.append(media);
  // Text authored next to the image in the same paragraph is its caption.
  if (el.textContent.trim()) {
    const caption = document.createElement('figcaption');
    caption.append(el);
    figure.append(caption);
  }
  return figure;
}

function decorateCell(cell) {
  const children = [...cell.children];
  const output = [];
  let tiles = null;
  let swatches = null;
  let figure = null;

  children.forEach((el) => {
    if (el.querySelector('picture')) {
      swatches = null;
      if (!tiles) {
        tiles = document.createElement('div');
        tiles.className = 'columns-moodboard-tiles';
        output.push(tiles);
      }
      figure = createFigure(el);
      tiles.append(figure);
      return;
    }

    const sources = getSwatchSources(el);
    if (sources.length) {
      tiles = null;
      figure = null;
      if (!swatches) {
        swatches = document.createElement('ul');
        swatches.className = 'columns-moodboard-swatches';
        output.push(swatches);
      }
      sources.forEach((source) => swatches.append(buildSwatch(source)));
      return;
    }

    if (figure && el.textContent.trim()) {
      let caption = figure.querySelector('figcaption');
      if (!caption) {
        caption = document.createElement('figcaption');
        figure.append(caption);
      }
      caption.append(el);
      return;
    }

    tiles = null;
    swatches = null;
    figure = null;
    if (el.textContent.trim()) output.push(el);
  });

  cell.replaceChildren(...output);
  cell.querySelectorAll('.columns-moodboard-tiles').forEach((group) => {
    group.classList.add(`columns-moodboard-tiles-${group.children.length}`);
  });

  // A tile whose caption holds one link gets the same link on its image.
  cell.querySelectorAll('.columns-moodboard-tile').forEach((tile) => {
    const links = tile.querySelectorAll('figcaption a');
    const media = tile.querySelector('.columns-moodboard-tile-media');
    if (links.length !== 1 || media.querySelector('a')) return;
    const [link] = links;
    tile.classList.add('has-link');
    link.classList.remove('button', 'primary', 'secondary');
    link.closest('.button-container')?.classList.remove('button-container');
    const imageLink = document.createElement('a');
    imageLink.href = link.href;
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
    imageLink.append(...media.childNodes);
    media.append(imageLink);
  });
}

/** @param {Element} block The columns-moodboard block element */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-moodboard-row');
    [...row.children].forEach((cell, idx) => {
      cell.classList.add('columns-moodboard-cell', idx ? 'columns-moodboard-side' : 'columns-moodboard-lead');
      decorateCell(cell);
    });
    // The first tile of the lead cell spans the full width above the others.
    row.querySelector('.columns-moodboard-lead .columns-moodboard-tile')?.classList.add('is-lead');
  });
  optimizeImages(block);
}
