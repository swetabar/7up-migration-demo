export default function decorate(block) {
  // Image-only full-bleed feature photo. If somehow no image, flag it so the
  // block collapses gracefully instead of leaving an empty full-width band.
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
}
