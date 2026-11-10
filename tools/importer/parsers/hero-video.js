/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-video
 * Source: https://www.cambriausa.com (.teaser-hero-video)
 * Row 1: poster image + link to the video file (absolute MP4 URL)
 * Row 2: FOAM logo image, H1, CTA links
 */
const SOURCE_ORIGIN = 'https://www.cambriausa.com';

function absolute(url) {
  if (!url) return '';
  try {
    return new URL(url, SOURCE_ORIGIN).href;
  } catch (e) {
    return url;
  }
}

function buildHeading(document, source, tag) {
  const heading = document.createElement(tag);
  const inner = source.querySelector(':scope > p');
  heading.innerHTML = (inner || source).innerHTML.trim();
  return heading;
}

export default function parse(element, { document }) {
  const video = element.querySelector('video.cmp-teaser-video__player, video');

  // Row 1: poster + video link
  const mediaCell = [];
  if (video) {
    const posterSrc = video.getAttribute('poster') || video.getAttribute('data-poster');
    if (posterSrc) {
      const poster = document.createElement('img');
      poster.src = absolute(posterSrc);
      poster.alt = video.getAttribute('name') || '';
      mediaCell.push(poster);
    }
    const videoSrc = video.getAttribute('src')
      || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src'));
    if (videoSrc) {
      const href = absolute(videoSrc);
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      mediaCell.push(p);
    }
  }

  // Row 2: logo, heading, CTAs
  const contentCell = [];
  const content = element.querySelector('.cmp-teaser__content');
  if (content) {
    const logo = content.querySelector('img.cmp-teaser__pretitle-image__desktop')
      || content.querySelector('img.cmp-teaser__pretitle-image__mobile');
    if (logo) contentCell.push(logo);

    const title = content.querySelector('.cmp-teaser__title');
    if (title) contentCell.push(buildHeading(document, title, 'h1'));

    const description = content.querySelector('.cmp-teaser__description');
    if (description) {
      description.querySelectorAll(':scope > *').forEach((el) => contentCell.push(el));
    }

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
  if (mediaCell.length) cells.push([mediaCell]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
