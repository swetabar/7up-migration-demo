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

  // tools/importer/import-recipes.js
  var import_recipes_exports = {};
  __export(import_recipes_exports, {
    default: () => import_recipes_default
  });

  // tools/importer/parsers/cards-recipe.js
  function parse(element, { document: document2 }) {
    const ORIGIN = "https://www.7up.com";
    const grid = element.matches(".recipe-grid") ? element : element.querySelector(".recipe-grid");
    const scope = grid || element;
    const items = Array.from(scope.querySelectorAll('a.recipe-item, a[class*="recipe-item"]'));
    const cells = [];
    items.forEach((item) => {
      const href = item.getAttribute("href") || "";
      const slug = href.split("/").filter(Boolean).pop() || "";
      let imgCell = "";
      const existingImg = item.querySelector("img[src]");
      if (existingImg) {
        imgCell = existingImg;
      } else if (slug) {
        const img = document2.createElement("img");
        img.src = `${ORIGIN}/images/recipes/thumbnails/${slug}.jpg`;
        imgCell = img;
      }
      const contentCell = [];
      const nameEl = item.querySelector(".recipe-item-name span, .recipe-item-name");
      let titleText = "";
      if (nameEl) {
        const heading = document2.createElement("h3");
        Array.from(nameEl.childNodes).forEach((node) => heading.append(node.cloneNode(true)));
        heading.innerHTML = heading.innerHTML.trim();
        titleText = heading.textContent.replace(/\s+/g, " ").trim();
        if (heading.textContent.trim()) contentCell.push(heading);
      }
      if (imgCell && imgCell.tagName === "IMG" && !imgCell.getAttribute("alt") && titleText) {
        imgCell.setAttribute("alt", titleText);
      }
      if (href) {
        const link = document2.createElement("a");
        link.setAttribute("href", href);
        const ctaEl = item.querySelector(".recipe-item-cta");
        const ctaText = ctaEl ? ctaEl.textContent.replace(/\s+/g, " ").trim() : "";
        link.textContent = ctaText || "View Recipe";
        contentCell.push(link);
      }
      if (contentCell.length === 0) return;
      cells.push([imgCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-recipe", cells });
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
        "#snow-container"
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

  // tools/importer/import-recipes.js
  var PAGE_TEMPLATE = {
    name: "recipes",
    description: "7up recipes listing: intro tagline + a grid of recipe cards.",
    urls: [
      "https://www.7up.com/en/recipes"
    ],
    blocks: [
      {
        name: "cards-recipe",
        instances: [
          "#body section.recipes .recipe-grid"
        ]
      }
    ],
    sections: [
      {
        id: "rc3",
        name: "recipes-body",
        selector: ["#body"],
        style: "green",
        blocks: ["cards-recipe"],
        defaultContent: ["#body > div.filters .filter p"]
      }
    ]
  };
  var parsers = {
    "cards-recipe": parse
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
  var import_recipes_default = {
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
  return __toCommonJS(import_recipes_exports);
})();
