/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-recipe. Base: hero.
 * Source selector: #body section.recipe-detail .featured-recipe-image
 * Source structure: div.featured-recipe-image containing a desktop <img class="hidden-xs">
 * and a mobile <img class="visible-xs">. Emit a single-column hero with the recipe
 * feature image (desktop primary). No heading/subheading/CTA overlay.
 * Generated: 2026-09-10
 */
export default function parse(element, { document }) {
  // Prefer the desktop image; fall back to the mobile image, then any image.
  const image = element.querySelector('img.hidden-xs')
    || element.querySelector('img.visible-xs')
    || element.querySelector('img');

  // Empty-block guard: no image means nothing meaningful to emit.
  if (!image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Hero is 1-column: one content row, one cell holding the feature image.
  cells.push([image]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-recipe', cells });
  element.replaceWith(block);
}
