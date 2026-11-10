/*
 * Header block
 * Content comes from the nav fragment (nav.plain.html), three sections:
 *   1. utility bar  – link list(s), a search link (becomes a search form), linked badge image
 *   2. brand        – linked logo
 *   3. main nav     – list; items with a nested list open a megamenu panel,
 *                     paragraphs after the nested list form the featured (image + caption) area,
 *                     a <strong> wrapped link without a nested list renders as a CTA button
 */

import { fetchPlaceholders, getBlockContext } from '../../scripts/shared.js';

const DESKTOP = window.matchMedia('(width >= 1200px)');

const SEARCH_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 15.86a1 1 0 0 0-.19.19A7 7 0 1 1 18 11a7 7 0 0 1-1.96 4.86zm5.67 4.43-3.68-3.67A9 9 0 1 0 11 20a9 9 0 0 0 5.62-1.97l3.67 3.68a1 1 0 0 0 1.42-1.42z"/></svg>';

/**
 * Fetch the nav fragment: local preview first, then site root (DA/EDS).
 * Relative media paths are resolved against the fragment URL.
 * @returns {Promise<DocumentFragment|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const tpl = document.createElement('template');
  tpl.innerHTML = await resp.text();
  tpl.content.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
    const value = el.getAttribute(attr);
    if (value && !/^(https?:|data:|\/)/.test(value)) {
      el.setAttribute(attr, new URL(value, resp.url).href);
    }
  });
  return tpl.content;
}

function formatLabel(template, label) {
  return template.includes('{}') ? template.replace('{}', label) : `${template} ${label}`;
}

function closeAll(nav, except) {
  nav.querySelectorAll('.nav-drop.is-open').forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    li.querySelector('.nav-drop-toggle')?.setAttribute('aria-expanded', 'false');
  });
}

function setOpen(li, open) {
  li.classList.toggle('is-open', open);
  li.querySelector('.nav-drop-toggle')?.setAttribute('aria-expanded', String(open));
}

/**
 * Turn the search link into a search form.
 * The link text is the placeholder/label, the link URL is the form action
 * and its query parameters become hidden fields.
 */
function buildSearch(p, labels) {
  const link = p.querySelector('a');
  const url = new URL(link.href, window.location.href);
  const label = link.textContent.trim();

  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = url.pathname;
  form.method = 'get';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', labels.searchSubmit || label);
  submit.innerHTML = SEARCH_ICON;

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'query';
  input.className = 'nav-search-input';
  input.placeholder = label;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', label);

  form.append(submit, input);
  url.searchParams.forEach((value, key) => {
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = key;
    hidden.value = value;
    form.append(hidden);
  });
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) e.preventDefault();
  });
  p.replaceWith(form);
  return form;
}

function decorateUtility(section, labels) {
  section.className = 'nav-utility';
  const lists = [...section.querySelectorAll(':scope > ul')];
  lists.forEach((ul, i) => ul.classList.add('nav-utility-links', i === 0 ? 'nav-utility-primary' : 'nav-utility-secondary'));
  const searchP = [...section.querySelectorAll(':scope > p')].find((p) => p.querySelector('a[href*="search"]') && !p.querySelector('img'));
  if (searchP) buildSearch(searchP, labels);
  lists.forEach((ul) => ul.querySelectorAll('a').forEach((a) => a.classList.add('nav-utility-link')));
  section.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.querySelector('img')) return;
    p.classList.add('nav-utility-badge');
    p.querySelector('a')?.classList.add('nav-utility-badge-link');
  });

  // group everything after the first list on the right side
  const right = document.createElement('div');
  right.className = 'nav-utility-end';
  [...section.children].slice(1).forEach((child) => right.append(child));
  section.append(right);
}

let panelCount = 0;

function decorateDrop(li, nav, labels) {
  const trigger = li.querySelector(':scope > p > a, :scope > a');
  const submenu = li.querySelector(':scope > ul');
  if (!trigger || !submenu) return;

  panelCount += 1;
  const panelId = `nav-panel-${panelCount}`;
  li.classList.add('nav-drop');
  trigger.classList.add('nav-drop-link');
  const wrap = trigger.closest('p');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-drop-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panelId);
  toggle.setAttribute('aria-label', formatLabel(labels.toggleSubmenu, trigger.textContent.trim()));

  // panel: link list + featured (image/caption) area
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = panelId;
  submenu.classList.add('nav-panel-links');
  submenu.querySelectorAll('a').forEach((a) => a.classList.add('nav-panel-link'));
  const feature = document.createElement('div');
  feature.className = 'nav-panel-feature';
  [...li.children].filter((el) => el !== wrap && el !== submenu && el.tagName === 'P')
    .forEach((p) => {
      if (p.querySelector('img')) {
        p.classList.add('nav-panel-image');
        p.querySelector('a')?.classList.add('nav-panel-image-link');
        p.querySelectorAll('img').forEach((img) => {
          img.loading = 'lazy';
          img.width = 850;
          img.height = 478;
        });
      } else {
        p.classList.add('nav-panel-caption');
        p.querySelector('a')?.classList.add('nav-panel-caption-link');
      }
      feature.append(p);
    });
  panel.append(submenu);
  if (feature.children.length) panel.append(feature);

  // flatten: li > trigger link + toggle + panel
  li.prepend(trigger, toggle);
  wrap?.remove();
  li.append(panel);

  li.addEventListener('mouseenter', () => {
    if (!DESKTOP.matches) return;
    closeAll(nav, li);
    setOpen(li, true);
  });
  li.addEventListener('mouseleave', () => {
    if (DESKTOP.matches) setOpen(li, false);
  });
  li.addEventListener('focusout', (e) => {
    if (DESKTOP.matches && !li.contains(e.relatedTarget)) setOpen(li, false);
  });
  toggle.addEventListener('click', () => {
    const open = !li.classList.contains('is-open');
    closeAll(nav, li);
    setOpen(li, open);
  });
  li.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && li.classList.contains('is-open')) {
      setOpen(li, false);
      trigger.focus();
    }
  });
}

function decorateMainNav(section, nav, labels) {
  section.className = 'nav-sections';
  const list = section.querySelector(':scope > ul');
  if (!list) return;
  list.classList.add('nav-list');
  [...list.children].forEach((li) => {
    li.classList.add('nav-item');
    if (li.querySelector(':scope > ul')) {
      decorateDrop(li, nav, labels);
    } else if (li.querySelector('strong a, a strong')) {
      li.classList.add('nav-cta');
      const link = li.querySelector('a');
      link.classList.add('nav-cta-link');
      // flatten li > p > strong > a into li > a (styling comes from the class)
      li.replaceChildren(link);
    }
  });
}

function toggleMenu(nav, hamburger, labels, force) {
  const open = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? labels.closeMenu : labels.openMenu);
  document.body.style.overflowY = open && !DESKTOP.matches ? 'hidden' : '';
  if (!open) closeAll(nav);
}

/**
 * Desktop shows search, contact links and badge in the utility bar;
 * on mobile the same nodes move into the menu drawer (no duplicated content).
 */
function placeUtilityItems(nav) {
  const end = nav.querySelector('.nav-utility-end');
  const top = nav.querySelector('.nav-drawer-top');
  const bottom = nav.querySelector('.nav-drawer-bottom');
  if (!end || !top || !bottom) return;
  const items = [
    nav.querySelector('.nav-search'),
    nav.querySelector('.nav-utility-secondary'),
    nav.querySelector('.nav-utility-badge'),
  ];
  if (DESKTOP.matches) {
    end.append(...items.filter(Boolean));
  } else {
    const [search, ...rest] = items;
    if (search) top.append(search);
    bottom.append(...rest.filter(Boolean));
  }
}

/** @param {Element} block */
export default async function decorate(block) {
  const { eventRoot } = getBlockContext(block);
  const [fragment, placeholders] = await Promise.all([fetchNav(), fetchPlaceholders()]);
  if (!fragment) return;

  const labels = {
    navigation: placeholders.mainNavigation || 'Main navigation',
    openMenu: placeholders.openMenu || 'Open menu',
    closeMenu: placeholders.closeMenu || 'Close menu',
    toggleSubmenu: placeholders.toggleSubmenu || 'Show submenu for',
    searchSubmit: placeholders.searchSubmit || '',
  };

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', labels.navigation);
  nav.setAttribute('aria-expanded', 'false');

  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const [utility, brand, main] = sections;

  if (utility) decorateUtility(utility, labels);
  if (brand) {
    brand.className = 'nav-brand';
    brand.querySelector('a')?.classList.add('nav-brand-link');
  }
  if (main) decorateMainNav(main, nav, labels);

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav-menu');
  hamburger.innerHTML = '<span class="nav-hamburger-icon" aria-hidden="true"></span>';

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const barInner = document.createElement('div');
  barInner.className = 'nav-bar-inner';
  if (brand) barInner.append(brand);
  barInner.append(hamburger);
  if (main) {
    main.id = 'nav-menu';
    const drawerTop = document.createElement('div');
    drawerTop.className = 'nav-drawer-top';
    const drawerBottom = document.createElement('div');
    drawerBottom.className = 'nav-drawer-bottom';
    main.prepend(drawerTop);
    main.append(drawerBottom);
    barInner.append(main);
  }
  bar.append(barInner);

  if (utility) nav.append(utility);
  nav.append(bar);

  hamburger.addEventListener('click', () => toggleMenu(nav, hamburger, labels));
  toggleMenu(nav, hamburger, labels, false);
  placeUtilityItems(nav);

  eventRoot.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!DESKTOP.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, hamburger, labels, false);
      hamburger.focus();
    }
  });
  eventRoot.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAll(nav);
  });

  // reset state when crossing the desktop breakpoint
  DESKTOP.addEventListener('change', () => {
    toggleMenu(nav, hamburger, labels, false);
    placeUtilityItems(nav);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.textContent = '';
  block.append(wrapper);
}
