/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-feature. Base: hero.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt): 1 column, 3 rows.
 *   Row 1 = block name (added by createBlock).
 *   Row 2 = background image (one cell).
 *   Row 3 = content: heading + description + CTA link (one cell).
 */
export default function parse(element, { document }) {
  // Background image (optional).
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Content: heading + description + CTA link(s).
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  let ctaLinks = Array.from(element.querySelectorAll('a.cmp-teaser__action-link'));
  if (!ctaLinks.length) {
    ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-container a'));
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Empty-block guard.
  if (!bgImage && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: background image (1-column → single cell in its own row).
  if (bgImage) cells.push([bgImage]);
  // Row 3: content (1-column → all content in a single cell).
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
