/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-recipe.
 * Base block: cards
 * Source: https://www.7up.com/en/recipes
 * Generated: 2026-09-09
 *
 * Source structure: a `.recipe-grid` containing repeating `a.recipe-item` anchors.
 * Each recipe-item is a single linked card:
 *   - background image (CSS background-image / lazy-load, no inline <img src>) —
 *     resolved from the item's slug: /images/recipes/thumbnails/{slug}.jpg
 *   - `.recipe-item-name` (recipe title)
 *   - `.recipe-item-cta` "View Recipe" (href comes from the anchor -> /recipes/{slug})
 *
 * Target (cards block, 2 columns): one row per recipe.
 *   cell 1 = image, cell 2 = title (as heading) + "View Recipe" link (recipe href).
 */
export default function parse(element, { document }) {
  const ORIGIN = 'https://www.7up.com';

  // The block element may be the .recipe-grid itself or a wrapper containing it.
  const grid = element.matches('.recipe-grid') ? element : element.querySelector('.recipe-grid');
  const scope = grid || element;

  // Each card is a linked recipe item. Fallbacks cover minor markup variation.
  const items = Array.from(scope.querySelectorAll('a.recipe-item, a[class*="recipe-item"]'));

  const cells = [];

  items.forEach((item) => {
    // Source recipe href is /recipes/{slug}, but the migrated detail pages live
    // under the locale path /en/recipes/{slug}. Rewrite the link so each card
    // points at the migrated page instead of a 404.
    const rawHref = item.getAttribute('href') || '';
    const slug = rawHref.split('/').filter(Boolean).pop() || '';
    const href = slug ? `/en/recipes/${slug}` : rawHref;

    // --- Cell 1: image ---
    // Source uses a CSS background-image / lazy-load, so there is no inline <img>.
    // Resolve the thumbnail from the slug where possible.
    let imgCell = '';
    const existingImg = item.querySelector('img[src]');
    if (existingImg) {
      imgCell = existingImg;
    } else if (slug) {
      const img = document.createElement('img');
      img.src = `${ORIGIN}/images/recipes/thumbnails/${slug}.jpg`;
      // alt derived from the recipe name below (set after we read the name)
      imgCell = img;
    }

    // --- Cell 2: title (heading) + View Recipe link ---
    const contentCell = [];

    const nameEl = item.querySelector('.recipe-item-name span, .recipe-item-name');
    let titleText = '';
    if (nameEl) {
      const heading = document.createElement('h3');
      // Preserve inline markup (e.g. <sup>®</sup>) while trimming whitespace.
      Array.from(nameEl.childNodes).forEach((node) => heading.append(node.cloneNode(true)));
      heading.innerHTML = heading.innerHTML.trim();
      titleText = heading.textContent.replace(/\s+/g, ' ').trim();
      if (heading.textContent.trim()) contentCell.push(heading);
    }

    // Give the derived image a meaningful alt now that we have the title.
    if (imgCell && imgCell.tagName === 'IMG' && !imgCell.getAttribute('alt') && titleText) {
      imgCell.setAttribute('alt', titleText);
    }

    // "View Recipe" CTA linking to the recipe href.
    if (href) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      const ctaEl = item.querySelector('.recipe-item-cta');
      const ctaText = ctaEl ? ctaEl.textContent.replace(/\s+/g, ' ').trim() : '';
      link.textContent = ctaText || 'View Recipe';
      contentCell.push(link);
    }

    // Skip empty cards (no title and no link).
    if (contentCell.length === 0) return;

    // 2-column row: [image, content]. Pad image cell if missing to keep columns even.
    cells.push([imgCell, contentCell]);
  });

  // Empty-block guard: if no cards were extracted, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-recipe', cells });
  element.replaceWith(block);
}
