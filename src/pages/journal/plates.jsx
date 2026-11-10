/**
 * The six journal plates — one hand-drawn SVG motif per article.
 * Used full-screen on /journal/<slug> and as the cover art on /journal.
 *
 * Deterministic output (seeded stars, no Math.random at render) so the SSR
 * markup and the client hydrate identically. Motion is CSS only (journal.css
 * .jr-a-*); every element's base style is its finished state, so reduced
 * motion just sees the still picture.
 */

const SKY = "#38bdf8";
const ICE = "#7dd3fc";
const CREAM = "#f3ede2";
const GOLD = "#fbbf24";

function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function Stars({ seed, count = 70 }) {
  const r = seeded(seed);
  const dots = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(r() * 1200);
    const y = Math.round(r() * 800);
    const s = r();
    dots.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={s > 0.93 ? 1.8 : s > 0.6 ? 1.1 : 0.7}
        fill={CREAM}
        opacity={(0.12 + s * 0.4).toFixed(2)}
        className={i % 7 === 0 ? "jr-a-breathe" : undefined}
        style={i % 7 === 0 ? { animationDelay: `${(i % 5) * 0.9}s` } : undefined}
      />,
    );
  }
  return <g aria-hidden="true">{dots}</g>;
}

function Defs({ id }) {
  return (
    <defs>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={SKY} stopOpacity="0.32" />
        <stop offset="100%" stopColor={SKY} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-gold`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
        <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ICE} stopOpacity="0.5" />
        <stop offset="100%" stopColor={ICE} stopOpacity="0.02" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  );
}

const DRAW = { "--len": 1 };

/* 1 — first-ten-minutes: a clock face; the first ten minutes lit, five moves on the arc. */
function Clock({ id }) {
  const cx = 780;
  const cy = 330;
  const R = 230;
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const long = i % 5 === 0;
    const r1 = R - (long ? 22 : 10);
    ticks.push(
      <line
        key={i}
        x1={(cx + Math.cos(a) * r1).toFixed(1)}
        y1={(cy + Math.sin(a) * r1).toFixed(1)}
        x2={(cx + Math.cos(a) * R).toFixed(1)}
        y2={(cy + Math.sin(a) * R).toFixed(1)}
        stroke={i < 10 ? ICE : CREAM}
        strokeOpacity={i < 10 ? 0.9 : long ? 0.32 : 0.14}
        strokeWidth={long ? 2.5 : 1.2}
      />,
    );
  }
  const arc = (a0, a1, r) => {
    const p = (a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r].map((n) => n.toFixed(1)).join(" ");
    return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
  };
  const top = -Math.PI / 2;
  const ten = top + Math.PI / 3;
  const moves = [0.08, 0.3, 0.52, 0.74, 0.96].map((t) => top + (ten - top) * t);
  return (
    <g>
      <circle cx={cx} cy={cy} r={R + 120} fill={`url(#${id}-glow)`} opacity="0.55" />
      <circle cx={cx} cy={cy} r={R + 58} fill="none" stroke={CREAM} strokeOpacity="0.1" strokeDasharray="2 12" className="jr-a-spin" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={CREAM} strokeOpacity="0.08" strokeWidth="1" />
      {ticks}
      <path d={arc(top, ten, R - 44)} fill="none" stroke={SKY} strokeOpacity="0.35" strokeWidth="18" filter={`url(#${id}-soft)`} />
      <path d={arc(top, ten, R - 44)} fill="none" stroke={ICE} strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" className="jr-a-draw" style={DRAW} />
      {moves.map((a, i) => (
        <circle key={i} cx={(cx + Math.cos(a) * (R - 44)).toFixed(1)} cy={(cy + Math.sin(a) * (R - 44)).toFixed(1)} r="6" fill={CREAM} className="jr-a-breathe" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      <line x1={cx} y1={cy} x2={(cx + Math.cos(ten) * (R - 70)).toFixed(1)} y2={(cy + Math.sin(ten) * (R - 70)).toFixed(1)} stroke={CREAM} strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx} y2={cy - R + 110} stroke={CREAM} strokeOpacity="0.5" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill={ICE} />
    </g>
  );
}

/* 2 — understand-but-cant-speak: the full shelf (what we understand) and the sparse one (what we say). */
function Shelves({ id }) {
  const r = seeded("shelves");
  const full = [];
  let x = 470;
  while (x < 1080) {
    const w = 14 + Math.round(r() * 16);
    const h = 70 + Math.round(r() * 60);
    full.push(<rect key={x} x={x} y={300 - h} width={w} height={h} rx="3" fill={r() > 0.8 ? ICE : CREAM} fillOpacity={(0.14 + r() * 0.3).toFixed(2)} />);
    x += w + 5;
  }
  const sparse = [
    [520, 92],
    [546, 74],
    [590, 108],
  ].map(([bx, h], i) => <rect key={i} x={bx} y={540 - h} width="20" height={h} rx="3" fill={CREAM} fillOpacity="0.32" />);
  return (
    <g>
      <ellipse cx="780" cy="420" rx="420" ry="260" fill={`url(#${id}-glow)`} opacity="0.5" />
      <line x1="440" y1="302" x2="1110" y2="302" stroke={CREAM} strokeOpacity="0.4" strokeWidth="3" />
      <line x1="440" y1="542" x2="1110" y2="542" stroke={CREAM} strokeOpacity="0.4" strokeWidth="3" />
      {full}
      {sparse}
      <g className="jr-a-driftx">
        <rect x="640" y="440" width="22" height="100" rx="3" fill={ICE} fillOpacity="0.85" />
        <rect x="630" y="430" width="42" height="120" rx="6" fill={SKY} fillOpacity="0.2" filter={`url(#${id}-soft)`} />
      </g>
      <path d="M 900 316 C 900 400, 760 380, 668 436" fill="none" stroke={ICE} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 8" className="jr-a-flow" />
    </g>
  );
}

/* 3 — words-that-betrayed-us: an Arabic plug with round pins against a socket with flat slots. */
function Plug({ id }) {
  return (
    <g>
      <circle cx="760" cy="380" r="300" fill={`url(#${id}-glow)`} opacity="0.5" />
      {/* socket */}
      <rect x="430" y="230" width="230" height="300" rx="44" fill="#0b1830" stroke={CREAM} strokeOpacity="0.35" strokeWidth="2" />
      <rect x="500" y="320" width="16" height="64" rx="4" fill="#020611" stroke={ICE} strokeOpacity="0.5" />
      <rect x="574" y="320" width="16" height="64" rx="4" fill="#020611" stroke={ICE} strokeOpacity="0.5" />
      <rect x="533" y="424" width="24" height="34" rx="4" fill="#020611" stroke={ICE} strokeOpacity="0.5" />
      {/* plug */}
      <g className="jr-a-driftx" style={{ animationDirection: "alternate-reverse" }}>
        <rect x="820" y="270" width="190" height="220" rx="56" fill="#13284a" stroke={CREAM} strokeOpacity="0.5" strokeWidth="2" />
        <rect x="764" y="334" width="58" height="20" rx="10" fill={CREAM} fillOpacity="0.8" />
        <rect x="764" y="404" width="58" height="20" rx="10" fill={CREAM} fillOpacity="0.8" />
        <path d="M 1010 380 C 1080 380, 1090 560, 1200 600" fill="none" stroke={CREAM} strokeOpacity="0.4" strokeWidth="10" strokeLinecap="round" />
      </g>
      {/* the gap: a spark that never quite closes */}
      <circle cx="712" cy="380" r="34" fill={`url(#${id}-gold)`} className="jr-a-breathe" />
      <path d="M 700 360 L 716 378 L 704 382 L 722 402" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="jr-a-breathe" />
    </g>
  );
}

/* 4 — accent-is-not-the-problem: two voices, different waves, meeting in one clear line. */
function Waves() {
  const wave = (y0, amp, len, phase) => {
    let d = "";
    for (let x = 0; x <= 1200; x += 12) {
      const t = x / 1200;
      const env = Math.sin(t * Math.PI);
      const y = y0 + Math.sin(x / len + phase) * amp * env;
      d += `${x === 0 ? "M" : "L"} ${x} ${y.toFixed(1)} `;
    }
    return d;
  };
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <path key={`a${i}`} d={wave(260 + i * 22, 70 - i * 10, 46 + i * 6, i)} fill="none" stroke={CREAM} strokeOpacity={0.12 + i * 0.05} strokeWidth="1.5" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path key={`b${i}`} d={wave(520 - i * 22, 60 - i * 8, 30 + i * 5, i * 2)} fill="none" stroke={ICE} strokeOpacity={0.14 + i * 0.05} strokeWidth="1.5" />
      ))}
      <path d="M 0 390 L 1200 390" fill="none" stroke={SKY} strokeWidth="3" strokeDasharray="10 22" className="jr-a-flow" />
      <path d="M 0 390 L 1200 390" fill="none" stroke={SKY} strokeOpacity="0.35" strokeWidth="14" style={{ filter: "blur(6px)" }} />
      <circle cx="160" cy="300" r="10" fill={CREAM} fillOpacity="0.8" />
      <circle cx="160" cy="480" r="10" fill={ICE} />
    </g>
  );
}

/* 5 — fear-of-mistakes: one figure in a spotlight; the audience, mostly elsewhere. */
function Spotlight({ id }) {
  const r = seeded("audience");
  const crowd = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 16; i++) {
      const x = 180 + i * 58 + (row % 2) * 29;
      const y = 640 + row * 52;
      const looking = r() > 0.75;
      crowd.push(
        <g key={`${row}-${i}`} opacity={0.18 + row * 0.08}>
          <circle cx={x} cy={y} r="11" fill={looking ? ICE : CREAM} />
          <rect x={x - 16} y={y + 14} width="32" height="30" rx="14" fill={CREAM} />
        </g>,
      );
    }
  }
  return (
    <g>
      <path d="M 640 0 L 520 0 L 380 520 L 900 520 Z" fill={`url(#${id}-beam)`} className="jr-a-narrow" />
      <ellipse cx="640" cy="520" rx="260" ry="48" fill={ICE} fillOpacity="0.16" />
      <ellipse cx="640" cy="520" rx="160" ry="26" fill={ICE} fillOpacity="0.22" />
      <circle cx="640" cy="380" r="28" fill={CREAM} fillOpacity="0.9" />
      <path d="M 596 520 C 596 440, 612 424, 640 424 C 668 424, 684 440, 684 520 Z" fill={CREAM} fillOpacity="0.9" />
      {crowd}
    </g>
  );
}

/* 6 — adults-learn-differently: the child's long wander and the adult's straighter road to the same star. */
function Paths({ id }) {
  return (
    <g>
      <circle cx="1000" cy="200" r="120" fill={`url(#${id}-gold)`} className="jr-a-breathe" />
      <path d="M 1000 176 L 1008 194 L 1028 196 L 1013 209 L 1018 229 L 1000 218 L 982 229 L 987 209 L 972 196 L 992 194 Z" fill={GOLD} />
      <path
        d="M 160 680 C 260 520, 420 760, 520 600 S 380 360, 560 420 S 760 640, 780 460 S 620 260, 820 300 S 980 380, 990 230"
        fill="none"
        stroke={CREAM}
        strokeOpacity="0.32"
        strokeWidth="2"
        strokeDasharray="3 10"
        strokeLinecap="round"
      />
      <path d="M 160 680 C 420 600, 760 420, 990 230" fill="none" stroke={ICE} strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" className="jr-a-draw" style={DRAW} />
      <path d="M 160 680 C 420 600, 760 420, 990 230" fill="none" stroke={SKY} strokeOpacity="0.3" strokeWidth="16" filter={`url(#${id}-soft)`} />
      <circle cx="160" cy="680" r="9" fill={CREAM} />
    </g>
  );
}

const MOTIFS = {
  "first-ten-minutes": Clock,
  "understand-but-cant-speak": Shelves,
  "words-that-betrayed-us": Plug,
  "accent-is-not-the-problem": Waves,
  "fear-of-mistakes": Spotlight,
  "adults-learn-differently": Paths,
};

/** Where each motif sits, as % of the 1200 width: a portrait screen centres on it. */
const FOCUS = {
  "first-ten-minutes": 65,
  "understand-but-cant-speak": 64,
  "words-that-betrayed-us": 56,
  "accent-is-not-the-problem": 50,
  "fear-of-mistakes": 53,
  "adults-learn-differently": 68,
};

/** <Plate slug variant="plate"|"cover" /> — decorative; the page carries the words. */
export default function Plate({ slug, variant = "plate" }) {
  const Motif = MOTIFS[slug];
  if (!Motif) return null;
  const id = `jr-${variant}-${slug}`;
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ "--jr-fx": `${FOCUS[slug] ?? 50}%` }}
      aria-hidden="true"
      focusable="false"
    >
      <Defs id={id} />
      <Stars seed={slug} count={variant === "cover" ? 40 : 80} />
      <Motif id={id} />
    </svg>
  );
}
