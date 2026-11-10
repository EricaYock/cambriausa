/* eslint-disable */
/* global WebImporter */

/**
 * Cambria USA Dynamic Media / Scene7 image transformer (afterTransform only).
 *
 * Rewrites <img src="https://cambriausa.scene7.com/is/image/..."> into anchors
 * that survive the markdown/docx round-trip; the scripts.js DM auto-block
 * turns them back into responsive <picture> elements.
 *   - Unlinked image: <a href="DM-URL">alt</a>
 *   - Linked image (image is sole content of a link): keep the link href,
 *     move the DM URL to title, link text = alt.
 *   - Mixed-content anchors are skipped (warned).
 * Empty alt becomes the visible sentinel "Image without alt text".
 */

const EMPTY_ALT_SENTINEL = 'Image without alt text';
const LINKED_WRAPPER_TAGS = new Set(['PICTURE']);
const WRAPPER_SIBLING_TAGS = new Set(['SOURCE']);

function detectDynamicMediaUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try {
    u = new URL(urlStr, 'https://x/');
  } catch (e) {
    return false;
  }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
    && u.pathname.startsWith('/adobe/assets/urn:')) return 'dm-openapi';
  return false;
}

function altToLinkText(alt) {
  return (alt && alt.trim()) || EMPTY_ALT_SENTINEL;
}

// Walk up through <picture> wrappers; return the topmost wrapper node.
function topWrapper(img) {
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_WRAPPER_TAGS.has(parent.tagName)) {
    const ok = Array.from(parent.children)
      .every((c) => c === node || WRAPPER_SIBLING_TAGS.has(c.tagName));
    if (!ok) break;
    node = parent;
    parent = parent.parentElement;
  }
  return node;
}

function closestAnchor(node) {
  let p = node.parentElement;
  while (p) {
    if (p.tagName === 'A') return p;
    if (p.tagName === 'TD' || p.tagName === 'TH' || p.tagName === 'BODY' || p.tagName === 'MAIN') return null;
    p = p.parentElement;
  }
  return null;
}

// Anchor whose only meaningful descendant is the image (through inline wrappers).
function isSoleContent(anchor, img) {
  if (anchor.textContent.trim() !== '') return false;
  const media = anchor.querySelectorAll('img, video, svg, iframe');
  return media.length === 1 && media[0] === img;
}

function getSrc(img) {
  const src = img.getAttribute('src') || '';
  if (detectDynamicMediaUrl(src)) return src;
  const dataSrc = img.getAttribute('data-src') || '';
  if (detectDynamicMediaUrl(dataSrc)) return dataSrc;
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    if (!img.isConnected) return;
    const dmUrl = getSrc(img);
    if (!dmUrl) return;

    const text = altToLinkText(img.getAttribute('alt'));
    const node = topWrapper(img);
    const anchor = closestAnchor(node);

    if (anchor) {
      if (!isSoleContent(anchor, img)) {
        console.warn(`[cambriausa-dm-images] skipped DM image in mixed-content link: ${dmUrl}`);
        return;
      }
      anchor.setAttribute('title', dmUrl);
      anchor.textContent = text;
      return;
    }

    const a = doc.createElement('a');
    a.setAttribute('href', dmUrl);
    a.textContent = text;
    node.replaceWith(a);
  });
}
