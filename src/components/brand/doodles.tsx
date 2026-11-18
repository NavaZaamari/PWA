import type { SVGProps } from "react";

/** Hand-drawn style doodles. Strokes use currentColor; fills use palette tokens. */
type P = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Brand mascot: a cat curled up with an open book. */
export function CatWithBook(props: P) {
  return (
    <svg viewBox="0 0 220 170" aria-hidden {...props}>
      {/* rug shadow */}
      <ellipse cx="112" cy="146" rx="88" ry="10" className="fill-straw" />
      {/* tail */}
      <path
        {...stroke}
        d="M168 132c18-2 26-14 22-26-3-9-13-11-17-4"
        className="text-night"
      />
      {/* body */}
      <path
        d="M52 138c-10-30 10-62 50-66 38-4 70 14 72 46 1 12-4 20-14 22H64c-6 0-10-1-12-2z"
        className="fill-sage/60"
      />
      <path
        {...stroke}
        d="M52 138c-10-30 10-62 50-66 38-4 70 14 72 46 1 12-4 20-14 22H64c-6 0-10-1-12-2z"
        className="text-night"
      />
      {/* stripes */}
      <path {...stroke} d="M110 78c4 8 4 14 0 20M132 82c3 7 2 13-2 18M150 92c2 6 0 11-4 14" className="text-olive-dark" />
      {/* head */}
      <path
        d="M30 112c-4-14 2-28 14-32l-2-16 12 10c6-2 12-2 18 0l12-10-2 16c10 6 14 18 10 32-6 14-24 18-38 14-12-2-20-6-24-14z"
        className="fill-sage/60"
      />
      <path
        {...stroke}
        d="M30 112c-4-14 2-28 14-32l-2-16 12 10c6-2 12-2 18 0l12-10-2 16c10 6 14 18 10 32-6 14-24 18-38 14-12-2-20-6-24-14z"
        className="text-night"
      />
      {/* closed eyes + nose + whiskers */}
      <path {...stroke} d="M46 102q4 4 8 0M66 102q4 4 8 0" className="text-night" />
      <path d="M58 109l2 2 2-2z" className="fill-rose" />
      <path {...stroke} strokeWidth={1.4} d="M40 110h-12M41 114l-11 3M80 110h12M79 114l11 3" className="text-olive-dark" />
      {/* open book */}
      <path d="M62 140c14-8 30-8 44-2 14-6 30-6 44 2v8c-14-6-30-6-44 0-14-6-30-6-44 0z" className="fill-cream" />
      <path
        {...stroke}
        d="M62 140c14-8 30-8 44-2 14-6 30-6 44 2v8c-14-6-30-6-44 0-14-6-30-6-44 0zM106 138v10"
        className="text-pomegranate"
      />
      <path {...stroke} strokeWidth={1.3} d="M72 140c8-3 18-3 26 0M114 140c8-3 18-3 26 0" className="text-sage" />
      {/* paw */}
      <path {...stroke} d="M84 132c0-6 10-6 10 0" className="text-night" />
      {/* zzz */}
      <path {...stroke} strokeWidth={1.8} d="M96 52h8l-8 8h8M112 38h6l-6 6h6" className="text-olive" />
    </svg>
  );
}

/** Small pomegranate doodle. */
export function Pomegranate(props: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <path d="M24 12c-9 0-15 7-15 16s7 15 15 15 15-6 15-15-6-16-15-16z" className="fill-pomegranate" />
      <path d="M19 12l2-5 3 3 3-3 2 5" {...stroke} className="text-pomegranate" />
      <path d="M17 24c2-3 5-4 8-4" {...stroke} strokeWidth={1.6} className="text-cream/70" />
      <circle cx="21" cy="30" r="1.6" className="fill-rose" />
      <circle cx="27" cy="33" r="1.6" className="fill-rose" />
      <circle cx="25" cy="27" r="1.6" className="fill-rose" />
    </svg>
  );
}

/** Olive branch doodle. */
export function OliveBranch(props: P) {
  return (
    <svg viewBox="0 0 80 40" aria-hidden {...props}>
      <path {...stroke} d="M4 30c20-6 44-12 72-22" className="text-olive-dark" />
      {[
        [16, 26, -30],
        [28, 22, 20],
        [40, 19, -30],
        [52, 15, 20],
        [64, 11, -30],
      ].map(([x = 0, y = 0, r = 0], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y + (i % 2 ? -6 : 6)}
          rx="7"
          ry="3"
          transform={`rotate(${r} ${x} ${y + (i % 2 ? -6 : 6)})`}
          className="fill-olive"
        />
      ))}
      <circle cx="46" cy="27" r="3" className="fill-olive-dark" />
      <circle cx="22" cy="17" r="3" className="fill-olive-dark" />
    </svg>
  );
}

/** Four-point sparkle used in the logo. */
export function Sparkle(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M12 1c.8 5.6 2.4 7.8 11 11-8.6 3.2-10.2 5.4-11 11-.8-5.6-2.4-7.8-11-11 8.6-3.2 10.2-5.4 11-11z" fill="currentColor" />
    </svg>
  );
}

/** Default profile avatar: a cat face doodle. */
export function CatAvatar(props: P) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <rect width="64" height="64" className="fill-straw" />
      <path d="M14 46c-3-10 0-20 8-24l-1-12 9 8h4l9-8-1 12c8 4 11 14 8 24-4 8-14 11-18 11s-14-3-18-11z" className="fill-sage" />
      <path {...stroke} d="M14 46c-3-10 0-20 8-24l-1-12 9 8h4l9-8-1 12c8 4 11 14 8 24-4 8-14 11-18 11s-14-3-18-11z" className="text-night" />
      <path {...stroke} d="M23 36q3 3 6 0M35 36q3 3 6 0" className="text-night" />
      <path d="M30 42l2 2 2-2z" className="fill-pomegranate" />
    </svg>
  );
}

/* ---------- tiny cover motifs ---------- */

export function Motif({ kind, ...props }: P & { kind: string }) {
  switch (kind) {
    case "pomegranate":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path {...stroke} strokeWidth={1.5} d="M12 6c-4.5 0-7.5 3.5-7.5 8s3.5 7.5 7.5 7.5 7.5-3 7.5-7.5S16.5 6 12 6zM9.5 6l1-2.5 1.5 1.5 1.5-1.5 1 2.5" />
          <circle cx="10" cy="14" r="1" fill="currentColor" />
          <circle cx="13.5" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case "olive":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path {...stroke} strokeWidth={1.5} d="M3 20C9 15 14 9 21 4M8 15c-3-1-4-3-4-5 2 0 4 1 4 5zM12 11c0-3 1-5 3-6 1 2 0 4-3 6zM14 13c3 0 5 1 6 3-2 1-4 0-6-3z" />
        </svg>
      );
    case "cat":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path {...stroke} strokeWidth={1.5} d="M5 18c-1-4 0-7 3-9l-.5-5L11 7h2l3.5-3L16 9c3 2 4 5 3 9-1.5 3-5 4-7 4s-5.5-1-7-4zM9 14q1 1 2 0M13 14q1 1 2 0" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path {...stroke} strokeWidth={1.5} d="M17 17.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5a8 8 0 0 1-3 3z" />
          <path d="M18 4l.6 1.4L20 6l-1.4.6L18 8l-.6-1.4L16 6l1.4-.6z" fill="currentColor" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path {...stroke} strokeWidth={1.5} d="M5 19C4 11 9 5 20 4c0 10-5 16-15 15zM5 19c4-5 7-8 11-11" />
        </svg>
      );
    case "teacup":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path {...stroke} strokeWidth={1.5} d="M5 11h11v3a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 12h1.5a2 2 0 0 1 0 4H16M4 21h14M9 4c-1 1.5 1 2.5 0 4M12.5 4c-1 1.5 1 2.5 0 4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...props}>
          <path d="M12 2c.7 5 2.2 7 9 10-6.8 3-8.3 5-9 10-.7-5-2.2-7-9-10 6.8-3 8.3-5 9-10z" fill="currentColor" />
        </svg>
      );
  }
}
