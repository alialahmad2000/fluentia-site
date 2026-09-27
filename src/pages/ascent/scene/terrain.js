/**
 * The mountain — one height function, written twice.
 *
 * The GPU displaces every terrain vertex with the GLSL below; the camera, the
 * fixed rope, the tents and the ladders are placed with the JS mirror, so they
 * sit on the same surface the shader draws. Both use the same integer hash
 * (WebGL2 has uint maths; JS gets the identical low 32 bits from Math.imul),
 * so the two agree to float precision.
 *
 * World: x east, z south (toward the viewer at base camp), y up. The summit is
 * at the origin, 1,500 units high. The climb comes up the glacier valley from
 * z ≈ 3,000: base camp → icefall (seracs) → the flat basin between two shoulders
 * → the steep south face → the summit ridge.
 */

export const SUMMIT_H = 1500;

/* ─── shared GLSL ─────────────────────────────────────────────────────────── */

export const NOISE_GLSL = /* glsl */ `
uint as_hash(uvec2 q) {
  q = q * uvec2(1597334673u, 3812015801u);
  return (q.x ^ q.y) * 1597334673u;
}
vec2 as_grad(ivec2 c) {
  uint h = as_hash(uvec2(c + 4096));
  float a = float(h) * (6.2831853 / 4294967296.0);
  return vec2(cos(a), sin(a));
}
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  ivec2 c = ivec2(i);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(as_grad(c), f);
  float b = dot(as_grad(c + ivec2(1, 0)), f - vec2(1.0, 0.0));
  float d = dot(as_grad(c + ivec2(0, 1)), f - vec2(0.0, 1.0));
  float e = dot(as_grad(c + ivec2(1, 1)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y) * 1.4;
}
float ridged(vec2 p, int oct) {
  float sum = 0.0, amp = 0.5, w = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= oct) break;
    float n = 1.0 - abs(gnoise(p));
    n *= n;
    n *= w;
    w = clamp(n * 2.0, 0.0, 1.0);
    sum += n * amp;
    p = vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y);
    amp *= 0.5;
  }
  return sum;
}
float fbm(vec2 p, int oct) {
  float sum = 0.0, amp = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= oct) break;
    sum += gnoise(p) * amp;
    p = vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y);
    amp *= 0.5;
  }
  return sum;
}
float smax(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
  return mix(b, a, h) + k * h * (1.0 - h);
}
`;

export const HEIGHT_GLSL = /* glsl */ `
float valleyX(float z) { return 150.0 + 140.0 * sin(z / 650.0 + 0.4); }
float floorH(float z) {
  return 20.0 + 250.0 * smoothstep(2700.0, 1850.0, z) + 150.0 * smoothstep(1800.0, 900.0, z);
}
float terrainH(vec2 p, int oct) {
  float x = p.x, z = p.y;
  float r = length(p);
  float ang = atan(z, x);
  float faces = 1.0 + 0.24 * abs(sin(1.5 * (ang - 0.35)));
  float h = 1560.0 * pow(max(0.0, 1.0 - r * faces / 2500.0), 1.55);
  vec2 qn = (p - vec2(-720.0, 1500.0)) * vec2(1.0, 0.5);
  h = smax(h, 1080.0 * pow(max(0.0, 1.0 - length(qn) / 820.0), 1.35), 160.0);
  vec2 ql = p - vec2(840.0, 560.0);
  h = smax(h, 1330.0 * pow(max(0.0, 1.0 - length(ql) / 1180.0), 1.45), 160.0);
  float ring = smoothstep(4300.0, 8000.0, r);
  h = max(h, ring * (700.0 + 900.0 * smoothstep(-0.5, 0.6, gnoise(p / 5200.0))) * ridged(p / 1900.0 + 7.3, oct));
  float det = ridged(p / 560.0, oct);
  h += (det - 0.35) * (50.0 + 0.22 * h);
  h += fbm(p / 140.0, 4) * (8.0 + 0.04 * h);
  float vx = valleyX(z);
  float vm = smoothstep(430.0, 150.0, abs(x - vx)) * smoothstep(820.0, 1180.0, z) * smoothstep(4200.0, 3700.0, z);
  float ice = smoothstep(2820.0, 2560.0, z) * smoothstep(1720.0, 1940.0, z);
  float fl = floorH(z) + fbm(p / 220.0, 3) * 12.0;
  fl += floor(max(0.0, gnoise(p / 38.0) + 0.2) * 4.0) * 0.25 * 26.0 * ice;
  return mix(h, fl, vm);
}
`;

/* ─── JS mirror ───────────────────────────────────────────────────────────── */

const TAU32 = 6.2831853 / 4294967296;

function grad(ix, iy) {
  const a = Math.imul((ix + 4096) >>> 0, 1597334673) >>> 0;
  const b = Math.imul((iy + 4096) >>> 0, 3812015801) >>> 0;
  const h = Math.imul((a ^ b) >>> 0, 1597334673) >>> 0;
  const ang = h * TAU32;
  return [Math.cos(ang), Math.sin(ang)];
}

export function gnoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const g00 = grad(ix, iy);
  const g10 = grad(ix + 1, iy);
  const g01 = grad(ix, iy + 1);
  const g11 = grad(ix + 1, iy + 1);
  const a = g00[0] * fx + g00[1] * fy;
  const b = g10[0] * (fx - 1) + g10[1] * fy;
  const d = g01[0] * fx + g01[1] * (fy - 1);
  const e = g11[0] * (fx - 1) + g11[1] * (fy - 1);
  const top = a + (b - a) * ux;
  const bot = d + (e - d) * ux;
  return (top + (bot - top) * uy) * 1.4;
}

function ridged(x, y, oct) {
  let sum = 0;
  let amp = 0.5;
  let w = 1;
  for (let i = 0; i < oct; i++) {
    let n = 1 - Math.abs(gnoise(x, y));
    n *= n;
    n *= w;
    w = Math.min(1, Math.max(0, n * 2));
    sum += n * amp;
    const nx = 1.6 * x - 1.2 * y;
    y = 1.2 * x + 1.6 * y;
    x = nx;
    amp *= 0.5;
  }
  return sum;
}

function fbm(x, y, oct) {
  let sum = 0;
  let amp = 0.5;
  for (let i = 0; i < oct; i++) {
    sum += gnoise(x, y) * amp;
    const nx = 1.6 * x - 1.2 * y;
    y = 1.2 * x + 1.6 * y;
    x = nx;
    amp *= 0.5;
  }
  return sum;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
export function smoothstep(e0, e1, v) {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
function smax(a, b, k) {
  const h = clamp01(0.5 + (0.5 * (a - b)) / k);
  return b + (a - b) * h + k * h * (1 - h);
}

export const valleyX = (z) => 150 + 140 * Math.sin(z / 650 + 0.4);
const floorH = (z) => 20 + 250 * smoothstep(2700, 1850, z) + 150 * smoothstep(1800, 900, z);

export function terrainH(x, z, oct = 7) {
  const r = Math.hypot(x, z);
  const ang = Math.atan2(z, x);
  const faces = 1 + 0.24 * Math.abs(Math.sin(1.5 * (ang - 0.35)));
  let h = 1560 * Math.pow(Math.max(0, 1 - (r * faces) / 2500), 1.55);
  const qnx = x + 720;
  const qnz = (z - 1500) * 0.5;
  h = smax(h, 1080 * Math.pow(Math.max(0, 1 - Math.hypot(qnx, qnz) / 820), 1.35), 160);
  h = smax(h, 1330 * Math.pow(Math.max(0, 1 - Math.hypot(x - 840, z - 560) / 1180), 1.45), 160);
  const ring = smoothstep(4300, 8000, r);
  h = Math.max(h, ring * (700 + 900 * smoothstep(-0.5, 0.6, gnoise(x / 5200, z / 5200))) * ridged(x / 1900 + 7.3, z / 1900 + 7.3, oct));
  const det = ridged(x / 560, z / 560, oct);
  h += (det - 0.35) * (50 + 0.22 * h);
  h += fbm(x / 140, z / 140, 4) * (8 + 0.04 * h);
  const vx = valleyX(z);
  const vm = smoothstep(430, 150, Math.abs(x - vx)) * smoothstep(820, 1180, z) * smoothstep(4200, 3700, z);
  const ice = smoothstep(2820, 2560, z) * smoothstep(1720, 1940, z);
  let fl = floorH(z) + fbm(x / 220, z / 220, 3) * 12;
  fl += Math.floor(Math.max(0, gnoise(x / 38, z / 38) + 0.2) * 4) * 0.25 * 26 * ice;
  return h + (fl - h) * vm;
}
