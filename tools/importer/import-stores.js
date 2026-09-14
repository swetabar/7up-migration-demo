/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import widgetParser from './parsers/widget.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/7up-cleanup.js';
import sectionsTransformer from './transformers/7up-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'stores',
  description: '7UP store locator page — a heading, a Destini store-locator widget embed, and an operator disclaimer.',
  urls: [
    'https://www.7up.com/en/stores',
  ],
  blocks: [
    {
      name: 'widget',
      instances: [
        '#destini-locator',
        '.destini-locator-class',
      ],
    },
  ],
  sections: [
    {
      id: 'rc3',
      name: 'stores-locator',
      selector: ['.wrap.search-wrap', '#body > div.wrap.search-wrap'],
      style: null,
      blocks: ['widget'],
      defaultContent: ['h1', '.search-wrap p'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  widget: widgetParser,
};

// TRANSFORMER REGISTRY - cleanup first, then sections. Run the sections
// transformer when there are 2+ sections OR any section carries a style
// (a single styled section still needs its Section Metadata block).
const needsSections = (PAGE_TEMPLATE.sections || []).length > 1
  || (PAGE_TEMPLATE.sections || []).some((s) => s.style);
const transformers = [
  cleanupTransformer,
  ...(needsSections ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page — dedupe elements matched by multiple selectors
    //    (the widget mount div matches both #destini-locator and .destini-locator-class).
    const seen = new Set();
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE)
      .filter((b) => (seen.has(b.element) ? false : seen.add(b.element)));

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
