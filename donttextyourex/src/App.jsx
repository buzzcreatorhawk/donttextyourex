import { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "./styles";
import { Moon, Loop, Phone, Mirror, Block, Bars, Book, Check, Circle, Arrow } from "./icons";

// Commerce, copy and the FAQ now live in meta.js, because the prerender pass and
// the JSON-LD builder need the same values and a second copy would drift out of
// step with the page - which for the FAQ specifically would turn valid markup
// into a spam signal.
import {
  BUY_URL, APP_URL, PRICE, COVER_SRC, faqs, buyEvent, appEvent,
  PAGES, FORMAT, READ_TIME, REFUND, CONTACT_EMAIL, AUTHOR, ARTICLES, IDENTITY,
  POSITIONING, LISTEN_TIME, INCLUDED, BRAND, TITLE, VIDEOS,
} from "./meta";
import { WeatherSystem } from "./diagram";

// ── Email list ──────────────────────────────────────────────────────────────
// Provider-agnostic on purpose - the provider is not chosen yet, and the shape
// of the request is the only thing that actually differs between them. Fill in
// `endpoint` and the section appears; leave it empty and the section does not
// render at all, because a form that silently discards an address is worse than
// no form.
//
// `encoding` is the setting that decides whether this works in a browser at all:
//
//   "form" - application/x-www-form-urlencoded. A CORS "simple request", so the
//            browser sends it with no preflight. Hosted form endpoints are built
//            to receive exactly this. It is the right default.
//   "json" - application/json. Triggers a CORS preflight OPTIONS request that a
//            hosted form endpoint typically will not answer - so it fails in the
//            browser while working fine from curl, which is a miserable thing to
//            debug. Use it only for an endpoint you control (a serverless
//            function), not a provider's public form URL.
//
// `field` is the name the provider expects the address under; providers disagree
// ("email", "email_address", "fields[email]"). Copy the name attribute out of
// the provider's own embed HTML rather than guessing.
//
// All of that is vendor-specific and changes without notice - check the current
// docs of whichever provider is chosen before trusting these defaults.
const LIST = {
  endpoint: "",       // TODO: the provider's POST target
  encoding: "form",   // "form" | "json"
  field: "email",     // the provider's field name for the address
  extra: {},          // fixed fields the provider requires alongside the address
};

// ── Content ─────────────────────────────────────────────────────────────────
const problems = [
  { Icon: Moon,   text: "It's 2am and you can't stop checking her Instagram." },
  { Icon: Loop,   text: "The same thoughts on loop. Every conversation replayed." },
  { Icon: Phone,  text: "Your thumb hovering over her name for the hundredth time." },
  { Icon: Mirror, text: "Not recognising the person staring back at you." },
];

// The six chapters plus the three sections around them. Listing only the
// chapters undersold the book: the Note, the Prologue and the Epilogue are
// three of its nine sections, and the Epilogue carries the closing exercise
// this page already promises. `num` is empty for those three so they read as
// what they are rather than as chapters seven, eight and nine.
const chapters = [
  { id: "note", num: "",   title: "A note from the author — who wrote this, and why." },
  { id: "prol", num: "",   title: "Prologue — the deal, before you read a word." },
  { id: "ch1",  num: "01", title: "What's in your mind right now — the five stages, named." },
  { id: "ch2",  num: "02", title: "Discipline as self-sacrifice — give your pain a job." },
  { id: "ch3",  num: "03", title: "The power of goals — starting from the floor." },
  { id: "ch4",  num: "04", title: "Rebuilding — the diamond under the coal." },
  { id: "ch5",  num: "05", title: "Support system — the message I almost didn't answer." },
  { id: "ch6",  num: "06", title: "Moving forward — protecting what's yours." },
  { id: "epil", num: "",   title: "Epilogue — and the two-list exercise that closes it." },
];

// Spelled out because "3 of the questions" reads like a spec sheet. Falls back
// to the numeral past ten, by which point the section wants rethinking anyway.
const COUNT_WORD = { 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six",
                     7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten" };

// Every line here is checked against the live app (2026-10-06): the counter is
// "Since last contact", "Today's line" comes from the book, there are eight
// habits and ten levels with a picture each. No notifications - none promised.
const features = [
  { Icon: Block, tone: "o", title: "The button",          desc: "“Don't text your ex” sits at the bottom of every day. One tap when you're about to." },
  { Icon: Bars,  tone: "",  title: "Days since last contact", desc: "The big number. It only grows while you hold, and your longest run is kept." },
  { Icon: Book,  tone: "t", title: "Today's line",        desc: "One line from the book, on your screen every day." },
  { Icon: Check, tone: "s", title: "Eight habits",        desc: "Cold shower, exercise, no contact, journal and four more. One tap each." },
];

// The four screens of "How it works", in the order he meets them at 2am.
// Each line is what that real screen shows.
const HOW = [
  { name: "today", title: "The button.", text: "It sits at the bottom of every day, under the count. Tap it when you're about to.",
    alt: "The Today screen with the Don't text your ex button at the bottom." },
  { name: "task", title: "One thing to do instead.", text: "A small task with a timer. Don't like it? Ask for a different one.",
    alt: "A task card: press your feet flat into the floor and push, thirty seconds." },
  { name: "write", title: "Or say all of it.", text: "Write the whole message out. It isn't saved anywhere, and there's no send button.",
    alt: "The write-it-out screen: a long draft, with the note that it is not saved and cannot be sent." },
  { name: "level", title: "It counts what you didn't send.", text: "Days held, habits done, texts you didn't send. Ten levels, a picture for each.",
    alt: "A level card, One Week Standing, with counts of days kept, texts not sent and habits done." },
];

// The cover's sunburst (teal and amber rays), as on the thumbnails and in the app's sky.
const Sunburst = ({ style }) => {
  const n = 20, r = 1000, rays = [];
  for (let k = 0; k < n; k++) {
    const a0 = (2 * Math.PI * k) / n, a1 = (2 * Math.PI * (k + 0.5)) / n;
    rays.push(<polygon key={k} fill={k % 2 ? "#29BC9D" : "#F9BC6D"}
      points={`0,0 ${(r * Math.cos(a0)).toFixed(1)},${(r * Math.sin(a0)).toFixed(1)} ${(r * Math.cos(a1)).toFixed(1)},${(r * Math.sin(a1)).toFixed(1)}`} />);
  }
  return (
    <svg className="sunburst" viewBox="-1000 -1000 2000 2000" aria-hidden="true" focusable="false" style={style}>
      <defs><radialGradient id="sb-fade"><stop offset="0.15" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <mask id="sb-m"><circle r="1000" fill="url(#sb-fade)" /></mask></defs>
      <g mask="url(#sb-m)">{rays}</g>
    </svg>
  );
};

// A real app screen in a phone frame. webp with a jpg fallback, fixed size so the
// layout never jumps.
const Shot = ({ name, alt, small = false }) => (
  <div className={`dev${small ? " sm" : ""}`}>
    <picture>
      <source srcSet={`/app/${name}.webp`} type="image/webp" />
      <img src={`/app/${name}.jpg`} width="412" height="915" alt={alt} loading={name === "today" ? "eager" : "lazy"} />
    </picture>
  </div>
);

// ── Reveal on scroll ────────────────────────────────────────────────────────
// The hidden state only exists while <html class="js"> is set, and that class is
// set by an inline script in index.html - not by React. On top of that every
// element has a hard fallback timer: if the observer is throttled (background
// tab, hidden window) and never fires, the content still appears. Content must
// never be able to get stuck invisible.
//
// The gate moved out of React for prerendering. It used to be React state, which
// meant the server rendered `page` and the browser then rendered `page js`. With
// static markup in the HTML that ordering produces a real flash: the content
// paints, React mounts, and the reveal class hides it again. Setting the class in
// <head> before first paint removes the window in which that can happen, and it
// also means a crawler that runs no JS gets the unhidden page for free.
const REVEAL_FALLBACK_MS = 1400;

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add("in");
    if (typeof IntersectionObserver === "undefined") { show(); return; }
    const timer = setTimeout(show, REVEAL_FALLBACK_MS);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { show(); clearTimeout(timer); io.disconnect(); } },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, []);
  return ref;
}

const Reveal = ({ children, delay = 0, as: Tag = "div", className = "", style, ...rest }) => {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`rv ${className}`.trim()} style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
};

// Primary CTA. When BUY_URL is unset it stays visible but is honestly inert
// rather than looking clickable and doing nothing.
//
// The label names BOTH formats (Kamil, 2026-09-12). One default feeds every buy
// button on the page, so this string is the only place the CTA wording lives -
// if a second label is ever passed in, it has to carry the audiobook too, which
// is what went wrong when one caller said "Get the PDF".
const Buy = ({ label = `Get the book + audiobook — ${PRICE}`, where }) =>
  BUY_URL
    ? <a className="cta" href={BUY_URL} {...buyEvent(where)}>{label}<Arrow size={18} /></a>
    : <span className="cta" role="link" aria-disabled="true">{label}<Arrow size={18} /></span>;

// The CTA plus what the money actually buys. Every buy button on the page uses
// this rather than the bare Buy, because "$24.99" on its own does not say whether
// the thing is forty pages or four hundred, a download or a subscription - and a
// buyer who finds out afterwards asks for his money back. Stating the length is
// the argument for the price, not an admission against it: short is the promise
// the book makes on its own first page.
const BuyBlock = ({ label, light = false, where }) => (
  <div>
    <Buy label={label} where={where} />
    <p className={`included ${light ? "hi-d" : "hi"}`}>{INCLUDED}</p>
    <p className={`terms ${light ? "lo-d" : "lo"}`} style={{ marginTop: 4 }}>
      {PAGES}-page {FORMAT} · {READ_TIME} to read · {LISTEN_TIME} audiobook · instant download
      {REFUND && <><br />{REFUND}</>}
    </p>
  </div>
);

export default function LandingPage() {
  const [navOn, setNavOn] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const trap = useRef(null);
  const [coverOk, setCoverOk] = useState(true);

  // rAF-throttled, passive. The old handler stored scrollY in state on every
  // scroll event and re-rendered the whole page; that value was never read.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setNavOn(window.scrollY > 90); raf = 0; });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (busy) return;
    // A bot fills every field it can find, including the one parked off-screen.
    // A human never touches it, so anything in it is not a signup. Fail silently
    // and show the success state - telling a bot why it was rejected only helps
    // it come back better.
    if (trap.current?.value) { setSent(true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email address."); return; }
    setErr("");
    setBusy(true);
    try {
      const payload = { ...LIST.extra, [LIST.field]: email };
      const res = await fetch(LIST.endpoint, {
        method: "POST",
        headers: { "Content-Type": LIST.encoding === "json"
          ? "application/json"
          : "application/x-www-form-urlencoded" },
        body: LIST.encoding === "json"
          ? JSON.stringify(payload)
          : new URLSearchParams(payload).toString(),
      });
      // fetch only rejects on a network failure - a 422 or a 500 resolves like
      // any other response. Without this check a rejected address still showed
      // "Done. It's on its way", which is the same lie as a form that never
      // made a request.
      if (!res.ok) {
        setErr(res.status === 429
          ? "Too many attempts. Give it a minute and try again."
          : "That didn't go through. Try again in a moment.");
        return;
      }
      setSent(true);
    } catch {
      setErr("That didn't send - check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [email, busy]);

  const toTop = useCallback((e) => {
    if (window.location.pathname !== "/") return;
    e.preventDefault();
    // An instant jump, not smooth: from the FAQ a smooth scroll crosses ~8,000px,
    // and it is the one variant verified working (2026-09-17).
    window.scrollTo({ top: 0, behavior: "auto" });
    if (window.location.hash) history.replaceState(null, "", "/");
  }, []);

  return (
    <div className="page light">
      <style>{CSS}</style>

      {/* ── NAV ── light, like the app's own bar. "Open the app" is the action now;
          the price stays one tap away in the book section. */}
      <header className="nav-bar"
        style={{
          position: "fixed", inset: "0 0 auto 0", zIndex: 100,
          padding: "14px var(--gut)",
          background: navOn ? "rgba(252,248,223,0.94)" : "transparent",
          backdropFilter: navOn ? "blur(14px)" : "none",
          borderBottom: navOn ? "1px solid rgba(9,34,49,0.08)" : "1px solid transparent",
          transition: "background 320ms ease, border-color 320ms ease",
        }}
      >
        <a className="label nav-l nav-home" href="/" onClick={toTop}
           style={{ color: "var(--navy)", textDecoration: "none" }}>
          {BRAND}
        </a>
        <span className="nav-links">
          <a className="label nav-l" href="#book" style={{ color: "var(--on-light-mid)", textDecoration: "none" }}>The book</a>
          {ARTICLES.length > 0 && (
            <a className="label nav-l" href="#reading" style={{ color: "var(--on-light-mid)", textDecoration: "none" }}>
              Read for free
            </a>
          )}
          {VIDEOS.length > 0 && (
            <a className="label nav-l" href="/videos/" style={{ color: "var(--on-light-mid)", textDecoration: "none" }}>
              Videos
            </a>
          )}
        </span>
        <div className="nav-buy" style={{ opacity: navOn ? 1 : 0, pointerEvents: navOn ? "auto" : "none", transition: "opacity 320ms ease" }}>
          <a className="app-cta" style={{ padding: "11px 20px", minHeight: 44, fontSize: 14 }} href={APP_URL} {...appEvent("nav")}>
            Open the app<Arrow size={16} />
          </a>
        </div>
      </header>

      <main>
        {/* ── HERO — the app first (Kamil, 2026-10-06) ──
            The H1 is the brand, which is also the phrase people type. The book's
            query ("A Survival Guide For Men After A Breakup") moved to the book
            section's H2; the page title and the schema still carry it. */}
        <section className="sec on-cream2" aria-labelledby="h-hero"
          style={{ position: "relative", overflow: "hidden", minHeight: "100dvh", display: "flex", alignItems: "center",
                   paddingTop: "clamp(150px,18vh,180px)" }}>
          <Sunburst style={{ right: "-18%", top: "-10%", width: "min(1200px,140vw)", opacity: 0.32 }} />
          <div className="wrap g-split hero-wrap">
            <div>
              <Reveal>
                <h1 id="h-hero" className="d-xl hi-d" style={{ marginBottom: 26 }}>
                  <span className="h1-kicker" style={{ color: "var(--rust)" }}>The free app for 2am</span>
                  Don't text your ex.<br /><span className="it c-deep">Open this instead.</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="lead" style={{ marginBottom: 34 }}>
                  Your thumb is already on her name. Tap one button and the app gives you one small thing to
                  do instead, right now. Or somewhere to write the whole message out, with no send button.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 26px" }}>
                  <a className="app-cta" href={APP_URL} {...appEvent("hero")}>Open the app, free<Arrow size={18} /></a>
                  <a className="ghost-d" href="#book">Or read the book<Arrow size={16} /></a>
                </div>
                <div className="facts">
                  <span>Free</span><span>No account</span><span>Stays on your phone</span><span>Works offline</span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={200} style={{ justifySelf: "center" }}>
              <div className="duo">
                <Shot name="today" alt="The app's Today screen: days since last contact, today's line from the book, eight habits, and the Don't text your ex button." />
                <Shot name="task" small alt="After tapping the button: one small task to do instead, with a thirty-second timer." />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── HOW IT WORKS — four real screens, in the order he meets them ── */}
        <section className="sec on-sand" aria-labelledby="h-how">
          <div className="wrap">
            <div style={{ marginBottom: "clamp(44px,6vw,72px)" }}>
              <span className="label c-rust">How it works</span>
              <h2 id="h-how" className="d-l hi-d" style={{ marginTop: 18 }}>What happens<br />when you tap it.</h2>
            </div>
            <div className="steps">
              {HOW.map((s, i) => (
                <Reveal key={s.name} delay={i * 80} className="step">
                  <Shot name={s.name} small alt={s.alt} />
                  <span className="n">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT ELSE IS IN IT ── */}
        <section className="sec on-sage2" aria-labelledby="h-app">
          <div className="wrap g-split-r">
            <div>
              <span className="label c-navy">Every day, not only at 2am</span>
              <h2 id="h-app" className="d-l" style={{ marginTop: 18, marginBottom: 22, color: "var(--navy)" }}>
                The number<br />is you.
              </h2>
              <p className="body" style={{ marginBottom: 30, color: "var(--navy)" }}>
                The urge is one minute. The rest of the app is for the days around it: a count that
                only goes up while you hold, and small things to do that make the next night easier.
              </p>
              <a className="app-cta" href={APP_URL} {...appEvent("app-section")}>Open the app<Arrow size={18} /></a>
              <p className="small" style={{ marginTop: 16, color: "var(--navy)" }}>
                Free. No account. Everything stays on your phone. Add it to your home screen and it works offline.
              </p>
            </div>
            <div className="feat">
              {features.map(({ Icon, title, desc, tone }) => (
                <Reveal key={title}>
                  <span className={`ic ${tone}`}><Icon size={22} /></span>
                  <span><b>{title}</b><span>{desc}</span></span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM ── */}
        <section className="sec on-cream2" aria-labelledby="h-problem">
          <div className="wrap">
            <div className="g-split-r" style={{ marginBottom: "clamp(32px,5vw,56px)" }}>
              <div>
                <span className="label c-rust">Sound familiar?</span>
                <h2 id="h-problem" className="d-l hi-d" style={{ marginTop: 18 }}>
                  You know exactly<br />what this feels like.
                </h2>
              </div>
              <p className="lead" style={{ alignSelf: "end" }}>
                And you also know you shouldn't text her. But knowing and doing are two different
                things at 2am.
              </p>
            </div>

            <ul style={{ listStyle: "none" }}>
              {problems.map(({ Icon, text }, i) => (
                <Reveal as="li" key={i} delay={i * 70} className="row">
                  <span className="num c-rust" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="c-deep" style={{ flexShrink: 0, marginTop: 3 }}><Icon size={22} /></span>
                    <span className="d-m hi-d" style={{ fontSize: "clamp(19px,2.4vw,30px)" }}>{text}</span>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ── THE HARD PART ── the one deep-teal section: the colour of the app's
            links and the cover's sea, the darkest thing either of them uses. */}
        <section className="sec on-deep" aria-labelledby="h-truth">
          <div className="wrap">
            <div className="g-split-r" style={{ marginBottom: "clamp(40px,6vw,72px)" }}>
              <div>
                <span className="label" style={{ color: "var(--sunline)" }}>From the book</span>
                <h2 id="h-truth" className="d-l hi" style={{ marginTop: 18 }}>
                  Two things<br />nobody will<br />say to you.
                </h2>
              </div>
              <p className="lead" style={{ alignSelf: "end" }}>
                They are both in the first twelve pages. They are not there to hurt you — they are
                there because you cannot build on ground you refuse to stand on.
              </p>
            </div>

            <div className="stack-l">
              <Reveal>
                <p className="label" style={{ marginBottom: 20, color: "var(--sunline)" }}>One</p>
                <h3 className="d-m hi it" style={{ marginBottom: 22 }}>
                  She's probably already moved on.
                </h3>
                <p className="lead">
                  Women don't leave suddenly. They clock out slowly. Emotionally, mentally, she began
                  the process of leaving long before she said the words — so by the time she ended
                  it, she had already grieved it. You hadn't. That's why you're on the floor and she
                  seems fine. It isn't that she didn't care. It's that she had a head start.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <p className="label" style={{ marginBottom: 20, color: "var(--sunline)" }}>Two</p>
                <h3 className="d-m hi it" style={{ marginBottom: 22 }}>
                  What broke isn't the love. It's the respect.
                </h3>
                <p className="lead">
                  A woman runs on love at eighty per cent and respect at twenty. A man is the other
                  way round. So when she leaves, he doesn't only grieve the relationship — he grieves
                  his own sense of worth, because somewhere in losing her he lost the version of
                  himself he respected most. That is what's actually crushing you. Not the absence of
                  love. The collapse of self-respect.
                </p>
                <p className="lead it" style={{ marginTop: 22, color: "var(--sunline)" }}>
                  Which is the good news, because self-respect is a thing you can rebuild.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── QUOTE — the orange of the app's sky and the cover's sun ── */}
        <section className="sec on-sun">
          <Reveal>
            <figure className="wrap" style={{ maxWidth: 860 }}>
              <blockquote className="d-l it">
                “The pain is fuel. The only question is what you point it at.”
              </blockquote>
              <figcaption className="label" style={{ marginTop: 30 }}>Chapter 2 — Discipline</figcaption>
            </figure>
          </Reveal>
        </section>

        {/* ── BOOK ── carries the book's search phrase as its H2 and POSITIONING
            word for word (DECISIONS 2026-09-11: repeat it verbatim; the schema may
            only assert what the page shows). */}
        <section className="sec on-cream2" aria-labelledby="h-book" id="book">
          <div className="wrap">
            <div className="g-split" style={{ marginBottom: "clamp(56px,8vw,96px)" }}>
              <div>
                <span className="label c-rust">The book behind the app</span>
                <h2 id="h-book" className="d-l hi-d" style={{ marginTop: 18, marginBottom: 14 }}>
                  A Survival Guide For<br />Men After A Breakup
                </h2>
                <p className="lead it c-deep" style={{ marginBottom: 6 }}>Written by a man who's been there.</p>
                <p className="label lo-d" style={{ marginBottom: 24 }}>{AUTHOR}</p>
                <p className="lead" style={{ marginBottom: 14 }}>
                  The app is for the minute. The book is for the weeks around it. You're not sleeping.
                  You're checking her Instagram at midnight. You're replaying conversations that go
                  nowhere. This is {POSITIONING}.
                </p>
                <p className="body" style={{ marginBottom: 36 }}>
                  Short on purpose. We won't dwell on what went wrong. We'll focus on how to get out
                  of the hole you're in.
                </p>
                <BuyBlock light where="book" />
              </div>
              <Reveal delay={160} style={{ justifySelf: "center" }}>
                {coverOk ? (
                  <img src={COVER_SRC} width="800" height="1280" alt={`Cover of ${TITLE}`}
                       onError={() => setCoverOk(false)} className="cover-card" />
                ) : (
                  <div aria-hidden="true" className="cover-card" style={{ aspectRatio: "5/8", background: "var(--deep)" }} />
                )}
              </Reveal>
            </div>

            <div className="g-split-r">
              <div>
                <h3 className="d-m hi-d" style={{ marginBottom: 14 }}>Six chapters.<br />One goal.<br />Get you back.</h3>
                <p className="small lo-d it">Six chapters, and the three sections around them.</p>
              </div>
              <div>
                <ul style={{ listStyle: "none" }}>
                  {chapters.map((ch, i) => (
                    <Reveal as="li" key={ch.id} delay={i * 60} className="row" style={{ alignItems: "baseline" }}>
                      <span className="label c-rust" style={{ minWidth: 28 }} aria-hidden={!ch.num}>
                        {ch.num || "—"}
                      </span>
                      <span className={ch.num ? "hi-d" : "lo-d"} style={{ fontSize: "clamp(16px,1.7vw,20px)", lineHeight: 1.5 }}>{ch.title}</span>
                    </Reveal>
                  ))}
                </ul>
                <Reveal delay={140} className="deal">
                  <p className="label c-rust" style={{ marginBottom: 14 }}>Before you start</p>
                  <p className="hi-d" style={{ fontSize: "clamp(17px,1.7vw,20px)", lineHeight: 1.6 }}>
                    There's a deal. No calling. No texting. No watching her every story hoping she'll
                    notice — not until you've finished the book. That's it. It's a small ask, and it
                    isn't long. Short on purpose.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUOTE 2 ── */}
        <section className="sec on-sage2">
          <Reveal>
            <figure className="wrap" style={{ maxWidth: 900 }}>
              <blockquote className="d-l it hi-d">
                “Somewhere underneath the coal of all this pain, there is a diamond. It was always
                there. The breakup didn't create it. But it created the pressure.”
              </blockquote>
              <figcaption className="label c-navy" style={{ marginTop: 30 }}>Chapter 4 — Rebuilding your life</figcaption>
            </figure>
          </Reveal>
        </section>

        {/* ── A PAGE FROM INSIDE ──
            The page sold a 43-page PDF and showed none of it. This is the figure
            from page 10, on the paper colour the book is actually set on, so a
            visitor can see the object before he pays for it rather than taking
            "six chapters" on faith.

            Chosen over the other two figures (the juggling sequence, the two-list
            exercise) because it illustrates the claim made highest up the page -
            chapter one, the five stages named - and because it gives away nothing
            that makes buying the book pointless. It is a map, not the territory:
            useless on its own, which is exactly the book's own argument about it. */}
        <section className="sec on-paper" aria-labelledby="h-inside">
          <div className="wrap g-split">
            <div>
              <span className="label c-rust">A page from inside</span>
              <h2 id="h-inside" className="d-l hi-d" style={{ marginTop: 18, marginBottom: 22 }}>
                Grief isn't<br />a straight line.
              </h2>
              <p className="body" style={{ marginBottom: 20 }}>
                You'll feel denial and anger in the same hour. You'll think you've reached acceptance
                and wake up bargaining the next morning. That isn't failure — that's grief doing what
                grief does.
              </p>
              <p className="body">
                The book asks one thing of you here: when you notice one of them, name it. Say it out
                loud if you have to. A feeling you can name is a feeling you can work with. A feeling
                you can't name just runs you.
              </p>
            </div>

            <Reveal delay={140} className="figure-d" style={{ color: "var(--on-light-hi)" }}>
              <WeatherSystem titleId="ws-title" descId="ws-desc" />
            </Reveal>
          </div>
        </section>

        {/* ── AUTHOR ── */}
        <section className="sec on-sand" aria-labelledby="h-author">
          <div className="wrap" style={{ maxWidth: 760 }}>
            <h2 id="h-author" className="label c-rust" style={{ marginBottom: 26 }}>Who wrote this</h2>
            <p className="d-m it hi-d">
              “I'm not a therapist. I'm not a life coach. I don't have a degree in psychology or a
              podcast with a million subscribers. What I have is this — I've been the guy you are
              right now. The 2am guy. I also know, because I've been here more than once and each
              time had to find my way out, how to get out.”
            </p>
            <p className="label c-rust" style={{ marginTop: 26 }}>{AUTHOR}</p>
            <div style={{ marginTop: 44 }}><Buy where="author" /></div>
          </div>
        </section>

        {/* ── READING ──
            Free, useful, and the only human-visible route to the articles.
            Sits directly above the FAQ because a man deciding whether to trust
            a stranger's book should be able to read the stranger first. */}
        {ARTICLES.length > 0 && (
          <section className="sec on-cream2" aria-labelledby="h-reading" id="reading">
            <div className="wrap" style={{ maxWidth: 900 }}>
              <span className="label c-rust">Free to read</span>
              <h2 id="h-reading" className="d-l hi-d" style={{ marginTop: 18, marginBottom: 18 }}>
                Start here.<br />No payment, no email.
              </h2>
              {/* Derived, never typed. This said "Two" and went stale the moment
                  a third article shipped - a wrong number on a live page, of
                  exactly the kind this project keeps out of the copy. */}
              <p className="body" style={{ marginBottom: "clamp(34px,5vw,52px)" }}>
                {ARTICLES.length === 1
                  ? "One of the questions men actually type at 2am, answered in full."
                  : `${COUNT_WORD[ARTICLES.length] || ARTICLES.length} of the questions men actually type at 2am, answered in full.`}{" "}
                If they help, the book is the rest of it.
              </p>
              <ul style={{ listStyle: "none" }}>
                {ARTICLES.map((a, i) => (
                  <Reveal as="li" key={a.slug} delay={i * 70}
                          style={{ borderTop: "1px solid rgba(9,34,49,0.14)" }}>
                    <a href={`/${a.slug}/`}
                       style={{ display: "block", padding: "26px 0", textDecoration: "none" }}>
                      <span className="d-m hi-d" style={{ display: "block", marginBottom: 8 }}>
                        {a.title}
                      </span>
                      <span className="small lo-d" style={{ display: "block", maxWidth: "62ch" }}>
                        {a.description}
                      </span>
                    </a>
                  </Reveal>
                ))}
              </ul>
              {/* The only link into /videos/ - the crawl path for that page. */}
              {VIDEOS.length > 0 && (
                <p className="body" style={{ marginTop: "clamp(34px,5vw,52px)" }}>
                  <a className="c-rust" href="/videos/">
                    Or watch: {VIDEOS.length} {VIDEOS.length === 1 ? "episode" : "episodes"} of The 2AM Guy →
                  </a>
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── FAQ ──
            The questions are the ones actually typed into a phone at 2am, which
            is the point: this is the section an answer engine can lift from, and
            it only earns that by being visible here. The same array drives the
            FAQPage JSON-LD - see meta.js. Native <details>, so it works with no
            JavaScript at all and stays keyboard-operable for free. */}
        <section className="sec on-sand" aria-labelledby="h-faq" id="faq">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <span className="label c-rust">Straight answers</span>
            <h2 id="h-faq" className="d-l hi-d" style={{ marginTop: 18, marginBottom: "clamp(34px,5vw,54px)" }}>
              The questions<br />you're actually asking.
            </h2>

            <div>
              {faqs.map(({ q, a, more }, i) => (
                <Reveal key={q} delay={i * 50}>
                  <details className="faq" name="faq">
                    <summary>
                      <span className="faq-q">{q}</span>
                      <span className="faq-mark" aria-hidden="true" />
                    </summary>
                    <p className="faq-a">{a}</p>
                    {/* An answer that has a full article behind it links to it.
                        This is the only internal link into the article, so it
                        is also the crawl path - do not remove it without
                        putting one somewhere else. */}
                    {more && (
                      <p className="faq-a" style={{ marginTop: 14 }}>
                        <a className="c-rust" href={more.href}>{more.label} →</a>
                      </p>
                    )}
                  </details>
                </Reveal>
              ))}
            </div>

            <div style={{ marginTop: "clamp(40px,6vw,64px)" }}><BuyBlock light where="final" /></div>
          </div>
        </section>

        {/* ── EMAIL — only renders once there is somewhere to send it ── */}
        {LIST.endpoint && (
          <section className="sec on-paper" aria-labelledby="h-list">
            <div className="wrap" style={{ maxWidth: 560 }}>
              <span className="label c-rust">Free download</span>
              <h2 id="h-list" className="d-l hi-d" style={{ marginTop: 18, marginBottom: 18 }}>
                Get the free<br />habit tracker.
              </h2>
              <p className="body" style={{ marginBottom: 34 }}>
                A companion to the book. Twelve months of habit tracking, progress charts and weekly
                reflections. Free when you join the list.
              </p>
              {sent ? (
                <p className="lead hi-d" role="status">Done. It's on its way to {email}.</p>
              ) : (
                <form onSubmit={submit} noValidate className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email" name="email" type="email" autoComplete="email" inputMode="email"
                    placeholder="you@example.com" value={email} disabled={busy}
                    aria-invalid={err ? "true" : undefined}
                    aria-describedby={err ? "email-err" : "email-help"}
                    onChange={(e) => { setEmail(e.target.value); if (err) setErr(""); }}
                  />
                  {/* Honeypot. Off-screen rather than display:none, because some
                      bots skip anything the CSS hides. Never shown, never focused,
                      never announced. */}
                  <input
                    ref={trap} type="text" name="website" defaultValue=""
                    tabIndex={-1} autoComplete="off" aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, padding: 0, border: 0, opacity: 0 }}
                  />
                  {err
                    ? <p className="err" id="email-err" role="alert">{err}</p>
                    : <p className="help" id="email-help">No spam. One email with your tracker. That's it.</p>}
                  <button
                    className="cta" type="submit" style={{ marginTop: 20 }}
                    disabled={busy} aria-disabled={busy || undefined}
                  >
                    {busy ? "Sending…" : "Send it"}<Arrow size={18} />
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="on-cream2" style={{ padding: "clamp(40px,6vw,64px) var(--gut)" }}>
        <div className="wrap stack-m">
          <p className="small lo-d" style={{ maxWidth: "62ch" }}>
            {REFUND && `${REFUND} `}A {PAGES}-page {FORMAT} and a {LISTEN_TIME} audiobook, both
            downloadable as soon as you've paid — no subscription and nothing recurring. This book is not therapy and makes no clinical
            claims; if you aren't sleeping or eating for weeks, or you're having thoughts of harming
            yourself, please talk to a doctor rather than to a book.
          </p>
          {/* The identity line. Visible on purpose: until 2026-09-11 no sentence
              on this site identified it by its own domain's name, and an answer
              engine asked what thedonttextyourex.com is attributed it to
              someone else's short film. This sentence is the on-page evidence
              that was missing, and it is the same string the schema uses as its
              description. See AEO/baseline-2026-09-11.md. */}
          <p className="small lo-d" style={{ maxWidth: "62ch" }}>{IDENTITY}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 14 }}>
            <span className="small lo-d">
              © {new Date().getFullYear()} {AUTHOR} · {BRAND}
              {CONTACT_EMAIL && <> · <a className="foot-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></>}
            </span>
            <span className="small it c-t700">“Go live your life.”</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
