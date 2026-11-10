/* eslint-disable */
/* global WebImporter */

/**
 * Cambria USA cleanup transformer.
 *
 * Strips non-authorable AEM (Core Components) site chrome shared by all
 * www.cambriausa.com templates (home, designs, ...): global header/footer
 * experience fragments, cookie banner, skip link, Back to Top button,
 * separator spacers, empty embeds / experience fragments, hidden
 * responsive-grid columns, third-party iframes/pixels and tracking attributes.
 */

// Chrome removed before parsing (affects block / default-content matching).
const CHROME_SELECTORS = [
  // Global header / footer experience fragments + navigation
  'header',
  'footer',
  'nav',
  '.cmp-experiencefragment--header',
  '.cmp-experiencefragment--footer',
  // Cookie consent + skip link
  '#cookiebanner',
  '#CybotCookiebotDialog',
  '.skip-to-main-content',
  // Back to Top button (global UI)
  '.back-to-top',
  '#backToTop',
  '.sr-only-back-to-top-btn',
  // Separator spacers (their <hr> would otherwise become section breaks)
  '.separator',
  '.cmp-separator',
  // Breadcrumbs (designs template)
  '.breadcrumb',
  '.cmp-breadcrumb',
  // Third-party / empty widget containers
  '#root-sketchfab',
  '#root-sketchfab-contstraints',
  '.emplifi-wrapper',
  '#pixlee_container',
  '[id^="batBeacon"]',
  'iframe',
  'script',
  'style',
  'noscript',
  'link',
];

// Designs (PDP) template: JS-only tools, gallery chrome and hidden duplicates.
const PDP_SELECTORS = [
  // Mobile duplicate of the H1 + series logo (desktop copy lives in .pdp-heading)
  '.pdp-wrapper__left .pdp-title-container.mobile-header',
  // "See it in your room" (Roomvo) / "See it in 3D" (Sketchfab) - JS overlays, no URL
  '.roomvo-sketchfab-container',
  '.roomvo-container',
  '.sketchfab-container',
  // Gallery controls: arrows, "Open in Full", "View All", progress counter / bars
  '.pdp-carousel__btn',
  '.pdp-carousel__actions',
  '.pdp-carousel__view-all',
  '.pdp-carousel__progress-counter',
  '.pdp-carousel__content__progress-container',
  '.slick-arrow',
  // Slick infinite-loop clones (duplicate slides)
  '.slick-slide.slick-cloned',
  // Hidden duplicate finish links (syndicated-show is the visible copy)
  '.syndicated-hide',
];

// Shopify storefront (shop.cambriausa.com, e.g. collections template):
// theme chrome, commerce widgets and app embeds. Applied only on Shopify pages.
const SHOP_SELECTORS = [
  // Global theme sections: header, footer, cart drawer, product compare
  '.shopify-section-group-header-group',
  '.shopify-section-group-footer-group',
  '.shopify-section-group-overlay-group',
  '.cc-header',
  '.cc-footer',
  '.cc-cart-drawer',
  '.cc-compare',
  'cart-drawer',
  'quick-add-drawer',
  'body > .overlay',
  'shop-cart-sync',
  'a.skip-link',
  // App embeds / pixels / consent
  '#pop-convert-app',
  '[id^="shopify-block-AOUhadktlbTJPcUMyU__"]',
  '#web-pixels-manager-sandbox-container',
  'iframe[id^="web-pixel-sandbox"]',
  'iframe.CybotCookiebotHiddenIframe',
  'iframe.CybotCookiebotOffscreenIframe',
  'iframe#db-sync',
  'img#db_lr_pixel_ad',
  // Collection listing tools: toolbar, pagination, divider
  '#products-toolbar',
  'products-toolbar',
  '#filter-results > nav',
  'hr.js-hidden',
  // Slider arrow buttons
  '.slider-nav',
  // Product card commerce UI: hover image, quick add (Add to cart / View details), empty prices
  'img.card__hover-image',
  '.card__quick-add',
  'button.js-quick-add',
  'a.quick-add-view-btn',
  '.price__no-variant',
  // FAQ disclosure +/- icons (inline SVG data URIs)
  '.cc-faq .disclosure__toggle',
];

const SHOP_HIDDEN_LABELS = /^(choose options|unit price)$/i;
const SHOP_CTA_LABELS = /^(add to cart|view details)$/i;

function isShopifyPage(root) {
  return !!root.querySelector('.shopify-section, [id^="shopify-section-"]');
}

function isDataUri(value) {
  return /^data:/i.test((value || '').trim());
}

function absolutizeProtocol(url) {
  return url && url.startsWith('//') ? `https:${url}` : url;
}

/** Largest candidate of a srcset (by w / x descriptor; last wins on ties). */
function largestSrcsetCandidate(srcset) {
  if (!srcset) return '';
  let best = '';
  let bestSize = -1;
  srcset.split(/,\s+(?=\S)/).forEach((part) => {
    const [url, descriptor = ''] = part.trim().split(/\s+/);
    if (!url || isDataUri(url)) return;
    const size = parseFloat(descriptor) || 0;
    if (size >= bestSize) {
      best = url;
      bestSize = size;
    }
  });
  return best;
}

/**
 * Lazy-loaded images: when src is missing or a data: URI placeholder, promote
 * the real URL (currentSrc / data-src / data-srcset / srcset / <source>) into
 * src. Protocol-relative //cdn URLs become https. No-op for images without a
 * lazy source (e.g. home / designs pages).
 */
function promoteLazyImages(root) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src && !isDataUri(src)) {
      if (src.startsWith('//')) img.setAttribute('src', absolutizeProtocol(src));
      return;
    }
    const picture = img.parentElement && img.parentElement.tagName === 'PICTURE' ? img.parentElement : null;
    const sourceSet = picture
      ? Array.from(picture.querySelectorAll('source'))
        .map((s) => s.getAttribute('srcset') || s.getAttribute('data-srcset'))
        .find(Boolean)
      : '';
    const candidates = [
      img.currentSrc,
      img.getAttribute('data-src'),
      largestSrcsetCandidate(img.getAttribute('data-srcset')),
      largestSrcsetCandidate(img.getAttribute('srcset')),
      largestSrcsetCandidate(sourceSet),
    ];
    const real = candidates.find((c) => c && !isDataUri(c));
    if (real) img.setAttribute('src', absolutizeProtocol(real.trim()));
  });
}

/** Breadcrumb <nav> -> "Home > Current page" paragraph (default content). */
function breadcrumbToParagraph(root) {
  const doc = root.ownerDocument;
  root.querySelectorAll('nav.breadcrumbs').forEach((nav) => {
    const links = Array.from(nav.querySelectorAll('a[href]'));
    if (!links.length) {
      nav.remove();
      return;
    }
    const p = doc.createElement('p');
    links.forEach((link, i) => {
      if (i > 0) p.append(' > ');
      const a = doc.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = link.textContent.trim();
      p.append(a);
    });
    nav.replaceWith(p);
  });
}

/**
 * FAQ heading is a second <h1> in the source (rich-text section right before
 * the FAQ section). Demote it to <h2> when another H1 precedes it.
 */
function demoteFaqHeading(root) {
  const doc = root.ownerDocument;
  root.querySelectorAll('.cc-faq').forEach((faq) => {
    const prev = faq.previousElementSibling;
    if (!prev || !prev.classList.contains('cc-rich-text')) return;
    prev.querySelectorAll('h1').forEach((h1) => {
      const firstH1 = root.querySelector('h1');
      if (firstH1 === h1) return;
      const h2 = doc.createElement('h2');
      while (h1.firstChild) h2.append(h1.firstChild);
      h1.replaceWith(h2);
    });
  });
}

function cleanupShopify(root) {
  // Facets first: their <details-disclosure> filters must not be treated as content.
  root.querySelectorAll('facet-filters#facet-filters, #facet-filters').forEach((el) => el.remove());

  breadcrumbToParagraph(root);
  removeAll(root, SHOP_SELECTORS);

  // Inline SVG sprite / pixel images directly under <body>
  root.querySelectorAll(':scope > img').forEach((img) => {
    if (isDataUri(img.getAttribute('src'))) img.remove();
  });

  // Custom-liquid spacer sections holding only a decorative <hr>
  root.querySelectorAll('.cc-custom-liquid').forEach((el) => {
    if (el.querySelector('hr') && isEmptyNode(el)) el.remove();
  });

  // Screen-reader-only commerce labels
  root.querySelectorAll('.visually-hidden').forEach((el) => {
    if (SHOP_HIDDEN_LABELS.test(el.textContent.trim())) el.remove();
  });

  // Remaining "Add to cart" buttons / "View details" links
  root.querySelectorAll('button, a').forEach((el) => {
    if (el.isConnected && SHOP_CTA_LABELS.test(el.textContent.trim())) el.remove();
  });

  // Empty unit price / compare-at price
  root.querySelectorAll('.unit-price').forEach((el) => {
    const price = el.querySelector('.unit-price__price');
    if (!price || !price.textContent.trim()) el.remove();
  });
  root.querySelectorAll('.price__was').forEach((el) => {
    if (!el.textContent.trim()) el.remove();
  });

  demoteFaqHeading(root);
}

function isEmptyNode(el) {
  return !el.textContent.trim()
    && !el.querySelector('img, picture, video, iframe, svg, source, a[href]');
}

/**
 * AEM responsive grid: `aem-GridColumn--default--hide` hides a column at the
 * default breakpoint. Without a phone-specific override it is never rendered
 * (e.g. the alternate "Introducing Four New Quartz Designs" fragment).
 */
function isHiddenGridColumn(el) {
  const cls = Array.from(el.classList);
  if (!cls.includes('aem-GridColumn--default--hide')) return false;
  const phoneOverride = cls.some((c) => c.startsWith('aem-GridColumn--phone--')
    && c !== 'aem-GridColumn--phone--hide');
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

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Shopify storefront first: the breadcrumb <nav> must become a paragraph
    // before the generic 'nav' chrome removal below.
    if (isShopifyPage(element)) cleanupShopify(element);

    // Lazy images (all templates; no-op without data-src / srcset)
    promoteLazyImages(element);

    // Designs: hidden duplicate of the authored PDP content rendered outside
    // <main> (would otherwise double every section / block match).
    element.querySelectorAll('#design-palette__pdp-authored').forEach((el) => {
      if (!el.closest('main')) el.remove();
    });

    removeAll(element, CHROME_SELECTORS);
    removeAll(element, PDP_SELECTORS);

    // JS-only toggle buttons with no destination (e.g. disclaimer "Show more")
    element.querySelectorAll('.button > a.cmp-button:not([href])').forEach((a) => {
      a.parentElement.remove();
    });

    // Designs: authored-content segments left empty once separators are gone
    element.querySelectorAll('.aem-authored-content-segment').forEach((el) => {
      if (el.isConnected && isEmptyNode(el)) el.remove();
    });

    // Hidden responsive-grid columns (zero-height alternate content)
    element.querySelectorAll('[class*="aem-GridColumn--default--hide"]').forEach((el) => {
      if (isHiddenGridColumn(el)) el.remove();
    });

    // Empty embeds (e.g. Marketo form placeholder with no content)
    element.querySelectorAll('.embed, .cmp-embed').forEach((el) => {
      if (el.isConnected && isEmptyNode(el)) el.remove();
    });

    // Empty experience fragments (zero-height placeholders)
    element.querySelectorAll('.experiencefragment, .cmp-experiencefragment').forEach((el) => {
      if (el.isConnected && isEmptyNode(el)) el.remove();
    });

    // Tracking pixels (1x1 beacons)
    element.querySelectorAll('img[src*="bat.bing.com"], img[src*="adsrvr.org"], img[src*="facebook.com/tr"]').forEach((img) => img.remove());
  }

  if (hookName === 'afterTransform') {
    // Leftover interactive / decorative chrome after parsers ran.
    removeAll(element, [
      'header',
      'footer',
      'nav',
      'iframe',
      'script',
      'style',
      'noscript',
      'link',
      '.white-bar-container',
      '.material-symbols-outlined',
      '.material-icons',
    ]);

    // Icon-only controls (video play/pause toggles, carousel arrows)
    element.querySelectorAll('button').forEach((btn) => {
      if (!btn.textContent.trim() && !btn.querySelector('img')) btn.remove();
    });

    // Tracking / framework attributes
    const ATTRS = ['onclick', 'onload', 'data-cmp-data-layer', 'data-cmp-clickable', 'data-cmp-link-accessibility-enabled', 'data-cmp-link-accessibility-text', 'data-cmp-data-layer-enabled', 'data-cmp-is', 'data-cmp-hook-carousel', 'data-analytics', 'data-track'];
    const all = [element, ...element.querySelectorAll('*')];
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
