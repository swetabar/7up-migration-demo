/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroRecipeParser from './parsers/hero-recipe.js';
import columnsRecipeParser from './parsers/columns-recipe.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/7up-cleanup.js';
import sectionsTransformer from './transformers/7up-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'recipe-detail',
  description: 'Individual recipe detail page: hero image, title + intro, ingredients/directions columns, tips band.',
  urls: [
    'https://www.7up.com/en/recipes/rainbow-sherbet-float',
  ],
  blocks: [
    {
      name: 'hero-recipe',
      instances: [
        '#body section.recipe-detail .featured-recipe-image',
      ],
    },
    {
      name: 'columns-recipe',
      instances: [
        '#body section.recipe-detail .recipe-content',
      ],
    },
  ],
  sections: [
    {
      id: 'rc3c1c1',
      name: 'recipe-hero',
      selector: ['#body section.recipe-detail .featured-recipe-image'],
      style: null,
      blocks: ['hero-recipe'],
      defaultContent: [],
    },
    {
      id: 'rc3c1c2-intro',
      name: 'recipe-intro',
      selector: ['#body section.recipe-detail .recipe-content-container'],
      style: 'centered',
      blocks: [],
      defaultContent: [
        '#body section.recipe-detail .recipe-content-container > h1',
        '#body section.recipe-detail .recipe-intro p',
      ],
    },
    {
      id: 'rc3c1c2c1',
      name: 'recipe-body',
      selector: ['#body section.recipe-detail .recipe-content'],
      style: null,
      blocks: ['columns-recipe'],
      defaultContent: [],
    },
    {
      id: 'rc3c1c2c2',
      name: 'recipe-tips',
      selector: ['#body section.recipe-detail .recipe-tips'],
      style: 'green',
      blocks: [],
      defaultContent: [
        '#body section.recipe-detail .recipe-tips h1',
        '#body section.recipe-detail .recipe-tips p',
      ],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-recipe': heroRecipeParser,
  'columns-recipe': columnsRecipeParser,
};

// TRANSFORMER REGISTRY - cleanup first, then sections. Run the sections
// transformer when there are 2+ sections OR any section carries a style.
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
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
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

    // 1. beforeTransform (initial cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root to /index)
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
