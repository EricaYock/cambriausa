import { fetchPlaceholders } from '../../scripts/shared.js';

/** Scroll distance (px) after which the back-to-top button is revealed. */
const BACK_TO_TOP_OFFSET = 400;

/** Desktop layout breakpoint (matches footer.css). */
const DESKTOP_MQ = window.matchMedia('(width >= 900px)');

/** Sections rendered in the wide primary column; everything else goes to the aside. */
const PRIMARY_TYPES = ['links', 'notice', 'legal'];

/**
 * Fetches the footer fragment. Metadata-independent: tries the local preview
 * path first (aem up serves content/ under /content), then the site root
 * used by Document Authoring / Edge Delivery.
 * @returns {Promise<{html: string, base: URL}|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(resp.url, window.location.href) };
}

/**
 * Resolves relative media references against the fragment URL so the footer
 * renders identically on every page depth.
 * @param {Element} root
 * @param {URL} base
 */
function resolveMedia(root, base) {
  const isRelative = (value) => value && !/^([a-z]+:|\/\/|\/)/i.test(value);
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (isRelative(src)) img.src = new URL(src, base).href;
  });
  root.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset');
    if (isRelative(srcset)) source.srcset = new URL(srcset, base).href;
  });
}

/**
 * Authoring fallback: an image followed by a bare URL link in the same
 * paragraph becomes a linked image.
 * @param {Element} section
 */
function linkStandaloneImages(section) {
  section.querySelectorAll('p').forEach((p) => {
    const media = p.querySelector(':scope > picture, :scope > img');
    const link = p.querySelector(':scope > a');
    if (media && link && !link.querySelector('img') && link.textContent.trim() === link.href) {
      link.textContent = '';
      link.append(media);
    }
  });
}

/**
 * Classifies a fragment section by its content shape.
 * @param {Element} section
 * @returns {'links'|'social'|'logos'|'cta'|'notice'|'legal'}
 */
function classifySection(section) {
  const links = [...section.querySelectorAll('a')];
  const imageOnly = links.length > 0
    && !section.textContent.trim()
    && links.every((a) => a.querySelector('img'));
  if (section.querySelector('h1, h2, h3, h4, h5, h6')) return 'links';
  if (imageOnly) return section.querySelector('ul') ? 'social' : 'logos';
  if (section.querySelector('strong a, em a')) return 'cta';
  if (section.querySelector('img')) return 'notice';
  return 'legal';
}

/**
 * Groups each heading with the list that follows it into a column.
 * @param {Element} section
 */
function buildLinkColumns(section) {
  const columns = document.createElement('div');
  columns.className = 'footer-link-columns';
  let column = null;
  [...section.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName) || !column) {
      column = document.createElement('div');
      column.className = 'footer-link-column';
      columns.append(column);
    }
    column.append(child);
  });
  section.append(columns);
}

/**
 * Collapses link columns into independent accordions below the desktop
 * breakpoint; on desktop the headings are plain text and lists are shown.
 * @param {Element} section
 */
function setupLinkAccordions(section) {
  const groups = [...section.querySelectorAll('.footer-link-column')].map((column, i) => {
    const heading = column.querySelector('h1, h2, h3, h4, h5, h6');
    const list = column.querySelector('ul');
    if (!heading || !list) return null;
    if (!list.id) list.id = `footer-links-${i + 1}`;
    return {
      column, heading, list, label: heading.textContent.trim(),
    };
  }).filter(Boolean);

  const apply = () => groups.forEach(({
    column, heading, list, label,
  }) => {
    column.classList.remove('is-open');
    if (DESKTOP_MQ.matches) {
      heading.textContent = label;
      list.hidden = false;
      return;
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'footer-accordion-toggle';
    toggle.textContent = label;
    toggle.setAttribute('aria-controls', list.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      column.classList.toggle('is-open', open);
      list.hidden = !open;
    });
    heading.replaceChildren(toggle);
    list.hidden = true;
  });

  apply();
  DESKTOP_MQ.addEventListener('change', apply);
}

/**
 * Flags list items that end a wrapped row so their trailing separator can be hidden.
 * @param {Element} list
 */
function trackRowEnds(list) {
  const mark = () => {
    const items = [...list.children];
    items.forEach((item, i) => {
      const next = items[i + 1];
      item.classList.toggle('is-row-end', !next || next.offsetTop !== item.offsetTop);
    });
  };
  new ResizeObserver(mark).observe(list);
}

/**
 * Turns emphasised links into button-styled call-to-action links.
 * @param {Element} section
 */
function buildCta(section) {
  section.querySelectorAll('strong > a, em > a').forEach((a) => {
    const wrapper = a.parentElement;
    a.classList.add('footer-button');
    wrapper.replaceWith(a);
  });
}

/**
 * Opens links to other origins in a new tab and announces it to screen readers.
 * @param {Element} root
 * @param {string} label screen-reader suffix
 */
function decorateExternalLinks(root, label) {
  root.querySelectorAll('a[href]').forEach((a) => {
    let url;
    try {
      url = new URL(a.href, window.location.href);
    } catch (e) {
      return;
    }
    if (!/^https?:$/.test(url.protocol) || url.origin === window.location.origin) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const hint = document.createElement('span');
    hint.className = 'footer-sr-only';
    hint.textContent = label;
    a.append(hint);
  });
}

/**
 * Builds the fixed back-to-top control.
 * @param {string} label accessible name
 * @returns {HTMLButtonElement}
 */
function buildBackToTop(label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-back-to-top';
  button.setAttribute('aria-label', label);
  button.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  const update = () => button.classList.toggle('is-visible', window.scrollY > BACK_TO_TOP_OFFSET);
  window.addEventListener('scroll', update, { passive: true });
  update();
  return button;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  let sections;
  if (block.textContent.trim() === '') {
    const fragment = await fetchFooterFragment();
    if (!fragment) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = fragment.html;
    resolveMedia(tpl.content, fragment.base);
    sections = [...tpl.content.children].filter((el) => el.tagName === 'DIV');
  } else {
    sections = [...block.querySelectorAll(':scope > div')];
  }

  const placeholders = await fetchPlaceholders();
  const labels = {
    newTab: placeholders.opensInANewTab || 'opens in a new tab',
    backToTop: placeholders.backToTop || 'Back to Top',
  };

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const primary = document.createElement('div');
  primary.className = 'footer-primary';
  const aside = document.createElement('div');
  aside.className = 'footer-aside';

  sections.forEach((section) => {
    linkStandaloneImages(section);
    const type = classifySection(section);
    section.className = `footer-section footer-${type}`;
    if (type === 'links') {
      buildLinkColumns(section);
      setupLinkAccordions(section);
    }
    if (type === 'legal') section.querySelectorAll('ul').forEach(trackRowEnds);
    if (type === 'cta') buildCta(section);
    (PRIMARY_TYPES.includes(type) ? primary : aside).append(section);
  });

  inner.append(primary, aside);
  decorateExternalLinks(inner, labels.newTab);
  block.replaceChildren(inner, buildBackToTop(labels.backToTop));
}
