import { useRef } from "react";
import { LIME, WHITE, DISP, seg, ease, f1, useSceneProgress } from "./scene-kit";
import { SCENES_A } from "./scenes-a";
import { SCENES_B } from "./scenes-b";

/**
 * Scroll-driven scenes, Gallery design. A stage sticks while the reader moves
 * through it; progress p (0→1) draws the art and picks the caption.
 * Each scene: { Art, caps[], tone?: "ink" | "paper" | "lime", img?: photo backdrop name, note? }.
 * Reduced motion: p = 1, the stage stops sticking, every caption is listed.
 */

/* ── clock ── */
const STATIONS = ["الكلام الجانبي", "الافتتاح", "المقاطعة بلباقة", "طلب التوضيح", "الختام"];
function ClockArt({ p }) {
  const t = ease(seg(p, 0.05, 0.85));
  const cx = 200, cy = 200, R = 160;
  const a0 = -Math.PI / 2;
  const a1 = a0 + (Math.PI / 3) * t;
  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const [x0, y0] = pt(a0, R);
  const [x1, y1] = pt(a1, R);
  const secs = Math.round(t * 600);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const now = Math.min(STATIONS.length - 1, Math.floor(t * STATIONS.length));
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const [ax, ay] = pt(a, R);
    const [bx, by] = pt(a, R - (major ? 16 : 8));
    ticks.push(<line key={i} x1={f1(ax)} y1={f1(ay)} x2={f1(bx)} y2={f1(by)} stroke={WHITE} strokeOpacity={major ? 0.9 : 0.35} strokeWidth={major ? 2 : 1} />);
  }
  return (
    <div className="g-clock">
      <svg viewBox="0 0 400 400" role="img" aria-label="ساعة: أول عشر دقائق من الاجتماع">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={WHITE} strokeOpacity="0.5" strokeWidth="1.5" />
        {t > 0.002 ? (
          <path d={`M ${cx} ${cy} L ${f1(x0)} ${f1(y0)} A ${R} ${R} 0 0 1 ${f1(x1)} ${f1(y1)} Z`} fill={LIME} />
        ) : null}
        {ticks}
        <line x1={cx} y1={cy} x2={f1(x1)} y2={f1(y1)} stroke={WHITE} strokeWidth="2" />
        <rect x="118" y="168" width="164" height="64" fill="#0b0b0c" />
        <text x={cx} y={cy + 20} textAnchor="middle" fill={WHITE} direction="ltr" style={{ font: `900 58px ${DISP}`, fontFeatureSettings: '"tnum"' }}>{`${mm}:${ss}`}</text>
      </svg>
      <ol className="g-stations" aria-label="المحطات الخمس">
        {STATIONS.map((s, i) => (
          <li key={s} className={t > 0 && i < now ? "is-on" : t > 0 && i === now ? "is-now" : undefined}><span>{s}</span></li>
        ))}
      </ol>
    </div>
  );
}

/* ── table ── */
function TableArt({ p }) {
  const lit = seg(p, 0.3, 0.6);
  const out = ease(seg(p, 0.3, 0.7));
  const ring = seg(p, 0.6, 1);
  const seats = [];
  for (let i = 0; i < 8; i++) {
    const top = i < 4;
    const x = 268 + (i % 4) * 88;
    const y = top ? 96 : 308;
    const ours = i === 5;
    const dy = ours ? (top ? -1 : 1) * out * 26 : 0;
    seats.push(
      <g key={i}>
        {ours && ring > 0 ? (
          <rect x={f1(x - 26 - ring * 40)} y={f1(y + dy - 26 - ring * 40)} width={f1(52 + ring * 80)} height={f1(52 + ring * 80)} fill="none" stroke="currentColor" strokeOpacity={f1(0.8 * (1 - ring) + 0.05)} strokeWidth="2" />
        ) : null}
        <rect x={x - 26} y={f1(y + dy - 26)} width="52" height="52" fill={ours ? LIME : "currentColor"} fillOpacity={ours ? f1(0.12 + lit * 0.88) : 0.1} stroke="currentColor" strokeOpacity={ours ? 1 : 0.5} strokeWidth="1.5" />
      </g>,
    );
  }
  return (
    <svg viewBox="0 0 800 400" role="img" aria-label="طاولة اجتماع، وكرسي واحد يخرج من الصف ويضيء">
      <rect x="236" y="150" width="328" height="100" fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.5" />
      <line x1="236" y1="200" x2="564" y2="200" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="4 8" />
      {seats}
      {lit > 0 ? (
        <g opacity={f1(lit)}>
          {[0, 1, 2].map((k) => (
            <line key={k} x1={f1(580 - k * 0)} y1={f1(344 + k * 12 + 26 * out)} x2={f1(640 + k * 26)} y2={f1(344 + k * 12 + 26 * out)} stroke="currentColor" strokeWidth="3" />
          ))}
        </g>
      ) : null}
    </svg>
  );
}

/* ── plug ── */
function PlugArt({ p }) {
  const morph = ease(seg(p, 0.4, 0.66));
  const slide = ease(seg(p, 0.1, 0.4)) * 0.55 + ease(seg(p, 0.66, 0.92)) * 0.45;
  const x = 640 - slide * 300;
  const pinH = 20 + (16 - 20) * morph;
  const pinW = 58 + (64 - 58) * morph;
  const pinR = 10 * (1 - morph);
  const fitted = p > 0.9;
  return (
    <svg viewBox="0 0 800 360" role="img" aria-label="فيش بأسنان دائرية أمام مقبس بفتحات مسطّحة؛ يتغيّر شكل الأسنان فيركب">
      <rect x="150" y="60" width="200" height="240" fill={fitted ? LIME : "none"} fillOpacity={fitted ? 0.18 : 0} stroke={fitted ? LIME : WHITE} strokeOpacity={fitted ? 1 : 0.6} strokeWidth="2" />
      <rect x="282" y="122" width="64" height="16" fill="#0b0b0c" stroke={WHITE} strokeOpacity="0.8" />
      <rect x="282" y="202" width="64" height="16" fill="#0b0b0c" stroke={WHITE} strokeOpacity="0.8" />
      <g transform={`translate(${f1(x - 640)} 0)`}>
        <rect x={f1(640 - pinW + 2)} y={f1(130 - pinH / 2)} width={f1(pinW)} height={f1(pinH)} rx={f1(pinR)} fill={fitted ? LIME : WHITE} />
        <rect x={f1(640 - pinW + 2)} y={f1(210 - pinH / 2)} width={f1(pinW)} height={f1(pinH)} rx={f1(pinR)} fill={fitted ? LIME : WHITE} />
        <rect x="640" y="80" width="150" height="200" fill="#0b0b0c" stroke={WHITE} strokeWidth="2" />
        <line x1="640" y1="180" x2="800" y2="180" stroke={WHITE} strokeOpacity="0.2" />
      </g>
      {p > 0.18 && p < 0.42 ? (
        <path d="M 372 150 l 14 16 l -10 4 l 16 18" fill="none" stroke={LIME} strokeWidth="4" strokeLinecap="square" />
      ) : null}
    </svg>
  );
}

/* ── swap ── */
const SWAPS = [
  { before: "Can you ", old: "open", neu: "turn on", after: " the light?", at: 0.22 },
  { before: "We discussed ", old: "about ", neu: " ", after: "the budget.", at: 0.46 },
  { before: "", old: "Sorry for late.", neu: "Sorry I'm late.", after: "", at: 0.7 },
];
function SwapArt({ p }) {
  return (
    <div className="g-swap" lang="en" dir="ltr">
      {SWAPS.map((s) => {
        const on = p >= s.at;
        const hint = !on && p >= s.at - 0.1;
        return (
          <div key={s.after + s.old}>
            {s.before}
            <span className="g-swap-slot">
              <span className="g-swap-old" style={{ opacity: on ? 0 : 1, transform: on ? "translateY(-10px)" : "none", textDecoration: hint ? undefined : "none", color: hint ? undefined : "inherit" }} aria-hidden={on}>{s.old}</span>
              <span className="g-swap-new" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)" }} aria-hidden={!on}>{s.neu}</span>
            </span>
            {s.after}
          </div>
        );
      })}
    </div>
  );
}

const OWN = {
  clock: { Art: ClockArt, img: "scene-clock", caps: ["أول عشر دقائق في الاجتماع فيها خمس محطات ثابتة.", "لكل محطة جملتين أو ثلاث، جاهزة قبل ما نحتاجها.", "وباقي الاجتماع؟ نخلّيه للإبداع."] },
  table: { Art: TableArt, tone: "paper", caps: ["في الاجتماع الجاي، فيه كرسي لنا.", "عشر جمل تقريباً تكفي لأول عشر دقائق.", "وكل اجتماع بعده يضيف جملة للقائمة."] },
  plug: { Art: PlugArt, caps: ["الفكرة سليمة، والكلمات سليمة…", "…بس شكل الفيش عربي، والجدار إنجليزي.", "لما نتعلّم شكل الجملة الإنجليزية، تركب."] },
  swap: { Art: SwapArt, tone: "paper", caps: ["ثلاث جمل تتكرر كثير في بيئة العمل.", "تصليح صغير في كل وحدة…", "…وتصير الجملة إنجليزية فعلاً."] },
};

const SCENES = { ...OWN, ...SCENES_A, ...SCENES_B };

export const hasScene = (id) => Boolean(SCENES[id]);

export default function Scene({ id }) {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const scene = SCENES[id];
  if (!scene) return null;
  const { Art, caps, img, note, tone = "ink" } = scene;
  const active = Math.min(caps.length - 1, Math.floor(p * caps.length * 1.05));
  return (
    <div className={`g-scene g-scene--${tone}`} ref={ref}>
      <div className="g-scene-stick">
        {img ? (
          <picture className="g-scene-img" aria-hidden="true">
            <img src={`/images/journal/gallery/${img}-w1280.webp`} srcSet={`/images/journal/gallery/${img}-w800.webp 800w, /images/journal/gallery/${img}-w1280.webp 1280w, /images/journal/gallery/${img}-w1920.webp 1920w`} sizes="100vw" alt="" loading="lazy" decoding="async" width="1920" height="1080" onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }} />
          </picture>
        ) : null}
        <div className="g-stage"><Art p={p} />{note ? <p className="g-note">{note}</p> : null}</div>
        <div className="g-caps">
          <i className="g-rail" style={{ transform: `scaleX(${p.toFixed(3)})` }} aria-hidden="true" />
          {caps.map((c, i) => (
            <p key={c} className={`g-cap${i === active ? " is-on" : ""}`}><i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i><span>{c}</span></p>
          ))}
        </div>
      </div>
    </div>
  );
}
