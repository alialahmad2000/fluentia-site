/**
 * The light of each camp, and how the page moves between them.
 *
 * `p` is the ascent position: 0 = base camp, 1 = icefall, 2 = basin, 3 = fixed
 * rope, 4 = high zone, 5 = summit, 6 = below the clouds. Each chapter holds its
 * own light for almost its whole length and hands over to the next inside a
 * narrow band around the boundary — the same band the white bloom covers, so
 * the change of light is never seen happening.
 *
 * No three.js in here: the page uses it too (the white bloom, the tone of the
 * header), and the low tier never downloads three.
 */

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const dir = (azDeg, elDeg) => {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  // az 0 = north (−z), 90 = east (+x)
  return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
};

const K = [
  // 0 · base camp — soft morning haze
  {
    skyTop: "#9fb6cc", skyMid: "#c4d3e2", skyHor: "#dfe8f1", fogCol: "#dde6ef", fogDen: 0.00034, fogFall: 0.0016,
    sun: dir(118, 13), sunCol: "#fff0d8", sunI: 1.05, sunVis: 0.55, amb: "#b9c9da", ambG: "#8795a6",
    stars: 0, clouds: 0, gold: "#000000", rim: 0.0, snow: 0.22, wind: 2.5, streak: 0.0,
    snowCol: "#ffffff", cloudLit: "#ffffff", cloudDark: "#b8c6d6",
  },
  // 1 · icefall — bright, cold, high sun
  {
    skyTop: "#a9d3f2", skyMid: "#cde8fb", skyHor: "#eaf6ff", fogCol: "#e8f3fb", fogDen: 0.00018, fogFall: 0.0012,
    sun: dir(150, 56), sunCol: "#f6fbff", sunI: 1.18, sunVis: 0.35, amb: "#bcdcf4", ambG: "#7fa3c4",
    stars: 0, clouds: 0, gold: "#000000", rim: 0.0, snow: 0.28, wind: 4, streak: 0.0,
    snowCol: "#ffffff", cloudLit: "#ffffff", cloudDark: "#c4d6e6",
  },
  // 2 · basin — the whiteout: near-white sky, heavy white fog, diffuse light
  {
    skyTop: "#eef4f9", skyMid: "#f1f6fa", skyHor: "#f4f8fb", fogCol: "#f4f8fb", fogDen: 0.0042, fogFall: 0.0008,
    sun: dir(160, 40), sunCol: "#ffffff", sunI: 0.35, sunVis: 0.0, amb: "#f1f6fb", ambG: "#d6e1ec",
    stars: 0, clouds: 0, gold: "#000000", rim: 0.0, snow: 0.34, wind: 0.35, streak: 0.0,
    snowCol: "#dfe8f2", cloudLit: "#ffffff", cloudDark: "#dfe8f1",
  },
  // 3 · fixed rope — deep blue face, side light
  {
    skyTop: "#0e3a66", skyMid: "#1f6fae", skyHor: "#38bdf8", fogCol: "#3d78ad", fogDen: 0.00016, fogFall: 0.0011,
    sun: dir(262, 9), sunCol: "#a8dcff", sunI: 0.95, sunVis: 0.25, amb: "#2a5e92", ambG: "#0f2c4d",
    stars: 0.05, clouds: 0, gold: "#000000", rim: 0.25, snow: 0.42, wind: 8, streak: 0.35,
    snowCol: "#cfeaff", cloudLit: "#9fd3f5", cloudDark: "#1d4a78",
  },
  // 4 · high zone — night, dark rock, stars, wind
  {
    skyTop: "#050b16", skyMid: "#07122a", skyHor: "#0a1a33", fogCol: "#0b1a30", fogDen: 0.00006, fogFall: 0.0009,
    sun: dir(225, 34), sunCol: "#9db4d6", sunI: 0.42, sunVis: 0.0, amb: "#1a2d4d", ambG: "#070f1d",
    stars: 1, clouds: 0.15, gold: "#000000", rim: 0.12, snow: 0.95, wind: 26, streak: 1.0,
    snowCol: "#b9cbe6", cloudLit: "#3b5378", cloudDark: "#0b1628",
  },
  // 5 · summit — sunrise over a sea of cloud
  {
    skyTop: "#1a2f5e", skyMid: "#e98f63", skyHor: "#ffd79a", fogCol: "#e9c793", fogDen: 0.00005, fogFall: 0.0008,
    sun: dir(96, 2.5), sunCol: "#ffb54a", sunI: 1.45, sunVis: 1.0, amb: "#3a4a70", ambG: "#1a2238",
    stars: 0.18, clouds: 1, gold: "#fbbf24", rim: 1.0, snow: 0.08, wind: 5, streak: 0.2,
    snowCol: "#ffe6c4", cloudLit: "#ffe0a8", cloudDark: "#5d6b92",
  },
  // 6 · below the clouds — calm cloud sea at dawn
  {
    skyTop: "#244077", skyMid: "#eea06f", skyHor: "#ffe6b0", fogCol: "#f0d3a2", fogDen: 0.00005, fogFall: 0.0008,
    sun: dir(98, 7), sunCol: "#ffcf86", sunI: 1.3, sunVis: 1.0, amb: "#4a5a82", ambG: "#1d2640",
    stars: 0, clouds: 1, gold: "#f5b94a", rim: 0.7, snow: 0.0, wind: 3, streak: 0.0,
    snowCol: "#ffffff", cloudLit: "#fff0d0", cloudDark: "#7584a8",
  },
];

const COLOR_KEYS = ["skyTop", "skyMid", "skyHor", "fogCol", "sunCol", "amb", "ambG", "gold", "snowCol", "cloudLit", "cloudDark"];
const NUM_KEYS = ["fogDen", "fogFall", "sunI", "sunVis", "stars", "clouds", "rim", "snow", "wind", "streak"];

const KEYS = K.map((k) => {
  const o = { sun: k.sun };
  COLOR_KEYS.forEach((c) => (o[c] = hex(k[c])));
  NUM_KEYS.forEach((c) => (o[c] = k[c]));
  return o;
});

export const LAST = KEYS.length - 1;
const HALF = 0.09;

const ss = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Weight of each boundary crossed at p (telescoping mix). */
function weights(p) {
  const w = [];
  for (let b = 1; b <= LAST; b++) w.push(ss(b - HALF, b + HALF, p));
  return w;
}

/** The interpolated look at p, written into `out` (reused every frame). */
export function lookAt(p, out = {}) {
  const w = weights(p);
  const lerpInto = (key, n) => {
    if (n === 1) {
      let v = KEYS[0][key];
      for (let b = 1; b <= LAST; b++) v += (KEYS[b][key] - KEYS[b - 1][key]) * w[b - 1];
      out[key] = v;
      return;
    }
    const arr = out[key] || (out[key] = new Array(n));
    for (let i = 0; i < n; i++) {
      let v = KEYS[0][key][i];
      for (let b = 1; b <= LAST; b++) v += (KEYS[b][key][i] - KEYS[b - 1][key][i]) * w[b - 1];
      arr[i] = v;
    }
  };
  COLOR_KEYS.forEach((c) => lerpInto(c, 3));
  NUM_KEYS.forEach((c) => lerpInto(c, 1));
  lerpInto("sun", 3);
  const s = out.sun;
  const l = Math.hypot(s[0], s[1], s[2]) || 1;
  s[0] /= l;
  s[1] /= l;
  s[2] /= l;
  // The fog of the basin swells toward its middle and thins as the face appears.
  const basin = ss(1.9, 2.25, p) * (1 - ss(2.55, 2.95, p));
  out.fogDen *= 1 + basin * 1.6;
  return out;
}

/**
 * The white bloom over the canvas: a short flash at every boundary, and the
 * basin held almost white. 0..1.
 */
export function whiteAt(p) {
  let v = 0;
  // no bloom into «below the clouds»: the summit settles, it does not flash
  for (let b = 1; b < LAST; b++) {
    const d = Math.abs(p - b);
    if (d < 0.09) v = Math.max(v, 0.85 * (1 - ss(0, 0.09, d)));
  }
  const basin = ss(2.02, 2.2, p) * (1 - ss(2.62, 2.92, p));
  return Math.max(v, basin * 0.78);
}

/** Light chapters carry navy text; dark ones cream. */
export const TONES = ["light", "light", "light", "dark", "dark", "dark", "dark"];
