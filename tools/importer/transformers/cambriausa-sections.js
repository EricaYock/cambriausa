/* eslint-disable */
/* global WebImporter */

/**
 * Cambria USA section transformer.
 *
 * Driven entirely by payload.template.sections (page-templates.json), so the
 * same file serves every cambriausa template (home, designs, ...).
 *
 * beforeTransform: insert <hr> section breaks before every non-first section
 *   (while the parser target elements still exist). Breaks for styled
 *   sections carry a temporary data-excat-section-id marker; a styled first
 *   section gets a temporary marked <hr> too.
 * afterTransform: add a Section Metadata block right after each marker (or
 *   after the surviving section element), strip markers, and drop the
 *   first section's temporary <hr>.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      // Prefer a match inside <main>: designs pages carry a hidden duplicate
      // of the authored content after </main> (#design-palette__pdp-authored).
      const matches = Array.from(root.querySelectorAll(sel));
      const el = matches.find((m) => m.closest('main')) || matches[0];
      if (el) return el;
    } catch (e) {
      // unsupported selector in this DOM implementation - try the next one
    }
  }
  return null;
}

/**
 * Normalise a section style to the comma-separated form EDS splits into
 * section classes: "cream, centered" (string) or ["cream", "centered"]
 * (array) both become "cream, centered". Returns '' when there is no style.
 */
function styleText(style) {
  if (!style) return '';
  const values = Array.isArray(style) ? style : String(style).split(',');
  return values.map((v) => String(v).trim()).filter(Boolean).join(', ');
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument || (payload && payload.document);

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      const style = styleText(section.style);
      if (i === 0 && !style) continue;
      const hr = doc.createElement('hr');
      if (style) hr.setAttribute(MARKER, section.id);
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const style = styleText(section.style);
      if (!style) continue;

      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const anchor = marker || findSectionElement(element, section);
      if (!anchor) continue;

      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style },
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

    // Safety: drop any stray markers whose sections did not need metadata.
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
