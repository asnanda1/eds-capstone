export default function decorate(block) {
  const rows = [...block.children];

  // Identify the image row and the content row(s).
  rows.forEach((row) => {
    const inner = row.firstElementChild || row;
    if (row.querySelector('picture')) {
      row.classList.add('hero-feature-image');
    } else {
      row.classList.add('hero-feature-content');
    }
    // unwrap single-cell rows to keep the DOM flat
    if (inner !== row && row.children.length === 1) {
      while (inner.firstElementChild) row.append(inner.firstElementChild);
      if (!inner.textContent.trim() && inner.children.length === 0) inner.remove();
    }
  });

  if (!block.querySelector('.hero-feature-image picture')) {
    block.classList.add('no-image');
  }
}
