import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // tag social links so CSS can render brand icons
  const NETWORKS = ['facebook', 'twitter', 'instagram'];
  footer.querySelectorAll('a').forEach((a) => {
    const hint = `${a.getAttribute('href') || ''} ${a.textContent}`.toLowerCase();
    const network = NETWORKS.find((n) => hint.includes(n));
    if (network) {
      a.classList.add('footer-social', `footer-social-${network}`);
      a.setAttribute('aria-label', network.charAt(0).toUpperCase() + network.slice(1));
    }
  });

  block.append(footer);
}
