/**
 * JourneyLine — the protagonist's single state.
 *
 * Every renderer of the voice line (preloader, the white page's floor line,
 * the lift into the phone, the recording bars, the track, the arrival wave)
 * reads the same numbers from here and draws the same waveform formula, so
 * the line never "resets" between legs: legs only move the targets, and the
 * values ease toward them.
 */

const state = {
  amp: 0, // waveform amplitude, px at 1× (0 = silent flat line)
  energy: 0, // 0..1 how alive the voice is (speed + glow)
  thick: 2, // stroke width, px
  glow: 0.4, // 0..1
};
const target = { ...state };
let last = 0;
let t = 0;

/** Legs call this; values glide there over ~0.4 s. */
export function voiceTo(next) {
  Object.assign(target, next);
}

/** Renderers call this once per frame; returns the eased state + clock. */
export function voice(now = performance.now()) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  const k = Math.min(1, dt * 6);
  for (const key of Object.keys(state)) state[key] += (target[key] - state[key]) * k;
  t += dt * (0.8 + state.energy * 1.6);
  return { ...state, t };
}

/**
 * The waveform: displacement at u ∈ [0,1] along the line, tapered to zero at
 * both ends so the line always "lands". Same formula everywhere.
 */
export function wave(u, time, amp) {
  const env = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u))), 0.9);
  const s =
    0.55 * Math.sin(2 * Math.PI * 3 * u + time * 1.7) +
    0.3 * Math.sin(2 * Math.PI * 7 * u - time * 2.3) +
    0.15 * Math.sin(2 * Math.PI * 13 * u + time * 3.1);
  return env * s * amp;
}

/** A path string for a horizontal wave from (x0,y) to (x1,y). */
export function wavePath(x0, x1, y, time, amp, n = 96) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = x0 + (x1 - x0) * u;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${(y + wave(u, time, amp)).toFixed(1)}`;
  }
  return d;
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
