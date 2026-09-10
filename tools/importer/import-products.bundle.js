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

  // tools/importer/import-products.js
  var import_products_exports = {};
  __export(import_products_exports, {
    default: () => import_products_default
  });

  // tools/importer/parsers/carousel-product.js
  function parse(element, { document: document2 }) {
    const list = element.matches('ul#product-carousel, ul[id*="carousel"]') ? element : element.querySelector('ul#product-carousel, ul[id*="carousel"]');
    const scope = list || element;
    const items = Array.from(scope.querySelectorAll(":scope > li, li"));
    const cells = [];
    items.forEach((item) => {
      const anchor = item.querySelector("a");
      const img = item.querySelector("img");
      if (!img && !anchor) return;
      const imageCell = anchor || img;
      cells.push([imageCell, ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-nutrition.js
  function parse2(element, { document: document2 }) {
    const panels = element.matches(".product") ? [element] : Array.from(element.querySelectorAll(":scope .product, div.product"));
    const scope = panels.length ? panels : [element];
    const cells = [];
    scope.forEach((panel) => {
      const contentCell = [];
      const titleEl = panel.querySelector(".product-header-text h3, .product-header h3, h3");
      if (titleEl && titleEl.textContent.trim()) {
        const heading = document2.createElement("h2");
        heading.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
        contentCell.push(heading);
      }
      const container = panel.querySelector(":scope > .container") || panel;
      const descEl = Array.from(container.children).find(
        (child) => child.tagName === "P" && child.textContent.trim()
      );
      if (descEl) {
        const p = document2.createElement("p");
        p.textContent = descEl.textContent.replace(/\s+/g, " ").trim();
        contentCell.push(p);
      }
      const callout = panel.querySelector(".nutrition .pull-left, .pull-left");
      if (callout) {
        Array.from(callout.children).forEach((node) => {
          if (node.tagName === "H4" && node.textContent.trim()) {
            const h = document2.createElement("h4");
            h.textContent = node.textContent.replace(/\s+/g, " ").trim();
            contentCell.push(h);
          } else if (node.tagName === "P" && node.textContent.trim()) {
            const p = document2.createElement("p");
            p.textContent = node.textContent.replace(/\s+/g, " ").trim();
            contentCell.push(p);
          }
        });
      }
      const table = panel.querySelector(".nutrition table, table");
      if (table) contentCell.push(table);
      const ingredients = panel.querySelector(".ingredients");
      if (ingredients) {
        const ingHeading = ingredients.querySelector("h4");
        if (ingHeading && ingHeading.textContent.trim()) {
          const h = document2.createElement("h4");
          h.textContent = ingHeading.textContent.replace(/\s+/g, " ").trim();
          contentCell.push(h);
        }
        const ingBody = ingredients.querySelector("p");
        if (ingBody && ingBody.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = ingBody.textContent.replace(/\s+/g, " ").trim();
          contentCell.push(p);
        }
      }
      const legal = panel.querySelector(".legal");
      if (legal && legal.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = legal.textContent.replace(/\s+/g, " ").trim();
        contentCell.push(p);
      }
      if (contentCell.length === 0) return;
      cells.push([contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-nutrition", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/7up-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    const templateName = payload && payload.template && payload.template.name;
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#fb-root",
        "#privacy_modal",
        "#tos_modal",
        "#reviews-modal",
        "#smart-cart",
        ".bv-verify-css-loaded",
        ".banner-wrapper2",
        // NOTE: #products is removed only for NON-products templates (see below).
        // On the dedicated /en/products page, #products IS the page content, so we
        // must NOT strip it there.
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
        ".recipe-content-container > span",
        // Recipe-detail: "Try these other recipes" related-recipes carousel that
        // trails the recipe body — cross-page navigation chrome (linked recipe
        // cards), not part of this recipe's content. Removing it also keeps its
        // raw <a> cards from leaking into the imported markdown.
        ".related-recipes",
        // Products page: decorative glass photos loose in #products (a big desktop
        // glass image in the intro header + the mobile .product-glass block) — purely
        // decorative, not authorable content; they'd otherwise leak between the intro
        // and the carousel. The carousel cans and nutrition cards are preserved.
        "#products > header .hidden-xs.hidden-sm",
        ".product-glass"
      ]);
      if (templateName !== "products") {
        WebImporter.DOMUtils.remove(element, ["#products"]);
      }
      if (templateName !== "home") {
        WebImporter.DOMUtils.remove(element, ["#simple-7up-banner-new"]);
      }
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

  // tools/importer/import-products.js
  var PAGE_TEMPLATE = {
    name: "products",
    description: "7up products explorer: intro copy, a can carousel selector, and per-flavour nutrition detail cards.",
    urls: [
      "https://www.7up.com/en/products"
    ],
    blocks: [
      {
        name: "carousel-product",
        instances: [
          "#products #product-carousel"
        ]
      },
      {
        name: "cards-nutrition",
        instances: [
          "#products .product"
        ]
      }
    ],
    sections: [
      {
        id: "rc4",
        name: "product-explorer",
        selector: ["#products"],
        style: "green",
        blocks: ["carousel-product", "cards-nutrition"],
        defaultContent: [
          "#products > header.container h1",
          "#products > header.container p"
        ]
      }
    ]
  };
  var parsers = {
    "carousel-product": parse,
    "cards-nutrition": parse2
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
  var import_products_default = {
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
  return __toCommonJS(import_products_exports);
})();
