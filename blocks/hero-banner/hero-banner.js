export default function decorate(block) {
  // First cell holds the full-bleed background image. If there is none,
  // fall back to a text-only banner so colour inheritance stays legible.
  const firstRow = block.querySelector(':scope > div:first-child');
  const hasImage = firstRow && firstRow.querySelector('picture');
  if (!hasImage) {
    block.classList.add('no-image');
  } else {
    firstRow.classList.add('hero-banner-bg');
  }

  // Everything that is not the background image is banner content
  // (heading, supporting copy, CTA). Group it so it can be positioned
  // and, for the card variant, boxed together.
  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  [...block.children].forEach((row) => {
    if (row === firstRow && hasImage) return;
    while (row.firstElementChild) {
      content.append(row.firstElementChild);
    }
    row.remove();
  });
  block.append(content);

  // Style CTA links as buttons.
  content.querySelectorAll('p > a').forEach((a) => {
    a.classList.add('button');
    const p = a.parentElement;
    if (p && p.childElementCount === 1 && p.textContent.trim() === a.textContent.trim()) {
      p.classList.add('button-container');
    }
  });

  // Banners with supporting body copy (a paragraph that isn't just the CTA)
  // present their content inside a centered rounded card, matching the source.
  const hasBodyText = [...content.querySelectorAll('p')].some(
    (p) => !p.querySelector('a') && p.textContent.trim().length > 0,
  );
  if (hasBodyText && !block.classList.contains('card')) {
    block.classList.add('card');
  }
}
