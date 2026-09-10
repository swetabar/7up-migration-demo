import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-recipe-card-image';
      } else {
        div.className = 'cards-recipe-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // If a card's body contains a single link, make the whole card clickable.
  ul.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('.cards-recipe-card-body a[href]');
    if (link) li.dataset.href = link.getAttribute('href');
  });
  ul.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-href]');
    if (li && !e.target.closest('a')) window.location.assign(li.dataset.href);
  });

  block.textContent = '';
  block.append(ul);
}
