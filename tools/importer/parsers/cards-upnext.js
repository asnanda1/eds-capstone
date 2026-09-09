/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-upnext. Base: cards (no-images variant).
 * Source: https://wknd.site/us/en/magazine/san-diego-surf.html
 * Generated: 2026-09-09
 *
 * Source is an AEM cmp-list (.list.cmp-list--upnext) — a text-only "up next"
 * related-articles list. Each <li> has an <a class="cmp-list__item-link">
 * wrapping a title span and a date span. NO images.
 *
 * Output follows the Cards (no images) convention: 1 column, one row per card.
 * Each card row is a single body cell containing the title as a link (href
 * preserved) plus the publication date as a separate (non-linked) element.
 * The cards-upnext decorator adds cards-upnext-card-body for a single body
 * cell (only adds cards-upnext-card-image when a picture is present), so no
 * empty image cell is fabricated.
 */
export default function parse(element, { document }) {
  // Each list item — validated against source.html (.cmp-list__item).
  const items = Array.from(element.querySelectorAll('li.cmp-list__item, .cmp-list__item'));

  const cells = [];

  items.forEach((item) => {
    // Link wrapping the title + date. Fallback to any anchor in the item.
    const sourceLink = item.querySelector('a.cmp-list__item-link, a');
    if (!sourceLink) return;

    const titleEl = item.querySelector('.cmp-list__item-title');
    const dateEl = item.querySelector('.cmp-list__item-date');

    // Title text — prefer the dedicated title span, else the link text.
    const titleText = (titleEl ? titleEl.textContent : sourceLink.textContent).trim();
    if (!titleText) return;

    // Build the title as a standalone link (href preserved), so the date is
    // NOT swallowed into the link (source wraps both spans in one <a>).
    const link = document.createElement('a');
    link.setAttribute('href', sourceLink.getAttribute('href') || '');
    link.textContent = titleText;

    const bodyCell = [link];

    // Publication date as a separate, non-linked element below the title.
    if (dateEl) {
      const dateText = dateEl.textContent.trim();
      if (dateText) {
        const dateP = document.createElement('p');
        dateP.textContent = dateText;
        bodyCell.push(dateP);
      }
    }

    // 1-column card row: one row, one cell holding the title link + date.
    cells.push([bodyCell]);
  });

  // Empty-block guard: no list items found — unwrap gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-upnext', cells });
  element.replaceWith(block);
}
