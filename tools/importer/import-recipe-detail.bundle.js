/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-recipe-detail.js
  var import_recipe_detail_exports = {};
  __export(import_recipe_detail_exports, {
    default: () => import_recipe_detail_default
  });

  // tools/importer/parsers/hero-recipe.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector("img.hidden-xs") || element.querySelector("img.visible-xs") || element.querySelector("img");
    if (!image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([image]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-recipe", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-recipe.js
  function parse2(element, { document: document2 }) {
    const columnDivs = Array.from(element.querySelectorAll(":scope > div"));
    if (columnDivs.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const ingredientsCol = columnDivs[0];
    const directionsCol = columnDivs[1] || document2.createElement("div");
    const cells = [];
    cells.push([ingredientsCol, directionsCol]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-recipe", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/7up-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#fb-root",
        "#privacy_modal",
        "#tos_modal",
        "#reviews-modal",
        "#smart-cart",
        ".bv-verify-css-loaded",
        ".banner-wrapper2",
        // #products (intro + can carousel + per-flavour nutrition cards) is present
        // in the source HTML but hidden / JS-gated on the live homepage, so it never
        // renders for real visitors. Removed to match what's actually visible.
        "#products",
        // Recipes page: non-authorable interactive/decorative chrome inside #body —
        //   .filters .overlay (dim layer), .shaker (JS randomizer image link),
        //   .no-results (hidden "no recipe" JS state), #snow-container (decorative).
        // The intro tagline (.filters .filter p) and .recipe-grid are preserved.
        ".filters .overlay",
        ".shaker",
        ".pop-up-container",
        ".no-results",
        "#snow-container",
        // Recipe-detail page: non-authorable chrome —
        //   .next-prev-container (PREV/NEXT recipe pagination), .modal.age-gate
        //   (age-gate overlay), .share-container (social share icons), .print-logo
        //   (print-only logo img). Recipe hero/title/intro/columns/tips are preserved.
        ".next-prev-container",
        ".modal.age-gate",
        ".share-container",
        ".print-logo",
        // Recipe-detail: stray mis-encoded meta subtitle span (direct child of the
        // content container) — its markup is double-encoded ("7UP&lt;sup&gt;®&lt;/sup&gt;")
        // and carries the wrong recipe name; it is hidden on the live page. Remove it
        // so it doesn't render as broken literal <sup> text.
        ".recipe-content-container > span"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#header",
        "section.home-recipes#recipes",
        "section#enjoy-7up",
        "footer",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/7up-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-recipe-detail.js
  var PAGE_TEMPLATE = {
    name: "recipe-detail",
    description: "Individual recipe detail page: hero image, title + intro, ingredients/directions columns, tips band.",
    urls: [
      "https://www.7up.com/en/recipes/rainbow-sherbet-float"
    ],
    blocks: [
      {
        name: "hero-recipe",
        instances: [
          "#body section.recipe-detail .featured-recipe-image"
        ]
      },
      {
        name: "columns-recipe",
        instances: [
          "#body section.recipe-detail .recipe-content"
        ]
      }
    ],
    sections: [
      {
        id: "rc3c1c1",
        name: "recipe-hero",
        selector: ["#body section.recipe-detail .featured-recipe-image"],
        style: null,
        blocks: ["hero-recipe"],
        defaultContent: []
      },
      {
        id: "rc3c1c2-intro",
        name: "recipe-intro",
        selector: ["#body section.recipe-detail .recipe-content-container"],
        style: "centered",
        blocks: [],
        defaultContent: [
          "#body section.recipe-detail .recipe-content-container > h1",
          "#body section.recipe-detail .recipe-intro p"
        ]
      },
      {
        id: "rc3c1c2c1",
        name: "recipe-body",
        selector: ["#body section.recipe-detail .recipe-content"],
        style: null,
        blocks: ["columns-recipe"],
        defaultContent: []
      },
      {
        id: "rc3c1c2c2",
        name: "recipe-tips",
        selector: ["#body section.recipe-detail .recipe-tips"],
        style: "green",
        blocks: [],
        defaultContent: [
          "#body section.recipe-detail .recipe-tips h1",
          "#body section.recipe-detail .recipe-tips p"
        ]
      }
    ]
  };
  var parsers = {
    "hero-recipe": parse,
    "columns-recipe": parse2
  };
  var needsSections = (PAGE_TEMPLATE.sections || []).length > 1 || (PAGE_TEMPLATE.sections || []).some((s) => s.style);
  var transformers = [
    transform,
    ...needsSections ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_recipe_detail_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_recipe_detail_exports);
})();
