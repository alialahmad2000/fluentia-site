/** Seeded generative helpers for «غسق الصحراء»: the same seed always draws the same dunes. */

export function hashSeed(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function rng(seed) {
  let a = typeof seed === "string" ? hashSeed(seed) : seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A dune ridge: sum of skewed sines (long windward slope, short slip face).
 * Returns yAt(x) and path builders. All numbers are rounded: tiny, stable markup.
 */
export function ridge(seed, { w = 1600, base = 600, amp = 60, waves = 3, skew = 0.7 } = {}) {
  const r = rng(seed);
  const parts = [];
  for (let i = 0; i < waves; i++) {
    parts.push({ f: (0.8 + r() * 1.4) * (i + 1) * 0.9, ph: r() * Math.PI * 2, a: 1 / (i + 1.2) });
  }
  const norm = parts.reduce((s, p) => s + p.a, 0);
  const yAt = (x) => {
    const u = (x / w) * Math.PI * 2;
    let v = 0;
    for (const p of parts) {
      const t = u * p.f + p.ph;
      v += p.a * Math.sin(t + skew * Math.sin(t));
    }
    return base - (v / norm) * amp;
  };
  const pts = [];
  const step = w / 40;
  for (let x = 0; x <= w + 0.1; x += step) pts.push([x, yAt(x)]);
  // Catmull-Rom → cubic Bézier
  let d = `M${pts[0][0].toFixed(0)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(0)} ${c1[1].toFixed(1)} ${c2[0].toFixed(0)} ${c2[1].toFixed(1)} ${p2[0].toFixed(0)} ${p2[1].toFixed(1)}`;
  }
  return { yAt, line: d, fill: (h) => `${d}L${w} ${h}L0 ${h}Z` };
}

/** Scatter of stars for the night sky: [x%, y%, r, opacity]. */
export function stars(seed, n = 60) {
  const r = rng(seed);
  return Array.from({ length: n }, () => [r() * 100, r() * 78, 0.5 + r() * 1.1, 0.35 + r() * 0.65]);
}
