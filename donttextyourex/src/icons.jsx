// Line icons. One family, one stroke weight (1.5), one 24-unit box, currentColor.
// These replace the emoji the page used as structural icons - emoji render
// differently on every platform and cannot be themed or sized reliably.

const Svg = ({ size = 24, children }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false"
  >
    {children}
  </svg>
);

export const Moon = (p) => (
  <Svg {...p}><path d="M20.8 13.4A8.6 8.6 0 1 1 10.6 3.2a6.7 6.7 0 0 0 10.2 10.2Z" /></Svg>
);

export const Loop = (p) => (
  <Svg {...p}>
    <path d="M17 3.5 20.5 7 17 10.5" /><path d="M3.5 11.2v-.7A3.5 3.5 0 0 1 7 7h13.5" />
    <path d="M7 20.5 3.5 17 7 13.5" /><path d="M20.5 12.8v.7a3.5 3.5 0 0 1-3.5 3.5H3.5" />
  </Svg>
);

export const Phone = (p) => (
  <Svg {...p}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M12 18.2h.01" />
  </Svg>
);

export const Mirror = (p) => (
  <Svg {...p}>
    <path d="M12 2.5c3 0 5.5 3.4 5.5 7.6S15 17.7 12 17.7s-5.5-3.4-5.5-7.6S9 2.5 12 2.5Z" />
    <path d="M12 17.7v3.8" /><path d="M8.5 21.5h7" />
  </Svg>
);

export const Block = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6 18.4 18.4" /></Svg>
);

export const Bars = (p) => (
  <Svg {...p}>
    <path d="M3.5 20.5h17" /><path d="M7.5 20.5v-4.5" />
    <path d="M12 20.5v-9" /><path d="M16.5 20.5v-13" />
  </Svg>
);

export const Book = (p) => (
  <Svg {...p}>
    <path d="M4 4.8A2.3 2.3 0 0 1 6.3 2.5H20v15.2H6.3A2.3 2.3 0 0 0 4 20v-15.2Z" />
    <path d="M4 20a2.3 2.3 0 0 0 2.3 2.3H20" /><path d="M8.5 7.5h7" />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>
);

export const Circle = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /></Svg>
);

export const Arrow = (p) => (
  <Svg {...p}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></Svg>
);
