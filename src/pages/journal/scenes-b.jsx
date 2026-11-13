import { LIME, WHITE, INK, DISP, seg, ease, f1 } from "./scene-kit";
import SCENES_B_CSS from "./scenes-b.css?inline";

/**
 * Gallery scenes, batch B: spotlight + stage (fear-of-mistakes),
 * paths + roots (adults-learn-differently). Each Art draws from p ∈ [0,1];
 * the frame at p = 1 is the complete, readable one (reduced motion).
 */
export { SCENES_B_CSS };

/* ── spotlight (ink) · a grid of people; our lime light shrinks to one cell ── */
const COLS = 15;
const ROWS = 5;
const PX = (i) => 36 + i * 52;
const PY = (j) => 44 + j * 52;
const MID_I = 7;
const MID_J = 2;
function SpotlightArt({ p }) {
  const t = ease(seg(p, 0.15, 0.8));
  const s = 1 + 16 * (1 - t);
  const cx = PX(MID_I);
  const cy = PY(MID_J);
  const cells = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      if (i === MID_I && j === MID_J) continue;
      const x = PX(i);
      const y = PY(j);
      const idx = j * COLS + i;
      const toUs = Math.atan2(cy - y, cx - x);
      const away = (((idx * 137) % 360) * Math.PI) / 180;
      let d = away - toUs;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      const a = toUs + d * t;
      cells.push(
        <g key={idx}>
          <rect x={x - 20} y={y - 20} width="40" height="40" fill="none" stroke={WHITE} strokeOpacity="0.22" />
          <line x1={f1(x)} y1={f1(y)} x2={f1(x + Math.cos(a) * 13)} y2={f1(y + Math.sin(a) * 13)} stroke={WHITE} strokeOpacity="0.85" strokeWidth="2" strokeLinecap="square" />
          <circle cx={f1(x)} cy={f1(y)} r="3" fill={WHITE} />
        </g>,
      );
    }
  }
  return (
    <svg className="g-spot-svg" viewBox="0 0 800 300" aria-hidden="true">
      {cells}
      <g transform={`translate(${cx} ${cy}) scale(${f1(s)})`}>
        <rect x="-20" y="-20" width="40" height="40" fill={LIME} fillOpacity={f1(0.14 + 0.86 * t)} />
      </g>
      <circle cx={cx} cy={cy} r="4" fill={INK} opacity={f1(t)} />
    </svg>
  );
}

/* ── stage (lime) · a square loop of four words; the traveller breaks out ── */
const CYCLE = ["نخاف", "نسكت", "ما نتدرّب", "يبقى الكلام صعب"];
const CHIPS = [[300, 60], [470, 200], [300, 340], [130, 200]];
const RX = 130, RY = 60, RW = 340, RH = 280;
function StageArt({ p }) {
  const spin = seg(p, 0.02, 0.6);
  const brk = ease(seg(p, 0.66, 0.94));
  const u = spin;
  // traveller along the rectangle perimeter, clockwise, starting top-middle
  const per = 2 * (RW + RH);
  let d = u * per;
  const start = RW / 2;
  const segs = [[RX + RW / 2, RY, 1, 0, RW / 2], [RX + RW, RY, 0, 1, RH], [RX + RW, RY + RH, -1, 0, RW], [RX, RY + RH, 0, -1, RH], [RX, RY, 1, 0, RW / 2]];
  let px = 300, py = 60;
  for (const [sx, sy, dx, dy, len] of segs) {
    const m = Math.min(d, len);
    px = sx + dx * m;
    py = sy + dy * m;
    if (d <= len) break;
    d -= len;
  }
  void start;
  const active = Math.floor(u * 4 + 0.5) % 4;
  const showDot = brk < 0.02;
  const ex = 300 + 270 * brk;
  const ey = 60 - 40 * brk;
  return (
    <svg viewBox="0 0 600 400" aria-hidden="true">
      <path d="M 300 60 L 470 60 L 470 340 L 130 340 L 130 60 L 300 60" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="3 8" pathLength="1" strokeOpacity={f1(1 - brk * 0.85)} />
      {CYCLE.map((label, i) => {
        const [x, y] = CHIPS[i];
        const on = i === active && brk < 0.2 && u > 0.01;
        return (
          <g key={label} className="g-stg-chip">
            <rect x={x - 120} y={y - 28} width="240" height="56" fill={on ? INK : "none"} stroke={INK} strokeWidth="2" />
            <text x={x} y={y + 9} textAnchor="middle" direction="rtl" fill={on ? LIME : INK} style={{ font: `800 24px ${DISP}` }}>{label}</text>
          </g>
        );
      })}
      {showDot ? <rect x={f1(px - 9)} y={f1(py - 9)} width="18" height="18" fill={INK} /> : null}
      {brk > 0 ? (
        <g>
          <line x1="300" y1="32" x2={f1(ex)} y2={f1(ey - 28)} stroke={INK} strokeWidth="6" strokeLinecap="square" />
          <rect x={f1(ex - 11)} y={f1(ey - 39)} width="22" height="22" fill={INK} />
        </g>
      ) : null}
    </svg>
  );
}

/* ── paths (paper) · the long winding walk vs the short line to a lime goal ── */
const CHILD = "M 710 360 C 640 250, 530 400, 470 300 S 550 140, 430 180 S 300 330, 290 220 S 390 90, 260 120 S 150 170, 105 112";
const ADULT = "M 710 360 C 510 320, 280 220, 105 112";
function PathsArt({ p }) {
  const child = ease(seg(p, 0.02, 0.72));
  const adult = ease(seg(p, 0.36, 0.64));
  const ask = ease(seg(p, 0.7, 0.92));
  return (
    <svg viewBox="0 0 800 420" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1="40" y1={50 + k * 55} x2="760" y2={50 + k * 55} stroke={INK} strokeOpacity="0.08" />)}
      <path d={CHILD} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" pathLength="1" strokeDasharray={`${f1(child * 1000) / 1000} 1`} />
      {adult > 0 ? (
        <>
          <path d={ADULT} fill="none" stroke={INK} strokeWidth="20" strokeLinecap="butt" pathLength="1" strokeDasharray={`${f1(adult * 1000) / 1000} 1`} />
          <path d={ADULT} fill="none" stroke={LIME} strokeWidth="14" strokeLinecap="butt" pathLength="1" strokeDasharray={`${f1(adult * 1000) / 1000} 1`} />
        </>
      ) : null}
      <rect x="710" y="352" width="16" height="16" fill={INK} />
      <g transform={`translate(105 95) scale(${f1(1 + 0.12 * Math.sin(ask * Math.PI))})`}>
        <rect x="-38" y="-38" width="76" height="76" fill={LIME} stroke={INK} strokeWidth="2" />
        <path d="M -16 0 H 16 M 0 -16 V 16" stroke={INK} strokeWidth="3" />
      </g>
      <text x="720" y="70" textAnchor="start" direction="rtl" fill={INK} opacity={f1(ask)} style={{ font: `900 56px ${DISP}` }}>وين رايحين؟</text>
    </svg>
  );
}

/* ── roots (ink) · memory strength hangs from a baseline like roots ── */
const REVIEWS = [1, 4, 8];
const RATE = [0.55, 0.3, 0.16, 0.08];
const strength = (day) => {
  let last = 0;
  let k = 0;
  for (const r of REVIEWS) if (day >= r) { last = r; k++; }
  return Math.exp(-RATE[k] * (day - last));
};
const LABELS = [[0, "اليوم", 40], [1, "بكرة", 72], [4, "بعد 3 أيام", 72], [8, "بعد أسبوع", 72]];
const BX = (day) => 40 + day * 48;
function RootsArt({ p }) {
  const end = seg(p, 0.05, 0.92) * 10;
  const bars = [];
  for (let n = 0; n <= 20; n++) {
    const day = n / 2;
    if (day > end + 1e-9) break;
    const rev = REVIEWS.includes(day) || day === 0;
    const h = strength(day) * 290;
    bars.push(<rect key={n} x={BX(day) - 9} y="100" width="18" height={f1(h)} fill={rev ? LIME : WHITE} fillOpacity={rev ? 1 : 0.85} />);
  }
  return (
    <svg viewBox="0 0 560 420" aria-hidden="true">
      <line x1="20" y1="100" x2="540" y2="100" stroke={WHITE} strokeWidth="2" />
      {LABELS.map(([day, label, y]) => (
        <g key={label} opacity={end >= day ? 1 : 0.4}>
          <line x1={BX(day)} y1={y + 8} x2={BX(day)} y2="100" stroke={WHITE} strokeOpacity="0.5" />
          <text x={BX(day)} y={y} textAnchor="middle" direction="rtl" fill={WHITE} style={{ font: `700 21px ${DISP}` }}>{label}</text>
        </g>
      ))}
      {bars}
    </svg>
  );
}

export const SCENES_B = {
  spotlight: {
    Art: SpotlightArt,
    tone: "ink",
    caps: ["نحس إن الضوء كله علينا…", "…والواقع إن أغلب الناس مشغولين بأنفسهم.", "الضوء أصغر بكثير مما نتخيّل."],
  },
  stage: {
    Art: StageArt,
    tone: "lime",
    caps: ["نخاف، فنسكت، فما نتدرّب…", "…فيبقى الكلام صعب، ونخاف أكثر.", "الدائرة ما تنكسر بالتفكير. تنكسر بالتجربة."],
  },
  paths: {
    Art: PathsArt,
    tone: "paper",
    caps: ["الطفل يستكشف المدينة مشي، وعنده وقت كثير.", "الكبير عنده سيارة وخريطة، بس وقته قليل.", "فالفرق كله في سؤال واحد: وين رايحين؟"],
  },
  roots: {
    Art: RootsArt,
    tone: "ink",
    note: "رسم توضيحي",
    caps: ["جملة تعلّمناها اليوم، تبدأ تبهت من بكرة.", "نرجع لها: بكرة، ثم بعد ثلاث أيام، ثم بعد أسبوع.", "وكل مرة، تبهت أبطأ من اللي قبلها."],
  },
};
