// ── Videos page ─────────────────────────────────────────────────────────────
// Renders VIDEOS (src/meta.js) to standalone static HTML at dist/videos/index.html.
// Standalone for the same reasons as the articles (see article.mjs): no state,
// and crawlers read the HTML.
//
// Embeds use youtube-nocookie.com with loading="lazy", so YouTube sets no
// cookies until a visitor presses play and off-screen players cost nothing on
// load. Every iframe has a title, which screen readers announce.
//
// NOTE: the page is one template literal, so a backtick anywhere in it -
// including a CSS comment - ends the string. See article.mjs.

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function videosPage(ctx) {
  const { SITE_URL, CSS, BRAND, AUTHOR, BUY_URL, PRICE, PAGES, FORMAT, READ_TIME,
          LISTEN_TIME, INCLUDED, abs, COVER_SRC, IDENTITY, VIDEOS, CHANNEL_URL } = ctx;
  for (const [k, v] of Object.entries({ SITE_URL, BRAND, PRICE, PAGES, FORMAT, READ_TIME,
                                        LISTEN_TIME, INCLUDED, VIDEOS, CHANNEL_URL })) {
    if (v === undefined) {
      throw new Error(`videosPage: ${k} is undefined - add it to the export list in src/ssr-entry.jsx`);
    }
  }

  const url = `${SITE_URL}/videos/`;
  const title = `The 2AM Guy: Videos | ${BRAND}`;
  const description =
    "The 2AM Guy on YouTube: what the research says about the worst hours after a breakup, " +
    "one night at a time. Free to watch.";

  // Same wording as the article CTA; there is no shared component (see article.mjs).
  const ctaLabel = `Get the book + audiobook — ${PRICE}`;
  const cta = BUY_URL
    ? `<a class="cta" href="${BUY_URL}">${ctaLabel}</a>
       <p class="included hi">${INCLUDED}</p>
       <p class="terms lo" style="margin-top:4px">${PAGES}-page ${FORMAT} · ${READ_TIME} to read · ${LISTEN_TIME} audiobook · instant download</p>`
    : `<span class="cta" role="link" aria-disabled="true">${ctaLabel}</span>`;

  const items = VIDEOS.map((v) => `
        <section class="vid" aria-labelledby="v-${esc(v.id)}">
          <p class="ep">Episode ${v.episode}</p>
          <h2 id="v-${esc(v.id)}">${esc(v.title)}</h2>
          <div class="frame">
            <iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}"
              loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </div>
          <p>${esc(v.description)}</p>
          <p class="yt"><a href="https://www.youtube.com/watch?v=${esc(v.id)}">Watch on YouTube →</a></p>
        </section>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0A2130" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="author" content="${esc(AUTHOR)}" />
    <meta property="og:site_name" content="${esc(BRAND)}" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${abs(COVER_SRC)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${abs(COVER_SRC)}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>${CSS}</style>
    <style>
      .art{max-width:880px;margin-inline:auto;padding:var(--bay) var(--gut)}
      .art h1{font-family:var(--display);font-weight:400;font-size:clamp(34px,5.2vw,60px);
        line-height:1.03;letter-spacing:-0.015em;color:var(--on-dark-hi);margin-bottom:22px}
      .art h2{font-family:var(--display);font-weight:400;font-size:clamp(24px,3vw,34px);
        line-height:1.15;color:var(--on-dark-hi);margin:0 0 20px}
      .art p{font-size:18px;line-height:1.7;color:var(--on-dark-mid);margin-bottom:18px}
      .art .lede{max-width:60ch}
      .art .back{display:inline-block;margin-bottom:38px;font-family:var(--text);font-size:12px;
        font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--orange);
        text-decoration:none}
      .art .ep{font-family:var(--text);font-size:12px;font-weight:600;letter-spacing:0.2em;
        text-transform:uppercase;color:var(--on-dark-lo);margin-bottom:12px}
      .vid{margin-top:64px;padding-top:44px;border-top:1px solid rgba(252,250,231,0.14)}
      .frame{position:relative;aspect-ratio:16/9;margin-bottom:22px;background:#000;
        border-radius:6px;overflow:hidden}
      .frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
      .art .yt a, .art .lede a{color:var(--teal300)}
      .art .end{margin-top:72px;padding-top:38px;border-top:1px solid rgba(252,250,231,0.14)}
      .art .end .cta{margin-top:6px}
      .art .site-id{margin-top:46px;padding-top:22px;
        border-top:1px solid rgba(252,250,231,0.14);
        font-family:var(--text);font-size:13px;line-height:1.6;
        color:var(--on-dark-lo);max-width:62ch}
    </style>
  </head>
  <body>
    <div class="page on-ink">
      <main class="art">
        <a class="back" href="/">← ${esc(BRAND)}</a>
        <h1>The 2AM Guy</h1>
        <p class="lede">What the research says about the worst hours after a breakup, one night at a time.
        More on <a href="${CHANNEL_URL}">the YouTube channel</a>.</p>
${items}
        <div class="end">
          <p class="body">The videos cover one night each. The book covers the whole way out.</p>
          ${cta}
        </div>
        <p class="site-id">${esc(IDENTITY)}</p>
      </main>
    </div>
  </body>
</html>
`;
}
