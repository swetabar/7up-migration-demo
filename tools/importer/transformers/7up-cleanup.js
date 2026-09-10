/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: 7up site-wide cleanup.
 * Removes non-authorable site chrome, overlays, and tracking widgets.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets that could interfere with block parsing (from cleaned.html):
    //   #fb-root (Facebook SDK), legal/review modals, smart-cart, Bazaarvoice verify node
    //   .banner-wrapper2: the source's mobile-only duplicate of the first hero
    //   banner (display:none on the live site) — its heading/CTA/images otherwise
    //   leak in as default content alongside the desktop hero-banner block.
    WebImporter.DOMUtils.remove(element, [
      '#fb-root',
      '#privacy_modal',
      '#tos_modal',
      '#reviews-modal',
      '#smart-cart',
      '.bv-verify-css-loaded',
      '.banner-wrapper2',
      // #products (intro + can carousel + per-flavour nutrition cards) is present
      // in the source HTML but hidden / JS-gated on the live homepage, so it never
      // renders for real visitors. Removed to match what's actually visible.
      '#products',
      // Recipes page: non-authorable interactive/decorative chrome inside #body —
      //   .filters .overlay (dim layer), .shaker (JS randomizer image link),
      //   .no-results (hidden "no recipe" JS state), #snow-container (decorative).
      // The intro tagline (.filters .filter p) and .recipe-grid are preserved.
      '.filters .overlay',
      '.shaker',
      '.pop-up-container',
      '.no-results',
      '#snow-container',
      // Recipe-detail page: non-authorable chrome —
      //   .next-prev-container (PREV/NEXT recipe pagination), .modal.age-gate
      //   (age-gate overlay), .share-container (social share icons), .print-logo
      //   (print-only logo img). Recipe hero/title/intro/columns/tips are preserved.
      '.next-prev-container',
      '.modal.age-gate',
      '.share-container',
      '.print-logo',
      // Recipe-detail: stray mis-encoded meta subtitle span (direct child of the
      // content container) — its markup is double-encoded ("7UP&lt;sup&gt;®&lt;/sup&gt;")
      // and carries the wrong recipe name; it is hidden on the live page. Remove it
      // so it doesn't render as broken literal <sup> text.
      '.recipe-content-container > span',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (from cleaned.html):
    //   header#header (navbar), empty section.home-recipes#recipes,
    //   section#enjoy-7up (wraps footer#footer), leftover iframes/links/noscript
    WebImporter.DOMUtils.remove(element, [
      'header#header',
      'section.home-recipes#recipes',
      'section#enjoy-7up',
      'footer',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
