/**
 * Loads and decorates the footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Fetch footer fragment (metadata-independent: /content first, then root for DA/EDS)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const footer = document.createElement('div');

  const classes = ['footer-links', 'footer-legal'];
  [...fragment.children].forEach((section, i) => {
    if (classes[i]) section.classList.add(classes[i]);
    footer.append(section);
  });

  block.append(footer);
}
