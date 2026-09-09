/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.7up.com/en
 * Generated: 2026-09-09
 *
 * Library convention (Hero): 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2: background image (optional).
 *   Row 3: title (heading), subheading (optional), CTA (optional).
 *
 * Source has two structural sub-variants handled here:
 *   .banner-wrapper1 → img#banner-desktop, .text-banner1 (h1.text-banner-h1, a.button-banner1)
 *   .banner-wrapper3 → img#banner-desktop3, .text-banner3 .recipes-text-data
 *                      (h1.text-banner-h3, p.text-p, a.button-banner3)
 */
export default function parse(element, { document }) {
  // Row 2: background image. The first <img> in either sub-variant is the
  // primary desktop banner asset (#banner-desktop / #banner-desktop3).
  const bgImage = element.querySelector('img');

  // Row 3 content. Heading, optional subheading, optional CTA.
  const heading = element.querySelector(
    'h1, h2, .text-banner-h1, .text-banner-h3, [class*="text-banner-h"]',
  );
  const subheading = element.querySelector('p.text-p, p');
  const ctaLinks = Array.from(
    element.querySelectorAll('a.button-banner1, a.button-banner3, a[class*="button-banner"], a'),
  );

  // Empty-block guard: no meaningful content → unwrap.
  if (!heading && !subheading && ctaLinks.length === 0 && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional).
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: single cell holding heading + subheading + CTA(s).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
