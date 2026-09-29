/**
 * The phone's pose across the «أول كلمة» pin — one function shared by the 3D
 * scene, the DOM phone (low tier) and the voice line, so the line meets the
 * microphone exactly where the phone is drawn.
 *
 *   p 0.06–0.32  lowered from above (a crane's load: decelerating into the touch)
 *   p 0.32       contact — the mic touches the silent line
 *   p 0.32–0.56  lifted to rest, pulling the line up by its middle
 *   p ≥ 0.56     at rest, face-on; a slow sway keeps it alive
 *
 * rest = the DOM phone's box in screen px {x, y, w, h} (measured from CSS).
 * Returns centre (px), rotations (rad) and the mic point (px).
 */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const win = (p, a, b) => clamp01((p - a) / (b - a));
const out3 = (t) => 1 - Math.pow(1 - t, 3);
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const DEG = Math.PI / 180;

export function phonePose(p, rest, floorY, H, time = 0, still = false) {
  const cxRest = rest.x + rest.w / 2;
  const cyRest = rest.y + rest.h / 2;
  const contactCy = floorY - rest.h / 2;
  const startCy = -rest.h * 0.62;
  // on a phone it comes in on a diagonal from the inline-end (left) side, clear of the title
  const narrow = rest.w < 300;
  const startCx = narrow ? cxRest - rest.w * 1.1 : cxRest;
  const down = out3(win(p, 0.06, 0.3));
  // 0.30–0.35: it rests on the line for a moment (the touch), then lifts
  const lift = inOut(win(p, 0.35, 0.56));
  let cy = lerp(startCy, contactCy, down);
  cy = lerp(cy, cyRest, lift);
  const settle = inOut(win(p, 0.06, 0.56));
  // alive at rest, but perfectly still by the swap to the DOM phone
  const calm = still ? 0 : 1 - win(p, 0.8, 0.87);
  const sway = Math.sin(time * 0.7) * 0.022 * calm;
  const rx = lerp(13 * DEG, 0, settle) + Math.sin(time * 0.5) * 0.012 * calm;
  const ry = lerp(-24 * DEG, 0, settle) + sway;
  const rz = lerp((narrow ? 12 : 5) * DEG, 0, settle);
  const cx = lerp(startCx, cxRest, out3(win(p, 0.06, 0.3)));
  // the mic sits on the bottom edge; with the phone nearly face-on its
  // projection is the bottom-centre of the box
  const micX = cx - Math.sin(rz) * (rest.h / 2) + Math.sin(ry) * rest.h * 0.02;
  const micY = cy + (rest.h / 2) * Math.cos(rx);
  return { cx, cy, rx, ry, rz, micX, micY, visible: cy + rest.h / 2 > 0 && cy - rest.h / 2 < H, lift, down };
}
