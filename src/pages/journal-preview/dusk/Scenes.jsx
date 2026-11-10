import { useEffect, useMemo, useRef, useState } from "react";
import { ridge, rng } from "./gen.js";

/**
 * Scroll scenes for «غسق الصحراء». Same captions as the live journal; the drawing is dusk:
 * the clock is a sun crossing a horizon, the table sits on a photographed dune,
 * the two roads cross seeded dunes, and the roots grow into the sand.
 * Progress p (0→1) comes from one rAF loop that runs only while the scene is near the screen.
 */
const OFF = "#f7ebe3";
const APRICOT = "#e8b48a";
const ROSE = "#d88a8a";
const BURNT = "#c9784a";
const INK = "#1b0a24";

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const f1 = (n) => n.toFixed(1);
const PLEX = "'IBM Plex Sans Arabic', system-ui, sans-serif";

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
    const on = () => { if (near && !raf) raf = requestAnimationFrame(tick); };
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => { near = e.isIntersecting; on(); }, { rootMargin: "120px 0px" })
      : null;
    if (io) io.observe(el); else near = true;
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    on();
    return () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}

/* ── first-ten-minutes · clock: ten minutes is the sun's slow arc ── */
const STATIONS = ["الكلام الجانبي", "الافتتاح", "المقاطعة بلباقة", "طلب التوضيح", "الختام"];
function ClockArt({ p }) {
  const t = ease(seg(p, 0.05, 0.85));
  const cx = 300;
  const cy = 250;
  const R = 220;
  const ang = Math.PI * t; // right→left over the horizon (RTL)
  const pt = (a, r) => [cx + Math.cos(a) * r, cy - Math.sin(a) * r];
  const [sx, sy] = pt(ang, R);
  const [x0, y0] = pt(0, R);
  const secs = Math.round(t * 600);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const now = Math.min(STATIONS.length - 1, Math.floor(t * STATIONS.length));
  const H = useMemo(() => ridge("clock", { w: 600, base: 250, amp: 10, waves: 3 }), []);
  return (
    <div className="dk-clock">
      <svg viewBox="0 0 600 300" role="img" aria-label="الشمس تقطع الأفق: أول عشر دقائق من الاجتماع">
        <defs>
          <radialGradient id="dkc-g"><stop offset="0" stopColor="#ffd9a8" stopOpacity=".7" /><stop offset="1" stopColor={APRICOT} stopOpacity="0" /></radialGradient>
        </defs>
        <path d={`M ${f1(x0)} ${cy} A ${R} ${R} 0 0 0 ${f1(cx - R)} ${cy}`} fill="none" stroke={OFF} strokeOpacity=".16" strokeDasharray="2 8" strokeLinecap="round" />
        {t > 0.003 ? <path d={`M ${f1(x0)} ${cy} A ${R} ${R} 0 0 0 ${f1(sx)} ${f1(sy)}`} fill="none" stroke={APRICOT} strokeWidth="2.4" strokeLinecap="round" /> : null}
        {STATIONS.map((_, i) => {
          const a = Math.PI * ((i + 0.5) / STATIONS.length);
          const [x, y] = pt(a, R);
          const on = t > 0 && i <= now;
          return <circle key={i} cx={f1(x)} cy={f1(y)} r="5" fill={on ? APRICOT : "#2a1433"} stroke={APRICOT} strokeOpacity=".7" />;
        })}
        <circle cx={f1(sx)} cy={f1(sy)} r="64" fill="url(#dkc-g)" />
        <circle cx={f1(sx)} cy={f1(sy)} r="20" fill="#ffd9a8" />
        <path d={H.fill(300)} fill={INK} fillOpacity=".92" />
        <path d={H.line} fill="none" stroke={BURNT} strokeOpacity=".7" />
        <text x={cx} y="285" textAnchor="middle" fill={OFF} direction="ltr" style={{ font: "500 34px 'IBM Plex Sans Arabic', system-ui, sans-serif", letterSpacing: "0.06em" }}>{`${mm}:${ss}`}</text>
      </svg>
      <ol className="dk-stations" aria-label="المحطات الخمس">
        {STATIONS.map((s, i) => <li key={s} className={t > 0 && i < now ? "is-on" : t > 0 && i === now ? "is-now" : undefined}>{s}</li>)}
      </ol>
    </div>
  );
}

/* ── first-ten-minutes · table ── */
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
        {ours && ring > 0 ? <circle cx={f1(x)} cy={f1(y)} r={f1(26 + ring * 70)} fill="none" stroke={APRICOT} strokeOpacity={f1(0.6 * (1 - ring) + 0.1)} strokeWidth="2" /> : null}
        <circle cx={f1(x)} cy={f1(y)} r="22" fill={ours ? APRICOT : OFF} fillOpacity={ours ? f1(0.2 + lit * 0.8) : 0.2} style={ours && lit > 0.5 ? { filter: "drop-shadow(0 0 14px rgba(232,180,138,.8))" } : undefined} />
      </g>,
    );
  }
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label="طاولة اجتماع، وكرسي واحد يضيء">
      <ellipse cx="400" cy="220" rx="190" ry="84" fill={INK} fillOpacity=".7" stroke={APRICOT} strokeOpacity=".35" strokeWidth="1.6" />
      {seats}
    </svg>
  );
}

/* ── adults-learn-differently · paths: two roads across the dunes to one evening star ── */
function PathsArt({ p }) {
  const child = ease(seg(p, 0.02, 0.78));
  const adult = ease(seg(p, 0.35, 0.62));
  const hz = useMemo(() => ridge("paths-h", { w: 800, base: 235, amp: 16, waves: 3 }), []);
  const nz = useMemo(() => ridge("paths-n", { w: 800, base: 345, amp: 22, waves: 2 }), []);
  const star = useMemo(() => { const r = rng("paths-s"); return Array.from({ length: 26 }, () => [r() * 800, r() * 150, 0.6 + r()]); }, []);
  return (
    <svg viewBox="0 0 800 420" role="img" aria-label="طريقان إلى نفس النجمة: طريق متعرّج طويل، وطريق أقصر لمن يعرف وجهته">
      {star.map(([x, y, r], i) => <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(r)} fill={OFF} fillOpacity=".4" />)}
      <path d={hz.fill(420)} fill="#3a1a42" /><path d={hz.line} fill="none" stroke={ROSE} strokeOpacity=".5" />
      <path d={nz.fill(420)} fill={INK} fillOpacity=".85" /><path d={nz.line} fill="none" stroke={BURNT} strokeOpacity=".6" />
      <g style={{ filter: "drop-shadow(0 0 14px rgba(255,217,168,.8))" }}>
        <path d="M 110 86 l 4 12 l 12 1 l -9 8 l 3 12 l -10 -7 l -10 7 l 3 -12 l -9 -8 l 12 -1 z" fill="#ffe3bd" />
      </g>
      <path d="M 710 372 C 640 270, 540 400, 480 310 S 560 160, 440 200 S 310 330, 300 245 S 380 140, 250 170 S 150 200, 110 122" fill="none" stroke={OFF} strokeOpacity=".7" strokeWidth="3.4" strokeLinecap="round" pathLength="1" strokeDasharray={`${f1(child * 1000) / 1000} 1`} />
      <path d="M 710 372 C 560 330, 330 230, 110 122" fill="none" stroke={APRICOT} strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray={`${f1(adult * 1000) / 1000} 1`} style={{ filter: "drop-shadow(0 0 8px rgba(232,180,138,.7))" }} />
      <circle cx="710" cy="372" r="8" fill={OFF} />
    </svg>
  );
}

/* ── adults-learn-differently · roots: forgetting slows, roots go deeper ── */
function RootsArt({ p }) {
  const t = seg(p, 0.05, 0.92);
  const reviews = [1, 4, 8];
  const rate = [0.55, 0.3, 0.16, 0.08];
  const strength = (d) => {
    let last = 0;
    let k = 0;
    for (const r of reviews) if (d >= r) { last = r; k++; }
    return Math.exp(-rate[k] * (d - last));
  };
  // RTL: day 0 on the right
  const X = (d) => 740 - d * 68;
  const Y = (s) => 250 - s * 190;
  const end = t * 10;
  let d = "";
  for (let x = 0; x <= end + 1e-9; x += 0.1) {
    const day = Math.round(x * 10) / 10;
    d += `${d ? "L" : "M"} ${f1(X(day))} ${f1(Y(strength(day)))} `;
  }
  const area = d ? `${d}L ${f1(X(end))} 250 L ${f1(X(0))} 250 Z` : "";
  const ticks = [[0, "اليوم"], [1, "بكرة"], [4, "بعد 3 أيام"], [8, "بعد أسبوع"]];
  const roots = useMemo(() => ticks.map(([day], k) => {
    const r = rng(`root-${k}`);
    return Array.from({ length: 2 + k }, (_, j) => {
      const len = 26 + k * 20 + r() * 16;
      const dx = (j - (1 + k) / 2) * (10 + r() * 8);
      return { day, len, dx, wob: (r() - 0.5) * 18 };
    });
  }).flat(), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <svg viewBox="0 0 800 380" role="img" aria-label="رسم توضيحي: قوة التذكّر تنخفض ثم ترتفع مع كل مراجعة، وتنخفض أبطأ كل مرة">
      <defs>
        <linearGradient id="dkr-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={APRICOT} stopOpacity=".38" /><stop offset="1" stopColor={APRICOT} stopOpacity="0" /></linearGradient>
      </defs>
      <line x1="40" y1="250" x2="770" y2="250" stroke={OFF} strokeOpacity=".28" />
      {roots.map((r, i) => {
        const on = clamp((end - r.day) / 1.4);
        if (on <= 0) return null;
        const L = r.len * on;
        const x = X(r.day);
        return <path key={i} d={`M ${f1(x)} 250 q ${f1(r.wob)} ${f1(L * 0.5)} ${f1(r.dx)} ${f1(L)}`} fill="none" stroke={ROSE} strokeOpacity={0.35 + on * 0.4} strokeWidth="1.8" strokeLinecap="round" />;
      })}
      {ticks.map(([day, label]) => (
        <g key={label} opacity={end >= day ? 1 : 0.4}>
          <line x1={X(day)} y1="250" x2={X(day)} y2="60" stroke={APRICOT} strokeOpacity=".18" strokeDasharray="3 6" />
          <circle cx={X(day)} cy={Y(1)} r="6" fill={end >= day ? APRICOT : "#2a1433"} stroke={APRICOT} />
          <text x={X(day)} y="364" textAnchor="middle" direction="rtl" fill={OFF} fillOpacity=".78" style={{ font: `400 calc(15px * var(--dk-svg-s, 1)) ${PLEX}` }}>{label}</text>
        </g>
      ))}
      {area ? <path d={area} fill="url(#dkr-a)" /> : null}
      {d ? <path d={d} fill="none" stroke="#ffd9a8" strokeWidth="3" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(232,180,138,.6))" }} /> : null}
    </svg>
  );
}

const SCENES = {
  clock: { Art: ClockArt, img: "scene-clock", caps: ["أول عشر دقائق في الاجتماع فيها خمس محطات ثابتة.", "لكل محطة جملتين أو ثلاث، جاهزة قبل ما نحتاجها.", "وباقي الاجتماع؟ نخلّيه للإبداع."] },
  table: { Art: TableArt, img: "scene-table", caps: ["في الاجتماع الجاي، فيه كرسي لنا.", "عشر جمل تقريباً تكفي لأول عشر دقائق.", "وكل اجتماع بعده يضيف جملة للقائمة."] },
  paths: { Art: PathsArt, caps: ["الطفل يستكشف المدينة مشي، وعنده وقت كثير.", "الكبير عنده سيارة وخريطة، بس وقته قليل.", "فالفرق كله في سؤال واحد: وين رايحين؟"] },
  roots: { Art: RootsArt, note: "رسم توضيحي", caps: ["جملة تعلّمناها اليوم، تبدأ تبهت من بكرة.", "نرجع لها: بكرة، ثم بعد ثلاث أيام، ثم بعد أسبوع.", "وكل مرة، تبهت أبطأ من اللي قبلها."] },
};

export default function Scene({ id }) {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const scene = SCENES[id];
  if (!scene) return null;
  const { Art, caps, note, img } = scene;
  const active = Math.min(caps.length - 1, Math.floor(p * caps.length * 1.05));
  return (
    <div className="dk-scene" ref={ref}>
      <div className="dk-scene-stick">
        {img ? (
          <picture className="dk-scene-img" aria-hidden="true">
            <img src={`/images/journal/dusk/${img}-w1280.webp`} srcSet={`/images/journal/dusk/${img}-w800.webp 800w, /images/journal/dusk/${img}-w1280.webp 1280w, /images/journal/dusk/${img}-w1920.webp 1920w`} sizes="100vw" alt="" loading="lazy" decoding="async" width="1920" height="1080" />
          </picture>
        ) : null}
        <div className="dk-stage">
          <Art p={p} />
          {note ? <p className="dk-note">{note}</p> : null}
        </div>
        <div className="dk-caps">
          {caps.map((c, i) => <p key={c} className={`dk-cap${i === active ? " is-on" : ""}`}>{c}</p>)}
        </div>
      </div>
    </div>
  );
}
