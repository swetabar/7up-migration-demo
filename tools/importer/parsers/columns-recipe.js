/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-recipe. Base: columns.
 * Source selector: #body section.recipe-detail .recipe-content
 * Source structure: div.recipe-content with two child <div>s:
 *   Column 1 (Ingredients): <h2>Ingredients</h2>, <ul class="ingredients">, and a
 *     .recipe-opt-container with an <hr> and a <ul> of metadata rows (icon <img> + text).
 *   Column 2 (Directions): <h2>Directions</h2>, <ul class="directions"> steps, and a
 *     .glasstype note (icon <img> + text).
 * Emit a 2-column columns block: 1 content row, cell 1 = Ingredients column, cell 2 = Directions column.
 * Icons, list semantics, and <sup>® </sup> markup are preserved (whole child elements referenced).
 * Generated: 2026-09-10
 */
export default function parse(element, { document }) {
  // The two top-level columns are the direct child <div>s of .recipe-content.
  const columnDivs = Array.from(element.querySelectorAll(':scope > div'));

  // Empty-block guard: need at least one column of content.
  if (columnDivs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const ingredientsCol = columnDivs[0];
  const directionsCol = columnDivs[1] || document.createElement('div');

  // A columns block cell becomes one grid-table cell in the imported markdown.
  // A single leading heading (the column's "Ingredients"/"Directions" title) is fine,
  // but a SECOND block-level heading later in the same cell — e.g. the "21+. Please
  // Drink Responsibly." <h6> alcoholic recipes place after the Directions list — makes
  // md2da fall back to emitting the whole page as raw grid-table text. Keep the first
  // heading in each column as its title and downgrade any later headings to <p> so the
  // text is preserved while the grid table stays valid.
  [ingredientsCol, directionsCol].forEach((col) => {
    const headings = col.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((h, i) => {
      if (i === 0) return; // keep the column title as a heading
      const p = document.createElement('p');
      p.innerHTML = h.innerHTML;
      h.replaceWith(p);
    });
  });

  // Reference the whole column elements so lists, icons, and <sup> markup
  // are preserved intact within each cell.
  const cells = [];
  cells.push([ingredientsCol, directionsCol]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-recipe', cells });
  element.replaceWith(block);
}
