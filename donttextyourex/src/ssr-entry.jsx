// The bundle entry for the prerender pass. Node cannot parse JSX, so esbuild
// bundles this to plain JS first and scripts/prerender.mjs imports the result.
// It exists only to gather App.jsx's default export and the few values the
// prerenderer needs into one module, so there is a single thing to import.
export { default } from "./App.jsx";
// Anything the article template reads off ctx MUST be listed here. ctx is THIS
// module, not meta.js, so a value that exists in meta.js but is missing from
// this line arrives as undefined - and a template literal renders that as the
// word "undefined" in shipped HTML rather than failing. That is exactly what
// happened to LISTEN_TIME and INCLUDED on 2026-09-12.
export { jsonLdString, SITE_URL, ARTICLES, AUTHOR, BRAND, TITLE, BUY_URL,
         PRICE, PAGES, FORMAT, READ_TIME, LISTEN_TIME, INCLUDED, abs, COVER_SRC,
         IDENTITY, ALT_NAME, POSITIONING, DESCRIPTION } from "./meta.js";
export { CSS } from "./styles.js";
