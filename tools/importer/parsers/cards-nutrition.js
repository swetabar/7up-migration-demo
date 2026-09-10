/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-nutrition.
 * Base block: cards
 * Source: https://www.7up.com/en/products
 * Generated: 2026-09-10
 *
 * Source structure: repeating `div.product` panels (6 flavours). Each panel holds:
 *   - `.product-header-text > h3` — flavour title
 *   - a top-level `<p>` — description
 *   - `.nutrition .pull-left` — Calories + Serving Size callouts (h4 + p.big pairs)
 *   - `.nutrition table` — nutrition facts (Amount Per Serving / % DV rows)
 *   - `.ingredients` — Ingredients heading + paragraph
 *   - `.legal` — legal disclaimer
 *
 * Excluded chrome (JS controls, not authorable content):
 *   - `.customer-reviews` / Bazaarvoice review widget (`#BVRRContainer`,
 *     `.review-holder`, "Read reviews" links)
 *   - toggle buttons `button.btn-products` ("Nutrition Facts" / "Description" / "Buy")
 *   - `.smart-commerce` buy widget
 *
 * Target (cards — no images variant, 1 column): one row per product panel.
 *   cell 1 = title (heading) + description + calories/serving callouts + nutrition
 *            table + ingredients + legal, all as default content in the card body.
 *   No per-card image exists in these panels (cans live in the carousel), so a
 *   single-cell "no image" card row is used.
 */
export default function parse(element, { document }) {
  // The block element may wrap the product panels or be a single panel.
  const panels = element.matches('.product')
    ? [element]
    : Array.from(element.querySelectorAll(':scope .product, div.product'));
  const scope = panels.length ? panels : [element];

  const cells = [];

  scope.forEach((panel) => {
    const contentCell = [];

    // --- Title (as a heading) ---
    const titleEl = panel.querySelector('.product-header-text h3, .product-header h3, h3');
    if (titleEl && titleEl.textContent.trim()) {
      const heading = document.createElement('h2');
      heading.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(heading);
    }

    // --- Description (top-level paragraph, not inside nutrition/ingredients/legal) ---
    // Direct child <p> of the panel container holds the flavour description.
    const container = panel.querySelector(':scope > .container') || panel;
    const descEl = Array.from(container.children).find(
      (child) => child.tagName === 'P' && child.textContent.trim(),
    );
    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(p);
    }

    // --- Calories + Serving Size callouts (h4 + p.big pairs) ---
    const callout = panel.querySelector('.nutrition .pull-left, .pull-left');
    if (callout) {
      Array.from(callout.children).forEach((node) => {
        if (node.tagName === 'H4' && node.textContent.trim()) {
          const h = document.createElement('h4');
          h.textContent = node.textContent.replace(/\s+/g, ' ').trim();
          contentCell.push(h);
        } else if (node.tagName === 'P' && node.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = node.textContent.replace(/\s+/g, ' ').trim();
          contentCell.push(p);
        }
      });
    }

    // --- Nutrition facts table (preserve the <table> element) ---
    const table = panel.querySelector('.nutrition table, table');
    if (table) contentCell.push(table);

    // --- Ingredients section (heading + paragraph) ---
    const ingredients = panel.querySelector('.ingredients');
    if (ingredients) {
      const ingHeading = ingredients.querySelector('h4');
      if (ingHeading && ingHeading.textContent.trim()) {
        const h = document.createElement('h4');
        h.textContent = ingHeading.textContent.replace(/\s+/g, ' ').trim();
        contentCell.push(h);
      }
      const ingBody = ingredients.querySelector('p');
      if (ingBody && ingBody.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = ingBody.textContent.replace(/\s+/g, ' ').trim();
        contentCell.push(p);
      }
    }

    // --- Legal disclaimer ---
    const legal = panel.querySelector('.legal');
    if (legal && legal.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = legal.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(p);
    }

    // Skip empty cards (excluded chrome only, no real content).
    if (contentCell.length === 0) return;

    // 1-column "no images" card: one row, one cell holding all content elements.
    cells.push([contentCell]);
  });

  // Empty-block guard: if no cards were extracted, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-nutrition', cells });
  element.replaceWith(block);
}
