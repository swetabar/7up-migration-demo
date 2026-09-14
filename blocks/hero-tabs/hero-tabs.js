/*
 * hero-tabs — a product can-carousel that doubles as a tab strip, ported from
 * the 7up.com #products interaction.
 *
 * Authoring model — one row per flavour, cells in this order:
 *   | can image | Flavour Name | description text | CTA link | nutrition facts |
 * The first row's flavour is the one shown selected on load.
 *
 * Behaviour (matches source `home.selectProduct`): clicking a can (or a nav
 * arrow) makes it the centre can and relabels every can item-1..item-N around
 * the arc, while the matching content panel gets `.active` and slides in.
 * Clicking the "Nutrition Facts" button hides itself and reveals that flavour's
 * nutrition detail (Calories, Serving Size, facts, Ingredients, legal) with a
 * "Description" button at the bottom that toggles back — mirroring the source's
 * paired btn-products buttons (hide self, fade in sibling).
 */
export default function decorate(block) {
  const rows = [...block.children];

  // The first row is the intro (default right-hand content) when its second
  // cell carries an <h1>. Cell 0 is the decorative image, cell 1 the text.
  // It has no can, so it isn't part of the carousel.
  let introCell = null;
  let introImage = null;
  const flavourRows = rows.filter((row) => {
    const cells = [...row.children];
    if (!introCell && cells[1] && cells[1].querySelector('h1')) {
      [, introCell] = cells;
      introImage = cells[0] && cells[0].querySelector('picture, img');
      return false;
    }
    return true;
  });

  // Parse each flavour row into a record.
  const flavours = flavourRows.map((row) => {
    const cells = [...row.children];
    const picture = cells[0] && cells[0].querySelector('picture, img');
    const name = cells[1] ? cells[1].textContent.trim() : '';
    const descCell = cells[2];
    const ctaLink = cells[3] && cells[3].querySelector('a');
    const nutritionCell = cells[4];
    // Product path for this flavour, e.g. /en/products/7up-cherry.
    const productPath = ctaLink ? ctaLink.getAttribute('href') : '';
    return {
      picture, name, descCell, ctaLink, nutritionCell, productPath,
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

  // The intro panel — shown by default on the products landing page. Sentinel
  // index INTRO (-1) selects it (no flavour active). Built from the intro cell.
  const INTRO = -1;
  let introPanel = null;
  if (introCell) {
    introPanel = document.createElement('div');
    introPanel.className = 'hero-tabs-panel hero-tabs-intro';
    const introInner = document.createElement('div');
    introInner.className = 'hero-tabs-panel-inner';
    [...introCell.childNodes].forEach((n) => introInner.append(n.cloneNode(true)));
    if (introImage) introInner.append(introImage.closest('picture') || introImage);
    introPanel.append(introInner);
  }

  // Base products path (parent of the flavour paths), used when returning to the
  // intro state, e.g. /en/products.
  const firstPath = flavours.find((f) => f.productPath)?.productPath || '';
  const basePath = firstPath.replace(/\/[^/]+$/, '') || firstPath;

  // Relabel cans around the arc and activate the matching panel — this is the
  // exact rotation from the source: for each can, its class is item-(offset+1)
  // where offset is its distance ahead of the selected index (wrapping around).
  // index === INTRO shows the intro panel with no flavour active.
  let selected = INTRO;
  const select = (index, updateUrl = true) => {
    const isIntro = index === INTRO;
    selected = isIntro ? INTRO : ((index % total) + total) % total;
    // When on the intro, keep a sensible default arc centred on the first can.
    const centre = isIntro ? 0 : selected;
    cans.forEach((li, i) => {
      let offset = i - centre;
      if (offset < 0) offset += total;
      li.className = `item-${offset + 1}`;
    });
    if (introPanel) introPanel.classList.toggle('active', isIntro);
    panels.forEach((p, i) => p.classList.toggle('active', !isIntro && i === selected));
    block.classList.toggle('open-product', !isIntro);

    // Reflect the selection in the URL (e.g. /en/products/7up-cherry or the
    // /en/products landing), matching the source's pushState — no reload.
    const path = isIntro ? basePath : (flavours[selected] && flavours[selected].productPath);
    if (updateUrl && path) {
      window.history.pushState({ heroTab: index }, '', path);
    }
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
    // Nutrition detail (hidden until the CTA is clicked).
    const hasNutrition = f.nutritionCell && f.nutritionCell.textContent.trim();

    // "Nutrition Facts" CTA — visible in the description state.
    const factsWrap = document.createElement('p');
    factsWrap.className = 'button-container hero-tabs-facts-cta';
    if (f.ctaLink) {
      const facts = document.createElement('button');
      facts.type = 'button';
      facts.className = 'button';
      facts.textContent = f.ctaLink.textContent || 'Nutrition Facts';
      factsWrap.append(facts);
      inner.append(factsWrap);

      if (hasNutrition) {
        const nutrition = document.createElement('div');
        nutrition.className = 'hero-tabs-nutrition';
        nutrition.hidden = true;
        [...f.nutritionCell.childNodes].forEach((n) => nutrition.append(n.cloneNode(true)));

        // "Description" CTA — sits at the bottom of the nutrition state and
        // toggles back, mirroring the source's paired btn-products buttons.
        const backWrap = document.createElement('p');
        backWrap.className = 'button-container hero-tabs-desc-cta';
        const back = document.createElement('button');
        back.type = 'button';
        back.className = 'button';
        back.textContent = 'Description';
        backWrap.append(back);
        nutrition.append(backWrap);
        inner.append(nutrition);

        const show = (showNutrition) => {
          nutrition.hidden = !showNutrition;
          factsWrap.hidden = showNutrition;
        };
        facts.addEventListener('click', () => show(true));
        back.addEventListener('click', () => show(false));
      }
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
  const rightPanels = introPanel ? [introPanel, ...panels] : panels;
  block.append(carouselContainer, ...rightPanels);

  // Initial state: honour a flavour slug in the current URL (deep link to
  // /en/products/7up-cherry) → that flavour; otherwise show the intro (default
  // /en/products landing) if present, else the first flavour. No history push.
  const matchIndex = () => {
    const { pathname } = window.location;
    const clean = pathname.replace(/\.html$/, '').replace(/\.plain$/, '');
    const found = flavours.findIndex((f) => f.productPath && (
      clean === f.productPath || pathname === f.productPath || pathname === `${f.productPath}.html`
    ));
    return found;
  };
  const initial = matchIndex();
  if (initial >= 0) select(initial, false);
  else select(introPanel ? INTRO : 0, false);

  // Keep the carousel in sync with browser back/forward.
  window.addEventListener('popstate', () => {
    const idx = matchIndex();
    if (idx >= 0) select(idx, false);
    else if (introPanel) select(INTRO, false);
  });
}
