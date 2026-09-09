import { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "./styles";
import { Moon, Loop, Phone, Mirror, Block, Bars, Book, Check, Circle, Arrow } from "./icons";

// Commerce, copy and the FAQ now live in meta.js, because the prerender pass and
// the JSON-LD builder need the same values and a second copy would drift out of
// step with the page - which for the FAQ specifically would turn valid markup
// into a spam signal.
import {
  BUY_URL, APP_URL, PRICE, COVER_SRC, faqs,
  PAGES, FORMAT, READ_TIME, REFUND, CONTACT_EMAIL, AUTHOR, ARTICLES,
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

const features = [
  { Icon: Block, title: "Don't Text Your Ex", desc: "Intercepts the urge and redirects it into something real. Instantly." },
  { Icon: Bars,  title: "No Contact Counter", desc: "Track every day of distance. Watch the number grow. That number is you." },
  { Icon: Book,  title: "Daily Thought",      desc: "One line from the book. Delivered when you need it most." },
  { Icon: Check, title: "Habit Tracker",      desc: "Eight habits. One tap each. Small wins that build a life." },
];

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
const Buy = ({ label = `Get the book — ${PRICE}` }) =>
  BUY_URL
    ? <a className="cta" href={BUY_URL}>{label}<Arrow size={18} /></a>
    : <span className="cta" role="link" aria-disabled="true">{label}<Arrow size={18} /></span>;

// The CTA plus what the money actually buys. Every buy button on the page uses
// this rather than the bare Buy, because "$24.99" on its own does not say whether
// the thing is forty pages or four hundred, a download or a subscription - and a
// buyer who finds out afterwards asks for his money back. Stating the length is
// the argument for the price, not an admission against it: short is the promise
// the book makes on its own first page.
const BuyBlock = ({ label, light = false }) => (
  <div>
    <Buy label={label} />
    <p className={`terms ${light ? "lo-d" : "lo"}`}>
      {PAGES}-page {FORMAT} · {READ_TIME} · instant download
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

  return (
    <div className="page">
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <header
        style={{
          position: "fixed", inset: "0 0 auto 0", zIndex: 100,
          padding: "14px var(--gut)", display: "flex",
          justifyContent: "space-between", alignItems: "center", gap: 16,
          background: navOn ? "rgba(10,33,48,0.94)" : "transparent",
          backdropFilter: navOn ? "blur(14px)" : "none",
          transition: "background 320ms ease",
        }}
      >
        <span style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <span className="label" style={{ color: navOn ? "var(--teal300)" : "var(--on-dark-lo)" }}>
            Survival Guide
          </span>
          {/* The articles were live but unreachable: the only link to them was
              inside a collapsed FAQ accordion, which a crawler follows and a
              person never finds. */}
          {ARTICLES.length > 0 && (
            <a className="label" href="#reading"
               style={{ color: navOn ? "var(--on-dark-mid)" : "var(--on-dark-lo)", textDecoration: "none" }}>
              Read First
            </a>
          )}
        </span>
        <div style={{ opacity: navOn ? 1 : 0, pointerEvents: navOn ? "auto" : "none", transition: "opacity 320ms ease" }}>
          {BUY_URL
            ? <a className="cta" style={{ padding: "12px 20px", minHeight: 44, fontSize: 14 }} href={BUY_URL}>{PRICE}<Arrow size={16} /></a>
            : <span className="cta" style={{ padding: "12px 20px", minHeight: 44, fontSize: 14 }} role="link" aria-disabled="true">{PRICE}<Arrow size={16} /></span>}
        </div>
      </header>

      <main>
        {/* ── HERO — the floor ── */}
        <section className="sec on-ink" aria-labelledby="h-hero"
          style={{ minHeight: "100dvh", display: "flex", alignItems: "center", paddingTop: "clamp(110px,15vh,180px)" }}>
          <div className="wrap g-split">
            <div>
              {/* The primary query belongs inside the H1, not in a sibling
                  span above it. It read "A Survival Guide For Men" alone, so
                  the most important heading on the page did not contain the
                  thing people search for. Same pixels, different markup: the
                  kicker is now a block-level span inside the heading.
                  One Reveal, not two - `.rv` animates translateY, which an
                  inline span inside a heading will not honour. */}
              <Reveal>
                <h1 id="h-hero" className="d-xl hi" style={{ marginBottom: 24 }}>
                  <span className="h1-kicker">How to Get Over a Breakup</span>
                  A Survival<br />Guide For Men
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="lead it c-teal" style={{ marginBottom: 10 }}>Written by a man who's been there.</p>
              </Reveal>
              <Reveal delay={190}>
                <p className="label lo" style={{ marginBottom: 22 }}>Kamil Zaleński</p>
              </Reveal>
              <Reveal delay={220}>
                <p className="lead" style={{ marginBottom: 44 }}>
                  You're not sleeping. You're checking her Instagram at midnight.
                  You're replaying conversations that go nowhere. This book was built for that moment.
                </p>
              </Reveal>
              <Reveal delay={300}><BuyBlock /></Reveal>
            </div>

            <Reveal delay={240} style={{ justifySelf: "center" }}>
              {coverOk ? (
                <img
                  src={COVER_SRC} width="800" height="1280"
                  alt="Cover of How to Get Over a Breakup — A Survival Guide For Men, by Kamil Zaleński"
                  onError={() => setCoverOk(false)}
                  style={{ width: "min(320px,72vw)", height: "auto", borderRadius: 3, boxShadow: "0 34px 70px -20px rgba(7,24,35,0.85)" }}
                />
              ) : (
                <div aria-hidden="true" style={{ width: "min(320px,72vw)", aspectRatio: "5/8", background: "var(--teal900)", borderRadius: 3 }} />
              )}
            </Reveal>
          </div>
        </section>

        {/* ── PROBLEM — still on the floor ── */}
        <section className="sec on-ink" aria-labelledby="h-problem">
          <div className="wrap">
            <div className="g-split-r" style={{ marginBottom: "clamp(32px,5vw,56px)" }}>
              <div>
                <span className="label c-teal">Sound familiar?</span>
                <h2 id="h-problem" className="d-l hi" style={{ marginTop: 18 }}>
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
                  <span className="num c-orange" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <span className="c-teal" style={{ flexShrink: 0, marginTop: 3 }}><Icon size={22} /></span>
                    <span className="d-m hi" style={{ fontSize: "clamp(19px,2.4vw,30px)" }}>{text}</span>
                  </span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={140}>
              <p className="lead" style={{ marginTop: "clamp(40px,6vw,68px)" }}>
                This isn't a therapy manual. This isn't a list of affirmations. This is a blueprint —
                written by a man who's been on the floor and figured out how to get back up.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── THE HARD PART ──
            The two ideas that separate this book from every other breakup page,
            and neither was on the site. The first is the most arresting page in
            the manuscript (p.11) and the second is its one genuinely unusual
            claim (p.12) - the site was selling six chapter titles while keeping
            its best material behind the paywall, which is backwards. Give away
            the ideas; the book is the working-through.

            Darkest ground on the page, on purpose. This is the section that says
            the unwelcome thing, and it sits between the description of the floor
            and the first light in the next section.

            The prose is lifted close to the manuscript's own wording rather than
            rewritten as marketing, so the voice a visitor meets here is the voice
            he gets if he buys. */}
        <section className="sec on-abyss" aria-labelledby="h-truth">
          <div className="wrap">
            <div className="g-split-r" style={{ marginBottom: "clamp(40px,6vw,72px)" }}>
              <div>
                <span className="label c-orange">The hard part</span>
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
                <p className="label c-teal" style={{ marginBottom: 20 }}>One</p>
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
                <p className="label c-teal" style={{ marginBottom: 20 }}>Two</p>
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
                <p className="lead c-teal it" style={{ marginTop: 22 }}>
                  Which is the good news, because self-respect is a thing you can rebuild.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── QUOTE 1 — first light ── */}
        <section className="sec on-t900">
          <Reveal>
            <figure className="wrap" style={{ maxWidth: 860 }}>
              <blockquote className="d-l it hi">
                “The pain is fuel. The only question is what you point it at.”
              </blockquote>
              <figcaption className="label c-teal" style={{ marginTop: 30 }}>Chapter 2 — Discipline</figcaption>
            </figure>
          </Reveal>
        </section>

        {/* ── BOOK ── */}
        <section className="sec on-t900" aria-labelledby="h-book" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <hr className="rule" style={{ marginBottom: "clamp(56px,8vw,96px)", color: "var(--on-dark-hi)" }} />
            <div className="g-split-r">
              <div>
                <span className="label c-teal">The book</span>
                <h2 id="h-book" className="d-l hi" style={{ marginTop: 18, marginBottom: 22 }}>
                  Six chapters.<br />One goal.<br />Get you back.
                </h2>
                <p className="body" style={{ marginBottom: 38 }}>
                  Short on purpose. We won't dwell on what went wrong. We'll focus on how to get out
                  of the hole you're in.
                </p>
                <BuyBlock label={`Get the ${FORMAT} — ${PRICE}`} />
              </div>

              <div>
                {/* A ul, not an ol: three of these nine sections are not
                    numbered chapters, and an ordered list that skips numbers
                    reads as a mistake. Keyed on id because num is no longer
                    unique - three entries share an empty one. */}
                <ul style={{ listStyle: "none" }}>
                  {chapters.map((ch, i) => (
                    <Reveal as="li" key={ch.id} delay={i * 60} className="row" style={{ alignItems: "baseline" }}>
                      <span className="label c-orange" style={{ minWidth: 28 }} aria-hidden={!ch.num}>
                        {ch.num || "—"}
                      </span>
                      <span className={ch.num ? "hi" : "lo"} style={{ fontSize: "clamp(16px,1.7vw,20px)", lineHeight: 1.5 }}>{ch.title}</span>
                    </Reveal>
                  ))}
                </ul>
                <p className="small lo it" style={{ marginTop: 22 }}>
                  Six chapters, and the three sections around them.
                </p>

                {/* The prologue's terms (p.6), which were nowhere on a site named
                    after them. This is the book's only demand of the reader and
                    it is also, said out loud, the sharpest thing the page can
                    say about what it is for. Set as a bordered strip rather than
                    a section: it belongs to the book description, and the page is
                    already long. */}
                <Reveal delay={140} className="deal">
                  <p className="label c-orange" style={{ marginBottom: 14 }}>Before you start</p>
                  <p className="hi" style={{ fontSize: "clamp(17px,1.7vw,20px)", lineHeight: 1.6 }}>
                    There's a deal. No calling. No texting. No watching her every story hoping she'll
                    notice — not until you've finished the book. That's it. It's a small ask, and it
                    isn't long. Short on purpose.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── APP ── */}
        <section className="sec on-t700" aria-labelledby="h-app">
          <div className="wrap">
            <div style={{ marginBottom: "clamp(44px,6vw,76px)", maxWidth: "22ch" }}>
              <span className="label c-teal">The app</span>
              <h2 id="h-app" className="d-l hi" style={{ marginTop: 18 }}>
                For the 2am moment.<br />Right in your pocket.
              </h2>
            </div>

            <div className="g-split">
              <div className="stack-l">
                {features.map(({ Icon, title, desc }, i) => (
                  <Reveal key={title} delay={i * 70} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "start" }}>
                    <span className="c-teal" style={{ marginTop: 2 }}><Icon size={26} /></span>
                    <span>
                      <span className="hi" style={{ display: "block", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{title}</span>
                      <span className="body" style={{ display: "block" }}>{desc}</span>
                    </span>
                  </Reveal>
                ))}
                {APP_URL
                  ? <a className="ghost" href={APP_URL}>Download the app<Arrow size={16} /></a>
                  : <p className="small lo it">The app is still in build. The book stands on its own.</p>}
              </div>

              <Reveal delay={180} style={{ justifySelf: "center" }}>
                <div className="phone float" role="img" aria-label="Preview of the app: an interrupt button, a habit grid, and the day's thought.">
                  <p className="label c-orange" style={{ fontSize: 9, textAlign: "center", marginBottom: 14 }}>Don't Text Your Ex</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 13px", marginBottom: 10, borderRadius: 3, border: "1px solid var(--orange)", background: "rgba(239,105,62,0.13)" }}>
                    <span className="c-orange"><Block size={22} /></span>
                    <span>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>Don't Text Your Ex</span>
                      <span style={{ display: "block", fontSize: 11, color: "var(--on-dark-lo)" }}>Tap for an instant redirect</span>
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 10 }}>
                    {[["Cold shower", true], ["Exercise", true], ["No contact", false], ["Journal", false]].map(([lbl, done]) => (
                      <span key={lbl} className={done ? "tile done" : "tile"}>
                        {done ? <Check size={14} /> : <Circle size={14} />}{lbl}
                      </span>
                    ))}
                  </div>
                  <div style={{ padding: "12px 13px", borderRadius: 3, border: "1px solid rgba(252,250,231,0.12)" }}>
                    <span className="label" style={{ fontSize: 9, color: "var(--teal300)" }}>Today's thought</span>
                    <p className="it" style={{ fontSize: 12, color: "var(--on-dark-mid)", marginTop: 7, lineHeight: 1.55 }}>
                      “The goal right now isn't transformation. It's interruption.”
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── QUOTE 2 — the turn. Hard cut into the light, on purpose. ── */}
        <section className="sec on-sage">
          <Reveal>
            <figure className="wrap" style={{ maxWidth: 900 }}>
              <blockquote className="d-l it hi-d">
                “Somewhere underneath the coal of all this pain, there is a diamond. It was always
                there. The breakup didn't create it. But it created the pressure.”
              </blockquote>
              <figcaption className="label c-t700" style={{ marginTop: 30 }}>Chapter 4 — Rebuilding your life</figcaption>
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
        <section className="sec on-cream" aria-labelledby="h-author">
          <div className="wrap" style={{ maxWidth: 760 }}>
            <h2 id="h-author" className="label c-rust" style={{ marginBottom: 26 }}>Who wrote this</h2>
            <p className="d-m it hi-d">
              “I'm not a therapist. I'm not a life coach. I don't have a degree in psychology or a
              podcast with a million subscribers. What I have is this — I've been the guy you are
              right now. The 2am guy. I also know, because I've been here more than once and each
              time had to find my way out, how to get out.”
            </p>
            <p className="label c-rust" style={{ marginTop: 26 }}>{AUTHOR}</p>
            <div style={{ marginTop: 44 }}><Buy /></div>
          </div>
        </section>

        {/* ── READING ──
            Free, useful, and the only human-visible route to the articles.
            Sits directly above the FAQ because a man deciding whether to trust
            a stranger's book should be able to read the stranger first. */}
        {ARTICLES.length > 0 && (
          <section className="sec on-t700" aria-labelledby="h-reading" id="reading">
            <div className="wrap" style={{ maxWidth: 900 }}>
              <span className="label c-teal">Free to read</span>
              <h2 id="h-reading" className="d-l hi" style={{ marginTop: 18, marginBottom: 18 }}>
                Start here.<br />No payment, no email.
              </h2>
              <p className="body" style={{ marginBottom: "clamp(34px,5vw,52px)" }}>
                Two of the questions men actually type at 2am, answered in full.
                If they help, the book is the rest of it.
              </p>
              <ul style={{ listStyle: "none" }}>
                {ARTICLES.map((a, i) => (
                  <Reveal as="li" key={a.slug} delay={i * 70}
                          style={{ borderTop: "1px solid rgba(252,250,231,0.18)" }}>
                    <a href={`/${a.slug}/`}
                       style={{ display: "block", padding: "26px 0", textDecoration: "none" }}>
                      <span className="d-m hi" style={{ display: "block", marginBottom: 8 }}>
                        {a.title}
                      </span>
                      <span className="small lo" style={{ display: "block", maxWidth: "62ch" }}>
                        {a.description}
                      </span>
                    </a>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── FAQ ──
            The questions are the ones actually typed into a phone at 2am, which
            is the point: this is the section an answer engine can lift from, and
            it only earns that by being visible here. The same array drives the
            FAQPage JSON-LD - see meta.js. Native <details>, so it works with no
            JavaScript at all and stays keyboard-operable for free. */}
        <section className="sec on-cream" aria-labelledby="h-faq" id="faq">
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
                        <a className="c-orange" href={more.href}>{more.label} →</a>
                      </p>
                    )}
                  </details>
                </Reveal>
              ))}
            </div>

            <div style={{ marginTop: "clamp(40px,6vw,64px)" }}><BuyBlock light /></div>
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

      <footer className="on-paper" style={{ padding: "clamp(40px,6vw,64px) var(--gut)" }}>
        <div className="wrap stack-m">
          <p className="small lo-d" style={{ maxWidth: "62ch" }}>
            {REFUND && `${REFUND} `}A {PAGES}-page {FORMAT}, downloadable as soon as you've paid — no
            subscription and nothing recurring. This book is not therapy and makes no clinical
            claims; if you aren't sleeping or eating for weeks, or you're having thoughts of harming
            yourself, please talk to a doctor rather than to a book.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 14 }}>
            <span className="small lo-d">
              © {new Date().getFullYear()} {AUTHOR} · How to Get Over a Breakup
              {CONTACT_EMAIL && <> · <a className="foot-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></>}
            </span>
            <span className="small it c-t700">“Go live your life.”</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
