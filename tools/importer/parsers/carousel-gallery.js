/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-gallery
 * Source: https://www.cambriausa.com/quartz-countertops/quartz-colors/designs/quintessa (.pdp-carousel)
 * One row per real slide (slick clones and the thumbnail strip are skipped).
 * Rows: [image | (empty text cell)] - a video slide holds its poster image
 * plus a link to the .mp4 in the image cell.
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

function cloneImage(img, document) {
  const out = document.createElement('img');
  out.src = absolute(img.getAttribute('src'));
  out.alt = img.getAttribute('alt') || '';
  return out;
}

function findVideoUrl(slide, poster) {
  const media = slide.querySelector('video[src], video source[src]');
  if (media) return absolute(media.getAttribute('src'));
  // AEM poster renditions live under the video asset:
  // /content/dam/.../name.mp4/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg
  const src = poster ? poster.getAttribute('src') || '' : '';
  const match = src.match(/^(.*?\.(?:mp4|webm|mov))\/_jcr_content\//i);
  return match ? absolute(match[1]) : null;
}

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.slick-track > .slick-slide:not(.slick-cloned)')];
  if (!slides.length) {
    slides = [...element.querySelectorAll('.carousel__media-item')]
      .filter((item) => !item.closest('.slick-cloned, .slick-dots'));
  }

  const cells = [];
  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    if (!img) return;
    const imageCell = [cloneImage(img, document)];
    if (slide.querySelector('.carousel__video-thumbnail, video')) {
      const videoUrl = findVideoUrl(slide, img);
      if (videoUrl) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = videoUrl;
        a.textContent = videoUrl;
        p.append(a);
        imageCell.push(p);
      }
    }
    cells.push([imageCell, '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
