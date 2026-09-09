// ── Post-build prerender ────────────────────────────────────────────────────
// Runs after `vite build`. Renders <App /> to static HTML with React's server
// renderer, then injects that markup and the JSON-LD into dist/index.html and
// writes dist/sitemap.xml.
//
// Why this exists: the site is a client-rendered SPA, so the shipped index.html
// is an empty <div id="root">. Googlebot will execute the JS on a later crawl
// pass, but crawlers that only fetch HTML - which includes most answer-engine
// fetchers - read what is in the file, and what was in the file was nothing.
// Prerendering is the difference between the page having content and not having
// content for every consumer that is not a full browser.
//
// Worth knowing before leaning on it: exactly which crawlers execute JS changes
// without announcement, and I have not tested any of them against this site.
// Static HTML is the right answer either way, which is why none of this depends
// on knowing the current answer.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as esbuild from "esbuild";
import { articlePage } from "./article.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dist = resolve(root, "dist");
const htmlPath = resolve(dist, "index.html");

if (!existsSync(htmlPath)) {
  console.error("[prerender] dist/index.html not found - run `vite build` first.");
  process.exit(1);
}

// App.jsx is ESM + JSX and Node cannot parse JSX, so bundle a server entry first.
//
// react, react-dom and the JSX runtime are deliberately EXTERNAL. If they were
// bundled, the App would call the bundled copy of React's useState while
// renderToStaticMarkup below drove this file's copy - two module instances, two
// separate internal dispatchers, and every hook throwing "invalid hook call".
// Keeping them external is what makes the two halves share one React.
const ssrDir = resolve(dist, ".ssr");
mkdirSync(ssrDir, { recursive: true });
const entryOut = resolve(ssrDir, "entry.mjs");

await esbuild.build({
  entryPoints: [resolve(root, "src/ssr-entry.jsx")],
  outfile: entryOut,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  jsx: "automatic",
  logLevel: "warning",
  external: ["react", "react-dom", "react/jsx-runtime", "react-dom/server"],
});

const ctx = await import(pathToFileURL(entryOut).href);
const { default: App, jsonLdString, SITE_URL, ARTICLES } = ctx;

// renderToStaticMarkup, not renderToString: the client uses createRoot rather
// than hydrateRoot, so React throws this markup away and mounts fresh. That is
// deliberate. It means there is no hydration tree to keep in sync and no class
// of hydration-mismatch bug to maintain, and the static pass exists purely for
// consumers that will never run the JS.
//
// A human sees no flash from that discard, because the reveal gate now lives on
// <html class="js">, set by an inline script before first paint - so both the
// static markup and React's replacement start out hidden. See index.html.
const markup = renderToStaticMarkup(createElement(App));

let html = readFileSync(htmlPath, "utf8");

const rootDiv = '<div id="root"></div>';
if (!html.includes(rootDiv)) {
  console.error('[prerender] No empty <div id="root"></div> in dist/index.html.');
  console.error("[prerender] Refusing to guess where the markup belongs.");
  process.exit(1);
}
html = html.replace(rootDiv, `<div id="root">${markup}</div>`);

const ld = `<script type="application/ld+json">${jsonLdString()}</script>`;
if (!html.includes("<!--JSONLD-->")) {
  console.error("[prerender] No <!--JSONLD--> placeholder in index.html.");
  process.exit(1);
}
html = html.replace("<!--JSONLD-->", ld);

writeFileSync(htmlPath, html, "utf8");

// ── Articles ──────────────────────────────────────────────────────────────
// Written before the sitemap, because the sitemap lists whatever was built.
const built = [];
for (const meta of ARTICLES) {
  const md = readFileSync(resolve(root, "content", meta.file), "utf8");
  const outDir = resolve(dist, meta.slug);
  mkdirSync(outDir, { recursive: true });
  const page = articlePage(md, meta, ctx);
  writeFileSync(resolve(outDir, "index.html"), page, "utf8");
  built.push(meta);
  console.log(`[prerender] ${meta.slug}/index.html ${(page.length / 1024).toFixed(1)}kb`);
}

// Sitemap. Generated rather than committed so lastmod is the real build date
// instead of a date someone typed once and then stopped updating. Articles
// carry their own `updated`, which is the date the words changed - not the
// date of the last deploy.
const lastmod = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ...built.map(
    (a) => `  <url>
    <loc>${SITE_URL}/${a.slug}/</loc>
    <lastmod>${a.updated}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  ),
].join("\n");

writeFileSync(
  resolve(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  "utf8"
);

const kb = (n) => `${(n / 1024).toFixed(1)}kb`;
console.log(`[prerender] index.html ${kb(html.length)} (markup ${kb(markup.length)}), sitemap.xml written`);

// Cheap guards against a silently empty render. These have caught more real
// breakage than any amount of eyeballing the output.
const problems = [];
if (!markup.includes("<h1")) problems.push("no <h1> in the rendered markup");
if (!markup.includes("Should I text my ex?")) problems.push("FAQ questions missing from markup");
if (!html.includes("application/ld+json")) problems.push("JSON-LD not injected");
for (const a of built) {
  const f = readFileSync(resolve(dist, a.slug, "index.html"), "utf8");
  if (!f.includes("<h1")) problems.push(`${a.slug}: no <h1>`);
  if (!f.includes("application/ld+json")) problems.push(`${a.slug}: no JSON-LD`);
  if (f.length < 4000) problems.push(`${a.slug}: suspiciously short`);
}
if (problems.length) {
  console.error(`[prerender] FAILED: ${problems.join("; ")}`);
  process.exit(1);
}
