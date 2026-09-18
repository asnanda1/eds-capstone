import { createOptimizedPicture } from '../../scripts/aem.js';

const INDEX_PATH = '/us/en/query-index.json';

/**
 * Fetches the query index once and caches it for the lifetime of the page.
 * @returns {Promise<Array>} the index records
 */
let indexPromise;
async function fetchIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_PATH)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return indexPromise;
}

/**
 * Scores a single record against the search terms.
 * Title matches weigh more than description matches.
 * @param {Object} record index record
 * @param {string[]} terms lowercased search terms
 * @returns {number} match score (0 = no match)
 */
function scoreRecord(record, terms) {
  const title = (record.title || '').toLowerCase();
  const description = (record.description || '').toLowerCase();
  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 10;
    if (description.includes(term)) return score + 3;
    return score;
  }, 0);
}

/**
 * Returns matching records sorted by relevance.
 * @param {Array} data index records
 * @param {string} query raw query string
 * @returns {Array} matching records, most relevant first
 */
function search(data, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return data
    .map((record) => ({ record, score: scoreRecord(record, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.record);
}

/**
 * Builds a single result list item.
 * @param {Object} record index record
 * @returns {HTMLElement} <li> element
 */
function renderResult(record) {
  const li = document.createElement('li');
  li.className = 'search-result';

  const link = document.createElement('a');
  link.href = record.path;

  if (record.image) {
    const picture = createOptimizedPicture(record.image, record.title, false, [{ width: '400' }]);
    const imageWrap = document.createElement('div');
    imageWrap.className = 'search-result-image';
    imageWrap.append(picture);
    link.append(imageWrap);
  }

  const body = document.createElement('div');
  body.className = 'search-result-body';
  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = record.title || record.path;
  body.append(title);
  if (record.description) {
    const desc = document.createElement('span');
    desc.className = 'search-result-description';
    desc.textContent = record.description;
    body.append(desc);
  }
  link.append(body);

  li.append(link);
  return li;
}

/**
 * Renders results (or an empty-state message) into the container.
 * @param {HTMLElement} container results container
 * @param {Array} results matching records
 * @param {string} query the query that produced the results
 */
function renderResults(container, results, query) {
  container.textContent = '';
  if (!query) return;

  const heading = document.createElement('p');
  heading.className = 'search-summary';
  heading.textContent = results.length
    ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
    : `No results for "${query}"`;
  container.append(heading);

  if (results.length) {
    const ul = document.createElement('ul');
    ul.className = 'search-results';
    results.forEach((record) => ul.append(renderResult(record)));
    container.append(ul);
  }
}

/**
 * Decorates the search block: an input, a results container, and live filtering.
 * Reads an initial query from the ?q= parameter so header search can deep-link here.
 * @param {HTMLElement} block the search block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const form = document.createElement('form');
  form.className = 'search-box';
  form.setAttribute('role', 'search');
  form.addEventListener('submit', (e) => e.preventDefault());

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search-input';
  input.placeholder = 'Search WKND';
  input.setAttribute('aria-label', 'Search');
  form.append(input);
  block.append(form);

  const results = document.createElement('div');
  results.className = 'search-results-container';
  block.append(results);

  const data = await fetchIndex();

  const runSearch = () => {
    const query = input.value.trim();
    renderResults(results, search(data, query), query);
    const url = new URL(window.location);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  };

  input.addEventListener('input', runSearch);

  const initialQuery = new URLSearchParams(window.location.search).get('q');
  if (initialQuery) {
    input.value = initialQuery;
    runSearch();
  }
  input.focus();
}
