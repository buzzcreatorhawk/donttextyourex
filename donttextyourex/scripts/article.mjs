// ── Article pages ───────────────────────────────────────────────────────────
// Renders content/*.md to standalone static HTML at dist/<slug>/index.html.
//
// Deliberately NOT a React route and NOT part of the SPA bundle. An article is
// prose: it needs no state, no hooks and no hydration, and every crawler that
// matters here reads HTML rather than executing JS. A static page is also the
// only version of this that cannot be broken by a bundler change.
//
// The Markdown subset below is small on purpose and THROWS on anything it does
// not recognise. A silent fallback would mean a typo in the prose ships as a
// literal asterisk on a live page; failing the build is the cheaper outcome.

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Inline: **bold**, *italic*, [text](href). Escaped first, so the prose can
// contain < and & without becoming markup.
function inline(s) {
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const stray = out.match(/\*/g);
  if (stray) throw new Error(`unbalanced emphasis in: ${s.slice(0, 60)}`);
  return out;
}

export function renderMarkdown(md) {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = [];
  const headings = [];
  let h1 = null;

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (block === "---") { html.push("<hr>"); continue; }

    if (block.startsWith("# ")) {
      h1 = block.slice(2).trim();
      html.push(`<h1>${inline(h1)}</h1>`);
      continue;
    }

    if (block.startsWith("## ")) {
      const text = block.slice(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ text, id });
      html.push(`<h2 id="${id}">${inline(text)}</h2>`);
      continue;
    }

    if (block.split("\n").every((l) => l.trim().startsWith("- "))) {
      const items = block
        .split("\n")
        .map((l) => `<li>${inline(l.trim().slice(2).trim())}</li>`)
        .join("");
      html.push(`<ul>${items}</ul>`);
      continue;
    }

    if (/^(#{3,}|>|\d+\.|\||```)/.test(block)) {
      throw new Error(`unsupported Markdown block: ${block.slice(0, 60)}`);
    }

    html.push(`<p>${inline(block.replace(/\n/g, " "))}</p>`);
  }

  if (!h1) throw new Error("article has no H1");
  return { html: html.join("\n"), headings, h1 };
}

// The prose under a heading, flattened - used for the FAQPage answers so the
// schema quotes what the page actually shows.
function answerFor(md, heading) {
  const after = md.split(`## ${heading}`)[1] || "";
  const body = after.split(/\n## |\n---/)[0] || "";
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\*\*|\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function articleJsonLd(md, meta, ctx) {
  const { SITE_URL, AUTHOR, BRAND, abs } = ctx;
  const url = `${SITE_URL}/${meta.slug}/`;
  const { headings, h1 } = renderMarkdown(md);

  // Only real questions become FAQ entries. Marking up a heading that is not a
  // question, or one whose answer is not on the page, is a spam signal.
  // Strip the surrounding quotes FIRST. A heading written in the reader's own
  // voice - "What if she texted me first?" - ends with a quote mark, not a
  // question mark, and was being dropped from the schema.
  const unquote = (t) => t.trim().replace(/^["“]|["”]$/g, "").trim();
  const questions = headings
    .filter((h) => unquote(h.text).endsWith("?"))
    .map((h) => ({
      "@type": "Question",
      name: unquote(h.text),
      acceptedAnswer: { "@type": "Answer", text: answerFor(md, h.text) },
    }));

  const graph = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: h1,
      name: meta.title,
      description: meta.description,
      datePublished: meta.published,
      dateModified: meta.updated,
      inLanguage: "en",
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", "@id": abs("/#author"), name: AUTHOR },
      publisher: { "@id": abs("/#publisher") },
      isPartOf: { "@id": abs("/#website") },
      about: { "@id": abs("/#book") },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: BRAND, item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: h1, item: url },
      ],
    },
  ];

  if (questions.length) {
    graph.push({ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: questions });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

export function articlePage(md, meta, ctx) {
  const { SITE_URL, CSS, BRAND, AUTHOR, BUY_URL, PRICE, PAGES, FORMAT, READ_TIME, abs, COVER_SRC } = ctx;
  const { html, h1 } = renderMarkdown(md);
  const url = `${SITE_URL}/${meta.slug}/`;
  const ld = articleJsonLd(md, meta, ctx);
  const d = new Date(meta.updated + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

  const cta = BUY_URL
    ? `<a class="cta" href="${BUY_URL}">Get the ${FORMAT} — ${PRICE}</a>
       <p class="terms lo">${PAGES}-page ${FORMAT} · ${READ_TIME} · instant download</p>`
    : `<span class="cta" role="link" aria-disabled="true">Get the ${FORMAT} — ${PRICE}</span>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0A2130" />
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="author" content="${esc(AUTHOR)}" />
    <meta property="og:site_name" content="${esc(BRAND)}" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:image" content="${abs(COVER_SRC)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <meta name="twitter:image" content="${abs(COVER_SRC)}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>${CSS}</style>
    <style>
      .art{max-width:720px;margin-inline:auto;padding:var(--bay) var(--gut)}
      .art h1{font-family:var(--display);font-weight:400;font-size:clamp(34px,5.2vw,60px);
        line-height:1.03;letter-spacing:-0.015em;color:var(--on-dark-hi);margin-bottom:26px}
      .art h2{font-family:var(--display);font-weight:400;font-size:clamp(24px,3vw,34px);
        line-height:1.15;color:var(--on-dark-hi);margin:52px 0 18px}
      .art p{font-size:18px;line-height:1.75;color:var(--on-dark-mid);margin-bottom:20px}
      .art p strong{color:var(--on-dark-hi);font-weight:600}
      .art ul{margin:0 0 20px 0;padding:0;list-style:none}
      .art li{font-size:17px;line-height:1.7;color:var(--on-dark-mid);
        padding-left:22px;position:relative;margin-bottom:12px}
      .art li::before{content:"";position:absolute;left:0;top:12px;width:8px;height:2px;
        background:var(--orange)}
      .art li strong{color:var(--on-dark-hi);font-weight:600}
      .art hr{border:0;border-top:1px solid rgba(252,250,231,0.14);margin:52px 0}
      .art a{color:var(--teal300)}
      .art .meta{font-family:var(--text);font-size:12px;font-weight:600;letter-spacing:0.2em;
        text-transform:uppercase;color:var(--on-dark-lo);margin-bottom:22px}
      .art .back{display:inline-block;margin-bottom:38px;font-family:var(--text);font-size:12px;
        font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--orange);
        text-decoration:none}
      .art .end{margin-top:60px;padding-top:38px;border-top:1px solid rgba(252,250,231,0.14)}
      .art .end .cta{margin-top:6px}
    </style>
    <script type="application/ld+json">${ld}</script>
  </head>
  <body>
    <div class="page on-ink">
      <article class="art">
        <a class="back" href="/">← ${esc(BRAND)}</a>
        <p class="meta">Updated ${d} · ${esc(AUTHOR)}</p>
        ${html}
        <div class="end">
          <p class="body">The whole thing — the five stages, what to do with the pain,
          how to rebuild, and the exercise that closes it — is in the book.</p>
          ${cta}
        </div>
      </article>
    </div>
  </body>
</html>
`;
}
