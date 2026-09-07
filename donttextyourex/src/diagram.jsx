// The five-stages figure from page 10 of the book, redrawn for the web.
//
// Why the page carries an interior figure at all: the site sells a $24.99 PDF
// and showed nothing of its inside. The book's interior is set on cream paper in
// a serif face with three hand-plotted line figures; the sales page is navy and
// orange and looks like a different object entirely. A visitor had no way to see
// what he was buying, and "six chapters" is a claim, not evidence.
//
// Geometry is copied point-for-point from `diagrams/01-weather-system.svg` in the
// book's build folder - the same file that produced the printed figure - so this
// is the book's actual drawing, not a website approximation of it. Two changes,
// both deliberate:
//
//   * `#111` becomes `currentColor` everywhere, so the figure takes the colour of
//     whatever ground it sits on instead of being a black rectangle stamped onto
//     the palette. The arrowhead marker has to be told this explicitly - a marker
//     resolves currentColor against its own <marker> element, not the referencing
//     path, so without `color:inherit` on the marker it falls back to black.
//   * The serif stack matches the site's --display token rather than the print
//     Georgia, so the labels are set in the same face as the headings.
//
// Inline rather than an <img>: it inherits colour, it costs no request, and it is
// in the prerendered HTML for consumers that never run JavaScript.
export const WeatherSystem = ({ titleId, descId }) => (
  <svg
    viewBox="0 0 700 430"
    width="700"
    height="430"
    role="img"
    aria-labelledby={`${titleId} ${descId}`}
    style={{ width: "100%", height: "auto", color: "inherit" }}
  >
    <title id={titleId}>The five stages of grief, drawn as a weather system</title>
    <desc id={descId}>
      Denial, anger, bargaining, depression and acceptance plotted as five points
      scattered across the frame rather than in a line. Solid arrows run forward
      between them; two dashed arrows loop backwards, from acceptance to
      bargaining and from depression to anger, showing that the stages are
      re-entered rather than passed through once.
    </desc>

    <defs>
      <marker
        id="ws-arrow" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="7" markerHeight="7" orient="auto-start-reverse"
        style={{ color: "inherit" }}
      >
        <path
          d="M 0 1 L 9 5 L 0 9" fill="none" stroke="currentColor"
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        />
      </marker>
    </defs>

    <g
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M 99 108 Q 178 128 236 175" markerEnd="url(#ws-arrow)" />
      <path d="M 246 199 Q 214 258 180 288" markerEnd="url(#ws-arrow)" />
      <path d="M 187 296 Q 305 236 388 124" markerEnd="url(#ws-arrow)" />
      <path d="M 414 120 Q 502 154 534 251" markerEnd="url(#ws-arrow)" />
      {/* The two that go backwards. These are the whole point of the figure. */}
      <path d="M 536 282 Q 356 396 178 320" markerEnd="url(#ws-arrow)" strokeDasharray="1 7" />
      <path d="M 404 132 Q 412 250 272 200" markerEnd="url(#ws-arrow)" strokeDasharray="1 7" />
    </g>

    <g fill="currentColor">
      <circle cx="85" cy="100" r="6" />
      <circle cx="250" cy="185" r="6" />
      <circle cx="167" cy="300" r="6" />
      <circle cx="400" cy="110" r="6" />
      <circle cx="545" cy="265" r="6" />
    </g>

    <g fill="currentColor" fontFamily="var(--display)" fontSize="19">
      <text x="85" y="78" textAnchor="middle">Denial</text>
      <text x="238" y="163" textAnchor="middle">Anger</text>
      <text x="150" y="306" textAnchor="end">Bargaining</text>
      <text x="400" y="88" textAnchor="middle">Depression</text>
      <text x="566" y="271">Acceptance</text>
    </g>

    <text
      x="350" y="418" textAnchor="middle" fill="currentColor"
      fontFamily="var(--display)" fontSize="17" fontStyle="italic"
    >
      Not a line. A weather system.
    </text>
  </svg>
);
