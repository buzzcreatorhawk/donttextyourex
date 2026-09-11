// The bundle entry for the prerender pass. Node cannot parse JSX, so esbuild
// bundles this to plain JS first and scripts/prerender.mjs imports the result.
// It exists only to gather App.jsx's default export and the few values the
// prerenderer needs into one module, so there is a single thing to import.
export { default } from "./App.jsx";
export { jsonLdString, SITE_URL, ARTICLES, AUTHOR, BRAND, TITLE, BUY_URL,
         PRICE, PAGES, FORMAT, READ_TIME, abs, COVER_SRC,
         IDENTITY, ALT_NAME } from "./meta.js";
export { CSS } from "./styles.js";
