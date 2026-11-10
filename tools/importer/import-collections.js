/* eslint-disable */
/* global WebImporter */

import cardsSwatchParser from './parsers/cards-swatch.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsIconParser from './parsers/cards-icon.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import columnsTeaserParser from './parsers/columns-teaser.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import cleanupTransformer from './transformers/cambriausa-cleanup.js';
import sectionsTransformer from './transformers/cambriausa-sections.js';
import dmImagesTransformer from './transformers/cambriausa-dm-images.js';

const PAGE_TEMPLATE = {
  "name": "collections",
  "urls": [
    "https://shop.cambriausa.com/collections/samples"
  ],
  "representativeUrl": "https://shop.cambriausa.com/collections/samples",
  "description": "Cambria Samples Store (Shopify) collection listing: centered intro with breadcrumb, shop-by-collection swatch tiles, product card grid (promo tile + product tiles), cream Cambria Difference icon points, material-comparison and resource teaser cards, cream pricing image/text promo and an FAQ accordion",
  "blocks": [
    {
      "name": "cards-swatch",
      "instances": [
        ".cc-collection-list .slider__grid"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".main-products-grid__results > ul.grid"
      ]
    },
    {
      "name": "cards-icon",
      "instances": [
        ".cc-icons-with-text .slider__grid"
      ]
    },
    {
      "name": "cards-teaser",
      "instances": [
        ".cc-multi-column ul:has(> li.multi-column)"
      ]
    },
    {
      "name": "columns-teaser",
      "instances": [
        ".cc-media-with-text .media-with-text"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        ".cc-faq .reading-width"
      ]
    }
  ],
  "urlPattern": "/collections/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Collection intro (breadcrumb, title, intro)",
      "selector": [
        ".container--breadcrumbs",
        ".cc-rich-text:has(~ .cc-collection-list)",
        "#main-content > div.container.container--breadcrumbs, #shopify-section-template--17768071233645__rich_text_3Pyj8y"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".container--breadcrumbs .breadcrumbs-list",
        ".cc-rich-text:has(~ .cc-collection-list) .section__block--heading",
        ".cc-rich-text:has(~ .cc-collection-list) .section__block.rte"
      ]
    },
    {
      "id": "section-2",
      "name": "Shop-by collection tiles",
      "selector": [
        ".cc-collection-list",
        "#shopify-section-template--17768071233645__collection_list_9gEhfq"
      ],
      "style": null,
      "blocks": [
        "cards-swatch"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Product listing grid",
      "selector": [
        ".cc-collection-products",
        "#shopify-section-template--17768071233645__collection-products"
      ],
      "style": null,
      "blocks": [
        "cards-product"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "The Cambria Difference (cream band)",
      "selector": [
        ".cc-rich-text:has(+ .cc-icons-with-text)",
        ".cc-icons-with-text",
        "#shopify-section-template--17768071233645__rich_text_w6Cxxw, #shopify-section-template--17768071233645__icons_with_text_cUfzzz"
      ],
      "style": "cream, centered",
      "blocks": [
        "cards-icon"
      ],
      "defaultContent": [
        ".cc-rich-text:has(+ .cc-icons-with-text) .section__block--heading",
        ".cc-rich-text:has(+ .cc-icons-with-text) .section__block.rte"
      ]
    },
    {
      "id": "section-5",
      "name": "How Do Cambria Quartz Surfaces Compare?",
      "selector": [
        ".cc-rich-text:has(+ .cc-multi-column)",
        "#shopify-section-template--17768071233645__rich_text_VjFrk8, #shopify-section-template--17768071233645__multi_column_HPW7f7"
      ],
      "style": "centered",
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": [
        ".cc-rich-text:has(+ .cc-multi-column) .section__block--heading",
        ".cc-rich-text:has(+ .cc-multi-column) .section__block.rte"
      ]
    },
    {
      "id": "section-6",
      "name": "Quartz pricing promo (cream band)",
      "selector": [
        ".cc-media-with-text",
        "#shopify-section-template--17768071233645__media_with_text_dP8VnF"
      ],
      "style": "cream",
      "blocks": [
        "columns-teaser"
      ],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "Quartz Countertop Resources",
      "selector": [
        ".cc-multi-column:has(.section__heading)",
        "#shopify-section-template--17768071233645__multi_column_LJwAEA"
      ],
      "style": "centered",
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": [
        ".cc-multi-column .section__heading"
      ]
    },
    {
      "id": "section-8",
      "name": "Quartz Samples Store FAQs",
      "selector": [
        ".cc-rich-text:has(+ .cc-faq)",
        ".cc-faq",
        "#shopify-section-template--17768071233645__rich_text_LdVpwX, #shopify-section-template--17768071233645__faq_8GY3HV, #shopify-section-template--17768071233645__rich_text_HLzaWT"
      ],
      "style": "centered",
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [
        ".cc-rich-text:has(+ .cc-faq) .section__block--heading",
        ".cc-rich-text:has(+ .cc-faq) .section__block.rte",
        ".cc-faq + .cc-rich-text .section__block--buttons"
      ]
    }
  ]
};

const parsers = {
  'cards-swatch': cardsSwatchParser,
  'cards-product': cardsProductParser,
  'cards-icon': cardsIconParser,
  'cards-teaser': cardsTeaserParser,
  'columns-teaser': columnsTeaserParser,
  'accordion-faq': accordionFaqParser,
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
