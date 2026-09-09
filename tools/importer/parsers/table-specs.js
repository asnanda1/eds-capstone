/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-specs. Base: table (no-header variant).
 * Source: https://wknd.site/us/en/adventures/climbing-new-zealand.html
 *   (.contentfragment.cmp-contentfragment--elements)
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt + metadata.json):
 *   Table, no header row. 2 columns, one row per spec.
 *   cell 1 = label (e.g. "Activity"), cell 2 = value (e.g. "Rock Climbing").
 *
 * Source is an AEM content fragment: <dl class="cmp-contentfragment__elements">
 *   with one <div class="cmp-contentfragment__element"> per spec, each holding a
 *   <dt ...__element-title> (label) and a <dd ...__element-value> (value).
 */
export default function parse(element, { document }) {
  // Each spec is a content-fragment element; fall back to raw dt/dd pairs if the
  // wrapper markup varies across pages.
  let specs = Array.from(element.querySelectorAll('.cmp-contentfragment__element'));

  const cells = [];

  specs.forEach((spec) => {
    const labelEl = spec.querySelector('.cmp-contentfragment__element-title, dt');
    const valueEl = spec.querySelector('.cmp-contentfragment__element-value, dd');
    const label = labelEl ? labelEl.textContent.trim() : '';
    const value = valueEl ? valueEl.textContent.trim() : '';
    // Only emit a row when there is something to show; keep 2 cells per row.
    if (label || value) {
      cells.push([label, value]);
    }
  });

  // Fallback: some pages expose the elements as bare dt/dd siblings inside the <dl>.
  if (!cells.length) {
    const dts = Array.from(element.querySelectorAll('dt'));
    dts.forEach((dt) => {
      const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === 'DD'
        ? dt.nextElementSibling
        : null;
      const label = dt.textContent.trim();
      const value = dd ? dd.textContent.trim() : '';
      if (label || value) cells.push([label, value]);
    });
  }

  // Empty-block guard: nothing extractable — unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-specs', cells });
  element.replaceWith(block);
}
