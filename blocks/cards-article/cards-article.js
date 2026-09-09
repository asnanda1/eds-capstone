import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-article-card-image';
      } else {
        div.className = 'cards-article-card-body';
        /* Normalize body: a bold uppercase title link followed by a
           single-line (ellipsis-truncated) description, matching source. */
        const container = div.querySelector('p') || div;
        const link = container.querySelector('a');
        if (link) {
          link.classList.add('cards-article-card-title');
          /* collect remaining text/inline nodes into a description span */
          const desc = document.createElement('span');
          desc.className = 'cards-article-card-description';
          [...container.childNodes].forEach((node) => {
            if (node === link) return;
            if (link.contains(node)) return;
            desc.append(node);
          });
          div.textContent = '';
          div.append(link);
          if (desc.textContent.trim()) div.append(desc);
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
