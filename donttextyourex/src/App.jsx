import { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "./styles";
import { Moon, Loop, Phone, Mirror, Block, Bars, Book, Check, Circle, Arrow } from "./icons";

// ── Commerce ────────────────────────────────────────────────────────────────
const BUY_URL = "";       // TODO: paste the Gumroad product URL here
const APP_URL = "";       // TODO: app store / download link, when there is one
const LIST_ENDPOINT = ""; // TODO: POST target for the email list. While this is
                          // empty the signup section does not render at all -
                          // a form that silently discards an address is worse
                          // than no form.
const PRICE = "$24.99";
const COVER_SRC = "/cover.jpg";

// ── Content ─────────────────────────────────────────────────────────────────
const problems = [
  { Icon: Moon,   text: "It's 2am and you can't stop checking her Instagram." },
  { Icon: Loop,   text: "The same thoughts on loop. Every conversation replayed." },
  { Icon: Phone,  text: "Your thumb hovering over her name for the hundredth time." },
  { Icon: Mirror, text: "Not recognising the person staring back at you." },
];

const chapters = [
  { num: "01", title: "What's in your mind right now — the five stages, named." },
  { num: "02", title: "Discipline as self-sacrifice — give your pain a job." },
  { num: "03", title: "The power of goals — starting from the floor." },
  { num: "04", title: "Rebuilding — the diamond under the coal." },
  { num: "05", title: "Support system — the message Mark almost didn't send." },
  { num: "06", title: "Moving forward — protecting what's yours." },
];

const features = [
  { Icon: Block, title: "Don't Text Your Ex", desc: "Intercepts the urge and redirects it into something real. Instantly." },
  { Icon: Bars,  title: "No Contact Counter", desc: "Track every day of distance. Watch the number grow. That number is you." },
  { Icon: Book,  title: "Daily Thought",      desc: "One line from the book. Delivered when you need it most." },
  { Icon: Check, title: "Habit Tracker",      desc: "Eight habits. One tap each. Small wins that build a life." },
];

// ── Reveal on scroll ────────────────────────────────────────────────────────
// The hidden state only exists while .page.js is set, and that class is only
// set when IntersectionObserver is available. On top of that every element has
// a hard fallback timer: if the observer is throttled (background tab, hidden
// window) and never fires, the content still appears. Content must never be
// able to get stuck invisible.
const REVEAL_FALLBACK_MS = 1400;

const enhanceOK = () =>
  typeof window !== "undefined" &&
  typeof IntersectionObserver !== "undefined" &&
  !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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

export default function LandingPage() {
  const [navOn, setNavOn] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [coverOk, setCoverOk] = useState(true);
  // Computed once, before first paint, so the page never flashes visible then hides.
  const [enhance] = useState(enhanceOK);

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email address."); return; }
    setErr("");
    try {
      await fetch(LIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch { setErr("That didn't send. Try again in a moment."); }
  }, [email]);

  return (
    <div className={enhance ? "page js" : "page"}>
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
        <span className="label" style={{ color: navOn ? "var(--teal300)" : "var(--on-dark-lo)" }}>
          Survival Guide
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
              <Reveal style={{ marginBottom: 26 }}>
                <span className="label c-orange">How to Get Over a Breakup</span>
              </Reveal>
              <Reveal delay={80}>
                <h1 id="h-hero" className="d-xl hi" style={{ marginBottom: 24 }}>
                  A Survival<br />Guide For Men
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="lead it c-teal" style={{ marginBottom: 22 }}>Written by someone who's been there.</p>
              </Reveal>
              <Reveal delay={220}>
                <p className="lead" style={{ marginBottom: 44 }}>
                  You're not sleeping. You're checking her Instagram at midnight.
                  You're replaying conversations that go nowhere. This book was built for that moment.
                </p>
              </Reveal>
              <Reveal delay={300}><Buy /></Reveal>
            </div>

            <Reveal delay={240} style={{ justifySelf: "center" }}>
              {coverOk ? (
                <img
                  src={COVER_SRC} width="800" height="1280"
                  alt="Cover of How to Get Over a Breakup — A Survival Guide For Men"
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
                <Buy label={`Get the PDF — ${PRICE}`} />
              </div>

              <div>
                <ol style={{ listStyle: "none" }}>
                  {chapters.map((ch, i) => (
                    <Reveal as="li" key={ch.num} delay={i * 60} className="row" style={{ alignItems: "baseline" }}>
                      <span className="label c-orange" style={{ minWidth: 28 }}>{ch.num}</span>
                      <span className="hi" style={{ fontSize: "clamp(16px,1.7vw,20px)", lineHeight: 1.5 }}>{ch.title}</span>
                    </Reveal>
                  ))}
                </ol>
                <p className="small lo it" style={{ marginTop: 22 }}>
                  Plus the 25-quality exercise that changes everything.
                </p>
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

        {/* ── AUTHOR ── */}
        <section className="sec on-cream" aria-labelledby="h-author">
          <div className="wrap" style={{ maxWidth: 760 }}>
            <h2 id="h-author" className="label c-rust" style={{ marginBottom: 26 }}>Who wrote this</h2>
            <p className="d-m it hi-d">
              “I'm not a therapist. I'm not a life coach. What I have is this — I've been the person
              you are right now. The 2am person. I also know, because I've been here more than once,
              how to get out.”
            </p>
            <div style={{ marginTop: 44 }}><Buy /></div>
          </div>
        </section>

        {/* ── EMAIL — only renders once there is somewhere to send it ── */}
        {LIST_ENDPOINT && (
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
                    placeholder="you@example.com" value={email}
                    aria-invalid={err ? "true" : undefined}
                    aria-describedby={err ? "email-err" : "email-help"}
                    onChange={(e) => { setEmail(e.target.value); if (err) setErr(""); }}
                  />
                  {err
                    ? <p className="err" id="email-err" role="alert">{err}</p>
                    : <p className="help" id="email-help">No spam. One email with your tracker. That's it.</p>}
                  <button className="cta" type="submit" style={{ marginTop: 20 }}>
                    Send it<Arrow size={18} />
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="on-paper" style={{ padding: "40px var(--gut)" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <span className="small lo-d">© {new Date().getFullYear()} How to Get Over a Breakup</span>
          <span className="small it c-t700">“Go live your life.”</span>
        </div>
      </footer>
    </div>
  );
}
