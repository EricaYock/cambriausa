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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  var SOURCE_ORIGIN = "https://www.cambriausa.com";
  function absolute(url) {
    if (!url) return "";
    try {
      return new URL(url, SOURCE_ORIGIN).href;
    } catch (e) {
      return url;
    }
  }
  function buildHeading(document, source, tag) {
    const heading = document.createElement(tag);
    const inner = source.querySelector(":scope > p");
    heading.innerHTML = (inner || source).innerHTML.trim();
    return heading;
  }
  function parse(element, { document }) {
    const video = element.querySelector("video.cmp-teaser-video__player, video");
    const mediaCell = [];
    if (video) {
      const posterSrc = video.getAttribute("poster") || video.getAttribute("data-poster");
      if (posterSrc) {
        const poster = document.createElement("img");
        poster.src = absolute(posterSrc);
        poster.alt = video.getAttribute("name") || "";
        mediaCell.push(poster);
      }
      const videoSrc = video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src");
      if (videoSrc) {
        const href = absolute(videoSrc);
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        p.append(a);
        mediaCell.push(p);
      }
    }
    const contentCell = [];
    const content = element.querySelector(".cmp-teaser__content");
    if (content) {
      const logo = content.querySelector("img.cmp-teaser__pretitle-image__desktop") || content.querySelector("img.cmp-teaser__pretitle-image__mobile");
      if (logo) contentCell.push(logo);
      const title = content.querySelector(".cmp-teaser__title");
      if (title) contentCell.push(buildHeading(document, title, "h1"));
      const description = content.querySelector(".cmp-teaser__description");
      if (description) {
        description.querySelectorAll(":scope > *").forEach((el) => contentCell.push(el));
      }
      content.querySelectorAll(".cmp-teaser__action-container a.cmp-teaser__action-link").forEach((link) => {
        const label = link.querySelector(".cmp-button__text");
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = (label || link).textContent.trim();
        p.append(a);
        contentCell.push(p);
      });
    }
    const cells = [];
    if (mediaCell.length) cells.push([mediaCell]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-swatch.js
  var ORIGIN = "https://www.cambriausa.com";
  function absolute2(url) {
    if (!url) return url;
    try {
      return new URL(url, ORIGIN).href;
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
        out.src = absolute2(img.getAttribute("src"));
        out.alt = img.getAttribute("alt") || "";
        imageCell = [out];
      }
      let textCell = "";
      if (name) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = href.startsWith("/") ? href : absolute2(href).replace(/^https:\/\/www\.cambriausa\.com/, "");
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
  function parse2(element, { document }) {
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

  // tools/importer/parsers/hero-gradient.js
  function buildHeading2(document, source) {
    const tag = /^H[1-6]$/.test(source.tagName) ? source.tagName.toLowerCase() : "h2";
    const heading = document.createElement(tag);
    const inner = source.querySelector(":scope > p");
    heading.innerHTML = (inner || source).innerHTML.trim();
    return heading;
  }
  function parse3(element, { document }) {
    const img = element.querySelector(".cmp-teaser__image--desktop img") || element.querySelector(".cmp-teaser__image--mobile img") || element.querySelector(".cmp-teaser__image img");
    const contentCell = [];
    const content = element.querySelector(".cmp-teaser__content");
    if (content) {
      const title = content.querySelector(".cmp-teaser__title");
      if (title) contentCell.push(buildHeading2(document, title));
      content.querySelectorAll(".cmp-teaser__description > *").forEach((el) => contentCell.push(el));
      content.querySelectorAll(".cmp-teaser__action-container a.cmp-teaser__action-link").forEach((link) => {
        const label = link.querySelector(".cmp-button__text");
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = (label || link).textContent.trim();
        p.append(a);
        contentCell.push(p);
      });
    }
    const cells = [];
    if (img) cells.push([[img]]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-gradient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-overlay.js
  var TEASER = ".teaser.cmp-teaser__hover-zoom";
  var MERGED_ATTR = "data-cards-overlay-merged";
  function isSkippable(el) {
    return el.matches(".separator, hr") || !el.textContent.trim() && !el.querySelector("img, picture, video, a[href]");
  }
  function collectTeasers(element) {
    const teasers = [element];
    const container = element.closest(".cmp-container__full-width");
    if (container) {
      container.querySelectorAll(TEASER).forEach((t) => {
        if (!teasers.includes(t)) teasers.push(t);
      });
    }
    let sibling = (container || element).nextElementSibling;
    while (sibling) {
      let found = [];
      if (sibling.matches(TEASER)) found = [sibling];
      else found = [...sibling.querySelectorAll(TEASER)];
      if (found.length) {
        found.forEach((t) => {
          if (!teasers.includes(t)) teasers.push(t);
        });
      } else if (!isSkippable(sibling)) {
        break;
      }
      sibling = sibling.nextElementSibling;
    }
    return teasers;
  }
  function buildRow(document, teaser) {
    const img = teaser.querySelector(".cmp-teaser__image img, .cmp-image img");
    const titleEl = teaser.querySelector(".cmp-teaser__title");
    const link = teaser.querySelector("a.cmp-teaser__link[href], a[href]");
    const textCell = [];
    if (titleEl) {
      const tag = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h3";
      const heading = document.createElement(tag);
      const text = titleEl.textContent.replace(/\s+/g, " ").trim();
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = text;
        heading.append(a);
      } else {
        heading.textContent = text;
      }
      textCell.push(heading);
    }
    if (!img && !textCell.length) return null;
    return [img ? [img] : "", textCell.length ? textCell : ""];
  }
  function parse4(element, { document }) {
    if (element.hasAttribute(MERGED_ATTR)) {
      element.remove();
      return;
    }
    const teasers = collectTeasers(element);
    const cells = [];
    teasers.forEach((teaser) => {
      const row = buildRow(document, teaser);
      if (row) cells.push(row);
    });
    teasers.slice(1).forEach((teaser) => {
      teaser.setAttribute(MERGED_ATTR, "true");
      const container = teaser.closest(".cmp-container__full-width");
      teaser.remove();
      if (container && container.isConnected && !container.querySelector(TEASER) && !container.textContent.trim() && !container.querySelector("img, picture, video")) {
        container.remove();
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-preview.js
  function parse5(element, { document }) {
    const allSlides = [...element.querySelectorAll(".teaser-carousel-slide-component")];
    let slides = allSlides.filter((s) => !s.classList.contains("clone"));
    if (!slides.length) slides = allSlides;
    const seen = /* @__PURE__ */ new Set();
    slides = slides.filter((slide) => {
      const title = slide.querySelector(".teaser-carousel-slide__title");
      const cta = slide.querySelector("a[href]");
      const key = `${title ? title.textContent.trim() : ""}|${cta ? cta.getAttribute("href") : ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const slideImage = (slide) => {
      const existing = slide.querySelector("img");
      if (existing) return existing;
      const wrapper = slide.querySelector(".teaser-carousel-slide__content-wrapper") || slide;
      let src = wrapper.getAttribute("data-background-image");
      if (!src) {
        const style = wrapper.getAttribute("style") || "";
        const match = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (match) [, src] = match;
      }
      if (!src) return null;
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      return img;
    };
    const cells = [];
    slides.forEach((slide) => {
      const img = slideImage(slide);
      const title = slide.querySelector(".teaser-carousel-slide__title");
      const description = slide.querySelector(".teaser-carousel-slide__description");
      const cta = slide.querySelector("a.teaser-carousel-slide__cta[href], .slide-cta-container a[href]");
      const textCell = [];
      if (title) {
        const tag = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : "h3";
        const heading = document.createElement(tag);
        heading.textContent = title.textContent.replace(/\s+/g, " ").trim();
        textCell.push(heading);
      }
      if (description) {
        const p = document.createElement("p");
        p.innerHTML = description.innerHTML.trim();
        textCell.push(p);
      }
      if (cta) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        textCell.push(p);
      }
      if (!img && !textCell.length) return;
      cells.push([img ? [img] : "", textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-preview", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
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
  function shopLinkParagraph(document, link) {
    const text = link.textContent.replace(/\s+/g, " ").trim();
    if (!text) return null;
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = shopAbsolute2(link.getAttribute("href"));
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parseShopCards(element, document) {
    const cells = [];
    element.querySelectorAll(":scope > li.multi-column").forEach((li) => {
      const card = li.querySelector(".card") || li;
      const img = card.querySelector("img");
      const src = shopImageSrc2(img);
      let imageCell = "";
      if (src) {
        const out = document.createElement("img");
        out.src = src;
        out.alt = (img.getAttribute("alt") || "").trim();
        imageCell = [out];
      }
      const textCell = [];
      const title = card.querySelector(".card__title");
      if (title && title.textContent.trim()) {
        const tag = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : "h3";
        const heading = document.createElement(tag);
        heading.textContent = title.textContent.replace(/\s+/g, " ").trim();
        textCell.push(heading);
      }
      const rte = card.querySelector(".card__rte");
      if (rte) {
        rte.querySelectorAll(":scope > p, :scope > ul, :scope > ol").forEach((el) => {
          const links = [...el.querySelectorAll("a[href]")];
          const linkOnly = el.tagName === "P" && links.length === 1 && links[0].textContent.trim() === el.textContent.trim();
          if (linkOnly) {
            const p = shopLinkParagraph(document, links[0]);
            if (p) textCell.push(p);
            return;
          }
          if (!el.textContent.trim()) return;
          links.forEach((a) => a.setAttribute("href", shopAbsolute2(a.getAttribute("href"))));
          textCell.push(el);
        });
      }
      card.querySelectorAll("a.card__button[href]").forEach((link) => {
        if (link.closest("p")) return;
        const p = shopLinkParagraph(document, link);
        if (p) textCell.push(p);
      });
      if (!imageCell && !textCell.length) return;
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    return cells;
  }
  function parse6(element, { document }) {
    if (element.querySelector(":scope > li.multi-column")) {
      const shopCells = parseShopCards(element, document);
      const shopBlock = WebImporter.Blocks.createBlock(document, { name: "cards-teaser", cells: shopCells });
      element.replaceWith(shopBlock);
      return;
    }
    const cells = [];
    element.querySelectorAll(".teaser").forEach((teaser) => {
      const img = teaser.querySelector(".cmp-teaser__image img, .cmp-image img");
      const title = teaser.querySelector(".cmp-teaser__title");
      const descriptions = teaser.querySelectorAll(".cmp-teaser__description > *");
      const links = teaser.querySelectorAll(".cmp-teaser__action-container a.cmp-teaser__action-link[href]");
      const textCell = [];
      if (title) {
        const tag = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : "h3";
        const heading = document.createElement(tag);
        heading.textContent = title.textContent.replace(/\s+/g, " ").trim();
        textCell.push(heading);
      }
      descriptions.forEach((el) => textCell.push(el));
      links.forEach((link) => {
        const label = link.querySelector(".cmp-button__text");
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = (label || link).textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        textCell.push(p);
      });
      if (!img && !textCell.length) return;
      cells.push([img ? [img] : "", textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-teaser", cells });
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-video": parse,
    "cards-swatch": parse2,
    "hero-gradient": parse3,
    "cards-overlay": parse4,
    "carousel-preview": parse5,
    "cards-teaser": parse6
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
