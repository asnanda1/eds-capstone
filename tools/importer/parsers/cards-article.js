/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt): 2 columns, one row per card.
 *   cell 1 = image (mandatory), cell 2 = body (title link + description).
 */
export default function parse(element, { document }) {
  // Each card is a list item; fall back to the article wrapper if list markup varies.
  let cards = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('.cmp-image-list__item-content, li, article'));
  }

  const cells = [];

  cards.forEach((card) => {
    // Image (mandatory) — first cell.
    const image = card.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Body (second cell): title link + description.
    // Use the linked title anchor so the heading remains a clickable link.
    const titleLink = card.querySelector('a.cmp-image-list__item-title-link');
    const title = titleLink
      || card.querySelector('.cmp-image-list__item-title, h1, h2, h3, [class*="title"]');
    const description = card.querySelector('.cmp-image-list__item-description, [class*="description"], p');

    const bodyCell = [];
    if (title) bodyCell.push(title);
    if (description) bodyCell.push(description);

    // Only add a card row if it has content.
    if (image || bodyCell.length) {
      cells.push([image || '', bodyCell.length ? bodyCell : '']);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
