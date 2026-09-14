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

  // The Destini ProductFirst snippet reads its config from the attributes on its
  // OWN <script> installation tag (the `?id=` param only names the target div).
  // Mirror the config onto the mount div too — Destini hydrates it — but the
  // authoritative source for the snippet is the script tag, so config MUST live
  // there or Destini errors with "missing locator-id from the installation script".
  const attrMap = {
    locatorId: 'locator-id',
    alphaCode: 'alpha-code',
    locatorName: 'locator-name',
    clientId: 'client-id',
  };

  // Load the Destini loader snippet once per page, carrying the config as
  // attributes on the script tag itself.
  if (!document.querySelector('script[src*="lets.shop/productFirstSnippet.js"]')) {
    const script = document.createElement('script');
    script.src = DESTINI_LOADER;
    script.async = true;
    Object.entries(attrMap).forEach(([dataKey, attr]) => {
      const value = block.dataset[dataKey];
      if (value) {
        script.setAttribute(attr, value);
        mount.setAttribute(attr, value);
      }
    });
    document.body.append(script);
  }
}
