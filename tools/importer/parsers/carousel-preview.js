/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-preview
 * Source: https://www.cambriausa.com (.teaser-carousel-with-previews)
 * The source clones slides at both ends for infinite looping; only the
 * unique (non-clone) slides are kept.
 * Rows: [image | h3, description, CTA link]
 */
export default function parse(element, { document }) {
  const allSlides = [...element.querySelectorAll('.teaser-carousel-slide-component')];
  let slides = allSlides.filter((s) => !s.classList.contains('clone'));
  if (!slides.length) slides = allSlides;

  // Safety net: de-duplicate by title + CTA in case clones are not flagged.
  const seen = new Set();
  slides = slides.filter((slide) => {
    const title = slide.querySelector('.teaser-carousel-slide__title');
    const cta = slide.querySelector('a[href]');
    const key = `${title ? title.textContent.trim() : ''}|${cta ? cta.getAttribute('href') : ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Live slides paint the photo as a CSS background on the content wrapper
  // (data-background-image / inline style); cached copies may hold an <img>.
  const slideImage = (slide) => {
    const existing = slide.querySelector('img');
    if (existing) return existing;
    const wrapper = slide.querySelector('.teaser-carousel-slide__content-wrapper') || slide;
    let src = wrapper.getAttribute('data-background-image');
    if (!src) {
      const style = wrapper.getAttribute('style') || '';
      const match = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (match) [, src] = match;
    }
    if (!src) return null;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    return img;
  };

  const cells = [];
  slides.forEach((slide) => {
    const img = slideImage(slide);
    const title = slide.querySelector('.teaser-carousel-slide__title');
    const description = slide.querySelector('.teaser-carousel-slide__description');
    const cta = slide.querySelector('a.teaser-carousel-slide__cta[href], .slide-cta-container a[href]');

    const textCell = [];
    if (title) {
      const tag = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h3';
      const heading = document.createElement(tag);
      heading.textContent = title.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(heading);
    }
    if (description) {
      const p = document.createElement('p');
      p.innerHTML = description.innerHTML.trim();
      textCell.push(p);
    }
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      textCell.push(p);
    }

    if (!img && !textCell.length) return;
    cells.push([img ? [img] : '', textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-preview', cells });
  element.replaceWith(block);
}
