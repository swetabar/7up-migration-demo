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
