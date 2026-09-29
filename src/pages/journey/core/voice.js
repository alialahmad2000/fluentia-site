/**
 * The protagonist — the visitor's voice — as one state and one screen layer.
 *
 * State: every renderer (the fall, the floor line, the lift into the phone,
 * the phone's screen, the live mic line, the road packet, the sea pulse, the
 * arrival wave) reads the same eased numbers and draws the same waveform
 * formula, so the voice never "resets" between legs.
 *
 * Layer: one fixed 2D canvas above the page (VoiceLayer.jsx). Exactly one leg
 * owns it per frame — it calls `claim(owner, draw)` from its update phase; the
 * layer calls that drawer in the render phase, or clears when nobody claimed.
 *
 * Anchors: at every hand-off the outgoing and incoming renderers write their
 * screen points to `window.__jnVoice` so a test can assert they coincide.
 */
const state = { amp: 0, energy: 0, thick: 2.4, glow: 0.5 };
const target = { ...state };
let clock = 0;
let lastT = 0;

export function voiceTo(next) {
  Object.assign(target, next);
}

/** Advance once per frame (call from the owner only). Returns the eased state. */
export function voiceStep(t, dt) {
  if (t === lastT) return { ...state, t: clock };
  lastT = t;
  const k = 1 - Math.exp(-dt * 7);
  for (const key of Object.keys(state)) state[key] += (target[key] - state[key]) * k;
  clock += dt * (0.7 + state.energy * 1.5);
  return { ...state, t: clock };
}

export const voiceNow = () => ({ ...state, t: clock });

/** Displacement at u ∈ [0,1], tapered at both ends so the line always lands. */
export function wave(u, t, amp, calm = 0) {
  const x = Math.min(1, Math.max(0, u));
  const env = Math.pow(Math.sin(Math.PI * x), 0.9);
  const s =
    0.55 * Math.sin(2 * Math.PI * 3 * x + t * 1.7) +
    (0.3 - calm * 0.08) * Math.sin(2 * Math.PI * 7 * x - t * 2.3) +
    (0.15 - calm * 0.1) * Math.sin(2 * Math.PI * 13 * x + t * 3.1);
  return env * s * amp;
}

/* ── the screen layer ── */
let owner = null;
let drawer = null;
let claimedAt = -1;
let claimedPrio = 0;

/** Own the layer for this frame. When two legs overlap, the higher prio wins. */
export function claim(name, draw, t, prio = 0) {
  if (claimedAt === t && prio < claimedPrio) return;
  owner = name;
  drawer = draw;
  claimedAt = t;
  claimedPrio = prio;
}
export function currentDrawer(t) {
  return claimedAt === t ? { owner, drawer } : null;
}

export function anchor(name, x, y) {
  if (typeof window === "undefined") return;
  const a = (window.__jnVoice = window.__jnVoice || {});
  a[name] = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export const SKY = "#38bdf8";
export const ICE = "#7dd3fc";

/** Stroke a polyline as the voice: a wide low-alpha under-stroke, then the core. */
export function strokeVoice(ctx, pts, { thick = 2.4, glow = 0, color = SKY, alpha = 1 } = {}) {
  if (!pts || pts.length < 2) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (glow > 0) {
    ctx.globalAlpha = alpha * glow * 0.35;
    ctx.strokeStyle = color;
    ctx.lineWidth = thick * 6;
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = thick;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
