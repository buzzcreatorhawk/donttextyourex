// ── Single source of truth for commerce, copy and structured data ───────────
// Both the running app and scripts/prerender.mjs import this file. That is the
// whole point: the JSON-LD must describe what the page actually renders, and it
// can only be guaranteed to do that if there is exactly one copy of the facts.
// Never state a fact about the product here that the page does not also show.

// The canonical origin. No trailing slash - every helper below appends one.
// Used for <link rel=canonical>, og:url, the absolute og:image, sitemap.xml and
// every @id in the JSON-LD. Absolute URLs are not optional in any of those
// places: a relative og:image is silently dropped by most link-preview crawlers.
export const SITE_URL = "https://donttextyourex.com";

export const abs = (path) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// ── Commerce ────────────────────────────────────────────────────────────────
export const BUY_URL = "";       // TODO: paste the Gumroad (or Stripe Payment Link) URL here
export const APP_URL = "";       // TODO: app store / download link, when there is one
export const PRICE = "$24.99";
export const PRICE_AMOUNT = "24.99";
export const PRICE_CURRENCY = "USD";
export const COVER_SRC = "/cover.jpg";

// ── Identity ────────────────────────────────────────────────────────────────
// The author is deliberately unnamed - see commit f3c1109, which removed the
// name from the site on purpose. The schema follows that decision rather than
// quietly reversing it, so the publisher is an Organization and there is no
// Person author. If the positioning ever changes, add a `Person` node here and
// set it as the Book's `author`; nothing else needs to move.
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
    a: "Six chapters and one exercise. The five stages named so you can recognise where you are; discipline used as a place to put the pain; goal-setting that starts from the floor rather than from motivation; rebuilding; the support system you probably have not asked for yet; and moving forward. Plus the 25-quality exercise. It is short on purpose - it does not dwell on what went wrong, it deals with the hole you are in now.",
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
//   * There is no `author` Person, by decision (see Identity above).
//   * No page count and no ISBN - I do not know them, and inventing either would
//     put a fabricated fact into a machine-readable format, which is the worst
//     possible place to put one.
export function buildJsonLd() {
  const orgId = abs("/#publisher");
  const siteId = abs("/#website");
  const pageId = abs("/#webpage");
  const bookId = abs("/#book");

  const book = {
    "@type": "Book",
    "@id": bookId,
    name: TITLE,
    alternateName: TAGLINE,
    description: DESCRIPTION,
    bookFormat: "https://schema.org/EBook",
    inLanguage: "en",
    image: abs(COVER_SRC),
    url: abs("/"),
    publisher: { "@id": orgId },
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
      "Support system - the message Mark almost didn't send.",
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
