/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroTabsParser from './parsers/hero-tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/7up-cleanup.js';

// PAGE TEMPLATE CONFIGURATION
// The 7UP products landing page. The source #products section is a can-carousel
// (each can is a tab) plus a right-hand column that shows an intro by default and
// swaps to a product panel when a can is selected. We render the whole thing as a
// single hero-tabs block (intro row + one row per flavour).
const PAGE_TEMPLATE = {
  name: 'products',
  description: '7UP products landing — hero-tabs can-carousel with intro + per-flavour panels.',
  urls: [
    'https://www.7up.com/en/products',
  ],
  blocks: [
    {
      name: 'hero-tabs',
      instances: ['#product-carousel'],
    },
  ],
  sections: [],
};

// PARSER REGISTRY
const parsers = {
  'hero-tabs': heroTabsParser,
};

// Only run cleanup (strip site chrome). No section transformer — single block.
const transformers = [cleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Parse the hero-tabs block BEFORE cleanup — the parser reaches into the
    //    carousel and the section header, which cleanup would otherwise strip.
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 2. The parser emits a block TABLE tagged data-hero-tabs in place inside
    //    #products. Detach it to main FIRST so cleanup can't remove it.
    const heroTabs = document.querySelector('[data-hero-tabs]');
    if (heroTabs) main.prepend(heroTabs);

    // 3. Strip everything else (banners, carousel, other chrome).
    executeTransformers('beforeTransform', main, payload);
    executeTransformers('afterTransform', main, payload);

    // 4. Rebuild main to contain ONLY the hero-tabs block.
    if (heroTabs) {
      heroTabs.removeAttribute('data-hero-tabs');
      main.textContent = '';
      main.append(heroTabs);
    }

    // 5. WebImporter built-in rules.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Output path: /en/products.
    const path = '/en/products';

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
