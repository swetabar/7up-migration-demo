/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: 7up site-wide cleanup.
 * Removes non-authorable site chrome, overlays, and tracking widgets.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  const templateName = payload && payload.template && payload.template.name;

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
      // NOTE: #products is removed only for NON-products templates (see below).
      // On the dedicated /en/products page, #products IS the page content, so we
      // must NOT strip it there.
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
      // Recipe-detail: "Try these other recipes" related-recipes carousel that
      // trails the recipe body — cross-page navigation chrome (linked recipe
      // cards), not part of this recipe's content. Removing it also keeps its
      // raw <a> cards from leaking into the imported markdown.
      '.related-recipes',
      // Products page: decorative glass photos loose in #products (a big desktop
      // glass image in the intro header + the mobile .product-glass block) — purely
      // decorative, not authorable content; they'd otherwise leak between the intro
      // and the carousel. The carousel cans and nutrition cards are preserved.
      '#products > header .hidden-xs.hidden-sm',
      '.product-glass',
    ]);

    // #products is the hidden/JS-gated product explorer on most pages (homepage,
    // recipes, etc.) — strip it there so it doesn't leak in as invisible content.
    // BUT on the dedicated /en/products page, #products IS the page's content, so
    // it must be kept. Gate the removal on the template name.
    if (templateName !== 'products') {
      WebImporter.DOMUtils.remove(element, ['#products']);
    }

    // The promotional banner section (#simple-7up-banner-new: lime hero, store
    // locator, flip-the-sip) is the HOMEPAGE hero content — but 7up serves the
    // same DOM on other pages (e.g. /en/products), where it is not part of the
    // page's real content and leaks in as stray banners. Keep it only for the
    // home template; strip it everywhere else.
    if (templateName !== 'home') {
      WebImporter.DOMUtils.remove(element, ['#simple-7up-banner-new']);
    }
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
