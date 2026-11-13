import { LIME, INK, DISP, TEXT, clamp, seg, ease, f1 } from "./scene-kit";
import SCENES_A_CSS from "./scenes-a.css?inline";

export { SCENES_A_CSS };

/**
 * Gallery scenes, set A: understand-but-cant-speak (gap, bridge) and
 * accent-is-not-the-problem (meters, waves). Pure render, no window/document.
 * Strokes use currentColor so each scene inherits ink-on-paper / white-on-ink / ink-on-lime.
 */

/* ── gap · ink · two horizontal slabs, the difference drawn as a dashed void ── */
const GAP_ROWS = [
  { label: "نتعرّف عليه لما نسمعه أو نقرأه", key: "know" },
  { label: "نطلّعه بنفسنا وقت الحاجة", key: "make" },
];
function GapArt({ p }) {
  const a = ease(seg(p, 0.02, 0.4));
  const b = ease(seg(p, 0.3, 0.62));
  const void_ = ease(seg(p, 0.55, 0.9));
  const w1 = (0.2 + 0.68 * a) * 1000;
  const w2 = (0.2 + 0.14 * b) * 1000;
  return (
    <div className="g-gap">
      {GAP_ROWS.map((r, i) => (
        <div className="g-gap-row" key={r.key}>
          <div className="g-gap-label" style={{ opacity: i === 0 ? 1 : f1(0.35 + 0.65 * ease(seg(p, 0.25, 0.5))) }}>{r.label}</div>
          <svg viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <line x1="0" y1="63.5" x2="1000" y2="63.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {i === 0 ? (
              <rect x={f1(1000 - w1)} y="0" width={f1(w1)} height="56" fill="currentColor" />
            ) : (
              <>
                <rect x={f1(1000 - (0.88 * 1000))} y="0" width={f1(0.88 * 1000 - w2)} height="56" fill="none" stroke="currentColor" strokeOpacity={f1(0.6 * void_)} strokeWidth="1.5" strokeDasharray="6 8" vectorEffect="non-scaling-stroke" />
                <rect x={f1(1000 - w2)} y="0" width={f1(w2)} height="56" fill={LIME} />
              </>
            )}
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ── bridge · paper · one arch of planks from the head to the mouth ── */
function BridgeArt({ p }) {
  const t = seg(p, 0.08, 0.9);
  const planks = 14;
  const lit = Math.round(t * planks);
  const pts = [];
  for (let i = 0; i < planks; i++) {
    const u = (i + 0.5) / planks;
    const x = (1 - u) * (1 - u) * 630 + 2 * (1 - u) * u * 435 + u * u * 240;
    const y = (1 - u) * (1 - u) * 170 + 2 * (1 - u) * u * 20 + u * u * 170;
    pts.push([x, y]);
  }
  const done = t >= 0.999;
  return (
    <div className="g-bridge">
      <svg viewBox="0 0 800 300" aria-hidden="true" focusable="false">
        <line x1="20" y1="256" x2="780" y2="256" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="240" y1="170" x2="240" y2="256" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1="630" y1="170" x2="630" y2="256" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <path d="M 630 170 Q 435 20 240 170" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="695" cy="206" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="695" cy="206" r="15" fill={LIME} stroke="currentColor" strokeWidth="1.5" />
        {pts.map(([x, y], i) => (
          <line key={i} x1={f1(x)} y1={f1(y - 14)} x2={f1(x)} y2={f1(y + 14)} stroke="currentColor" strokeOpacity={i < lit ? 1 : 0.16} strokeWidth="7" />
        ))}
        <rect x="30" y="120" width="210" height="136" fill={done ? LIME : "none"} stroke="currentColor" strokeWidth="1.5" />
        <text x="135" y="204" textAnchor="middle" direction="ltr" lang="en" fill={INK} fillOpacity={done ? 1 : 0.3} style={{ font: `900 40px ${DISP}` }}>Hello...</text>
      </svg>
    </div>
  );
}

/* ── meters · lime · three tall columns; the accent column drops, clarity stands ── */
const METERS = [
  ["اللكنة", "accentedness", 0.82, 0.3],
  ["سهولة الفهم", "comprehensibility", 0.78, 0.45],
  ["الوضوح الفعلي", "intelligibility", 0.96, 0.58],
];
function MetersArt({ p }) {
  const fill = ease(seg(p, 0.04, 0.3));
  const turn = ease(seg(p, 0.55, 0.78));
  return (
    <div className="g-meters">
      {METERS.map(([ar, en, a, b], i) => {
        const v = (a + (b - a) * turn) * fill;
        return (
          <div className={`g-mcol${i === 0 ? " is-accent" : ""}`} key={en}>
            <div className="g-mtrack">
              <i style={{ transform: `scaleY(${Math.max(0.02, v).toFixed(3)})` }} />
            </div>
            <div className="g-mlabel">
              <span>{ar}</span>
              <span className="g-men" dir="ltr" lang="en">{en}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── waves · paper · six voices drawn into one clear lime line ── */
function WavesArt({ p }) {
  const t = ease(seg(p, 0.1, 0.9));
  const lines = [];
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
    lines.push(<path key={k} d={d} fill="none" stroke="currentColor" strokeOpacity={f1(0.3 + 0.6 * t)} strokeWidth="1.5" />);
    lines.push(<rect key={`d${k}`} x="0" y={f1(y0 + Math.sin(k) * amp - 5)} width="10" height="10" fill="currentColor" />);
  }
  return (
    <div className="g-waves">
      <svg viewBox="0 0 800 340" aria-hidden="true" focusable="false">
        <line x1="640" y1="20" x2="640" y2="320" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        {lines}
        <rect x="640" y="161" width="160" height="18" fill={LIME} stroke="currentColor" strokeWidth="1.5" opacity={f1(t)} />
      </svg>
    </div>
  );
}

export const SCENES_A = {
  gap: {
    Art: GapArt,
    tone: "ink",
    note: "رسم توضيحي، مب أرقام دراسة",
    caps: ["الكلمات اللي نتعرّف عليها لما تمرّ قدامنا…", "…أكثر بكثير من الكلمات اللي نطلّعها بنفسنا وقت الحاجة.", "الفرق مب جهل. هو طريق ما مشيناه كفاية."],
  },
  bridge: {
    Art: BridgeArt,
    tone: "paper",
    caps: ["الفكرة في الراس، والكلمات موجودة.", "الجسر للفم ينبني لوح لوح، بكل جملة نقولها بصوت.", "لين تطلع الجملة لحالها."],
  },
  meters: {
    Art: MetersArt,
    tone: "lime",
    note: "رسم توضيحي، مب أرقام دراسة",
    caps: ["مدير مشروع بلكنة عربية واضحة، والنبر في مكانه.", "لكنة قوية، والكلام وصل كامل.", "وتقليد لكنة أمريكية بسرعة؟ لكنة أخف، وفهم أصعب."],
  },
  waves: {
    Art: WavesArt,
    tone: "paper",
    caps: ["اللي يتكلمون الإنجليزي لغة ثانية أكثر بكثير من أهلها.", "كل واحد بلكنته.", "واللي يوصل، هو اللي فكرته أوضح."],
  },
};
