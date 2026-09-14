/*
 * hero-tabs — a product can-carousel that doubles as a tab strip, ported from
 * the 7up.com #products interaction.
 *
 * Authoring model — one row per flavour, cells in this order:
 *   | can image | Flavour Name | description text | CTA link |
 * The first row's flavour is the one shown selected on load.
 *
 * Behaviour (matches source `home.selectProduct`): clicking a can (or a nav
 * arrow) makes it the centre can and relabels every can item-1..item-N around
 * the arc, while the matching content panel gets `.active` and slides in.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Parse each row into a flavour record.
  const flavours = rows.map((row) => {
    const cells = [...row.children];
    const picture = cells[0] && cells[0].querySelector('picture, img');
    const name = cells[1] ? cells[1].textContent.trim() : '';
    const descCell = cells[2];
    const ctaLink = cells[3] && cells[3].querySelector('a');
    return {
      picture, name, descCell, ctaLink,
    };
  }).filter((f) => f.picture || f.name);

  const total = flavours.length;

  // Build the two columns.
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'hero-tabs-carousel-container';

  const carousel = document.createElement('ul');
  carousel.className = 'hero-tabs-carousel';

  const nav = document.createElement('div');
  nav.className = 'hero-tabs-nav';

  const cans = [];
  const panels = [];

  // Relabel cans around the arc and activate the matching panel — this is the
  // exact rotation from the source: for each can, its class is item-(offset+1)
  // where offset is its distance ahead of the selected index (wrapping around).
  let selected = 0;
  const select = (index) => {
    selected = ((index % total) + total) % total;
    cans.forEach((li, i) => {
      let offset = i - selected;
      if (offset < 0) offset += total;
      li.className = `item-${offset + 1}`;
    });
    panels.forEach((p, i) => p.classList.toggle('active', i === selected));
  };

  flavours.forEach((f, i) => {
    // ---- can (tab) ----
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', f.name);
    if (f.picture) btn.append(f.picture);
    li.append(btn);
    carousel.append(li);
    cans.push(li);

    // ---- content panel ----
    const panel = document.createElement('div');
    panel.className = 'hero-tabs-panel';
    const inner = document.createElement('div');
    inner.className = 'hero-tabs-panel-inner';

    if (f.name) {
      const h2 = document.createElement('h2');
      h2.textContent = f.name;
      inner.append(h2);
    }
    if (f.descCell) {
      [...f.descCell.childNodes].forEach((n) => inner.append(n.cloneNode(true)));
    }
    if (f.ctaLink) {
      f.ctaLink.classList.add('button');
      const wrap = document.createElement('p');
      wrap.className = 'button-container';
      wrap.append(f.ctaLink);
      inner.append(wrap);
    }
    panel.append(inner);
    panels.push(panel);

    btn.addEventListener('click', () => select(i));
  });

  // Nav arrows.
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'prev';
  prev.textContent = 'Previous';
  prev.addEventListener('click', () => select(selected - 1));
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'next';
  next.textContent = 'Next';
  next.addEventListener('click', () => select(selected + 1));
  nav.append(prev, next);

  carouselContainer.append(carousel, nav);

  block.textContent = '';
  block.append(carouselContainer, ...panels);

  // Initial state.
  select(0);
}
