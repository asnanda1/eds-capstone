/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventure. Base: tabs.
 * Sources (validated against both cached instances):
 *   - https://wknd.site/us/en/adventures/climbing-new-zealand.html (.tabs.panelcontainer)
 *       adventure-detail: each panel holds a content fragment.
 *   - https://wknd.site/us/en/adventures.html (.tabs.panelcontainer)
 *       adventures-listing: each panel holds a `.image-list.list` card grid.
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt): 2 columns, one row per tab.
 *   cell 1 = tab label (from `.cmp-tabs__tab`),
 *   cell 2 = tab content (from `.cmp-tabs__tabpanel`).
 *
 * Source is an AEM tabs component:
 *   <ol class="cmp-tabs__tablist"><li class="cmp-tabs__tab">Label</li>...</ol>
 *   <div class="cmp-tabs__tabpanel"> ...panel content... </div> (one per tab)
 *
 * Two panel-content shapes are handled without regressing either page:
 *
 *  (A) Content-fragment panels (adventure-detail): the meaningful content lives in
 *      `.cmp-contentfragment__elements` (headings/images/paragraphs/lists), while the
 *      content fragment's own `<h3 class="cmp-contentfragment__title">` is a repeated
 *      adventure name we omit from the tab body. We extract those leaf nodes.
 *
 *  (B) Nested-block panels (adventures-listing): each panel contains a `.image-list.list`
 *      card grid. Because the import runs parsers in template order
 *      (hero-feature → cards-article → tabs-adventure) and parsers mutate the DOM in
 *      place, the `cards-article` parser has ALREADY converted each grid into a cards
 *      block table by the time this parser runs. We therefore take the panel's child
 *      subtree AS-IS (the converted cards block) as the tab content — a nested block
 *      inside the tab panel — instead of flattening to leaf nodes (which would descend
 *      into the cards table, drop the `<a>` card titles, and destroy the block).
 */
export default function parse(element, { document }) {
  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  panels.forEach((panel, i) => {
    // Tab label — first cell. Fall back to a generic label if the tablist is absent.
    const labelEl = labels[i];
    const label = labelEl ? labelEl.textContent.trim() : `Tab ${i + 1}`;

    // Tab content — second cell.
    const cfRoot = panel.querySelector('.cmp-contentfragment__elements');

    let contentCell;
    if (cfRoot) {
      // (A) Content-fragment panel (adventure-detail). Collect meaningful leaf content
      // nodes: headings, images, paragraphs, lists. Selectors are mutually exclusive
      // (distinct element types), so no double capture.
      const nodes = Array.from(
        cfRoot.querySelectorAll('h1, h2, h3, h4, h5, h6, img, p, ul, ol'),
      ).filter((node) => {
        // Skip the repeated content-fragment title heading.
        if (node.classList && node.classList.contains('cmp-contentfragment__title')) return false;
        // Skip list containers that are the tablist / carousel indicators (defensive).
        if (node.tagName === 'OL' && node.classList
          && (node.classList.contains('cmp-tabs__tablist')
            || node.classList.contains('cmp-carousel__indicators'))) return false;
        return true;
      });
      contentCell = nodes.length ? nodes : '';
    } else {
      // (B) Nested-block / generic panel (adventures-listing). Take the panel's element
      // children as-is so an already-converted nested block (e.g. the cards-article
      // table) is preserved intact rather than flattened.
      const kids = Array.from(panel.children);
      contentCell = kids.length ? kids : '';
    }

    cells.push([label, contentCell]);
  });

  // Empty-block guard: no tabs found — unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventure', cells });
  element.replaceWith(block);
}
