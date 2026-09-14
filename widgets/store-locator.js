/*
 * store-locator widget — mounts the Destini Product Locators embed.
 *
 * The widget block (blocks/widget/widget.js) fetches this file's HTML/CSS/JS and
 * calls this default export with the block element. It has already copied the
 * authored link's query params onto `block.dataset` (data-locator-id, etc.).
 *
 * Destini hydrates an empty mount div (#destini-locator) that carries its config
 * as attributes; its loader snippet then injects the search UI client-side. The
 * snippet targets the mount by id via its `?id=` query param.
 */
const MOUNT_ID = 'destini-locator';
const DESTINI_LOADER = `https://lets.shop/productFirstSnippet.js?id=${MOUNT_ID}`;

/**
 * @param {Element} block the widget block element (config on block.dataset)
 */
export default function decorate(block) {
  const mount = block.querySelector(`#${MOUNT_ID}`);
  if (!mount) return;

  // Apply the Destini config (carried as data-* on the block) back onto the
  // mount div as the hyphenated attributes the Destini script expects.
  const attrMap = {
    locatorId: 'locator-id',
    alphaCode: 'alpha-code',
    locatorName: 'locator-name',
    clientId: 'client-id',
  };
  Object.entries(attrMap).forEach(([dataKey, attr]) => {
    const value = block.dataset[dataKey];
    if (value) mount.setAttribute(attr, value);
  });

  // Load the Destini loader snippet once per page.
  if (!document.querySelector('script[src*="lets.shop/productFirstSnippet.js"]')) {
    const script = document.createElement('script');
    script.src = DESTINI_LOADER;
    script.async = true;
    document.body.append(script);
  }
}
