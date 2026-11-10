/* eslint-disable */
/* global WebImporter */

import carouselGalleryParser from './parsers/carousel-gallery.js';
import columnsMoodboardParser from './parsers/columns-moodboard.js';
import cardsSwatchParser from './parsers/cards-swatch.js';
import columnsTeaserParser from './parsers/columns-teaser.js';
import cleanupTransformer from './transformers/cambriausa-cleanup.js';
import sectionsTransformer from './transformers/cambriausa-sections.js';
import dmImagesTransformer from './transformers/cambriausa-dm-images.js';

const PAGE_TEMPLATE = {
  "name": "designs",
  "urls": [
    "https://www.cambriausa.com/quartz-countertops/quartz-colors/designs/quintessa"
  ],
  "representativeUrl": "https://www.cambriausa.com/quartz-countertops/quartz-colors/designs/quintessa",
  "description": "To be named in naming step",
  "blocks": [
    {
      "name": "carousel-gallery",
      "instances": [
        ".pdp-carousel"
      ]
    },
    {
      "name": "columns-moodboard",
      "instances": [
        ".cmp-moodboard__wrapper"
      ]
    },
    {
      "name": "cards-swatch",
      "instances": [
        ".cmp-similar-designs__cards-container"
      ]
    },
    {
      "name": "columns-teaser",
      "instances": [
        ".cmp-pdp-teaser-50-50"
      ]
    }
  ],
  "urlPattern": "/quartz-countertops/quartz-colors/designs/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Product overview (breadcrumb, gallery, details)",
      "selector": [
        ".aem-authored-content-segment:has(> .cmp-container__fixed-width .cmp-button__secondary)",
        ".aem-authored-content-segment:has(.pdp-carousel)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(1)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(2)"
      ],
      "style": "split",
      "blocks": [
        "carousel-gallery"
      ],
      "defaultContent": [
        ".aem-authored-content-segment > .cmp-container__fixed-width .cmp-button__secondary",
        ".pdp-wrapper__right .pdp-heading",
        ".pdp-wrapper__right .pdp-details"
      ]
    },
    {
      "id": "section-2",
      "name": "Moodboard",
      "selector": [
        ".aem-authored-content-segment:has(.cmp-moodboard)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [
        "columns-moodboard"
      ],
      "defaultContent": [
        ".cmp-moodboard__authored-title",
        ".cmp-moodboard__authored-description",
        ".cmp-moodboard__header-share-container .share-container"
      ]
    },
    {
      "id": "section-3",
      "name": "Benefits of Cambria",
      "selector": [
        ".aem-authored-content-segment:has(.numberedlist)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(5)"
      ],
      "style": "cream, centered",
      "blocks": [],
      "defaultContent": [
        ".aem-authored-content-segment .cmp-title__gold",
        ".aem-authored-content-segment .numberedlist"
      ]
    },
    {
      "id": "section-4",
      "name": "Explore Similar Designs",
      "selector": [
        ".aem-authored-content-segment:has(.cmp-similar-designs)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(6)"
      ],
      "style": null,
      "blocks": [
        "cards-swatch"
      ],
      "defaultContent": [
        ".cmp-similar-designs__title",
        ".cmp-similar-designs__description"
      ]
    },
    {
      "id": "section-5",
      "name": "Experience Cambria in Person",
      "selector": [
        ".aem-authored-content-segment:has(.cmp-pdp-teaser-50-50)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(7)"
      ],
      "style": "cream",
      "blocks": [
        "columns-teaser"
      ],
      "defaultContent": []
    },
    {
      "id": "section-6",
      "name": "Certification logos",
      "selector": [
        ".aem-authored-content-segment:has(.pdp-certifications)",
        "#root-search > div.pdp-container > div.pdp-subcontainer > div.aem-authored-content-segment:nth-of-type(8)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".pdp-certifications"
      ]
    }
  ]
};

const parsers = {
  'carousel-gallery': carouselGalleryParser,
  'columns-moodboard': columnsMoodboardParser,
  'cards-swatch': cardsSwatchParser,
  'columns-teaser': columnsTeaserParser,
};

// Order matters: cleanup strips chrome first, sections inserts breaks/metadata, DM rewrites Scene7 images last.
const transformers = [cleanupTransformer, sectionsTransformer, dmImagesTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
