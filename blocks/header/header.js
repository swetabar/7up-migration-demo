// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Toggle the mobile nav drawer open/closed.
 * @param {Element} nav The nav element
 * @param {boolean|null} [forceExpanded] optional forced state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

/**
 * Loads and decorates the header, mainly the nav.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Fetch nav fragment (metadata-independent: /content first, then root for DA/EDS)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // Assign semantic section classes in order: brand, sections, tools
  const classes = ['brand', 'sections', 'tools'];
  [...fragment.children].forEach((section, i) => {
    if (classes[i]) section.classList.add(`nav-${classes[i]}`);
    nav.append(section);
  });

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);

  // Reset drawer state when crossing between mobile and desktop widths
  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
  });

  // Close the mobile drawer on escape
  nav.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !isDesktop.matches) toggleMenu(nav, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
