/** @param {Element} block The hero-gradient block element */
export default function decorate(block) {
  const rows = [...block.children];
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-gradient-media';
  const content = document.createElement('div');
  content.className = 'hero-gradient-content';

  if (picture) {
    const holder = picture.parentElement;
    media.append(picture);
    if (holder?.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) holder.remove();
  }

  rows.forEach((row) => {
    [...row.querySelectorAll(':scope > div > *')].forEach((el) => {
      if (el.textContent.trim() || el.querySelector('picture, img')) content.append(el);
    });
  });

  block.replaceChildren(media, content);
  if (!picture) block.classList.add('no-media');
}
