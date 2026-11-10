/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-designs.js
  var import_designs_exports = {};
  __export(import_designs_exports, {
    default: () => import_designs_default
  });

  // tools/importer/parsers/carousel-gallery.js
  var ORIGIN = "https://www.cambriausa.com";
  function absolute(url) {
    if (!url) return url;
    try {
      return new URL(url, ORIGIN).href;
    } catch (e) {
      return url;
    }
  }
  function cloneImage(img, document) {
    const out = document.createElement("img");
    out.src = absolute(img.getAttribute("src"));
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function findVideoUrl(slide, poster) {
    const media = slide.querySelector("video[src], video source[src]");
    if (media) return absolute(media.getAttribute("src"));
    const src = poster ? poster.getAttribute("src") || "" : "";
    const match = src.match(/^(.*?\.(?:mp4|webm|mov))\/_jcr_content\//i);
    return match ? absolute(match[1]) : null;
  }
  function parse(element, { document }) {
    let slides = [...element.querySelectorAll(".slick-track > .slick-slide:not(.slick-cloned)")];
    if (!slides.length) {
      slides = [...element.querySelectorAll(".carousel__media-item")].filter((item) => !item.closest(".slick-cloned, .slick-dots"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      if (!img) return;
      const imageCell = [cloneImage(img, document)];
      if (slide.querySelector(".carousel__video-thumbnail, video")) {
        const videoUrl = findVideoUrl(slide, img);
        if (videoUrl) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = videoUrl;
          a.textContent = videoUrl;
          p.append(a);
          imageCell.push(p);
        }
      }
      cells.push([imageCell, ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-moodboard.js
  var ORIGIN2 = "https://www.cambriausa.com";
  function absolute2(url) {
    if (!url) return url;
    try {
      return new URL(url, ORIGIN2).href;
    } catch (e) {
      return url;
    }
  }
  function imageParagraph(img, document) {
    const p = document.createElement("p");
    const out = document.createElement("img");
    out.src = absolute2(img.getAttribute("src"));
    out.alt = img.getAttribute("alt") || "";
    p.append(out);
    return p;
  }
  function captionParagraph(source, href, document) {
    if (!source || !source.textContent.trim()) return null;
    const p = document.createElement("p");
    let target = p;
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      p.append(a);
      target = a;
    }
    [...source.childNodes].forEach((n) => target.append(n.cloneNode(true)));
    return p;
  }
  function toHex(value) {
    if (!value) return "";
    const hex = value.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/i);
    if (hex) return hex[0].toLowerCase();
    const rgb = value.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!rgb) return "";
    return `#${rgb.slice(1, 4).map((c) => Number(c).toString(16).padStart(2, "0")).join("")}`;
  }
  function swatchColor(paint) {
    const chip = paint.querySelector(".hex") || paint.querySelector(".cmp-moodboard__block-paint-swatch");
    const candidates = [];
    [chip, chip && chip.parentElement].forEach((el) => {
      if (!el) return;
      candidates.push(el.getAttribute("style"), el.getAttribute("data-hex"), el.getAttribute("data-color"), el.textContent);
    });
    for (let i = 0; i < candidates.length; i += 1) {
      const hex = toHex(candidates[i]);
      if (hex) return hex;
    }
    return "";
  }
  function parse2(element, { document }) {
    const slabCell = [];
    const slabs = element.querySelector(".cmp-moodboard__block-slabs");
    if (slabs) {
      const featured = slabs.querySelector(".cmp-moodboard__featured-slab");
      const cards = [
        ...featured ? [featured] : [],
        ...slabs.querySelectorAll(".cmp-moodboard__detailed-slab-container .cmp-design-card")
      ];
      cards.forEach((card) => {
        const img = card.querySelector("img");
        if (!img) return;
        slabCell.push(imageParagraph(img, document));
        const link = card.querySelector("a[href]");
        const href = link ? absolute2(link.getAttribute("href")) : null;
        const caption = captionParagraph(card.querySelector(".cmp-design-card__design-name-text"), href, document);
        if (caption) slabCell.push(caption);
      });
    }
    const sideCell = [];
    const paints = [...element.querySelectorAll(".cmp-moodboard__block-paint")];
    if (paints.length) {
      const ul = document.createElement("ul");
      paints.forEach((paint) => {
        const name = paint.querySelector(".shade-name");
        const brand = paint.querySelector(".brand");
        const hex = swatchColor(paint);
        const li = document.createElement("li");
        if (name) {
          const strong = document.createElement("strong");
          strong.textContent = name.textContent.trim();
          li.append(strong);
        }
        [brand && brand.textContent.trim(), hex].forEach((text) => {
          if (!text) return;
          if (li.childNodes.length) li.append(document.createElement("br"));
          li.append(document.createTextNode(text));
        });
        if (li.childNodes.length) ul.append(li);
      });
      if (ul.children.length) sideCell.push(ul);
    }
    element.querySelectorAll(".cmp-moodboard__block-hardware").forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;
      sideCell.push(imageParagraph(img, document));
      const link = item.querySelector("a[href]");
      const href = link ? absolute2(link.getAttribute("href")) : null;
      const caption = captionParagraph(item.querySelector(".hardware-name"), href, document);
      if (caption) sideCell.push(caption);
    });
    const cells = [[slabCell.length ? slabCell : "", sideCell.length ? sideCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-moodboard", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-swatch.js
  var ORIGIN3 = "https://www.cambriausa.com";
  function absolute3(url) {
    if (!url) return url;
    try {
      return new URL(url, ORIGIN3).href;
    } catch (e) {
      return url;
    }
  }
  function cleanName(text) {
    return (text || "").replace(/\s+/g, " ").replace(/\s+(?=[®™©])/g, "").trim();
  }
  function parseSimilarDesigns(element, document) {
    const cells = [];
    element.querySelectorAll("a.cmp-similar-designs__card").forEach((card) => {
      const img = card.querySelector("img");
      const nameEl = card.querySelector(".cmp-similar-designs__card-design-name-text");
      const href = card.getAttribute("href");
      const name = cleanName(nameEl ? nameEl.textContent : "") || img && img.getAttribute("alt") || "";
      if (!img && !name) return;
      let imageCell = "";
      if (img) {
        const out = document.createElement("img");
        out.src = absolute3(img.getAttribute("src"));
        out.alt = img.getAttribute("alt") || "";
        imageCell = [out];
      }
      let textCell = "";
      if (name) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = href.startsWith("/") ? href : absolute3(href).replace(/^https:\/\/www\.cambriausa\.com/, "");
          a.textContent = name;
          p.append(a);
        } else {
          p.textContent = name;
        }
        textCell = [p];
      }
      cells.push([imageCell, textCell]);
    });
    return cells;
  }
  var SHOP_ORIGIN = "https://shop.cambriausa.com";
  function isDataUri(value) {
    return /^data:/i.test((value || "").trim());
  }
  function largestSrcsetCandidate(srcset) {
    if (!srcset) return "";
    let best = "";
    let bestSize = -1;
    srcset.split(/,\s+(?=\S)/).forEach((part) => {
      const [url, descriptor = ""] = part.trim().split(/\s+/);
      if (!url || isDataUri(url)) return;
      const size = parseFloat(descriptor) || 0;
      if (size >= bestSize) {
        best = url;
        bestSize = size;
      }
    });
    return best;
  }
  function shopAbsolute(url) {
    if (!url) return "";
    const value = url.trim();
    if (/^(mailto|tel|javascript):/i.test(value) || value.startsWith("#")) return value;
    try {
      return new URL(value.startsWith("//") ? `https:${value}` : value, SHOP_ORIGIN).href;
    } catch (e) {
      return value;
    }
  }
  function shopImageSrc(img) {
    if (!img) return "";
    const real = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      largestSrcsetCandidate(img.getAttribute("data-srcset")),
      largestSrcsetCandidate(img.getAttribute("srcset")),
      img.currentSrc
    ].find((c) => c && !isDataUri(c));
    return real ? shopAbsolute(real) : "";
  }
  function parseShopCollections(element, document) {
    const cells = [];
    element.querySelectorAll("li.slider__item").forEach((item) => {
      var _a, _b;
      const card = item.querySelector(".card__collection") || item;
      const nameLink = card.querySelector(".card__title a[href], .card__info a[href]");
      const name = cleanName(nameLink ? nameLink.textContent : "");
      const img = card.querySelector(".card__media img");
      const src = shopImageSrc(img);
      if (!src && !name) return;
      let imageCell = "";
      if (src) {
        const out = document.createElement("img");
        out.src = src;
        out.alt = (img.getAttribute("alt") || "").trim() || name;
        imageCell = [out];
      }
      let textCell = "";
      if (name) {
        const p = document.createElement("p");
        const href = nameLink.getAttribute("href") || ((_b = (_a = card.querySelector(".card__media a[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href"));
        if (href) {
          const a = document.createElement("a");
          a.href = shopAbsolute(href);
          a.textContent = name;
          p.append(a);
        } else {
          p.textContent = name;
        }
        textCell = [p];
      }
      cells.push([imageCell, textCell]);
    });
    return cells;
  }
  function parse3(element, { document }) {
    if (element.querySelector(".card__collection")) {
      const cells2 = parseShopCollections(element, document);
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-swatch", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    if (element.matches(".cmp-similar-designs__cards-container") || !element.querySelector(".cmp-container__full-width") && element.querySelector("a.cmp-similar-designs__card")) {
      const cells2 = parseSimilarDesigns(element, document);
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-swatch", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const grid = element.querySelector(".cmp-container__fixed-width > .cmp-container > .aem-Grid") || element;
    const defaults = [];
    const title = grid.querySelector(":scope > .title .cmp-title__text, :scope > .title h1, :scope > .title h2, :scope > .title h3");
    if (title) defaults.push(title);
    grid.querySelectorAll(":scope > .text .cmp-text > *").forEach((el) => defaults.push(el));
    grid.querySelectorAll(":scope > .button a.cmp-button").forEach((link) => {
      const label = link.querySelector(".cmp-button__text");
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = (label || link).textContent.trim();
      p.append(a);
      defaults.push(p);
    });
    const cells = [];
    grid.querySelectorAll(":scope > .cmp-container__full-width").forEach((item) => {
      const img = item.querySelector(".cmp-image img");
      const nameLink = item.querySelector(".cmp-text a[href]");
      if (!img && !nameLink) return;
      const imageCell = img ? [img] : [""];
      const textCell = [];
      if (nameLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = nameLink.getAttribute("href");
        a.textContent = nameLink.textContent.trim();
        p.append(a);
        textCell.push(p);
      } else {
        const imgLink = item.querySelector("a.cmp-image__link[href]");
        if (imgLink && img) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = imgLink.getAttribute("href");
          a.textContent = img.getAttribute("alt") || imgLink.getAttribute("href");
          p.append(a);
          textCell.push(p);
        }
      }
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-swatch", cells });
    defaults.forEach((el) => element.before(el));
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-teaser.js
  var ORIGIN4 = "https://www.cambriausa.com";
  function absolute4(url) {
    if (!url) return url;
    try {
      return new URL(url, ORIGIN4).href;
    } catch (e) {
      return url;
    }
  }
  var SHOP_ORIGIN2 = "https://shop.cambriausa.com";
  function isDataUri2(value) {
    return /^data:/i.test((value || "").trim());
  }
  function largestSrcsetCandidate2(srcset) {
    if (!srcset) return "";
    let best = "";
    let bestSize = -1;
    srcset.split(/,\s+(?=\S)/).forEach((part) => {
      const [url, descriptor = ""] = part.trim().split(/\s+/);
      if (!url || isDataUri2(url)) return;
      const size = parseFloat(descriptor) || 0;
      if (size >= bestSize) {
        best = url;
        bestSize = size;
      }
    });
    return best;
  }
  function shopAbsolute2(url) {
    if (!url) return "";
    const value = url.trim();
    if (/^(mailto|tel|javascript):/i.test(value) || value.startsWith("#")) return value;
    try {
      return new URL(value.startsWith("//") ? `https:${value}` : value, SHOP_ORIGIN2).href;
    } catch (e) {
      return value;
    }
  }
  function shopImageSrc2(img) {
    if (!img) return "";
    const real = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      largestSrcsetCandidate2(img.getAttribute("data-srcset")),
      largestSrcsetCandidate2(img.getAttribute("srcset")),
      img.currentSrc
    ].find((c) => c && !isDataUri2(c));
    return real ? shopAbsolute2(real) : "";
  }
  function parseShopMediaWithText(element, document) {
    const textCell = [];
    const text = element.querySelector(".media-with-text__text") || element;
    const heading = text.querySelector(".section__block--heading, h1, h2, h3");
    if (heading && heading.textContent.trim()) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      textCell.push(h2);
    }
    text.querySelectorAll(".rte > p, .rte > ul, .rte > ol").forEach((el) => {
      if (!el.textContent.trim()) return;
      el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", shopAbsolute2(a.getAttribute("href"))));
      textCell.push(el);
    });
    text.querySelectorAll(".section__block--button a[href], .section__block--buttons a[href]").forEach((link) => {
      const label = link.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = shopAbsolute2(link.getAttribute("href"));
      a.textContent = label;
      p.append(a);
      textCell.push(p);
    });
    const imageCell = [];
    const img = element.querySelector(".media-with-text__media img");
    const src = shopImageSrc2(img);
    if (src) {
      const out = document.createElement("img");
      out.src = src;
      out.alt = (img.getAttribute("alt") || "").trim();
      imageCell.push(out);
    }
    return [[textCell.length ? textCell : "", imageCell.length ? imageCell : ""]];
  }
  function parse4(element, { document }) {
    if (element.matches(".media-with-text") || element.querySelector(".media-with-text__text")) {
      const shopCells = parseShopMediaWithText(element, document);
      const shopBlock = WebImporter.Blocks.createBlock(document, { name: "columns-teaser", cells: shopCells });
      element.replaceWith(shopBlock);
      return;
    }
    const textCell = [];
    const title = element.querySelector(".cmp-pdp-teaser-50-50__title");
    if (title && title.textContent.trim()) {
      const h2 = document.createElement("h2");
      h2.textContent = title.textContent.trim();
      textCell.push(h2);
    }
    const description = element.querySelector(".cmp-pdp-teaser-50-50__description") || element.querySelector(".cmp-pdp-teaser-50-50__description-container .cmp-text");
    if (description) {
      const paras = [...description.querySelectorAll(":scope > p, :scope > ul, :scope > ol")];
      if (paras.length) {
        paras.forEach((p) => textCell.push(p));
      } else if (description.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        textCell.push(p);
      }
    }
    element.querySelectorAll(".cmp-pdp-teaser-50-50__cta-button a[href]").forEach((link) => {
      const label = link.querySelector(".cmp-button__text") || link;
      const text = label.textContent.trim();
      if (!text) return;
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = absolute4(link.getAttribute("href"));
      a.textContent = text;
      p.append(a);
      textCell.push(p);
    });
    const imageCell = [];
    const img = element.querySelector(".cmp-pdp-teaser-50-50__image-container img");
    if (img) {
      const out = document.createElement("img");
      out.src = absolute4(img.getAttribute("src"));
      out.alt = img.getAttribute("alt") || "";
      imageCell.push(out);
    }
    const cells = [[textCell.length ? textCell : "", imageCell.length ? imageCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/cambriausa-cleanup.js
  var CHROME_SELECTORS = [
    // Global header / footer experience fragments + navigation
    "header",
    "footer",
    "nav",
    ".cmp-experiencefragment--header",
    ".cmp-experiencefragment--footer",
    // Cookie consent + skip link
    "#cookiebanner",
    "#CybotCookiebotDialog",
    ".skip-to-main-content",
    // Back to Top button (global UI)
    ".back-to-top",
    "#backToTop",
    ".sr-only-back-to-top-btn",
    // Separator spacers (their <hr> would otherwise become section breaks)
    ".separator",
    ".cmp-separator",
    // Breadcrumbs (designs template)
    ".breadcrumb",
    ".cmp-breadcrumb",
    // Third-party / empty widget containers
    "#root-sketchfab",
    "#root-sketchfab-contstraints",
    ".emplifi-wrapper",
    "#pixlee_container",
    '[id^="batBeacon"]',
    "iframe",
    "script",
    "style",
    "noscript",
    "link"
  ];
  var PDP_SELECTORS = [
    // Mobile duplicate of the H1 + series logo (desktop copy lives in .pdp-heading)
    ".pdp-wrapper__left .pdp-title-container.mobile-header",
    // "See it in your room" (Roomvo) / "See it in 3D" (Sketchfab) - JS overlays, no URL
    ".roomvo-sketchfab-container",
    ".roomvo-container",
    ".sketchfab-container",
    // Gallery controls: arrows, "Open in Full", "View All", progress counter / bars
    ".pdp-carousel__btn",
    ".pdp-carousel__actions",
    ".pdp-carousel__view-all",
    ".pdp-carousel__progress-counter",
    ".pdp-carousel__content__progress-container",
    ".slick-arrow",
    // Slick infinite-loop clones (duplicate slides)
    ".slick-slide.slick-cloned",
    // Hidden duplicate finish links (syndicated-show is the visible copy)
    ".syndicated-hide"
  ];
  var SHOP_SELECTORS = [
    // Global theme sections: header, footer, cart drawer, product compare
    ".shopify-section-group-header-group",
    ".shopify-section-group-footer-group",
    ".shopify-section-group-overlay-group",
    ".cc-header",
    ".cc-footer",
    ".cc-cart-drawer",
    ".cc-compare",
    "cart-drawer",
    "quick-add-drawer",
    "body > .overlay",
    "shop-cart-sync",
    "a.skip-link",
    // App embeds / pixels / consent
    "#pop-convert-app",
    '[id^="shopify-block-AOUhadktlbTJPcUMyU__"]',
    "#web-pixels-manager-sandbox-container",
    'iframe[id^="web-pixel-sandbox"]',
    "iframe.CybotCookiebotHiddenIframe",
    "iframe.CybotCookiebotOffscreenIframe",
    "iframe#db-sync",
    "img#db_lr_pixel_ad",
    // Collection listing tools: toolbar, pagination, divider
    "#products-toolbar",
    "products-toolbar",
    "#filter-results > nav",
    "hr.js-hidden",
    // Slider arrow buttons
    ".slider-nav",
    // Product card commerce UI: hover image, quick add (Add to cart / View details), empty prices
    "img.card__hover-image",
    ".card__quick-add",
    "button.js-quick-add",
    "a.quick-add-view-btn",
    ".price__no-variant",
    // FAQ disclosure +/- icons (inline SVG data URIs)
    ".cc-faq .disclosure__toggle"
  ];
  var SHOP_HIDDEN_LABELS = /^(choose options|unit price)$/i;
  var SHOP_CTA_LABELS = /^(add to cart|view details)$/i;
  function isShopifyPage(root) {
    return !!root.querySelector('.shopify-section, [id^="shopify-section-"]');
  }
  function isDataUri3(value) {
    return /^data:/i.test((value || "").trim());
  }
  function absolutizeProtocol(url) {
    return url && url.startsWith("//") ? `https:${url}` : url;
  }
  function largestSrcsetCandidate3(srcset) {
    if (!srcset) return "";
    let best = "";
    let bestSize = -1;
    srcset.split(/,\s+(?=\S)/).forEach((part) => {
      const [url, descriptor = ""] = part.trim().split(/\s+/);
      if (!url || isDataUri3(url)) return;
      const size = parseFloat(descriptor) || 0;
      if (size >= bestSize) {
        best = url;
        bestSize = size;
      }
    });
    return best;
  }
  function promoteLazyImages(root) {
    root.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src && !isDataUri3(src)) {
        if (src.startsWith("//")) img.setAttribute("src", absolutizeProtocol(src));
        return;
      }
      const picture = img.parentElement && img.parentElement.tagName === "PICTURE" ? img.parentElement : null;
      const sourceSet = picture ? Array.from(picture.querySelectorAll("source")).map((s) => s.getAttribute("srcset") || s.getAttribute("data-srcset")).find(Boolean) : "";
      const candidates = [
        img.currentSrc,
        img.getAttribute("data-src"),
        largestSrcsetCandidate3(img.getAttribute("data-srcset")),
        largestSrcsetCandidate3(img.getAttribute("srcset")),
        largestSrcsetCandidate3(sourceSet)
      ];
      const real = candidates.find((c) => c && !isDataUri3(c));
      if (real) img.setAttribute("src", absolutizeProtocol(real.trim()));
    });
  }
  function breadcrumbToParagraph(root) {
    const doc = root.ownerDocument;
    root.querySelectorAll("nav.breadcrumbs").forEach((nav) => {
      const links = Array.from(nav.querySelectorAll("a[href]"));
      if (!links.length) {
        nav.remove();
        return;
      }
      const p = doc.createElement("p");
      links.forEach((link, i) => {
        if (i > 0) p.append(" > ");
        const a = doc.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = link.textContent.trim();
        p.append(a);
      });
      nav.replaceWith(p);
    });
  }
  function demoteFaqHeading(root) {
    const doc = root.ownerDocument;
    root.querySelectorAll(".cc-faq").forEach((faq) => {
      const prev = faq.previousElementSibling;
      if (!prev || !prev.classList.contains("cc-rich-text")) return;
      prev.querySelectorAll("h1").forEach((h1) => {
        const firstH1 = root.querySelector("h1");
        if (firstH1 === h1) return;
        const h2 = doc.createElement("h2");
        while (h1.firstChild) h2.append(h1.firstChild);
        h1.replaceWith(h2);
      });
    });
  }
  function cleanupShopify(root) {
    root.querySelectorAll("facet-filters#facet-filters, #facet-filters").forEach((el) => el.remove());
    breadcrumbToParagraph(root);
    removeAll(root, SHOP_SELECTORS);
    root.querySelectorAll(":scope > img").forEach((img) => {
      if (isDataUri3(img.getAttribute("src"))) img.remove();
    });
    root.querySelectorAll(".cc-custom-liquid").forEach((el) => {
      if (el.querySelector("hr") && isEmptyNode(el)) el.remove();
    });
    root.querySelectorAll(".visually-hidden").forEach((el) => {
      if (SHOP_HIDDEN_LABELS.test(el.textContent.trim())) el.remove();
    });
    root.querySelectorAll("button, a").forEach((el) => {
      if (el.isConnected && SHOP_CTA_LABELS.test(el.textContent.trim())) el.remove();
    });
    root.querySelectorAll(".unit-price").forEach((el) => {
      const price = el.querySelector(".unit-price__price");
      if (!price || !price.textContent.trim()) el.remove();
    });
    root.querySelectorAll(".price__was").forEach((el) => {
      if (!el.textContent.trim()) el.remove();
    });
    demoteFaqHeading(root);
  }
  function isEmptyNode(el) {
    return !el.textContent.trim() && !el.querySelector("img, picture, video, iframe, svg, source, a[href]");
  }
  function isHiddenGridColumn(el) {
    const cls = Array.from(el.classList);
    if (!cls.includes("aem-GridColumn--default--hide")) return false;
    const phoneOverride = cls.some((c) => c.startsWith("aem-GridColumn--phone--") && c !== "aem-GridColumn--phone--hide");
    return !phoneOverride;
  }
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      let nodes = [];
      try {
        nodes = root.querySelectorAll(sel);
      } catch (e) {
        return;
      }
      nodes.forEach((n) => n.remove());
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      if (isShopifyPage(element)) cleanupShopify(element);
      promoteLazyImages(element);
      element.querySelectorAll("#design-palette__pdp-authored").forEach((el) => {
        if (!el.closest("main")) el.remove();
      });
      removeAll(element, CHROME_SELECTORS);
      removeAll(element, PDP_SELECTORS);
      element.querySelectorAll(".button > a.cmp-button:not([href])").forEach((a) => {
        a.parentElement.remove();
      });
      element.querySelectorAll(".aem-authored-content-segment").forEach((el) => {
        if (el.isConnected && isEmptyNode(el)) el.remove();
      });
      element.querySelectorAll('[class*="aem-GridColumn--default--hide"]').forEach((el) => {
        if (isHiddenGridColumn(el)) el.remove();
      });
      element.querySelectorAll(".embed, .cmp-embed").forEach((el) => {
        if (el.isConnected && isEmptyNode(el)) el.remove();
      });
      element.querySelectorAll(".experiencefragment, .cmp-experiencefragment").forEach((el) => {
        if (el.isConnected && isEmptyNode(el)) el.remove();
      });
      element.querySelectorAll('img[src*="bat.bing.com"], img[src*="adsrvr.org"], img[src*="facebook.com/tr"]').forEach((img) => img.remove());
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "header",
        "footer",
        "nav",
        "iframe",
        "script",
        "style",
        "noscript",
        "link",
        ".white-bar-container",
        ".material-symbols-outlined",
        ".material-icons"
      ]);
      element.querySelectorAll("button").forEach((btn) => {
        if (!btn.textContent.trim() && !btn.querySelector("img")) btn.remove();
      });
      const ATTRS = ["onclick", "onload", "data-cmp-data-layer", "data-cmp-clickable", "data-cmp-link-accessibility-enabled", "data-cmp-link-accessibility-text", "data-cmp-data-layer-enabled", "data-cmp-is", "data-cmp-hook-carousel", "data-analytics", "data-track"];
      const all = [element, ...element.querySelectorAll("*")];
      all.forEach((el) => {
        ATTRS.forEach((a) => {
          if (el.hasAttribute && el.hasAttribute(a)) el.removeAttribute(a);
        });
        if (el.attributes) {
          Array.from(el.attributes).forEach((attr) => {
            if (/^data-(analytics|track|gtm|cmp-data-layer)/.test(attr.name)) el.removeAttribute(attr.name);
          });
        }
      });
    }
  }

  // tools/importer/transformers/cambriausa-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const matches = Array.from(root.querySelectorAll(sel));
        const el = matches.find((m) => m.closest("main")) || matches[0];
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function styleText(style) {
    if (!style) return "";
    const values = Array.isArray(style) ? style : String(style).split(",");
    return values.map((v) => String(v).trim()).filter(Boolean).join(", ");
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload && payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        const style = styleText(section.style);
        if (i === 0 && !style) continue;
        const hr = doc.createElement("hr");
        if (style) hr.setAttribute(MARKER, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const style = styleText(section.style);
        if (!style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const anchor = marker || findSectionElement(element, section);
        if (!anchor) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style }
        });
        anchor.after(metadata);
        if (marker) {
          if (i === 0) {
            marker.remove();
          } else {
            marker.removeAttribute(MARKER);
          }
        }
      }
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    }
  }

  // tools/importer/transformers/cambriausa-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  var LINKED_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function detectDynamicMediaUrl(urlStr) {
    if (typeof urlStr !== "string") return false;
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return "scene7";
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) return "dm-openapi";
    return false;
  }
  function altToLinkText(alt) {
    return alt && alt.trim() || EMPTY_ALT_SENTINEL;
  }
  function topWrapper(img) {
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_WRAPPER_TAGS.has(parent.tagName)) {
      const ok = Array.from(parent.children).every((c) => c === node || WRAPPER_SIBLING_TAGS.has(c.tagName));
      if (!ok) break;
      node = parent;
      parent = parent.parentElement;
    }
    return node;
  }
  function closestAnchor(node) {
    let p = node.parentElement;
    while (p) {
      if (p.tagName === "A") return p;
      if (p.tagName === "TD" || p.tagName === "TH" || p.tagName === "BODY" || p.tagName === "MAIN") return null;
      p = p.parentElement;
    }
    return null;
  }
  function isSoleContent(anchor, img) {
    if (anchor.textContent.trim() !== "") return false;
    const media = anchor.querySelectorAll("img, video, svg, iframe");
    return media.length === 1 && media[0] === img;
  }
  function getSrc(img) {
    const src = img.getAttribute("src") || "";
    if (detectDynamicMediaUrl(src)) return src;
    const dataSrc = img.getAttribute("data-src") || "";
    if (detectDynamicMediaUrl(dataSrc)) return dataSrc;
    return null;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      if (!img.isConnected) return;
      const dmUrl = getSrc(img);
      if (!dmUrl) return;
      const text = altToLinkText(img.getAttribute("alt"));
      const node = topWrapper(img);
      const anchor = closestAnchor(node);
      if (anchor) {
        if (!isSoleContent(anchor, img)) {
          console.warn(`[cambriausa-dm-images] skipped DM image in mixed-content link: ${dmUrl}`);
          return;
        }
        anchor.setAttribute("title", dmUrl);
        anchor.textContent = text;
        return;
      }
      const a = doc.createElement("a");
      a.setAttribute("href", dmUrl);
      a.textContent = text;
      node.replaceWith(a);
    });
  }

  // tools/importer/import-designs.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-gallery": parse,
    "columns-moodboard": parse2,
    "cards-swatch": parse3,
    "columns-teaser": parse4
  };
  var transformers = [transform, transform2, transform3];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_designs_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_designs_exports);
})();
