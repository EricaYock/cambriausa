const DURATION = 300;
const EASING = 'cubic-bezier(0.2, 0.6, 0.4, 1)';

/**
 * Move a cell's content into a target; a single paragraph is unwrapped
 * so the question reads as plain summary text.
 * @param {Element} cell
 * @param {Element} target
 */
function moveContent(cell, target) {
  const only = cell.children.length === 1 ? cell.firstElementChild : null;
  const source = only && only.tagName === 'P' ? only : cell;
  target.append(...source.childNodes);
}

/**
 * Wrap a bare text answer in a paragraph so it gets paragraph styling.
 * @param {Element} body
 */
function normalizeBody(body) {
  const hasBlock = [...body.children].some((el) => !['A', 'STRONG', 'EM', 'B', 'I', 'SPAN', 'BR'].includes(el.tagName));
  if (!hasBlock && body.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...body.childNodes);
    body.append(p);
  }
}

/**
 * Open or close an item, animating the panel height (source: 0.3s height
 * transition with a content fade).
 * @param {HTMLDetailsElement} details
 */
function toggle(details) {
  const panel = details.querySelector('.accordion-faq-item-panel');
  const opening = !details.open || details.classList.contains('is-closing');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (details.animation) details.animation.cancel();

  if (reduce || !panel.animate) {
    details.classList.remove('is-closing');
    details.open = opening;
    return;
  }

  const start = details.open ? panel.getBoundingClientRect().height : 0;
  if (opening) {
    details.classList.remove('is-closing');
    details.open = true;
  } else {
    details.classList.add('is-closing');
  }
  const end = opening ? panel.scrollHeight : 0;

  const animation = panel.animate(
    [{ height: `${start}px` }, { height: `${end}px` }],
    { duration: DURATION, easing: EASING },
  );
  details.animation = animation;
  animation.onfinish = () => {
    details.animation = null;
    if (!opening) {
      details.open = false;
      details.classList.remove('is-closing');
    }
  };
}

/** @param {Element} block The accordion-faq block element */
export default function decorate(block) {
  const items = [];

  [...block.children].forEach((row) => {
    const [questionCell, ...answerCells] = [...row.children];
    if (!questionCell || !questionCell.textContent.trim()) return;

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const question = document.createElement('span');
    question.className = 'accordion-faq-item-question';
    moveContent(questionCell, question);
    summary.append(question);

    const panel = document.createElement('div');
    panel.className = 'accordion-faq-item-panel';
    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    answerCells.forEach((cell) => body.append(...cell.childNodes));
    normalizeBody(body);
    panel.append(body);

    details.append(summary, panel);
    items.push(details);
  });

  block.replaceChildren(...items);

  block.addEventListener('click', (e) => {
    const summary = e.target.closest('.accordion-faq-item-label');
    if (!summary || !block.contains(summary)) return;
    e.preventDefault();
    toggle(summary.parentElement);
  });
}
