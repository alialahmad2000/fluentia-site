import { useEffect, useRef, useState } from "react";

/**
 * Scroll-driven scenes in the ink direction. Same captions and logic as the live
 * journal (src/pages/journal/scenes.jsx), redrawn in ember on ink. Progress p
 * (0 → 1) moves the drawing and picks the caption. Reduced motion: p = 1, no
 * sticky stage, every caption listed (ink.css).
 */
const EMBER = "#e8542c";
const EMBER2 = "#ff7a45";
const CREAM = "#f2eadf";
const INK = "#0e0b09";
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const f1 = (n) => n.toFixed(1);
const SVG_FONT = "'IBM Plex Sans Arabic', system-ui, sans-serif";

function useSceneProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(1); return undefined; }
    let raf = 0;
    let near = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const q = Math.round((span > 0 ? clamp(-r.top / span) : 1) * 100) / 100;
      setP((prev) => (prev === q ? prev : q));
    };
    const onScroll = () => { if (near && !raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; onScroll(); }, { rootMargin: "120px 0px" });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
  return p;
}

/* ── clock ── */
const STATIONS = ["الكلام الجانبي", "الافتتاح", "المقاطعة بلباقة", "طلب التوضيح", "الختام"];
function ClockArt({ p }) {
  const t = ease(seg(p, 0.05, 0.85));
  const cx = 200, cy = 200, R = 150;
  const a0 = -Math.PI / 2;
  const a1 = a0 + (Math.PI / 3) * t;
  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const [x0, y0] = pt(a0, R);
  const [x1, y1] = pt(a1, R);
  const secs = Math.round(t * 600);
  const now = Math.min(STATIONS.length - 1, Math.floor(t * STATIONS.length));
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const [ax, ay] = pt(a, R + 22);
    const [bx, by] = pt(a, R + (i % 5 === 0 ? 34 : 28));
    ticks.push(<line key={i} x1={f1(ax)} y1={f1(ay)} x2={f1(bx)} y2={f1(by)} stroke={CREAM} strokeOpacity={i % 5 === 0 ? 0.5 : 0.18} />);
  }
  return (
    <div className="ink-clock">
      <svg viewBox="0 0 400 400" role="img" aria-label="ساعة: أول عشر دقائق من الاجتماع">
        {ticks}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={CREAM} strokeOpacity="0.1" strokeWidth="12" />
        {t > 0.002 ? <path d={`M ${f1(x0)} ${f1(y0)} A ${R} ${R} 0 0 1 ${f1(x1)} ${f1(y1)}`} fill="none" stroke={EMBER2} strokeWidth="12" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 14px rgba(255,122,69,.85))" }} /> : null}
        {STATIONS.map((_, i) => {
          const [x, y] = pt(a0 + (Math.PI / 3) * ((i + 0.5) / STATIONS.length), R);
          return <circle key={i} cx={f1(x)} cy={f1(y)} r="5" fill={i <= now && t > 0 ? CREAM : INK} stroke={CREAM} strokeOpacity="0.6" />;
        })}
        <text x={cx} y={cy + 16} textAnchor="middle" fill={CREAM} style={{ font: `500 54px ${SVG_FONT}`, fontFeatureSettings: '"tnum"' }} direction="ltr">{`${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`}</text>
      </svg>
      <ol className="ink-stations" aria-label="المحطات الخمس">
        {STATIONS.map((s, i) => <li key={s} className={t > 0 && i < now ? "is-on" : t > 0 && i === now ? "is-now" : undefined}>{s}</li>)}
      </ol>
    </div>
  );
}

/* ── table ── */
function TableArt({ p }) {
  const lit = seg(p, 0.3, 0.6);
  const ring = seg(p, 0.6, 1);
  const seats = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
    const x = 400 + Math.cos(a) * 250;
    const y = 220 + Math.sin(a) * 130;
    const ours = i === 0;
    seats.push(
      <g key={i}>
        {ours && ring > 0 ? <circle cx={f1(x)} cy={f1(y)} r={f1(26 + ring * 80)} fill="none" stroke={EMBER2} strokeOpacity={f1(0.7 * (1 - ring) + 0.08)} strokeWidth="2" /> : null}
        <circle cx={f1(x)} cy={f1(y)} r="22" fill={ours ? EMBER2 : CREAM} fillOpacity={ours ? f1(0.15 + lit * 0.85) : 0.16} style={ours && lit > 0.5 ? { filter: "drop-shadow(0 0 18px rgba(255,122,69,.95))" } : undefined} />
      </g>,
    );
  }
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label="طاولة اجتماع، وكرسي واحد يضيء">
      <ellipse cx="400" cy="220" rx="190" ry="84" fill="#1b1410" stroke={CREAM} strokeOpacity="0.22" strokeWidth="2" />
      <ellipse cx="400" cy="220" rx="190" ry="84" fill="url(#ink-tbl)" opacity={f1(lit * 0.9)} />
      <defs><radialGradient id="ink-tbl" cx="50%" cy="100%" r="80%"><stop offset="0" stopColor={EMBER} stopOpacity="0.55" /><stop offset="1" stopColor={EMBER} stopOpacity="0" /></radialGradient></defs>
      {seats}
      {lit > 0 ? (
        <g opacity={f1(lit)}>
          {[0, 1, 2].map((k) => <path key={k} d={`M ${400 - 18 - k * 12} ${352 - k * 4} q ${18 + k * 12} ${-22 - k * 10} ${36 + k * 24} 0`} fill="none" stroke={EMBER2} strokeWidth="2" strokeLinecap="round" opacity={0.9 - k * 0.25} />)}
        </g>
      ) : null}
    </svg>
  );
}

/* ── spotlight ── */
function SpotlightArt({ p }) {
  const t = ease(seg(p, 0.2, 0.75));
  const r = 330 - t * 230;
  const crowd = [];
  const looking = new Set([5, 19, 30]);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 13; i++) {
      const idx = row * 13 + i;
      const turned = looking.has(idx);
      crowd.push(<circle key={idx} cx={70 + i * 55 + (row % 2) * 27} cy={330 + row * 38} r="10" fill={turned && t > 0.4 ? EMBER2 : CREAM} fillOpacity={turned && t > 0.4 ? 0.95 : 0.14 + row * 0.05} style={turned && t > 0.4 ? { filter: "drop-shadow(0 0 8px rgba(255,122,69,.9))" } : undefined} />);
    }
  }
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label="دائرة ضوء على متكلم، تصغر؛ وأغلب الحضور ينظرون لأشياء أخرى">
      <defs>
        <radialGradient id="ink-sp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={EMBER2} stopOpacity="0.55" />
          <stop offset="65%" stopColor={EMBER} stopOpacity="0.16" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="170" r={f1(r)} fill="url(#ink-sp)" />
      <circle cx="400" cy="140" r="20" fill={CREAM} />
      <path d="M 370 230 C 370 180, 382 168, 400 168 C 418 168, 430 180, 430 230 Z" fill={CREAM} />
      {crowd}
    </svg>
  );
}

/* ── stage (the fear cycle) ── */
const CYCLE = ["نخاف", "نسكت", "ما نتدرّب", "يبقى الكلام صعب"];
function StageArt({ p }) {
  const spin = seg(p, 0, 0.55);
  const brk = ease(seg(p, 0.6, 0.9));
  const cx = 400, cy = 200, R = 130;
  const active = Math.min(CYCLE.length - 1, Math.floor(spin * CYCLE.length * 1.2) % CYCLE.length);
  return (
    <svg viewBox="0 0 800 400" role="img" aria-label="دائرة الخوف: نخاف، فنسكت، فما نتدرّب، فيبقى الكلام صعب؛ وسهم يكسرها">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={CREAM} strokeOpacity={f1(0.28 * (1 - brk) + 0.06)} strokeWidth="2" strokeDasharray="6 8" />
      {CYCLE.map((label, i) => {
        const a = (i / CYCLE.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const on = i === active && brk < 0.2;
        return (
          <g key={label} opacity={f1(1 - brk * 0.6)}>
            <circle cx={f1(x)} cy={f1(y)} r="8" fill={on ? EMBER2 : CREAM} fillOpacity={on ? 1 : 0.5} style={on ? { filter: "drop-shadow(0 0 12px rgba(255,122,69,.95))" } : undefined} />
            <text x={f1(x + (Math.cos(a) >= 0 ? 18 : -18))} y={f1(y + 7)} textAnchor={Math.cos(a) >= 0 ? "end" : "start"} direction="rtl" fill={CREAM} fillOpacity={on ? 1 : 0.62} style={{ font: `600 20px ${SVG_FONT}` }}>{label}</text>
          </g>
        );
      })}
      {brk > 0 ? (
        <g opacity={f1(brk)}>
          <path d={`M ${cx} ${cy} L ${f1(cx + 330 * brk)} ${f1(cy - 150 * brk)}`} stroke={EMBER2} strokeWidth="4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 12px rgba(255,122,69,.9))" }} />
          <circle cx={f1(cx + 330 * brk)} cy={f1(cy - 150 * brk)} r="9" fill={EMBER2} />
        </g>
      ) : null}
    </svg>
  );
}

const SCENES = {
  clock: { Art: ClockArt, tag: "المشهد 1 · عشر دقائق", caps: ["أول عشر دقائق في الاجتماع فيها خمس محطات ثابتة.", "لكل محطة جملتين أو ثلاث، جاهزة قبل ما نحتاجها.", "وباقي الاجتماع؟ نخلّيه للإبداع."] },
  table: { Art: TableArt, tag: "المشهد 2 · الكرسي", caps: ["في الاجتماع الجاي، فيه كرسي لنا.", "عشر جمل تقريباً تكفي لأول عشر دقائق.", "وكل اجتماع بعده يضيف جملة للقائمة."] },
  spotlight: { Art: SpotlightArt, tag: "تأثير الضوء المسلّط", caps: ["نحس إن الضوء كله علينا…", "…والواقع إن أغلب الناس مشغولين بأنفسهم.", "الضوء أصغر بكثير مما نتخيّل."] },
  stage: { Art: StageArt, tag: "دائرة الخوف", caps: ["نخاف، فنسكت، فما نتدرّب…", "…فيبقى الكلام صعب، ونخاف أكثر.", "الدائرة ما تنكسر بالتفكير. تنكسر بالتجربة."] },
};

export default function Scene({ id }) {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const scene = SCENES[id];
  if (!scene) return null;
  const { Art, caps, tag } = scene;
  const active = Math.min(caps.length - 1, Math.floor(p * caps.length * 1.05));
  return (
    <div className="ink-scene" ref={ref}>
      <div className="ink-scene-stick" style={{ "--glow": p.toFixed(2), "--gx": `${30 + p * 40}%` }}>
        <span className="ink-scene-tag">{tag}</span>
        <div className="ink-stage"><Art p={p} /></div>
        <div className="ink-caps">
          <div className="ink-cap-dots" aria-hidden="true">{caps.map((c, i) => <i key={c} className={i <= active ? "is-on" : undefined} />)}</div>
          <div className="ink-capstack">{caps.map((c, i) => <p key={c} className={`ink-cap${i === active ? " is-on" : ""}`}>{c}</p>)}</div>
        </div>
      </div>
    </div>
  );
}
