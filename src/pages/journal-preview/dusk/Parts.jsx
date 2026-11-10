import { useMemo } from "react";
import { Link } from "react-router-dom";
import { parseInline, readLabel } from "../../../content/journal/index.js";
import { previewPath } from "../../../content/journal/preview.js";
import { Art } from "../shared";
import { ridge, rng } from "./gen.js";

/** {{English}} → isolated LTR run; **x** → bold. */
export function Inline({ text }) {
  return parseInline(text).map((tok, i) => {
    if (tok.t === "en") return <span key={i} className="dk-en" dir="ltr" lang="en">{tok.v}</span>;
    if (tok.t === "b") return <b key={i}>{tok.v}</b>;
    return tok.v;
  });
}

/* ── motifs: small silhouettes that stand on a dune crest ─────────────── */
const INK = "#1b0a24";
const RIM = "#e8b48a";
const MOTIFS = {
  lamp: (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      <defs><radialGradient id="dkl" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffd9a8" stopOpacity=".9" /><stop offset="1" stopColor="#e8b48a" stopOpacity="0" /></radialGradient></defs>
      <circle cx="84" cy="30" r="34" fill="url(#dkl)" />
      <rect x="40" y="52" width="72" height="4" fill={INK} /><rect x="46" y="56" width="3" height="22" fill={INK} /><rect x="102" y="56" width="3" height="22" fill={INK} />
      <path d="M86 52 L86 40 L96 24" stroke={INK} strokeWidth="2.4" fill="none" /><path d="M90 28 L106 22 L100 34 Z" fill={INK} />
      <circle cx="98" cy="32" r="2.6" fill="#ffe3bd" />
      <rect x="10" y="60" width="3" height="18" fill={INK} /><rect x="22" y="60" width="3" height="18" fill={INK} /><rect x="8" y="56" width="20" height="4" fill={INK} /><rect x="8" y="38" width="3" height="20" fill={INK} />
    </svg>
  ),
  shelf: (
    <svg viewBox="0 0 70 100" aria-hidden="true">
      <rect x="6" y="4" width="58" height="94" fill={INK} />
      {[0, 1, 2, 3].map((r) => <rect key={r} x="10" y={10 + r * 22} width="50" height="14" fill="#2c1236" />)}
      {[[14, 20, 8], [30, 20, 12], [22, 42, 10], [42, 42, 8], [16, 64, 12], [44, 64, 9], [26, 86, 10]].map(([x, y, w], i) => <rect key={i} x={x} y={y - 8} width={w} height="8" fill={RIM} fillOpacity={0.55 + (i % 3) * 0.15} />)}
    </svg>
  ),
  bridge: (
    <svg viewBox="0 0 160 60" aria-hidden="true">
      <path d="M0 40 Q80 14 160 40 L160 46 Q80 22 0 46 Z" fill={INK} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={10 + i * 16} y={i % 2 ? 22 : 24} width="2.4" height="18" fill={INK} />)}
      <path d="M10 24 Q80 2 150 24" stroke={INK} strokeWidth="1.6" fill="none" />
    </svg>
  ),
  gong: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M26 112 L40 12 M94 112 L80 12" stroke={INK} strokeWidth="5" fill="none" /><rect x="34" y="8" width="52" height="5" fill={INK} />
      <line x1="60" y1="13" x2="60" y2="32" stroke={INK} strokeWidth="1.5" />
      <circle cx="60" cy="58" r="27" fill={INK} stroke={RIM} strokeOpacity=".7" strokeWidth="1.6" /><circle cx="60" cy="58" r="10" fill="none" stroke={RIM} strokeOpacity=".4" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx="60" cy="112" rx={34 + i * 22} ry={5 + i * 3} fill="none" stroke={RIM} strokeOpacity={0.42 - i * 0.12} />)}
    </svg>
  ),
  door: (
    <svg viewBox="0 0 120 110" aria-hidden="true">
      <defs><linearGradient id="dkd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffd9a8" stopOpacity=".95" /><stop offset="1" stopColor="#e8b48a" stopOpacity="0" /></linearGradient></defs>
      <path d="M44 100 L120 108 L120 92 Z" fill="url(#dkd)" />
      <rect x="30" y="6" width="38" height="96" fill="#ffd9a8" fillOpacity=".9" />
      <path d="M26 104 V2 H72 V104 H66 V8 H32 V104 Z" fill={INK} />
      <path d="M32 8 L58 14 V100 L32 104 Z" fill={INK} />
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <path d="M78 108 C78 80 74 64 62 50 M80 108 C80 78 86 64 100 48 M80 70 C80 58 80 54 80 44" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M10 46 C16 22 50 24 62 28 C74 12 110 14 120 30 C146 28 156 40 150 50 C130 58 100 46 80 52 C54 46 28 60 10 46 Z" fill={INK} />
      {[[30, 100], [50, 96], [38, 106], [18, 104]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3.2" ry="1.6" fill={INK} />)}
    </svg>
  ),
};

/** Where each article's motif stands (x on the mid ridge, size in vmax-ish units). */
export const MOTIF_OF = {
  "understand-but-cant-speak": { m: "shelf", x: 0.25, w: 62 },
  "words-that-betrayed-us": { m: "bridge", x: 0.3, w: 190 },
  "accent-is-not-the-problem": { m: "gong", x: 0.28, w: 130 },
  "fear-of-mistakes": { m: "door", x: 0.3, w: 110 },
  "adults-learn-differently": { m: "tree", x: 0.27, w: 180 },
  cover: { m: "lamp", x: 0.7, w: 150 },
};

/**
 * Three seeded dune layers. `layers` picks which to draw; `motif` stands on the middle one.
 * Stretched with preserveAspectRatio="none" (smooth curves survive), the motif is placed by
 * percentage so it keeps its proportions on any screen.
 */
export function Dunes({ seed, layers = ["far", "mid", "near"], motif = null, className = "", tones, par = true }) {
  const L = useMemo(() => {
    const H = 400;
    const t = tones || { far: "#7a3a58", mid: "#4a2150", near: "#26102f" };
    const defs = {
      far: { r: ridge(`${seed}-far`, { base: 130, amp: 38, waves: 3 }), fill: t.far, rim: "#e8b48a", ro: 0.5, k: 0.14 },
      mid: { r: ridge(`${seed}-mid`, { base: 220, amp: 46, waves: 3 }), fill: t.mid, rim: "#d88a8a", ro: 0.45, k: 0.07 },
      near: { r: ridge(`${seed}-near`, { base: 330, amp: 34, waves: 2 }), fill: t.near, rim: "#c9784a", ro: 0.5, k: 0 },
    };
    return { H, list: layers.map((n) => ({ n, ...defs[n] })), defs };
  }, [seed, layers.join(), tones]); // eslint-disable-line react-hooks/exhaustive-deps
  const mo = motif && MOTIFS[motif.m];
  const mid = L.defs.mid;
  return (
    <div className={`dk-dunes ${className}`} aria-hidden="true">
      {L.list.map((l) => (
        <div className="dk-layer" key={l.n} data-plx={par ? l.k : undefined}>
          <svg viewBox={`0 0 1600 ${L.H}`} preserveAspectRatio="none">
            <path d={l.r.fill(L.H)} fill={l.fill} />
            <path d={l.r.line} fill="none" stroke={l.rim} strokeOpacity={l.ro} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          {l.n === "mid" && mo ? (
            <div
              className="dk-motif"
              style={{
                left: `${motif.x * 100}%`,
                top: `${(mid.r.yAt(motif.x * 1600) / L.H) * 100 + 0.8}%`,
                "--mw": `${motif.w}px`,
              }}
            >
              {mo}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** A chapter mark: one drawn ridge line with a half-sunk sun, unique per seed. */
export function Horizon({ seed, n }) {
  const g = useMemo(() => {
    const r = rng(`hz-${seed}`);
    const R = ridge(`hz-${seed}`, { w: 1000, base: 30, amp: 9 + r() * 6, waves: 3 });
    const sx = 120 + r() * 760;
    return { line: R.line, sx, sy: R.yAt(sx) };
  }, [seed]);
  return (
    <div className="dk-horizon dk-r" aria-hidden="true">
      <svg viewBox="0 0 1000 52" preserveAspectRatio="none">
        <defs>
          <clipPath id={`hc-${seed}`}><rect x="0" y="0" width="1000" height={g.sy + 1} /></clipPath>
        </defs>
        <circle cx={g.sx} cy={g.sy + 4} r="15" fill="#e8b48a" clipPath={`url(#hc-${seed})`} />
        <path d={g.line} fill="none" stroke="#e8b48a" strokeOpacity=".7" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
        <path d={`${g.line}`} transform="translate(0 7)" fill="none" stroke="#d88a8a" strokeOpacity=".28" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {n != null ? <span className="dk-horizon-n">{String(n).padStart(2, "0")}</span> : null}
    </div>
  );
}

/** An article card; `size` = hero | mid | small decides the proportions in CSS. */
export function Card({ article, dir, index, size = "mid", level = 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <Link to={previewPath(dir, article.slug)} className={`dk-card dk-card--${size} dk-r`}>
      <div className="dk-card-art">
        <Art dir={dir} name={`plate-${article.slug}`} eager={false} wide={size === "small"} alt="" sizes={size === "hero" ? "100vw" : "(min-width: 900px) 40vw, 90vw"} />
        <span className="dk-card-shade" />
        <Dunes seed={`card-${article.slug}`} layers={["mid", "near"]} className="dk-dunes--card" par={false} />
      </div>
      <div className="dk-card-body">
        <span className="dk-card-no" dir="ltr">{String(index + 1).padStart(2, "0")}</span>
        <H className="dk-card-title">{article.title}</H>
        <p className="dk-card-line">{size === "small" ? article.dek : article.quote}</p>
        <span className="dk-card-foot">{readLabel(article)}</span>
      </div>
    </Link>
  );
}
