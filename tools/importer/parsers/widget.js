/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the widget block.
 * Base block: widget (generic third-party widget loader — blocks/widget/widget.js)
 * Source: https://www.7up.com/en/stores
 * Generated: 2026-09-14
 *
 * Source structure: an empty mount div (`#destini-locator.destini-locator-class`)
 * that the Destini Product Locators script hydrates client-side. Its config lives
 * in the surrounding page script, not in the DOM; the analysis captured it as:
 *   locator-id=3170, alpha-code=C62, locator-name="7UP OCL Store Locator",
 *   client-id=up.
 *
 * Target (widget): a single-cell block whose only content is a link to the widget
 * asset `/widgets/store-locator.html`, with the Destini config passed as query
 * params. At runtime blocks/widget/widget.js fetches that asset and moves the
 * query params onto data-* attributes so the widget can read its config.
 */
export default function parse(element, { document }) {
  // Destini config for this locator instance (from page analysis).
  const params = new URLSearchParams({
    'locator-id': '3170',
    'alpha-code': 'C62',
    'locator-name': '7UP OCL Store Locator',
    'client-id': 'up',
  });
  const href = `/widgets/store-locator.html?${params.toString()}`;

  const link = document.createElement('a');
  link.setAttribute('href', href);
  link.textContent = 'store-locator';

  const cells = [[link]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'widget', cells });
  element.replaceWith(block);
}
