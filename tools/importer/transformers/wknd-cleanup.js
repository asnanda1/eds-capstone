/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup (shared across all WKND templates).
 * Removes non-authorable site shell (header, footer, nav, search, mobile nav,
 * tracking iframe) and leftover empty elements. The site shell is identical
 * across templates, so this single transformer serves the "home",
 * "adventure-detail", "adventures-listing" and "magazine" templates. All
 * selectors verified against migration-work/cleaned.html snapshots (home;
 * adventure-detail: climbing-new-zealand; adventures-listing: /us/en/adventures;
 * magazine: san-diego-surf) where header.cmp-experiencefragment--header,
 * footer.cmp-experiencefragment--footer, the Adobe ID Syncing iframe, #toggleNav
 * and #mobileNav are all present.
 *
 * NOTE (author-bio preservation): the magazine article embeds an AUTHORABLE
 * author-bio experience fragment (div.experiencefragment >
 * .cmp-experiencefragment--justin-barr, cleaned.html lines 301-302). This
 * transformer removes header/footer XF by their SPECIFIC tag+class selectors
 * (header.cmp-experiencefragment--header / footer.cmp-experiencefragment--footer)
 * and deliberately does NOT use a broad .experiencefragment or
 * .cmp-experiencefragment selector, so the author-bio XF is preserved as
 * authorable content (it is section m3 in the magazine template).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking / syncing iframe (cleaned.html line 566: #destination_publishing_iframe_*)
    // Mobile nav toggle and drawer (cleaned.html lines 568, 574) — remove before parsing.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell from experience fragments (cleaned.html):
    //  - header.cmp-experiencefragment--header (line 5)
    //  - footer.cmp-experiencefragment--footer (line 471)
    // Specific tag+class selectors only — the author-bio XF
    // (.cmp-experiencefragment--justin-barr) is authorable and is NOT matched.
    // Plus leftover empty <meta> tags inside cmp-image wrappers (e.g. line 183).
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      'meta',
    ]);
  }
}
