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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".teaser.cmp-teaser--hero, .cmp-teaser"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
      const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
      let ctaLinks = Array.from(slide.querySelectorAll("a.cmp-teaser__action-link"));
      if (!ctaLinks.length) {
        ctaLinks = Array.from(slide.querySelectorAll(".cmp-teaser__action-container a"));
      }
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      contentCell.push(...ctaLinks);
      if (image || contentCell.length) {
        cells.push([image || "", contentCell.length ? contentCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-specs.js
  function parse2(element, { document: document2 }) {
    let specs = Array.from(element.querySelectorAll(".cmp-contentfragment__element"));
    const cells = [];
    specs.forEach((spec) => {
      const labelEl = spec.querySelector(".cmp-contentfragment__element-title, dt");
      const valueEl = spec.querySelector(".cmp-contentfragment__element-value, dd");
      const label = labelEl ? labelEl.textContent.trim() : "";
      const value = valueEl ? valueEl.textContent.trim() : "";
      if (label || value) {
        cells.push([label, value]);
      }
    });
    if (!cells.length) {
      const dts = Array.from(element.querySelectorAll("dt"));
      dts.forEach((dt) => {
        const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === "DD" ? dt.nextElementSibling : null;
        const label = dt.textContent.trim();
        const value = dd ? dd.textContent.trim() : "";
        if (label || value) cells.push([label, value]);
      });
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "table-specs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-adventure.js
  function parse3(element, { document: document2 }) {
    const labels = Array.from(element.querySelectorAll(".cmp-tabs__tab"));
    const panels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    const cells = [];
    panels.forEach((panel, i) => {
      const labelEl = labels[i];
      const label = labelEl ? labelEl.textContent.trim() : `Tab ${i + 1}`;
      const contentRoot = panel.querySelector(".cmp-contentfragment__elements") || panel;
      const nodes = Array.from(
        contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6, img, p, ul, ol")
      ).filter((node) => {
        if (node.classList && node.classList.contains("cmp-contentfragment__title")) return false;
        if (node.tagName === "OL" && node.classList && (node.classList.contains("cmp-tabs__tablist") || node.classList.contains("cmp-carousel__indicators"))) return false;
        return true;
      });
      const contentCell = nodes.length ? nodes : "";
      cells.push([label, contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "#toggleNav",
        "#mobileNav"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        "meta"
      ]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
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

  // tools/importer/import-adventure-detail.js
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "Adventure detail page \u2014 hero, itinerary, gallery, metadata",
    urls: [
      "https://wknd.site/us/en/adventures/climbing-new-zealand.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".carousel.cmp-carousel--mini"]
      },
      {
        name: "table-specs",
        instances: [".contentfragment.cmp-contentfragment--elements"]
      },
      {
        name: "tabs-adventure",
        instances: [".tabs.panelcontainer"]
      }
    ],
    sections: [
      {
        id: "a1",
        name: "Breadcrumb",
        selector: [".breadcrumb.cmp-breadcrumb--fixed"],
        style: null,
        blocks: [],
        defaultContent: [".breadcrumb.cmp-breadcrumb--fixed"]
      },
      {
        id: "a2",
        name: "Hero carousel",
        selector: [".carousel.cmp-carousel--mini"],
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "a3",
        name: "Page title",
        selector: [".title.cmp-title--underline"],
        style: null,
        blocks: [],
        defaultContent: [".title.cmp-title--underline"]
      },
      {
        id: "a4",
        name: "Adventure specs sidebar",
        selector: [".contentfragment.cmp-contentfragment--elements"],
        style: null,
        blocks: ["table-specs"],
        defaultContent: []
      },
      {
        id: "a5",
        name: "Tabbed adventure content",
        selector: [".tabs.panelcontainer"],
        style: null,
        blocks: ["tabs-adventure"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "table-specs": parse2,
    "tabs-adventure": parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
