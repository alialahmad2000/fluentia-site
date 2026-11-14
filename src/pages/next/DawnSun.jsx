import { MARK_BOX, MARK_PATHS } from "../../lib/brandMark";

/**
 * «الفجر» — the Fluentia F as a rising sun (homepage, since 2026-11-14).
 *
 * The real mark (src/lib/brandMark.js, the official feather-F paths), crisp
 * vector, filled warm at the base and sky at the top: the brand blue meeting
 * the new dawn accent. A soft bloom sits behind it. Pure SVG + CSS (dawn.css):
 * no raster, no box, nothing that could show a seam.
 *
 * `id` keeps the gradient ids unique when the page shows two suns (hero, final).
 */
const [bx, by, bw, bh] = MARK_BOX;
// tone 0 feather rims · 1 the feathers' faces · 2 thin separators · 3 the stem plane
// tone 3 is the whole left half of the F (not a thin shade): it takes a
// slightly deeper version of the same light, so the F reads as ONE lit shape
// with the logo's own two-plane depth. Dark fills there read as a window frame.
const TONE_FILL = ["a", "b", "a", "c"];

export default function DawnSun({ id = "ds", className = "" }) {
  return (
    <div className={`dsun ${className}`} aria-hidden="true">
      <div className="dsun-bloom" />
      <svg className="dsun-mark" viewBox={`${bx} ${by} ${bw} ${bh}`} width={bw} height={bh} focusable="false">
        <defs>
          {/* top → bottom in the mark's own coordinates: a touch of sky at the top,
              warm gold through the body, dawn orange where it meets the horizon */}
          <linearGradient id={`${id}-a`} gradientUnits="userSpaceOnUse" x1="0" y1={by} x2="0" y2={by + bh}>
            <stop offset="0" stopColor="#5CCBFA" />
            <stop offset="0.22" stopColor="#A9DDF2" />
            <stop offset="0.44" stopColor="#FFD08A" />
            <stop offset="0.7" stopColor="#FFB547" />
            <stop offset="1" stopColor="#FF8A4C" />
          </linearGradient>
          {/* the feathers' inner faces: the same light, a shade brighter */}
          <linearGradient id={`${id}-b`} gradientUnits="userSpaceOnUse" x1="0" y1={by} x2="0" y2={by + bh}>
            <stop offset="0" stopColor="#6FD0FA" />
            <stop offset="0.3" stopColor="#FFD592" />
            <stop offset="0.6" stopColor="#FFBC55" />
            <stop offset="1" stopColor="#FF9150" />
          </linearGradient>
          {/* the stem plane: the same light, a step deeper */}
          <linearGradient id={`${id}-c`} gradientUnits="userSpaceOnUse" x1="0" y1={by} x2="0" y2={by + bh}>
            <stop offset="0" stopColor="#38BDF8" />
            <stop offset="0.24" stopColor="#8FCBE6" />
            <stop offset="0.46" stopColor="#F5BE72" />
            <stop offset="0.72" stopColor="#F79A3E" />
            <stop offset="1" stopColor="#F2733F" />
          </linearGradient>
        </defs>
        {MARK_PATHS.map(([tone, d], i) => (
          // a hairline stroke in the same light closes the anti-aliasing seam where two pieces meet
          <path key={i} d={d} fill={`url(#${id}-${TONE_FILL[tone]})`} stroke={`url(#${id}-${TONE_FILL[tone]})`} strokeWidth="0.7" />
        ))}
      </svg>
    </div>
  );
}
