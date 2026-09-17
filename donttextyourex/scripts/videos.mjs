// ── Video pages ─────────────────────────────────────────────────────────────
// Renders VIDEOS (src/meta.js) to standalone static HTML:
//   dist/videos/index.html         a grid of cards - thumbnails only, no players
//   dist/videos/<slug>/index.html  one watch page per episode
//
// Why this shape (researched 2026-09-17, Kamil chose it):
// - Google: "A video category page that lists multiple videos of equal
//   prominence" is NOT a watch page, and video results need "a dedicated watch
//   page for each video". So the grid links out; each episode gets its own URL.
// - Facade: no YouTube iframe loads until the visitor presses play. Each player
//   is an <a> to the video on YouTube with the thumbnail inside, so with no JS
//   it still works (it opens YouTube); the inline script swaps in the
//   youtube-nocookie iframe on click. Same idea as paulirish/lite-youtube-embed,
//   without taking the dependency.
//
// Standalone HTML for the same reasons as the articles (see article.mjs).
// NOTE: every page is one template literal, so a backtick anywhere inside it -
// including the inline script and CSS comments - ends the string. The script
// below uses string concatenation for exactly that reason.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Full YouTube description per episode - summary paragraphs, chapters, studies -
// copied from youtube videos/episodes/*/YOUTUBE-UPLOAD.md so the page carries
// the same words YouTube does. Visible text, which is what engines read.
export const DETAILS = JSON.parse(
  readFileSync(fileURLToPath(new URL("../content/videos.json", import.meta.url)), "utf8"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const clock = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
const thumb = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;       // 1280x720, ~120-150kb
// 640x480 with the 16:9 frame letterboxed inside; object-fit:cover in a 16:9 box
// crops exactly the bars away. About half the bytes of maxres, for cards.
const cardThumb = (id) => `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
const watchUrl = (id, t) => `https://www.youtube.com/watch?v=${id}${t ? `&t=${t}s` : ""}`;

function check(ctx) {
  const need = ["SITE_URL", "BRAND", "AUTHOR", "PRICE", "PAGES", "FORMAT", "READ_TIME",
                "LISTEN_TIME", "INCLUDED", "IDENTITY", "VIDEOS", "CHANNEL_URL", "CSS"];
  for (const k of need) {
    if (ctx[k] === undefined) {
      throw new Error(`videos.mjs: ${k} is undefined - add it to the export list in src/ssr-entry.jsx`);
    }
  }
  for (const v of ctx.VIDEOS) {
    if (!DETAILS[v.id]) throw new Error(`videos.mjs: no entry for ${v.id} in content/videos.json`);
    for (const k of ["slug", "title", "summary", "seconds"]) {
      if (!v[k]) throw new Error(`videos.mjs: ${v.id} has no ${k} in VIDEOS`);
    }
  }
}

function cta(ctx) {
  const { BUY_URL, PRICE, INCLUDED, PAGES, FORMAT, READ_TIME, LISTEN_TIME } = ctx;
  // Same wording as the article CTA; there is no shared component (see article.mjs).
  const label = `Get the book + audiobook — ${PRICE}`;
  return BUY_URL
    ? `<a class="cta" href="${BUY_URL}">${label}</a>
       <p class="included hi">${INCLUDED}</p>
       <p class="terms lo" style="margin-top:4px">${PAGES}-page ${FORMAT} · ${READ_TIME} to read · ${LISTEN_TIME} audiobook · instant download</p>`
    : `<span class="cta" role="link" aria-disabled="true">${label}</span>`;
}

// Shared by both page types: art-direction matches the article pages.
const BASE_CSS = `
  .vp{max-width:1080px;margin-inline:auto;padding:var(--bay) var(--gut)}
  .vp h1{font-family:var(--display);font-weight:400;font-size:clamp(34px,5.2vw,60px);
    line-height:1.03;letter-spacing:-0.015em;color:var(--on-dark-hi);margin-bottom:20px}
  .vp p{font-size:18px;line-height:1.7;color:var(--on-dark-mid)}
  .vp .back{display:inline-block;margin-bottom:38px;font-family:var(--text);font-size:12px;
    font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--orange);text-decoration:none}
  .vp .kick{font-family:var(--text);font-size:12px;font-weight:600;letter-spacing:0.2em;
    text-transform:uppercase;color:var(--on-dark-lo);margin-bottom:12px}
  .vp .lede{max-width:60ch}
  .vp .lede a{color:var(--teal300)}
  .vp .end{margin-top:80px;padding-top:38px;border-top:1px solid rgba(252,250,231,0.14);max-width:720px}
  .vp .end .cta{margin-top:18px}
  .vp .site-id{margin-top:46px;padding-top:22px;border-top:1px solid rgba(252,250,231,0.14);
    font-family:var(--text);font-size:13px;line-height:1.6;color:var(--on-dark-lo);max-width:62ch}
  .dur{position:absolute;right:10px;bottom:10px;background:rgba(10,33,48,0.88);color:var(--on-dark-hi);
    font-family:var(--text);font-size:13px;font-weight:600;padding:3px 8px;border-radius:4px;
    font-variant-numeric:tabular-nums}
  .play{position:absolute;left:50%;top:50%;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;
    background:rgba(10,33,48,0.72);border:2px solid rgba(252,250,231,0.85);transition:background 200ms ease,transform 200ms ease}
  .play::after{content:"";position:absolute;left:29px;top:22px;border-style:solid;border-width:14px 0 14px 22px;
    border-color:transparent transparent transparent var(--on-dark-hi)}
  .card{position:relative;display:flex;flex-direction:column}
  .card .thumb{position:relative;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#000;margin-bottom:16px}
  .card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 400ms ease}
  /* Bottom-left on cards: the thumbnails carry their own big lettering, and a
     centred button sat on top of it. */
  .card .play{left:10px;top:auto;bottom:10px;width:44px;height:44px;margin:0}
  .card .play::after{left:16px;top:12px;border-width:9px 0 9px 14px}
  .card h2, .card h3{font-family:var(--display);font-weight:400;font-size:clamp(22px,2.4vw,28px);
    line-height:1.15;color:var(--on-dark-hi);margin-bottom:10px}
  .card h2 a, .card h3 a{color:inherit;text-decoration:none}
  .card h2 a::after, .card h3 a::after{content:"";position:absolute;inset:0;z-index:1}
  .card .sum{font-size:16px;line-height:1.6;margin-bottom:14px}
  .card .ytl{position:relative;z-index:2;align-self:flex-start;margin-top:auto;font-family:var(--text);
    font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--on-dark-lo);text-decoration:none;padding:6px 0}
  .card .ytl:hover{color:var(--on-dark-hi)}
  .card:hover img{transform:scale(1.03)}
  .card:hover .play{background:var(--orange)}
  .card h2 a:focus-visible{outline:none}
  .card:focus-within .thumb{outline:3px solid var(--orange);outline-offset:3px}
  @media(prefers-reduced-motion:reduce){.card img,.play{transition:none}.card:hover img{transform:none}}
`;

function page({ ctx, url, title, description, ogType, image, css, ld, body, script }) {
  const { BRAND, AUTHOR, CSS } = ctx;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0A2130" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="${esc(AUTHOR)}" />
    <meta property="og:site_name" content="${esc(BRAND)}" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="preconnect" href="https://i.ytimg.com" />
    <style>${CSS}</style>
    <style>${BASE_CSS}${css}</style>
    <script type="application/ld+json">${ld}</script>
  </head>
  <body>
    <div class="page on-ink">
      <main class="vp">
${body}
        <p class="site-id">${esc(ctx.IDENTITY)}</p>
      </main>
    </div>${script ? `\n    <script>${script}</script>` : ""}
  </body>
</html>
`;
}

const card = (v, Tag) => `
          <article class="card">
            <div class="thumb">
              <img src="${cardThumb(v.id)}" alt="" width="640" height="480" loading="lazy" decoding="async" />
              <span class="play" aria-hidden="true"></span>
              <span class="dur"><span class="sr">Length </span>${clock(v.seconds)}</span>
            </div>
            <p class="kick">Episode ${v.episode}</p>
            <${Tag}><a href="/videos/${v.slug}/">${esc(v.title)}</a></${Tag}>
            <p class="sum">${esc(v.summary)}</p>
            <a class="ytl" href="${esc(watchUrl(v.id))}">Watch on YouTube ↗</a>
          </article>`;

const breadcrumbs = (ctx, items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
});

// ── /videos/ ────────────────────────────────────────────────────────────────
export function videosIndexPage(ctx) {
  check(ctx);
  const { SITE_URL, BRAND, VIDEOS, CHANNEL_URL, abs, COVER_SRC } = ctx;
  const url = `${SITE_URL}/videos/`;
  const title = `The 2AM Guy: Videos | ${BRAND}`;
  const description =
    "The 2AM Guy on YouTube: what the research says about the worst hours after a breakup, " +
    "one night at a time. Free to watch.";
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": `${url}#page`, url, name: title, description, inLanguage: "en",
        isPartOf: { "@id": abs("/#website") },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: VIDEOS.map((v, i) => ({
            "@type": "ListItem", position: i + 1, url: `${SITE_URL}/videos/${v.slug}/`, name: v.title,
          })),
        },
      },
      breadcrumbs(ctx, [[BRAND, `${SITE_URL}/`], ["Videos", url]]),
    ],
  }).replace(/<\/script/gi, "<\\/script");

  const body = `
        <a class="back" href="/">← ${esc(BRAND)}</a>
        <h1>The 2AM Guy</h1>
        <p class="lede">What the research says about the worst hours after a breakup, one night at a time.
        More on <a href="${CHANNEL_URL}">the YouTube channel</a>.</p>
        <div class="grid">${VIDEOS.map((v) => card(v, "h2")).join("")}
        </div>
        <div class="end">
          <p>The videos cover one night each. The book covers the whole way out.</p>
          ${cta(ctx)}
        </div>`;

  const css = `
  .grid{display:grid;gap:clamp(40px,5vw,56px) clamp(24px,3vw,36px);margin-top:clamp(40px,6vw,64px);
    grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  return page({ ctx, url, title, description, ogType: "website", image: abs(COVER_SRC), css, ld, body });
}

// ── /videos/<slug>/ ─────────────────────────────────────────────────────────
// Swaps the facade link for the iframe on click. A chapter click starts the
// player at that time (reloading the iframe if one is already playing).
// No backticks and no dollar-brace in here: it lives inside a template literal.
const PLAYER_JS = `
(function(){
  var box=document.querySelector("[data-player]"); if(!box) return;
  function play(t){
    var id=box.getAttribute("data-player");
    var f=document.createElement("iframe");
    f.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0"+(t?"&start="+t:"");
    f.title=box.getAttribute("data-title");
    f.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.referrerPolicy="strict-origin-when-cross-origin";
    f.allowFullscreen=true;
    box.innerHTML=""; box.appendChild(f); f.focus();
  }
  box.addEventListener("click",function(e){
    var a=e.target.closest("a.facade"); if(!a) return;
    e.preventDefault(); play(0);
  });
  document.querySelectorAll("a[data-t]").forEach(function(a){
    a.addEventListener("click",function(e){
      e.preventDefault(); play(+a.getAttribute("data-t"));
      box.scrollIntoView({behavior:"smooth",block:"center"});
    });
  });
})();`;

export function videoWatchPage(v, ctx) {
  check(ctx);
  const { SITE_URL, BRAND, VIDEOS } = ctx;
  const d = DETAILS[v.id];
  const url = `${SITE_URL}/videos/${v.slug}/`;
  const title = `${v.title} | The 2AM Guy`;
  const description = v.summary;

  const graph = [breadcrumbs(ctx, [[BRAND, `${SITE_URL}/`], ["Videos", `${SITE_URL}/videos/`], [v.title, url]])];
  // Only with a real upload date (see VIDEOS in meta.js). Google lists
  // thumbnailUrl, name, description and uploadDate as the core fields.
  if (v.uploaded) {
    const m = Math.floor(v.seconds / 60), s = v.seconds % 60;
    graph.push({
      "@type": "VideoObject", "@id": `${url}#video`, name: v.title,
      description: [v.summary, ...d.about].join(" "),
      thumbnailUrl: [thumb(v.id)], uploadDate: v.uploaded, duration: `PT${m}M${s}S`,
      embedUrl: `https://www.youtube.com/embed/${v.id}`, url,
      publisher: { "@id": ctx.abs("/#publisher") },
    });
  }
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/<\/script/gi, "<\\/script");

  const chapters = d.chapters.map(([t, label]) =>
    `<li><a href="${esc(watchUrl(v.id, t))}" data-t="${t}"><span class="t">${clock(t)}</span><span>${esc(label)}</span></a></li>`).join("");
  const studies = d.studies.map(([label, href]) =>
    `<li>${href ? `<a href="${esc(href)}">${esc(label)}</a>` : esc(label)}</li>`).join("");
  const others = VIDEOS.filter((x) => x.id !== v.id);

  const body = `
        <a class="back" href="/videos/">← All videos</a>
        <p class="kick">The 2AM Guy · Episode ${v.episode} · ${clock(v.seconds)}</p>
        <h1>${esc(v.title)}</h1>
        <div class="player" data-player="${esc(v.id)}" data-title="${esc(v.title)}">
          <a class="facade" href="${esc(watchUrl(v.id))}" aria-label="Play: ${esc(v.title)}">
            <img src="${thumb(v.id)}" alt="" width="1280" height="720" fetchpriority="high" />
            <span class="play" aria-hidden="true"></span>
          </a>
        </div>
        <div class="cols">
          <div class="about">
            ${d.about.map((p) => `<p>${esc(p)}</p>`).join("\n            ")}
            <p><a class="ytb" href="${esc(watchUrl(v.id))}">Watch on YouTube ↗</a></p>
          </div>
          <nav class="chapters" aria-labelledby="h-chap">
            <h2 id="h-chap">Chapters</h2>
            <ol>${chapters}</ol>
          </nav>
        </div>
        <details class="studies">
          <summary>Studies mentioned (${d.studies.length})</summary>
          <ul>${studies}</ul>
        </details>
        ${d.disclaimer ? `<p class="disc">${esc(d.disclaimer)}</p>` : ""}
        ${others.length ? `<section class="more" aria-labelledby="h-more">
          <h2 id="h-more">More episodes</h2>
          <div class="grid">${others.map((x) => card(x, "h3")).join("")}
          </div>
        </section>` : ""}
        <div class="end">
          <p>The videos cover one night each. The book covers the whole way out.</p>
          ${cta(ctx)}
        </div>`;

  const css = `
  .vp h1{max-width:22ch}
  .player{position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#000;
    margin:clamp(24px,4vw,40px) 0 clamp(32px,5vw,52px);box-shadow:0 30px 60px -30px rgba(0,0,0,0.7)}
  .player iframe, .player .facade, .player img{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
  .player img{object-fit:cover}
  /* Corner, not centre: the thumbnails carry their own lettering. */
  .player .play{left:clamp(14px,2.5vw,24px);top:auto;bottom:clamp(14px,2.5vw,24px);margin:0}
  .facade:hover .play, .facade:focus-visible .play{background:var(--orange);transform:scale(1.06)}
  .facade:focus-visible{outline:3px solid var(--orange);outline-offset:-3px}
  .cols{display:grid;gap:clamp(36px,5vw,64px)}
  @media(min-width:880px){.cols{grid-template-columns:1.35fr 1fr}}
  .about p{margin-bottom:18px;max-width:62ch}
  .ytb{display:inline-block;margin-top:6px;padding:12px 20px;border:1px solid rgba(252,250,231,0.35);border-radius:999px;
    font-family:var(--text);font-size:14px;font-weight:600;color:var(--on-dark-hi);text-decoration:none}
  .ytb:hover{border-color:var(--on-dark-hi)}
  .chapters h2, .more h2{font-family:var(--text);font-size:12px;font-weight:600;letter-spacing:0.2em;
    text-transform:uppercase;color:var(--on-dark-lo);margin-bottom:14px}
  .chapters ol{list-style:none;margin:0;padding:0;border-top:1px solid rgba(252,250,231,0.12)}
  .chapters li{border-bottom:1px solid rgba(252,250,231,0.12)}
  .chapters a{display:flex;gap:16px;padding:11px 4px;font-size:16px;line-height:1.45;color:var(--on-dark-mid);text-decoration:none}
  .chapters a:hover{color:var(--on-dark-hi);background:rgba(252,250,231,0.04)}
  .chapters .t{flex:0 0 3.2em;font-variant-numeric:tabular-nums;color:var(--teal300)}
  .studies{margin-top:clamp(40px,6vw,64px);border-top:1px solid rgba(252,250,231,0.14);border-bottom:1px solid rgba(252,250,231,0.14)}
  .studies summary{cursor:pointer;padding:20px 0;font-family:var(--text);font-size:12px;font-weight:600;
    letter-spacing:0.2em;text-transform:uppercase;color:var(--on-dark-mid)}
  .studies summary:hover{color:var(--on-dark-hi)}
  .studies ul{list-style:none;margin:0 0 24px;padding:0;max-width:760px}
  .studies li{font-size:15px;line-height:1.6;color:var(--on-dark-mid);margin-bottom:10px;padding-left:22px;
    position:relative;overflow-wrap:anywhere}
  .studies li::before{content:"";position:absolute;left:0;top:11px;width:8px;height:2px;background:var(--orange)}
  .studies a{color:var(--on-dark-mid);text-decoration-color:rgba(252,250,231,0.3)}
  .disc{margin-top:28px;font-size:14px !important;color:var(--on-dark-lo) !important;max-width:70ch}
  .more{margin-top:clamp(64px,9vw,104px)}
  .more .grid{display:grid;gap:40px 32px;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  return page({ ctx, url, title, description, ogType: "video.other", image: thumb(v.id), css, ld, body, script: PLAYER_JS });
}
