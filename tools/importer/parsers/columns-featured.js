/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-09
 *
 * Structure (from metadata contentPattern): single row, 2 cells.
 *   cell 1 = image, cell 2 = text (eyebrow + heading + description + CTA link).
 */
export default function parse(element, { document }) {
  // Image (left column).
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Text content (right column): eyebrow + heading + description + CTA link(s).
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
  // Exclude pretitle from the heading match ("pretitle" contains the substring "title",
  // which would otherwise make [class*="title"] select the eyebrow in document order).
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  let ctaLinks = Array.from(element.querySelectorAll('a.cmp-teaser__action-link'));
  if (!ctaLinks.length) {
    ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-container a'));
  }

  const textCell = [];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  // Empty-block guard.
  if (!image && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[image || '', textCell.length ? textCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
