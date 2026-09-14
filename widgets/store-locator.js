/*
 * store-locator widget — mounts the Destini Product Locators embed.
 *
 * The widget block (blocks/widget/widget.js) fetches this file's HTML/CSS/JS and
 * calls this default export with the block element.
 *
 * Destini's ProductFirst snippet reads its config from the attributes on its OWN
 * <script> installation tag (the `?id=` param only names the target div); without
 * a `locator-id` there it errors with "missing locator-id from the installation
 * script". The config is FIXED for the 7UP OCL locator, so we bake it in as
 * defaults here rather than routing it through the authored content link — EDS
 * normalizes authored links and drops query strings, so config passed via the
 * link href does not survive the content pipeline. Authored data-* attributes
 * (if ever present) still override the defaults.
 */
const MOUNT_ID = 'destini-locator';
const DESTINI_LOADER = `https://lets.shop/productFirstSnippet.js?id=${MOUNT_ID}`;

// Fixed Destini config for the 7UP OCL Store Locator.
const DEFAULT_CONFIG = {
  'locator-id': '3170',
  'alpha-code': 'C62',
  'locator-name': '7UP OCL Store Locator',
  'client-id': 'up',
};

// Map hyphenated Destini attrs to their camelCase dataset aliases (for overrides).
const DATASET_KEYS = {
  'locator-id': 'locatorId',
  'alpha-code': 'alphaCode',
  'locator-name': 'locatorName',
  'client-id': 'clientId',
};

/**
 * @param {Element} block the widget block element (optional config on block.dataset)
 */
export default function decorate(block) {
  const mount = block.querySelector(`#${MOUNT_ID}`);
  if (!mount) return;

  // Resolve config: baked-in defaults, optionally overridden by authored data-*.
  const config = {};
  Object.entries(DEFAULT_CONFIG).forEach(([attr, fallback]) => {
    const override = block.dataset[DATASET_KEYS[attr]];
    config[attr] = override || fallback;
  });

  // Load the Destini loader snippet once per page, carrying the config as
  // attributes on the script tag (authoritative) and mirrored onto the mount div.
  if (!document.querySelector('script[src*="lets.shop/productFirstSnippet.js"]')) {
    const script = document.createElement('script');
    script.src = DESTINI_LOADER;
    script.async = true;
    Object.entries(config).forEach(([attr, value]) => {
      script.setAttribute(attr, value);
      mount.setAttribute(attr, value);
    });
    document.body.append(script);
  }
}
