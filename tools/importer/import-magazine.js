/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsUpnextParser from './parsers/cards-upnext.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine',
  description: 'Magazine article page — editorial rich text and imagery',
  urls: [
    'https://wknd.site/us/en/magazine/san-diego-surf.html',
  ],
  blocks: [
    {
      name: 'cards-upnext',
      instances: ['.list.cmp-list--upnext'],
    },
  ],
  sections: [
    {
      id: 'm1', name: 'Lead image', selector: ['div.image.aem-GridColumn:first-of-type'], style: null, blocks: [], defaultContent: ['div.image.aem-GridColumn:first-of-type'],
    },
    {
      id: 'm2', name: 'Article body', selector: ['#container-fca115ba19.cmp-container'], style: null, blocks: [], defaultContent: ['#container-fca115ba19.cmp-container'],
    },
    {
      id: 'm3', name: 'Author bio', selector: ['.cmp-experiencefragment--justin-barr', '.experiencefragment'], style: null, blocks: [], defaultContent: ['.cmp-experiencefragment--justin-barr'],
    },
    {
      id: 'm4', name: 'Up next sidebar', selector: ['.list.cmp-list--upnext'], style: null, blocks: ['cards-upnext'], defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'cards-upnext': cardsUpnextParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

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

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

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
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
