/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the hero-tabs variant. Base block: tabs (NOT the generic hero).
 *
 * The source #products section is a can-carousel of ALL flavours where each can
 * acts as a tab. We reproduce that: one block row per flavour, in carousel order,
 * with the cells the block's decorate() expects:
 *   | can image | Flavour Name | description | CTA link | nutrition facts |
 *
 * The nutrition cell mirrors the source's hidden nutrition-container (Calories,
 * Serving Size, the facts table, Ingredients and legal). Block cells cannot hold
 * a nested <table>, so the facts table is flattened into a <ul>.
 *
 * The element passed in is the #products (or #product-carousel) container on the
 * shared products page.
 */
export default function parse(element, { document }) {
  const root = element.closest('#products') || document.querySelector('#products') || element;
  const carousel = root.querySelector('#product-carousel');
  const cells = [];

  const cans = carousel ? [...carousel.querySelectorAll(':scope > li')] : [];
  cans.forEach((li) => {
    const a = li.querySelector('a');
    const href = a ? a.getAttribute('href') || '' : '';
    const slug = href.replace(/^#product-/, '');
    const img = li.querySelector('img');
    const panel = slug ? root.querySelector(`#product-${slug}`) : null;

    // Flavour name (panel h3) and description (first panel paragraph).
    let name = img ? (img.getAttribute('alt') || '').trim() : '';
    let descText = '';
    if (panel) {
      const h3 = panel.querySelector('.product-header-text h3, .product-header h3, h3');
      if (h3) name = h3.textContent.replace(/\s+/g, ' ').trim();
      const p = panel.querySelector(':scope > .container > p, :scope .container > p, :scope > p');
      if (p) descText = p.textContent.replace(/\s+/g, ' ').trim();
    }

    const nameCell = document.createElement('p');
    nameCell.textContent = name;

    const descCell = document.createElement('div');
    if (descText) {
      const p = document.createElement('p');
      p.textContent = descText;
      descCell.append(p);
    }

    const ctaCell = document.createElement('div');
    if (slug) {
      const cta = document.createElement('a');
      cta.setAttribute('href', `/en/products/${slug}`);
      cta.textContent = 'Nutrition Facts';
      ctaCell.append(cta);
    }

    // Nutrition facts cell — mirror the source nutrition-container, flattening
    // the facts <table> into a <ul> so it survives markdown conversion.
    const nutriCell = document.createElement('div');
    const nutrition = panel ? panel.querySelector('.nutrition-container, .nutrition') : null;
    if (nutrition) {
      const clone = nutrition.cloneNode(true);
      clone.querySelectorAll('button, .btn-products, .customer-reviews, .smart-commerce, .reviews-btn')
        .forEach((n) => n.remove());
      clone.querySelectorAll('table').forEach((table) => {
        const ul = document.createElement('ul');
        table.querySelectorAll('tr').forEach((tr) => {
          const parts = [...tr.children].map((c) => c.textContent.replace(/\s+/g, ' ').trim());
          const text = parts.filter(Boolean).join(' — ');
          if (!text) return;
          const liEl = document.createElement('li');
          liEl.textContent = text;
          ul.append(liEl);
        });
        table.replaceWith(ul);
      });
      while (clone.firstChild) nutriCell.append(clone.firstChild);
    }

    cells.push([img || document.createElement('span'), nameCell, descCell, ctaCell, nutriCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-tabs', cells });
  // Tag the emitted block so the import script can re-parent it before cleanup
  // (the block table is emitted in place, inside #products, which cleanup strips).
  block.setAttribute('data-hero-tabs', 'true');
  element.replaceWith(block);
}
