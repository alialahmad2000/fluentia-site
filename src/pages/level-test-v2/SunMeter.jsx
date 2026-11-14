/**
 * The sun meter — the one memorable thing on the page. The six levels sit on
 * a rising path out of the horizon (read right to left, like the page); the
 * sun stands on the learner's level, and the sky warms with it.
 * `lvl` null = no level yet (the sun waits below the horizon).
 */
import React, { useId } from 'react';

const CEFR = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
export function sunPoint(i, w = 320, h = 200) {
  const t = i / 5;
  const x = w * 0.86 - w * 0.7 * t;
  const y = h * 0.8 - h * 0.62 * Math.sin((t * Math.PI) / 2);
  return [x, y];
}

export default function SunMeter({ lvl = null, title, compact = false }) {
  const uid = useId().replace(/:/g, '');
  const W = 320; const H = 200; const horizon = H * 0.8;
  const has = Number.isInteger(lvl);
  const [sx, sy] = has ? sunPoint(lvl, W, H) : [W * 0.86, horizon + 26];
  const warmth = has ? 0.25 + lvl * 0.13 : 0.12;
  const path = Array.from({ length: 41 }, (_, k) => sunPoint(k / 8, W, H)).map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg className="lt2-sun" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title || (has ? `المستوى ${CEFR[lvl]}` : 'مقياس المستوى')}>
      <defs>
        <radialGradient id={`sky${uid}`} cx={sx / W} cy={sy / H} r="0.9">
          <stop offset="0" stopColor="#ffb547" stopOpacity={warmth} />
          <stop offset="0.35" stopColor="#ff8a4c" stopOpacity={warmth * 0.45} />
          <stop offset="1" stopColor="#0b1024" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sun${uid}`}>
          <stop offset="0" stopColor="#fff4dc" />
          <stop offset="0.45" stopColor="#ffd08a" />
          <stop offset="1" stopColor="#ffb547" />
        </radialGradient>
        <radialGradient id={`halo${uid}`}>
          <stop offset="0" stopColor="#ffb547" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`above${uid}`}><rect x="0" y="0" width={W} height={horizon} /></clipPath>
      </defs>
      <rect x="0" y="0" width={W} height={horizon} fill={`url(#sky${uid})`} />
      <path d={path} fill="none" stroke="rgba(186,230,253,.22)" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
      {CEFR.map((c, i) => {
        const [x, y] = sunPoint(i, W, H);
        const on = has && i <= lvl;
        return (
          <g key={c}>
            <circle cx={x} cy={y} r={on ? 3.6 : 3} fill={on ? '#ffb547' : 'rgba(186,230,253,.35)'} />
            {!compact && (
              <text x={x} y={has && i === lvl ? y + 34 : y - 10} textAnchor="middle" direction="ltr" fontFamily="'Barlow Condensed','Barlow Fallback',sans-serif" fontWeight="800" fontSize={has && i === lvl ? 15 : 12.5} fill={has && i === lvl ? '#ffb547' : 'rgba(246,241,232,.55)'}>{c}</text>
            )}
          </g>
        );
      })}
      <g clipPath={`url(#above${uid})`}>
        <circle cx={sx} cy={sy} r="38" fill={`url(#halo${uid})`} />
        <circle className="sun-core" cx={sx} cy={sy} r="14" fill={`url(#sun${uid})`} />
      </g>
      <line x1="0" x2={W} y1={horizon} y2={horizon} stroke="rgba(255,181,71,.55)" strokeWidth="1.5" />
      <rect x="0" y={horizon} width={W} height={H - horizon} fill="#060914" opacity=".55" />
    </svg>
  );
}
