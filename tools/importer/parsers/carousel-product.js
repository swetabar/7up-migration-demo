/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-product.
 * Base block: carousel
 * Source: https://www.7up.com/en/products
 * Generated: 2026-09-10
 *
 * Source structure: a `ul#product-carousel` with repeating `<li>` slide items.
 * Each item is a single linked product-can image:
 *   <li><a href="#product-{slug}"><img src="..." alt="Flavor Name"></a></li>
 *
 * Target (carousel block, 2 columns): one row per slide.
 *   cell 1 = the linked can image (mandatory) — the <a> preserving href + <img> alt.
 *   cell 2 = optional text content — none in this source, so an empty cell keeps
 *            the table columns even.
 */
export default function parse(element, { document }) {
  // The block element may be the <ul> itself or a wrapper containing it.
  const list = element.matches('ul#product-carousel, ul[id*="carousel"]')
    ? element
    : element.querySelector('ul#product-carousel, ul[id*="carousel"]');
  const scope = list || element;

  // Each slide is a <li> holding a linked can image. Fallback covers direct <li> children.
  const items = Array.from(scope.querySelectorAll(':scope > li, li'));

  const cells = [];

  items.forEach((item) => {
    // The linked image: prefer the anchor (preserves href + alt), fall back to the img.
    const anchor = item.querySelector('a');
    const img = item.querySelector('img');
    if (!img && !anchor) return;

    // Cell 1: linked can image. Keep the anchor wrapping the image so the
    // href (e.g. #product-7up-cherry) and image alt are both preserved.
    const imageCell = anchor || img;

    // 2-column carousel row: [image, text]. No text content in source → empty cell.
    cells.push([imageCell, '']);
  });

  // Empty-block guard: if no slides were extracted, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-product', cells });
  element.replaceWith(block);
}
