/* eslint-disable */
/* global WebImporter */

import heroVideoParser from './parsers/hero-video.js';
import cardsSwatchParser from './parsers/cards-swatch.js';
import heroGradientParser from './parsers/hero-gradient.js';
import cardsOverlayParser from './parsers/cards-overlay.js';
import carouselPreviewParser from './parsers/carousel-preview.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import cleanupTransformer from './transformers/cambriausa-cleanup.js';
import sectionsTransformer from './transformers/cambriausa-sections.js';
import dmImagesTransformer from './transformers/cambriausa-dm-images.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.cambriausa.com"
  ],
  "representativeUrl": "https://www.cambriausa.com",
  "description": "Cambria USA home page: video hero, new-designs swatch grid, promo banner, inspiration category tiles, Cambria Difference carousel and planning-tool teasers",
  "blocks": [
    {
      "name": "hero-video",
      "instances": [
        ".teaser-hero-video"
      ]
    },
    {
      "name": "cards-swatch",
      "instances": [
        ".cmp-experiencefragment--4-up"
      ]
    },
    {
      "name": "hero-gradient",
      "instances": [
        ".teaser-hero"
      ]
    },
    {
      "name": "cards-overlay",
      "instances": [
        ".teaser.cmp-teaser__hover-zoom"
      ]
    },
    {
      "name": "carousel-preview",
      "instances": [
        ".teaser-carousel-with-previews"
      ]
    },
    {
      "name": "cards-teaser",
      "instances": [
        ".cmp-container__flex-container"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero video banner",
      "selector": [
        ".cmp-container__full-width:has(.teaser-hero-video)",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.cmp-container__full-width.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "New quartz designs",
      "selector": [
        "div.experiencefragment:has(> .cmp-experiencefragment--4-up)",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.experiencefragment.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)"
      ],
      "style": "centered",
      "blocks": [
        "cards-swatch"
      ],
      "defaultContent": [
        ".cmp-experiencefragment--4-up .cmp-title",
        ".cmp-experiencefragment--4-up .cmp-container__fixed-width > .cmp-container > div > .text .cmp-text",
        ".cmp-experiencefragment--4-up .cmp-button"
      ]
    },
    {
      "id": "section-3",
      "name": "Cambria Style promo banner",
      "selector": [
        ".teaser-hero",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser-hero.teaser.cmp-teaser-hero__overlay__black-left-gradient.cmp-teaser-hero__text-alignment__left.cmp-teaser-hero__font-color__white.cmp-teaser-hero__button-style__white-solid.cmp-teaser-hero__desktop-height__512px.cmp-teaser-hero__mobile-height__450px.aem-GridColumn.aem-GridColumn--default--12"
      ],
      "style": null,
      "blocks": [
        "hero-gradient"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Inspiration intro and category tiles",
      "selector": [
        ".cmp-container__fixed-width:has(+ .cmp-container__full-width .cmp-teaser__hover-zoom)",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.cmp-container__fixed-width.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.cmp-container__full-width.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(8)",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.cmp-container__full-width.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(10)"
      ],
      "style": "centered",
      "blocks": [
        "cards-overlay"
      ],
      "defaultContent": [
        ".cmp-container__fixed-width:has(+ .cmp-container__full-width .cmp-teaser__hover-zoom) .cmp-title",
        ".cmp-container__fixed-width:has(+ .cmp-container__full-width .cmp-teaser__hover-zoom) .cmp-text",
        ".cmp-container__fixed-width:has(+ .cmp-container__full-width .cmp-teaser__hover-zoom) .cmp-button"
      ]
    },
    {
      "id": "section-5",
      "name": "The Cambria Difference",
      "selector": [
        ".cmp-container__fixed-width:has(.teaser-carousel-with-previews)",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.cmp-container__fixed-width.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(11)"
      ],
      "style": "centered",
      "blocks": [
        "carousel-preview"
      ],
      "defaultContent": [
        ".cmp-container__fixed-width:has(.teaser-carousel-with-previews) .cmp-title",
        ".cmp-container__fixed-width:has(.teaser-carousel-with-previews) .cmp-text",
        ".cmp-container__fixed-width:has(.teaser-carousel-with-previews) .cmp-button"
      ]
    },
    {
      "id": "section-6",
      "name": "Planning tools teasers",
      "selector": [
        ".cmp-container__flex-container",
        "body > div.root.container.responsivegrid > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > main.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.cmp-container__fixed-width.cmp-container__flex-container.aem-GridColumn.aem-GridColumn--default--12"
      ],
      "style": null,
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-video': heroVideoParser,
  'cards-swatch': cardsSwatchParser,
  'hero-gradient': heroGradientParser,
  'cards-overlay': cardsOverlayParser,
  'carousel-preview': carouselPreviewParser,
  'cards-teaser': cardsTeaserParser,
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
