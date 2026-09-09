/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt): 2 columns, one row per slide.
 *   cell 1 = slide image, cell 2 = content (heading + description + CTA link).
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item; fall back to inner teasers if item markup varies.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.teaser.cmp-teaser--hero, .cmp-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — first cell.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Content (optional) — second cell: heading + description + CTA link(s).
    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
    let ctaLinks = Array.from(slide.querySelectorAll('a.cmp-teaser__action-link'));
    if (!ctaLinks.length) {
      ctaLinks = Array.from(slide.querySelectorAll('.cmp-teaser__action-container a'));
    }

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);

    // Only add a slide row if it has at least an image or content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard: nothing extractable.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
