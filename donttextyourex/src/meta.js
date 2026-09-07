// ── Single source of truth for commerce, copy and structured data ───────────
// Both the running app and scripts/prerender.mjs import this file. That is the
// whole point: the JSON-LD must describe what the page actually renders, and it
// can only be guaranteed to do that if there is exactly one copy of the facts.
// Never state a fact about the product here that the page does not also show.

// The canonical origin. No trailing slash - every helper below appends one.
// Used for <link rel=canonical>, og:url, the absolute og:image, sitemap.xml and
// every @id in the JSON-LD. Absolute URLs are not optional in any of those
// places: a relative og:image is silently dropped by most link-preview crawlers.
// NOT donttextyourex.com. That domain is live and belongs to someone else - a
// competing breakup-recovery site, whose premise (get back together with your
// ex) is the opposite of this book's. Pointing canonical, og:url, og:image and
// every JSON-LD @id at it told search engines her page was the canonical
// version of this one. Corrected 2026-09-07, before it ever reached production.
// Change this only to a domain Kamil actually controls.
//
// THEdonttextyourex.com - with the "the" - is a different domain, and it is
// Kamil's. It is where the site is actually served. Verified 2026-09-07 with
// curl, not assumed: the apex 301s to the www host, and both the www host and
// donttextyourex.vercel.app return 200 serving the same bundle. www is the host
// visitors land on, so www is what canonical, og:url and the sitemap must name -
// pointing them at the vercel.app origin while the traffic arrives at the custom
// domain splits the page's identity across two origins for no gain.
export const SITE_URL = "https://www.thedonttextyourex.com";

export const abs = (path) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// ── Commerce ────────────────────────────────────────────────────────────────
export const BUY_URL = "";       // TODO: paste the Payhip (or Stripe Payment Link) URL here
export const APP_URL = "";       // TODO: app store / download link, when there is one
export const PRICE = "$24.99";
export const PRICE_AMOUNT = "24.99";
export const PRICE_CURRENCY = "USD";
export const COVER_SRC = "/cover.jpg";

// ── What the buyer actually receives ───────────────────────────────────────
// A $24.99 digital product with no stated length is the shape of a refund. These
// three facts go on the page next to every buy button, and PAGES also becomes
// `numberOfPages` in the Book schema.
//
// PAGES is counted, not estimated: `How To Get Over A Breakup.pdf` in the parent
// folder is 42 pages, front cover through the closing exercise, read in full
// 2026-09-07. If the manuscript grows before launch, recount - do not adjust this
// by feel.
//
// READ_TIME is derived and labelled as such: 6,631 words (STATE.md, counted from
// the manuscript) at 200-250 wpm is 27-33 minutes, so "about half an hour" is the
// honest way to say it. It is not a measured figure and the copy does not pretend
// it is.
export const PAGES = 42;
export const FORMAT = "PDF";
export const READ_TIME = "about half an hour";

// The refund position. EMPTY, and every line that would state one is gated on it
// being non-empty - the same rule as BUY_URL and the email endpoint. Kamil took
// the refund promise off the page on 2026-09-07, having not agreed the 30-day
// no-questions wording that was proposed for him.
//
// Empty means the page makes no refund claim at all, which is the honest state
// while no policy has been decided. It does NOT mean "no refunds": under UK
// consumer law a digital download can carry an express waiver of the 14-day
// cancellation right, but that waiver has to be obtained at checkout, and if it
// is not, the right stands whatever this page says. So the page staying silent
// is also the safe state - a "no refunds" line here could be an unenforceable
// claim, which is worse than saying nothing. Not legal advice; check the current
// rules, and check what the store actually presents at checkout.
//
// Set this to a sentence and it reappears under every buy button, in the FAQ and
// in the footer. Nothing else needs changing.
export const REFUND = "";

// Buyers of a digital product need a route to a human. Empty until Kamil decides
// which address to publish - his personal Gmail is not that decision to make for
// him - and the contact line does not render while it is empty, rather than
// printing a mailto: that goes nowhere.
export const CONTACT_EMAIL = "";  // TODO: the address that receives buyer email

// ── Identity ────────────────────────────────────────────────────────────────
// The author is named. Commit f3c1109 had removed the name from the site, and
// the schema deliberately followed that; Kamil reversed it on 2026-09-07,
// choosing `Kamil Zaleński` with the ń, to match the cover and the standing
// position that his public work ships under his own name. This is the change
// the previous comment said to make: a Person node, set as the Book's author.
// The ń is intentional - do not transliterate it.
export const AUTHOR = "Kamil Zaleński";
export const TITLE = "How to Get Over a Breakup — A Survival Guide For Men";
export const TAGLINE = "A Survival Guide For Men";
export const BRAND = "How to Get Over a Breakup";
export const DESCRIPTION =
  "You're not sleeping. You're checking her Instagram at midnight. You're replaying " +
  "conversations that go nowhere. A short, direct book for that moment.";

// ── FAQ ─────────────────────────────────────────────────────────────────────
// These are rendered visibly on the page AND emitted as FAQPage JSON-LD, from
// this one array. Google's guidance is that FAQ markup must describe content the
// visitor can actually see; marking up questions that appear nowhere on the page
// is a spam signal, not a shortcut. Keeping both readers on one array is what
// makes that guarantee hold instead of being a promise someone has to remember.
//
// Answers are self-contained paragraphs on purpose. An answer engine lifts a
// paragraph that stands alone far more readily than one that leans on the
// surrounding page for its meaning.
export const faqs = [
  {
    q: "Should I text my ex?",
    a: "No - not tonight, and not for the reason you are telling yourself. The urge to text is almost never about her; it is about wanting the discomfort to stop. Sending the message trades a week of slow healing for about ninety seconds of relief, and then restarts the clock. If you need to say it, write it somewhere she will never read it. The sending is the part that costs you.",
  },
  {
    q: "How long does the no contact rule actually take?",
    a: "Thirty days is the number people repeat, but the number is not the mechanism. No contact works because it stops you re-opening the wound, so the honest answer is that it takes as long as it takes you to stop reaching for your phone as a reflex. Most men notice the pull weakening somewhere in the third or fourth week. Counting the days helps - not because day 30 is a finish line, but because a rising number is evidence you are doing something.",
  },
  {
    q: "Why does this hurt so much more than I expected?",
    a: "Because you did not only lose a person, you lost a structure - the shape of your week, the assumed future, the person you were when you were with her. Grief attaches to all of it at once. That is also why it does not fade in a straight line: you will have a good Tuesday and a wrecked Thursday for no visible reason. It is not a relapse and it is not weakness. It is what the process looks like from the inside.",
  },
  {
    q: "What is actually in the book?",
    a: "Six chapters and one exercise, across 42 pages. The five stages named so you can recognise where you are; discipline used as a place to put the pain; goal-setting that starts from the floor rather than from motivation; rebuilding; the support system you probably have not asked for yet; and moving forward. It closes with a two-list exercise: twenty-five qualities you want in the woman you end up with, and then, on the facing page, the twenty-five that woman would want in a partner. The second list is the one that does the work. It is short on purpose - it does not dwell on what went wrong, it deals with the hole you are in now.",
  },
  // The delivery claim here is a promise about a shop that does not exist yet.
  // Check it against the store's own settings on the day BUY_URL is filled in - a
  // delivery promise the checkout does not keep is the exact failure the gated
  // email form exists to prevent, only with the buyer's money already taken.
  //
  // The refund half of this entry was removed with REFUND (see above). The
  // question no longer asks about refunds, because a question the page raises and
  // then does not answer is worse than one it never raised.
  {
    q: "What exactly do I get for $24.99?",
    a: "A 42-page PDF, downloadable the moment you have paid - no app to install, no account to make, nothing recurring. It reads in about half an hour. There is no paperback and no audiobook. It is six chapters and one closing exercise, and it is deliberately short: the whole argument of the book is that at 2am you need something you can finish, not something you can start.",
  },
  {
    q: "Is this therapy, or a replacement for it?",
    a: "Neither. It is written by someone who has been through it, not by a clinician, and it makes no clinical claims. If you are not sleeping or eating for weeks, or you are having thoughts of harming yourself, that is a doctor's job and not a book's - please go and talk to one. This is a blueprint for the ordinary, brutal version of a breakup, which is the version most men are actually in.",
  },
  {
    q: "Who is it for?",
    a: "Men in the first weeks or months after a breakup who already know they should not text her and are doing it anyway. It assumes you do not want affirmations, you do not want to be told to love yourself, and you do want something to do at 2am. If you want a gentle book, this is not it.",
  },
];

// ── Structured data ─────────────────────────────────────────────────────────
// Built as an @graph so every node cross-references by @id instead of being
// repeated. Nodes are only emitted when the underlying fact is true:
//
//   * `offers` appears only once BUY_URL is set. An Offer pointing at nothing is
//     a structured claim that the book is purchasable, which right now it is not.
//   * The `author` Person is named (see Identity above).
//   * `numberOfPages` is emitted because the number is now known: the finished
//     PDF exists and was read page by page (see PAGES). It was previously
//     omitted, correctly, while nobody had counted it - the rule was never
//     "omit page counts", it was "never put a fact into a machine-readable
//     format unless someone has actually established it".
//   * Still no ISBN. Nobody has one, and inventing one here would be that same
//     mistake in the worst possible place.
export function buildJsonLd() {
  const orgId = abs("/#publisher");
  const siteId = abs("/#website");
  const pageId = abs("/#webpage");
  const bookId = abs("/#book");
  const authorId = abs("/#author");

  const book = {
    "@type": "Book",
    "@id": bookId,
    name: TITLE,
    alternateName: TAGLINE,
    description: DESCRIPTION,
    bookFormat: "https://schema.org/EBook",
    numberOfPages: PAGES,
    bookEdition: "Revised edition",
    inLanguage: "en",
    image: abs(COVER_SRC),
    url: abs("/"),
    publisher: { "@id": orgId },
    author: { "@id": authorId },
    genre: "Self-help",
    about: [
      { "@type": "Thing", name: "Breakup recovery" },
      { "@type": "Thing", name: "No contact rule" },
      { "@type": "Thing", name: "Mens mental health" },
    ],
    hasPart: [
      "What's in your mind right now - the five stages, named.",
      "Discipline as self-sacrifice - give your pain a job.",
      "The power of goals - starting from the floor.",
      "Rebuilding - the diamond under the coal.",
      "Support system - the message I almost didn't answer.",
      "Moving forward - protecting what's yours.",
    ].map((name, i) => ({ "@type": "Chapter", position: i + 1, name })),
  };

  if (BUY_URL) {
    book.offers = {
      "@type": "Offer",
      price: PRICE_AMOUNT,
      priceCurrency: PRICE_CURRENCY,
      availability: "https://schema.org/InStock",
      url: BUY_URL,
      seller: { "@id": orgId },
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": authorId,
        name: AUTHOR,
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: BRAND,
        url: abs("/"),
        logo: abs(COVER_SRC),
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: abs("/"),
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: abs("/"),
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        isPartOf: { "@id": siteId },
        about: { "@id": bookId },
        primaryImageOfPage: { "@type": "ImageObject", url: abs(COVER_SRC) },
      },
      book,
      {
        "@type": "FAQPage",
        "@id": abs("/#faq"),
        isPartOf: { "@id": pageId },
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}

// `</script` is escaped because a JSON string containing it would otherwise
// close the surrounding <script> tag early - the one XSS-shaped footgun in
// hand-embedded JSON-LD.
export const jsonLdString = () =>
  JSON.stringify(buildJsonLd(), null, 2).replace(/<\/script/gi, "<\\/script");
