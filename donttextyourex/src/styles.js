// Every colour below was sampled from public/cover.jpg with a 14-colour median
// cut - these are real pixel values off the cover, not invented ones. Share of
// the cover in brackets.
//   ink #0A2130 (12.2%)  teal900 #114149 (7.6%)  teal700 #146463 (6.8%)
//   teal500 #0D9280 (6.2%)  teal300 #28BC9D (7.5%)  sage #9FC7A0 (5.3%)
//   amber #F8BF71 (6.9%)  cream #F9E0A8 (6.9%)  paper #FCFAE7 (7.4%)
//   orange #EF693E (12.7%, the largest single colour)  rust #9A4437 (5.6%)
//   abyss #071823 is the one extrapolated value - one step under ink.
//
// Contrast rules, computed against WCAG 2.1 rather than eyeballed:
//   Text-bearing dark grounds: ink / teal900 / teal700 ONLY. teal500 and
//     teal300 fail as text grounds (2.2-3.5:1) - accent use only.
//   Text-bearing light grounds: sage / amber / cream / paper.
//   Accent text on dark : orange (5.31:1 on ink) or teal300 (6.89:1 on ink).
//   Accent text on light: rust (6.13:1 on paper) or teal700 (6.58:1 on paper).
//     orange on paper is 2.95:1 - never orange as text on a light ground.
//   Primary CTA is orange fill + ink text = 5.31:1. White on orange was 2.95:1.
//
// One stylesheet, token-driven. Replaces ~280 lines of inline style objects so
// colour and spacing live in one place instead of being re-typed per element.
export const CSS = `
:root{
  --abyss:#071823; --ink:#0A2130; --teal900:#114149; --teal700:#146463;
  --teal500:#0D9280; --teal300:#28BC9D; --sage:#9FC7A0;
  --amber:#F8BF71; --cream:#F9E0A8; --paper:#FCFAE7;
  --orange:#EF693E; --rust:#9A4437;

  --on-dark-hi:rgba(252,250,231,0.96);
  --on-dark-mid:rgba(252,250,231,0.78);
  --on-dark-lo:rgba(252,250,231,0.60);
  --on-light-hi:rgba(9,26,34,0.92);
  --on-light-mid:rgba(9,26,34,0.72);
  --on-light-lo:rgba(9,26,34,0.58);

  --display:"Instrument Serif",Iowan Old Style,Palatino,serif;
  --text:"Archivo",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;

  --gut:clamp(20px,5vw,64px);
  --bay:clamp(72px,11vw,148px);
  --wrap:1180px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--ink)}
.page{font-family:var(--text);font-size:17px;line-height:1.65;overflow-x:clip}
img{max-width:100%;display:block}

/* ── type ─────────────────────────────────────────────────────────────── */
.d-xl{font-family:var(--display);font-weight:400;font-size:clamp(50px,8.6vw,124px);line-height:0.94;letter-spacing:-0.015em}
.d-l {font-family:var(--display);font-weight:400;font-size:clamp(34px,5.2vw,70px);line-height:1.02;letter-spacing:-0.01em}
.d-m {font-family:var(--display);font-weight:400;font-size:clamp(25px,3.3vw,42px);line-height:1.22}
.lead{font-size:clamp(17px,1.55vw,20px);line-height:1.72;max-width:56ch}
.body{font-size:16px;line-height:1.72;max-width:64ch}
.small{font-size:14px;line-height:1.6}
.label{font-family:var(--text);font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;line-height:1}
/* Visually identical to .label + .c-orange, but it lives inside the H1.
   No backticks in here - this whole stylesheet is a template literal. */
.h1-kicker{display:block;font-family:var(--text);font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;line-height:1;color:var(--orange);margin-bottom:26px}
.num{font-family:var(--display);font-size:clamp(40px,5vw,68px);line-height:0.8;font-style:italic}
.it{font-style:italic}

/* ── layout ───────────────────────────────────────────────────────────── */
.sec{padding:var(--bay) var(--gut)}
.wrap{max-width:var(--wrap);margin-inline:auto;width:100%}
.g-split{display:grid;gap:clamp(40px,6vw,88px);align-items:center;grid-template-columns:1fr}
@media(min-width:900px){.g-split{grid-template-columns:1.15fr 0.85fr}}
.g-split-r{display:grid;gap:clamp(40px,6vw,80px);align-items:start;grid-template-columns:1fr}
@media(min-width:900px){.g-split-r{grid-template-columns:0.9fr 1.1fr}}
.stack-s>*+*{margin-top:14px}
.stack-m>*+*{margin-top:26px}
.stack-l>*+*{margin-top:44px}

/* ── grounds ──────────────────────────────────────────────────────────── */
/* abyss is a text-bearing ground here. It was extrapolated one step under ink
   (see the header note), and cream-white at 78% sits on it at roughly 15:1 -
   comfortably past AA. Reserved for the one section that says the unwelcome
   thing, so the page gets darker exactly where the copy does. */
.on-abyss {background:var(--abyss);  color:var(--on-dark-mid)}
.on-ink   {background:var(--ink);    color:var(--on-dark-mid)}
.on-t900  {background:var(--teal900);color:var(--on-dark-mid)}
.on-t700  {background:var(--teal700);color:var(--on-dark-mid)}
.on-sage  {background:var(--sage);   color:var(--on-light-mid)}
.on-cream {background:var(--cream);  color:var(--on-light-mid)}
.on-paper {background:var(--paper);  color:var(--on-light-mid)}
.hi{color:var(--on-dark-hi)} .lo{color:var(--on-dark-lo)}
.hi-d{color:var(--on-light-hi)} .lo-d{color:var(--on-light-lo)}
.c-orange{color:var(--orange)} .c-teal{color:var(--teal300)}
.c-rust{color:var(--rust)} .c-t700{color:var(--teal700)}

/* ── rules, not cards ─────────────────────────────────────────────────── */
.rule{height:1px;border:0;background:currentColor;opacity:0.18}
.row{display:grid;grid-template-columns:auto 1fr;gap:clamp(18px,3vw,40px);
     align-items:start;padding:clamp(22px,3vw,34px) 0;border-top:1px solid currentColor}
.row{border-top-color:rgba(252,250,231,0.14)}
.row:last-child{border-bottom:1px solid rgba(252,250,231,0.14)}

/* The line under every buy button: length, format and delivery, plus the refund
   terms if REFUND is ever set. Small and quiet by design - it is not a selling
   point competing with the CTA, it is the answer to "what am I actually
   getting", placed where the question is asked. */
.terms{font-size:13px;line-height:1.6;margin-top:14px;max-width:46ch}

/* The prologue's terms. A left rule rather than a card: the page's whole visual
   grammar is rules and grounds, and a rounded box here would read as a component
   borrowed from somewhere else. */
.deal{margin-top:clamp(30px,4vw,44px);padding:22px 0 4px 24px;
      border-left:2px solid var(--orange)}

/* The interior figure. It inherits colour from this wrapper, so the whole drawing
   moves with the ground rather than being a black stamp on it. */
.figure-d{width:100%;max-width:620px;justify-self:center}

.foot-link{color:inherit;text-decoration:underline;text-underline-offset:3px}
.foot-link:hover{color:var(--rust)}

/* ── controls ─────────────────────────────────────────────────────────── */
.cta{display:inline-flex;align-items:center;gap:10px;
  background:var(--orange);color:var(--ink);
  font-family:var(--text);font-size:16px;font-weight:600;letter-spacing:0.01em;
  border:0;border-radius:2px;padding:19px 30px;min-height:56px;
  text-decoration:none;cursor:pointer;
  box-shadow:0 10px 28px -10px rgba(154,68,55,0.75);
  transition:transform 180ms cubic-bezier(.2,.7,.3,1),box-shadow 180ms ease,background 180ms ease}
.cta:hover{background:#F4784F;box-shadow:0 14px 34px -10px rgba(154,68,55,0.9)}
.cta:active{transform:translateY(1px);box-shadow:0 6px 18px -8px rgba(154,68,55,0.8)}
/* Inert only until BUY_URL is set. Kept at full visual strength so the page
   reads as finished; the honesty lives in aria-disabled + the cursor, and
   it becomes a real <a> the moment BUY_URL exists. */
.cta[aria-disabled="true"]{cursor:not-allowed}
.cta[aria-disabled="true"]:hover{background:var(--orange);
  box-shadow:0 10px 28px -10px rgba(154,68,55,0.75)}
.cta[aria-disabled="true"]:hover svg{transform:none}
.cta svg{transition:transform 180ms cubic-bezier(.2,.7,.3,1)}
.cta:hover svg{transform:translateX(3px)}

.ghost{display:inline-flex;align-items:center;gap:9px;background:none;border:0;
  padding:8px 0;min-height:44px;cursor:pointer;font-family:var(--text);font-size:15px;
  color:var(--teal300);border-bottom:1px solid currentColor;border-radius:0;
  transition:opacity 160ms ease}
.ghost:hover{opacity:0.72}

:where(a,button,input,[tabindex]):focus-visible{
  outline:3px solid var(--orange);outline-offset:3px;border-radius:1px}

.field{display:block}
.field label{display:block;font-size:13px;font-weight:600;letter-spacing:0.06em;
  color:var(--on-light-hi);margin-bottom:8px}
.field input{width:100%;min-height:52px;padding:14px 16px;font-family:var(--text);
  font-size:16px;color:var(--on-light-hi);background:rgba(9,26,34,0.05);
  border:1px solid rgba(9,26,34,0.25);border-radius:2px}
.field input::placeholder{color:rgba(9,26,34,0.42)}
.field .help{font-size:13px;color:var(--on-light-lo);margin-top:8px}
.field .err{font-size:13px;color:var(--rust);font-weight:500;margin-top:8px}

/* ── phone ────────────────────────────────────────────────────────────── */
.phone{background:var(--abyss);border-radius:26px;padding:20px 16px 16px;
  max-width:300px;box-shadow:0 18px 44px -12px rgba(7,24,35,0.55);
  border:1px solid rgba(252,250,231,0.10)}
.tile{display:flex;align-items:center;gap:9px;padding:11px 12px;border-radius:3px;
  font-size:12px;border:1px solid rgba(252,250,231,0.12);color:var(--on-dark-lo)}
.tile.done{color:var(--teal300);border-color:rgba(40,188,157,0.42);background:rgba(40,188,157,0.10)}

/* ── faq ──────────────────────────────────────────────────────────────── */
/* Native <details>, so every answer is in the DOM and readable whether or not
   JavaScript runs - which is the entire reason this section is worth marking up
   as FAQPage. A crawler that executes nothing still gets all six answers. */
.faq{border-top:1px solid rgba(9,26,34,0.16)}
.faq:last-of-type{border-bottom:1px solid rgba(9,26,34,0.16)}
.faq>summary{list-style:none;cursor:pointer;display:flex;align-items:flex-start;
  justify-content:space-between;gap:24px;padding:22px 0;min-height:44px;
  color:var(--on-light-hi)}
.faq>summary::-webkit-details-marker{display:none}
.faq>summary:focus-visible{outline:2px solid var(--rust);outline-offset:4px}
.faq-q{font-family:var(--display);font-size:clamp(17px,2vw,22px);
  line-height:1.4;color:var(--on-light-hi)}
/* A plus that becomes a minus. Drawn with pseudo-elements rather than an icon so
   it costs nothing and inherits colour. */
.faq-mark{position:relative;flex-shrink:0;width:15px;height:15px;margin-top:6px}
.faq-mark::before,.faq-mark::after{content:"";position:absolute;background:currentColor;
  left:0;top:7px;width:15px;height:1.5px;transition:transform 260ms cubic-bezier(.2,.7,.3,1)}
.faq-mark::after{transform:rotate(90deg)}
.faq[open] .faq-mark::after{transform:rotate(0deg)}
.faq-a{padding:0 0 26px;max-width:64ch;font-size:16px;line-height:1.7;
  color:var(--on-light-mid)}

/* ── motion ───────────────────────────────────────────────────────────── */
/* Visible is the DEFAULT. The hidden state is only applied once the inline
   script in index.html has confirmed IntersectionObserver exists (html.js), so a
   throttled observer, a background tab or a JS failure can never leave the page
   blank. The gate is on <html> rather than on .page because it has to be set
   before the first paint of the prerendered markup - if React owned it, the
   static content would paint and then be hidden again on mount. */
.rv{transition:opacity 700ms cubic-bezier(.2,.7,.3,1),transform 700ms cubic-bezier(.2,.7,.3,1)}
html.js .rv{opacity:0;transform:translateY(18px)}
html.js .rv.in{opacity:1;transform:none}
.float{animation:float 5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:0.001ms!important;animation-iteration-count:1!important;
    transition-duration:0.001ms!important;scroll-behavior:auto!important}
  html.js .rv{opacity:1;transform:none}
}
`;
