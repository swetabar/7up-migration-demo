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

  // tools/importer/parsers/hero-tabs.js
  function parse(element, { document }) {
    const root = element.closest("#products") || document.querySelector("#products") || element;
    const carousel = root.querySelector("#product-carousel");
    const cells = [];
    const header = root.querySelector(":scope > header, header.container");
    if (header) {
      const introImg = header.querySelector("img");
      const introContent = document.createElement("div");
      const h1 = header.querySelector("h1");
      if (h1) {
        const heading = document.createElement("h1");
        const clone = h1.cloneNode(true);
        clone.querySelectorAll("br").forEach((br) => br.replaceWith(document.createTextNode(" ")));
        heading.textContent = clone.textContent.replace(/\s+/g, " ").trim();
        introContent.append(heading);
      }
      const introP = header.querySelector("p");
      if (introP) {
        const p = document.createElement("p");
        p.textContent = introP.textContent.replace(/\s+/g, " ").trim();
        introContent.append(p);
      }
      cells.push([introImg || document.createElement("span"), introContent]);
    }
    const cans = carousel ? [...carousel.querySelectorAll(":scope > li")] : [];
    cans.forEach((li) => {
      const a = li.querySelector("a");
      const href = a ? a.getAttribute("href") || "" : "";
      const slug = href.replace(/^#product-/, "");
      const img = li.querySelector("img");
      const panel = slug ? root.querySelector(`#product-${slug}`) : null;
      let name = img ? (img.getAttribute("alt") || "").trim() : "";
      let descText = "";
      if (panel) {
        const h3 = panel.querySelector(".product-header-text h3, .product-header h3, h3");
        if (h3) name = h3.textContent.replace(/\s+/g, " ").trim();
        const p = panel.querySelector(":scope > .container > p, :scope .container > p, :scope > p");
        if (p) descText = p.textContent.replace(/\s+/g, " ").trim();
      }
      const nameCell = document.createElement("p");
      nameCell.textContent = name;
      const descCell = document.createElement("div");
      if (descText) {
        const p = document.createElement("p");
        p.textContent = descText;
        descCell.append(p);
      }
      const ctaCell = document.createElement("div");
      if (slug) {
        const cta = document.createElement("a");
        cta.setAttribute("href", `/en/products/${slug}`);
        cta.textContent = "Nutrition Facts";
        ctaCell.append(cta);
      }
      const nutriCell = document.createElement("div");
      const nutrition = panel ? panel.querySelector(".nutrition-container, .nutrition") : null;
      if (nutrition) {
        const clone = nutrition.cloneNode(true);
        clone.querySelectorAll("button, .btn-products, .customer-reviews, .smart-commerce, .reviews-btn").forEach((n) => n.remove());
        clone.querySelectorAll("table").forEach((table) => {
          const ul = document.createElement("ul");
          table.querySelectorAll("tr").forEach((tr) => {
            const parts = [...tr.children].map((c) => c.textContent.replace(/\s+/g, " ").trim());
            const text = parts.filter(Boolean).join(" \u2014 ");
            if (!text) return;
            const liEl = document.createElement("li");
            liEl.textContent = text;
            ul.append(liEl);
          });
          table.replaceWith(ul);
        });
        while (clone.firstChild) nutriCell.append(clone.firstChild);
      }
      cells.push([img || document.createElement("span"), nameCell, descCell, ctaCell, nutriCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-tabs", cells });
    block.setAttribute("data-hero-tabs", "true");
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

  // tools/importer/import-products.js
  var PAGE_TEMPLATE = {
    name: "products",
    description: "7UP products landing \u2014 hero-tabs can-carousel with intro + per-flavour panels.",
    urls: [
      "https://www.7up.com/en/products"
    ],
    blocks: [
      {
        name: "hero-tabs",
        instances: ["#product-carousel"]
      }
    ],
    sections: []
  };
  var parsers = {
    "hero-tabs": parse
  };
  var transformers = [transform];
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
  var import_products_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
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
      const heroTabs = document.querySelector("[data-hero-tabs]");
      if (heroTabs) main.prepend(heroTabs);
      executeTransformers("beforeTransform", main, payload);
      executeTransformers("afterTransform", main, payload);
      if (heroTabs) {
        heroTabs.removeAttribute("data-hero-tabs");
        main.textContent = "";
        main.append(heroTabs);
      }
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = "/en/products";
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_products_exports);
})();
