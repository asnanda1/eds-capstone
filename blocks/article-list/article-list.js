import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_INDEX = '/us/en/query-index.json';

/**
 * Reads the block's config rows. Authors provide a two-column table:
 *   | article-list |            |
 *   | filter       | /us/en/magazine/ |
 *   | limit        | 8          |
 *   | index        | /us/en/query-index.json |
 * @param {Element} block
 * @returns {{filter:string, limit:number, index:string}}
 */
function readConfig(block) {
  const cfg = { filter: '', limit: 0, index: DEFAULT_INDEX };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();
    if (key === 'filter' || key === 'path') cfg.filter = value;
    else if (key === 'limit') cfg.limit = parseInt(value, 10) || 0;
    else if (key === 'index') cfg.index = value;
  });
  return cfg;
}

/**
 * Fetches and caches the query index.
 * @param {string} path index path
 * @returns {Promise<Array>} index records
 */
const indexCache = {};
async function fetchIndex(path) {
  if (!indexCache[path]) {
    indexCache[path] = fetch(path)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return indexCache[path];
}

/**
 * Selects and sorts records for a listing.
 * - keeps only records under the filter prefix
 * - excludes the filter's own landing page (e.g. /us/en/magazine)
 * - newest first by lastModified
 * @param {Array} data index records
 * @param {{filter:string, limit:number}} cfg
 * @returns {Array}
 */
function selectRecords(data, cfg) {
  const prefix = cfg.filter.replace(/\/$/, '');
  let records = data.filter((r) => {
    if (!prefix) return true;
    // must be a descendant of the prefix, not the landing page itself
    return r.path.startsWith(`${prefix}/`);
  });
  records.sort((a, b) => (Number(b.lastModified) || 0) - (Number(a.lastModified) || 0));
  if (cfg.limit > 0) records = records.slice(0, cfg.limit);
  return records;
}

/**
 * Builds a single card list item matching the cards-article visual style.
 * @param {Object} record index record
 * @returns {HTMLElement}
 */
function renderCard(record) {
  const li = document.createElement('li');

  const imageWrap = document.createElement('div');
  imageWrap.className = 'article-list-card-image';
  if (record.image) {
    const picture = createOptimizedPicture(record.image, record.title, false, [{ width: '750' }]);
    const imgLink = document.createElement('a');
    imgLink.href = record.path;
    imgLink.append(picture);
    imageWrap.append(imgLink);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';
  const title = document.createElement('a');
  title.className = 'article-list-card-title';
  title.href = record.path;
  title.textContent = record.title || record.path;
  body.append(title);
  if (record.description) {
    const desc = document.createElement('span');
    desc.className = 'article-list-card-description';
    desc.textContent = record.description;
    body.append(desc);
  }

  li.append(imageWrap, body);
  return li;
}

/**
 * Decorates the article-list block: reads config, fetches the index,
 * and renders matching pages as cards. Newly published pages appear
 * automatically once they are indexed.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  block.textContent = '';

  const data = await fetchIndex(cfg.index);
  const records = selectRecords(data, cfg);

  const ul = document.createElement('ul');
  records.forEach((record) => ul.append(renderCard(record)));
  block.append(ul);
}
