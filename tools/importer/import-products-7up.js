/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroTabsParser from './parsers/hero-tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/7up-cleanup.js';

// PAGE TEMPLATE CONFIGURATION
// The 7UP product page. Source is the shared products page DOM; we extract ONLY
// the Original 7UP product panel (#product-7up) and render it as a hero-tabs block,
// then output it at /en/products/7up.
const PAGE_TEMPLATE = {
  name: 'products-7up',
  description: '7UP product detail page — hero-tabs block only.',
  urls: [
    'https://www.7up.com/en/products/7up',
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

// Only run cleanup (strip site chrome). No section transformer — single block, no sections.
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

    // 1. Parse the target block(s) BEFORE cleanup — the hero-tabs parser reaches
    //    into the carousel for the hero image, which cleanup would otherwise strip.
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

    // 2. The parser emits a block TABLE (not a div) in place inside #products,
    //    tagged data-hero-tabs. Detach it to main FIRST so the cleanup transformer
    //    (which strips #products and other chrome) can't remove it.
    const heroTabs = document.querySelector('[data-hero-tabs]');
    if (heroTabs) main.prepend(heroTabs);

    // 3. Strip everything else (banners, carousel, other panels, chrome).
    executeTransformers('beforeTransform', main, payload);
    executeTransformers('afterTransform', main, payload);

    // 4. Rebuild main to contain ONLY the hero-tabs block.
    if (heroTabs) {
      heroTabs.removeAttribute('data-hero-tabs');
      main.textContent = '';
      main.append(heroTabs);
    }

    // 4. WebImporter built-in rules.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Force output path to /en/products/7up regardless of the fetched URL.
    const path = '/en/products/7up';

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
