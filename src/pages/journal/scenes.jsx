import { useEffect, useRef, useState } from "react";

/**
 * Scrollytelling scenes for «مجلة طلاقة». Each scene is a tall block whose
 * stage sticks to the viewport while the reader scrolls through it. Progress p
 * (0 → 1) drives the drawing and picks the caption.
 *
 * - SSR renders p = 0 (the first caption is the readable fallback).
 * - prefers-reduced-motion: p = 1 at once, the stage stops sticking and every
 *   caption is shown in order (journal.css).
 * - The rAF loop runs only while the scene is near the viewport; p is
 *   quantised to 1/100, so React re-renders at most ~100 times per pass.
 * - Illustrations that look like charts carry «رسم توضيحي» — they are not data.
 */

const SKY = "#38bdf8";
const ICE = "#7dd3fc";
const CREAM = "#f3ede2";
const GOLD = "#fbbf24";

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** progress of p inside [a, b], 0..1 */
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const f1 = (n) => n.toFixed(1);

function useSceneProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      return undefined;
    }
    let raf = 0;
    let near = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const v = span > 0 ? clamp(-r.top / span) : 1;
      const q = Math.round(v * 100) / 100;
      setP((prev) => (prev === q ? prev : q));
    };
    const onScroll = () => {
      if (near && !raf) raf = requestAnimationFrame(tick);
    };
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => { near = e.isIntersecting; onScroll(); }, { rootMargin: "120px 0px" })
      : null;
    if (io) io.observe(el);
    else near = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}

/* ── 1 · first-ten-minutes ───────────────────────────────────────── */
const STATIONS = ["الكلام الجانبي", "الافتتاح", "المقاطعة بلباقة", "طلب التوضيح", "الختام"];
function ClockArt({ p }) {
  const t = ease(seg(p, 0.05, 0.85));
  const cx = 200;
  const cy = 200;
  const R = 150;
  const a0 = -Math.PI / 2;
  const a1 = a0 + (Math.PI / 3) * t; // ten minutes = 60°
  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const [x0, y0] = pt(a0, R);
  const [x1, y1] = pt(a1, R);
  const secs = Math.round(t * 600);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const now = Math.min(STATIONS.length - 1, Math.floor(t * STATIONS.length));
  return (
    <div className="jr-clock-wrap">
      <svg viewBox="0 0 400 400" role="img" aria-label="ساعة: أول عشر دقائق من الاجتماع">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={CREAM} strokeOpacity="0.12" strokeWidth="14" />
        {t > 0.002 ? (
          <path d={`M ${f1(x0)} ${f1(y0)} A ${R} ${R} 0 0 1 ${f1(x1)} ${f1(y1)}`} fill="none" stroke={SKY} strokeWidth="14" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,.6))" }} />
        ) : null}
        {STATIONS.map((_, i) => {
          const a = a0 + (Math.PI / 3) * ((i + 0.5) / STATIONS.length);
          const [x, y] = pt(a, R);
          return <circle key={i} cx={f1(x)} cy={f1(y)} r="5" fill={i <= now && t > 0 ? CREAM : "#0b1830"} stroke={CREAM} strokeOpacity="0.6" />;
        })}
        <text x={cx} y={cy + 14} textAnchor="middle" fill={CREAM} style={{ font: "600 44px Inter, system-ui, sans-serif" }} direction="ltr">{`${mm}:${ss}`}</text>
      </svg>
      <ol className="jr-stations" aria-label="المحطات الخمس">
        {STATIONS.map((s, i) => (
          <li key={s} className={t > 0 && i < now ? "is-on" : t > 0 && i === now ? "is-now" : undefined}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

function TableArt({ p }) {
  const lit = seg(p, 0.3, 0.6);
  const ring = seg(p, 0.6, 1);
  const seats = [];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / 2;
    const x = 400 + Math.cos(a) * 250;
    const y = 220 + Math.sin(a) * 130;
    const ours = i === 0;
    seats.push(
      <g key={i}>
        {ours && ring > 0 ? (
          <circle cx={f1(x)} cy={f1(y)} r={f1(26 + ring * 70)} fill="none" stroke={SKY} strokeOpacity={f1(0.6 * (1 - ring) + 0.1)} strokeWidth="2" />
        ) : null}
        <circle cx={f1(x)} cy={f1(y)} r="22" fill={ours ? SKY : CREAM} fillOpacity={ours ? f1(0.15 + lit * 0.85) : 0.22} style={ours && lit > 0.5 ? { filter: "drop-shadow(0 0 12px rgba(56,189,248,.8))" } : undefined} />
      </g>,
    );
  }
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label="طاولة اجتماع، وكرسي واحد يضيء">
      <ellipse cx="400" cy="220" rx="190" ry="84" fill="#0b1830" stroke={CREAM} strokeOpacity="0.25" strokeWidth="2" />
      {seats}
      {lit > 0 ? (
        <g opacity={f1(lit)}>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${400 - 18 - k * 12} ${352 - k * 4} q ${18 + k * 12} ${-22 - k * 10} ${36 + k * 24} 0`} fill="none" stroke={ICE} strokeWidth="2" strokeLinecap="round" opacity={0.9 - k * 0.25} />
          ))}
        </g>
      ) : null}
    </svg>
  );
}

/* ── 2 · understand-but-cant-speak ──────────────────────────────── */
function GapArt({ p }) {
  const a = ease(seg(p, 0.02, 0.4));
  const b = ease(seg(p, 0.3, 0.62));
  const rows = [
    ["نتعرّف عليه لما نسمعه أو نقرأه", 0.2 + 0.68 * a, false],
    ["نطلّعه بنفسنا وقت الحاجة", 0.2 + 0.14 * b, true],
  ];
  return (
    <div className="jr-bars">
      {rows.map(([label, w, dim]) => (
        <div key={label} className={`jr-bar-row${dim ? " jr-bar--dim" : ""}`}>
          <div className="jr-bar-head"><span>{label}</span></div>
          <div className="jr-bar"><i style={{ transform: `scaleX(${w.toFixed(3)})` }} /></div>
        </div>
      ))}
    </div>
  );
}

function BridgeArt({ p }) {
  const t = seg(p, 0.08, 0.9);
  const planks = 14;
  const lit = Math.round(t * planks);
  const pts = [];
  for (let i = 0; i < planks; i++) {
    const u = (i + 0.5) / planks;
    // quadratic from the head (right) to the mouth (left)
    const x = (1 - u) * (1 - u) * 640 + 2 * (1 - u) * u * 400 + u * u * 160;
    const y = (1 - u) * (1 - u) * 170 + 2 * (1 - u) * u * 40 + u * u * 170;
    pts.push([x, y]);
  }
  const done = t >= 0.999;
  return (
    <svg viewBox="0 0 800 300" role="img" aria-label="جسر من الفكرة إلى الكلام، يكتمل لوحاً لوحاً">
      <circle cx="680" cy="190" r="54" fill="none" stroke={CREAM} strokeOpacity="0.5" strokeWidth="2" />
      <circle cx="680" cy="190" r="16" fill={ICE} style={{ filter: "drop-shadow(0 0 10px rgba(125,211,252,.8))" }} />
      <path d="M 640 170 Q 400 40 160 170" fill="none" stroke={CREAM} strokeOpacity="0.14" strokeWidth="2" strokeDasharray="3 9" />
      {pts.map(([x, y], i) => (
        <line key={i} x1={f1(x)} y1={f1(y - 12)} x2={f1(x)} y2={f1(y + 12)} stroke={i < lit ? SKY : CREAM} strokeOpacity={i < lit ? 1 : 0.12} strokeWidth="5" strokeLinecap="round" />
      ))}
      <path d="M 70 150 h 120 a 16 16 0 0 1 16 16 v 44 a 16 16 0 0 1 -16 16 h -84 l -22 20 v -20 h -14 a 16 16 0 0 1 -16 -16 v -44 a 16 16 0 0 1 16 -16 z" fill={done ? "rgba(56,189,248,.16)" : "none"} stroke={done ? SKY : CREAM} strokeOpacity={done ? 1 : 0.4} strokeWidth="2" />
      <text x="130" y="197" textAnchor="middle" fill={CREAM} fillOpacity={done ? 1 : 0.35} direction="ltr" style={{ font: "600 calc(20px * min(var(--jr-svg-s, 1), 1.35)) Inter, system-ui, sans-serif" }}>Hello...</text>
    </svg>
  );
}

/* ── 3 · words-that-betrayed-us ─────────────────────────────────── */
function PlugArt({ p }) {
  const morph = ease(seg(p, 0.4, 0.66));
  const slide = ease(seg(p, 0.1, 0.4)) * 0.55 + ease(seg(p, 0.66, 0.92)) * 0.45;
  const x = 640 - slide * 300;
  const pinH = 20 + (16 - 20) * morph; // round 20×58 → flat 16×64 (rotated slot)
  const pinW = 58 + (64 - 58) * morph;
  const pinR = 10 * (1 - morph) + 3 * morph;
  const fitted = p > 0.9;
  return (
    <svg viewBox="0 0 800 360" role="img" aria-label="فيش بأسنان دائرية أمام مقبس بفتحات مسطّحة؛ يتغيّر شكل الأسنان فيركب">
      <rect x="150" y="60" width="200" height="240" rx="38" fill="#0b1830" stroke={fitted ? SKY : CREAM} strokeOpacity={fitted ? 0.9 : 0.35} strokeWidth="2" style={fitted ? { filter: "drop-shadow(0 0 16px rgba(56,189,248,.5))" } : undefined} />
      <rect x="282" y="122" width="64" height="16" rx="3" fill="#020611" stroke={ICE} strokeOpacity="0.5" />
      <rect x="282" y="202" width="64" height="16" rx="3" fill="#020611" stroke={ICE} strokeOpacity="0.5" />
      <g transform={`translate(${f1(x - 640)} 0)`}>
        <rect x={f1(640 - pinW + 2)} y={f1(130 - pinH / 2)} width={f1(pinW)} height={f1(pinH)} rx={f1(pinR)} fill={CREAM} fillOpacity="0.85" />
        <rect x={f1(640 - pinW + 2)} y={f1(210 - pinH / 2)} width={f1(pinW)} height={f1(pinH)} rx={f1(pinR)} fill={CREAM} fillOpacity="0.85" />
        <rect x="640" y="80" width="150" height="200" rx="48" fill="#13284a" stroke={CREAM} strokeOpacity="0.5" strokeWidth="2" />
      </g>
      {p > 0.18 && p < 0.42 ? (
        <path d="M 372 150 l 14 16 l -10 4 l 16 18" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
    </svg>
  );
}

const SWAPS = [
  { before: "Can you ", old: "open", neu: "turn on", after: " the light?", at: 0.22 },
  { before: "We discussed ", old: "about\u00a0", neu: "", after: "the budget.", at: 0.46 },
  { before: "", old: "Sorry for late.", neu: "Sorry I'm late.", after: "", at: 0.7 },
];
function SwapArt({ p }) {
  return (
    <div className="jr-swap" lang="en">
      {SWAPS.map((s) => {
        const on = p >= s.at;
        return (
          <div key={s.after + s.old}>
            {s.before}
            <span className="jr-swap-slot">
              <span className="jr-swap-old" style={{ opacity: on ? 0 : 1, transform: on ? "translateY(-8px)" : "none" }} aria-hidden={on}>{s.old}</span>
              <span className="jr-swap-new" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)" }} aria-hidden={!on}>{s.neu || "​"}</span>
            </span>
            {s.after}
          </div>
        );
      })}
    </div>
  );
}

/* ── 4 · accent-is-not-the-problem ──────────────────────────────── */
const METERS = [
  ["اللكنة", "accentedness", 0.82, 0.3],
  ["سهولة الفهم", "comprehensibility", 0.78, 0.45],
  ["الوضوح الفعلي", "intelligibility", 0.96, 0.58],
];
function MetersArt({ p }) {
  const fill = ease(seg(p, 0.04, 0.3));
  const turn = ease(seg(p, 0.55, 0.78));
  return (
    <div className="jr-bars">
      {METERS.map(([ar, en, a, b], i) => {
        const v = (a + (b - a) * turn) * fill;
        return (
          <div key={en} className={`jr-bar-row${i === 0 ? " jr-bar--dim" : ""}`}>
            <div className="jr-bar-head">
              <span>{ar}</span>
              <span className="jr-en jr-lbl" dir="ltr" lang="en">{en}</span>
            </div>
            <div className="jr-bar"><i style={{ transform: `scaleX(${Math.max(0.02, v).toFixed(3)})` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function WavesArt({ p }) {
  const t = ease(seg(p, 0.1, 0.9));
  const lines = [];
  const colors = [CREAM, ICE, CREAM, SKY, CREAM, ICE];
  for (let k = 0; k < 6; k++) {
    const y0 = 40 + k * 52;
    const freq = 0.02 + k * 0.006;
    const amp = 18 + (k % 3) * 6;
    let d = "";
    for (let x = 0; x <= 800; x += 10) {
      const u = x / 800;
      const pull = ease(clamp((u - 0.15) / 0.7)) * (0.35 + 0.65 * t);
      const y = y0 + (170 - y0) * pull + Math.sin(x * freq + k) * amp * (1 - pull * 0.9);
      d += `${x === 0 ? "M" : "L"} ${x} ${f1(y)} `;
    }
    lines.push(<path key={k} d={d} fill="none" stroke={colors[k]} strokeOpacity={0.25 + 0.5 * t} strokeWidth="2" />);
  }
  return (
    <svg viewBox="0 0 800 340" role="img" aria-label="أصوات بلكنات مختلفة تلتقي في خط واحد واضح">
      {lines}
      <line x1="660" y1="170" x2="800" y2="170" stroke={SKY} strokeWidth="4" strokeOpacity={f1(t)} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,.8))" }} />
    </svg>
  );
}

/* ── 5 · fear-of-mistakes ───────────────────────────────────────── */
function SpotlightArt({ p }) {
  const t = ease(seg(p, 0.2, 0.75));
  const r = 330 - t * 230;
  const crowd = [];
  const looking = new Set([5, 19, 30]);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 13; i++) {
      const idx = row * 13 + i;
      const x = 70 + i * 55 + (row % 2) * 27;
      const y = 330 + row * 38;
      const turned = looking.has(idx);
      crowd.push(<circle key={idx} cx={x} cy={y} r="10" fill={turned && t > 0.4 ? ICE : CREAM} fillOpacity={turned && t > 0.4 ? 0.9 : 0.16 + row * 0.06} />);
    }
  }
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label="دائرة ضوء على متكلم، تصغر؛ وأغلب الحضور ينظرون لأشياء أخرى">
      <defs>
        <radialGradient id="jr-sc-spot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ICE} stopOpacity="0.42" />
          <stop offset="70%" stopColor={ICE} stopOpacity="0.12" />
          <stop offset="100%" stopColor={ICE} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="170" r={f1(r)} fill="url(#jr-sc-spot)" />
      <circle cx="400" cy="140" r="20" fill={CREAM} />
      <path d="M 370 230 C 370 180, 382 168, 400 168 C 418 168, 430 180, 430 230 Z" fill={CREAM} />
      {crowd}
    </svg>
  );
}

const CYCLE = ["نخاف", "نسكت", "ما نتدرّب", "يبقى الكلام صعب"];
/* SVG text inherits direction: rtl from the page, so "start" is the RIGHT edge. */
function StageArt({ p }) {
  const spin = seg(p, 0, 0.55);
  const brk = ease(seg(p, 0.6, 0.9));
  const cx = 400;
  const cy = 200;
  const R = 130;
  const active = Math.min(CYCLE.length - 1, Math.floor(spin * CYCLE.length * 1.2) % CYCLE.length);
  return (
    <svg viewBox="0 0 800 400" role="img" aria-label="دائرة الخوف: نخاف، فنسكت، فما نتدرّب، فيبقى الكلام صعب؛ وسهم يكسرها">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={CREAM} strokeOpacity={f1(0.25 * (1 - brk) + 0.06)} strokeWidth="2" strokeDasharray="6 8" />
      {CYCLE.map((label, i) => {
        const a = (i / CYCLE.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const on = i === active && brk < 0.2;
        return (
          <g key={label} opacity={f1(1 - brk * 0.6)}>
            <circle cx={f1(x)} cy={f1(y)} r="8" fill={on ? GOLD : CREAM} fillOpacity={on ? 1 : 0.5} />
            <text x={f1(x + (Math.cos(a) >= 0 ? 18 : -18))} y={f1(y + 6)} textAnchor={Math.cos(a) >= 0 ? "end" : "start"} direction="rtl" fill={CREAM} fillOpacity={on ? 1 : 0.6} style={{ font: "600 calc(18px * var(--jr-svg-s, 1)) 'Readex Pro Variable', system-ui, sans-serif" }}>{label}</text>
          </g>
        );
      })}
      {brk > 0 ? (
        <g opacity={f1(brk)}>
          <path d={`M ${cx} ${cy} L ${f1(cx + 330 * brk)} ${f1(cy - 150 * brk)}`} stroke={SKY} strokeWidth="4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,.8))" }} />
          <circle cx={f1(cx + 330 * brk)} cy={f1(cy - 150 * brk)} r="9" fill={ICE} />
        </g>
      ) : null}
    </svg>
  );
}

/* ── 6 · adults-learn-differently ───────────────────────────────── */
function PathsArt({ p }) {
  const child = ease(seg(p, 0.02, 0.75));
  const adult = ease(seg(p, 0.35, 0.62));
  return (
    <svg viewBox="0 0 800 420" role="img" aria-label="طريقان إلى نفس النجمة: طريق متعرّج طويل، وطريق أقصر لمن يعرف وجهته">
      <path d="M 700 92 l 6 14 l 15 1 l -11 10 l 4 15 l -14 -8 l -14 8 l 4 -15 l -11 -10 l 15 -1 z" fill={GOLD} style={{ filter: "drop-shadow(0 0 12px rgba(251,191,36,.6))" }} />
      <path d="M 90 360 C 160 250, 270 400, 330 300 S 250 140, 370 180 S 500 330, 510 220 S 410 90, 540 120 S 650 170, 700 112" fill="none" stroke={CREAM} strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray={`${f1(child * 1000) / 1000} 1`} />
      <path d="M 90 360 C 290 320, 520 220, 700 112" fill="none" stroke={SKY} strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray={`${f1(adult * 1000) / 1000} 1`} style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,.7))" }} />
      <circle cx="90" cy="360" r="8" fill={CREAM} />
    </svg>
  );
}

function RootsArt({ p }) {
  const t = seg(p, 0.05, 0.92);
  // memory strength over 10 days; reviews on day 1, 4, 8 (tomorrow, +3, +1 week)
  const reviews = [1, 4, 8];
  const rate = [0.55, 0.3, 0.16, 0.08];
  const strength = (d) => {
    let last = 0;
    let k = 0;
    for (const r of reviews) if (d >= r) { last = r; k++; }
    return Math.exp(-rate[k] * (d - last));
  };
  const X = (d) => 60 + d * 68;
  const Y = (s) => 300 - s * 230;
  let d = "";
  const end = t * 10;
  for (let x = 0; x <= end + 1e-9; x += 0.1) {
    const day = Math.round(x * 10) / 10;
    d += `${d ? "L" : "M"} ${f1(X(day))} ${f1(Y(strength(day)))} `;
  }
  const ticks = [[0, "اليوم"], [1, "بكرة"], [4, "بعد 3 أيام"], [8, "بعد أسبوع"]];
  return (
    <svg viewBox="0 0 800 360" role="img" aria-label="رسم توضيحي: قوة التذكّر تنخفض ثم ترتفع مع كل مراجعة، وتنخفض أبطأ كل مرة">
      <line x1="60" y1="300" x2="760" y2="300" stroke={CREAM} strokeOpacity="0.2" />
      {ticks.map(([day, label]) => (
        <g key={label} opacity={end >= day ? 1 : 0.35}>
          <line x1={X(day)} y1="300" x2={X(day)} y2="70" stroke={SKY} strokeOpacity="0.18" strokeDasharray="3 6" />
          <circle cx={X(day)} cy={Y(1)} r="6" fill={end >= day ? ICE : "#0b1830"} stroke={ICE} />
          <text x={day === 0 ? X(day) + 12 : X(day)} y="330" textAnchor={day === 0 ? "start" : "middle"} direction="rtl" fill={CREAM} fillOpacity="0.7" style={{ font: "500 calc(15px * var(--jr-svg-s, 1)) 'Readex Pro Variable', system-ui, sans-serif" }}>{label}</text>
        </g>
      ))}
      {d ? <path d={d} fill="none" stroke={ICE} strokeWidth="3" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(125,211,252,.6))" }} /> : null}
    </svg>
  );
}

const SCENES = {
  clock: {
    Art: ClockArt,
    caps: ["أول عشر دقائق في الاجتماع فيها خمس محطات ثابتة.", "لكل محطة جملتين أو ثلاث، جاهزة قبل ما نحتاجها.", "وباقي الاجتماع؟ نخلّيه للإبداع."],
  },
  table: {
    Art: TableArt,
    caps: ["في الاجتماع الجاي، فيه كرسي لنا.", "عشر جمل تقريباً تكفي لأول عشر دقائق.", "وكل اجتماع بعده يضيف جملة للقائمة."],
  },
  gap: {
    Art: GapArt,
    note: "رسم توضيحي، مب أرقام دراسة",
    caps: ["الكلمات اللي نتعرّف عليها لما تمرّ قدامنا…", "…أكثر بكثير من الكلمات اللي نطلّعها بنفسنا وقت الحاجة.", "الفرق مب جهل. هو طريق ما مشيناه كفاية."],
  },
  bridge: {
    Art: BridgeArt,
    caps: ["الفكرة في الراس، والكلمات موجودة.", "الجسر للفم ينبني لوح لوح، بكل جملة نقولها بصوت.", "لين تطلع الجملة لحالها."],
  },
  plug: {
    Art: PlugArt,
    caps: ["الفكرة سليمة، والكلمات سليمة…", "…بس شكل الفيش عربي، والجدار إنجليزي.", "لما نتعلّم شكل الجملة الإنجليزية، تركب."],
  },
  swap: {
    Art: SwapArt,
    caps: ["ثلاث جمل تتكرر كثير في بيئة العمل.", "تصليح صغير في كل وحدة…", "…وتصير الجملة إنجليزية فعلاً."],
  },
  meters: {
    Art: MetersArt,
    note: "رسم توضيحي، مب أرقام دراسة",
    caps: ["مدير مشروع بلكنة عربية واضحة، والنبر في مكانه.", "لكنة قوية، والكلام وصل كامل.", "وتقليد لكنة أمريكية بسرعة؟ لكنة أخف، وفهم أصعب."],
  },
  waves: {
    Art: WavesArt,
    caps: ["اللي يتكلمون الإنجليزي لغة ثانية أكثر بكثير من أهلها.", "كل واحد بلكنته.", "واللي يوصل، هو اللي فكرته أوضح."],
  },
  spotlight: {
    Art: SpotlightArt,
    caps: ["نحس إن الضوء كله علينا…", "…والواقع إن أغلب الناس مشغولين بأنفسهم.", "الضوء أصغر بكثير مما نتخيّل."],
  },
  stage: {
    Art: StageArt,
    caps: ["نخاف، فنسكت، فما نتدرّب…", "…فيبقى الكلام صعب، ونخاف أكثر.", "الدائرة ما تنكسر بالتفكير. تنكسر بالتجربة."],
  },
  paths: {
    Art: PathsArt,
    caps: ["الطفل يستكشف المدينة مشي، وعنده وقت كثير.", "الكبير عنده سيارة وخريطة، بس وقته قليل.", "فالفرق كله في سؤال واحد: وين رايحين؟"],
  },
  roots: {
    Art: RootsArt,
    note: "رسم توضيحي",
    caps: ["جملة تعلّمناها اليوم، تبدأ تبهت من بكرة.", "نرجع لها: بكرة، ثم بعد ثلاث أيام، ثم بعد أسبوع.", "وكل مرة، تبهت أبطأ من اللي قبلها."],
  },
};

export default function Scene({ id }) {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const scene = SCENES[id];
  if (!scene) return null;
  const { Art, caps, note } = scene;
  const active = Math.min(caps.length - 1, Math.floor(p * caps.length * 1.05));
  return (
    <div className="jr-scene" ref={ref}>
      <div className="jr-scene-stick">
        <div className="jr-stage">
          <Art p={p} />
          {note ? <p className="jr-note">{note}</p> : null}
        </div>
        <div className="jr-caps">
          {caps.map((c, i) => (
            <p key={c} className={`jr-cap${i === active ? " is-on" : ""}`}>{c}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
