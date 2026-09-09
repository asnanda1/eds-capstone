/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks and section metadata (shared across all WKND templates).
 * Fully section-list-driven from payload.template.sections in
 * tools/importer/page-templates.json, so it serves every template unchanged:
 *   - home: 5 sections; only "Featured article" (s2) is styled ("grey") → 4 <hr> + 1 Section Metadata.
 *   - adventure-detail: 5 sections (Breadcrumb, Hero carousel, Page title,
 *     Adventure specs sidebar, Tabbed adventure content); all styles null →
 *     4 <hr> + 0 Section Metadata. Selectors verified against
 *     migration-work/cleaned.html (climbing-new-zealand).
 *   - adventures-listing: 5 sections (Page title l1, Intro feature banner l2,
 *     Current adventures heading l3, Filter tabs and card grid l4, Separator l5);
 *     all styles null → 4 <hr> + 0 Section Metadata. Selectors verified against
 *     migration-work/cleaned.html (/us/en/adventures): l1
 *     main.cmp-layout-container--fixed:nth-of-type(1), l2 .teaser.cmp-teaser--hero,
 *     l3 .title.cmp-title--underline, l4 .tabs.panelcontainer, l5 .separator
 *     (first match is the authorable content separator, in document order before
 *     the footer's hidden separator).
 *   - magazine: 4 sections (Lead image m1, Article body m2, Author bio m3,
 *     Up next sidebar m4); all styles null → 3 <hr> + 0 Section Metadata.
 *     Selectors verified against migration-work/cleaned.html (san-diego-surf):
 *     m1 div.image.aem-GridColumn:first-of-type (line 165), m2
 *     #container-fca115ba19.cmp-container (line 188), m3
 *     .cmp-experiencefragment--justin-barr (line 302, the authorable author-bio
 *     XF preserved by wknd-cleanup.js), m4 .list.cmp-list--upnext (line 379).
 * Section selectors come from tools/importer/page-templates.json (DOM-verified from page analysis).
 *
 * Breaks are inserted in beforeTransform (while every section element still exists,
 * before block parsers replace them) using a marker attribute; Section Metadata is
 * inserted in afterTransform anchored to that marker.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker) the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
