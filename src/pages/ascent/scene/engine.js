import * as THREE from "three";
import { NOISE_GLSL, HEIGHT_GLSL, terrainH, valleyX } from "./terrain";
import { lookAt } from "./looks";
import { cameraSamples, lookTargets, ropePoints, groundAt } from "./path";

/**
 * The ascent — one live procedural mountain in one canvas.
 *
 * createAscent() builds everything once; frame(p, now) draws the climb at
 * ascent position p (0 base camp … 6 below the clouds). No textures, no models:
 * the terrain, sky, fog, snow, rope and cloud sea are all shaders. Nothing here
 * touches the DOM beyond its own canvas; the page owns scroll, layout and text.
 */

const CLOUD_Y = 840;

const COMMON = /* glsl */ `
uniform vec3 uCam;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform float uSunI;
uniform vec3 uFogCol;
uniform float uFogDen;
uniform float uFogFall;
uniform float uTime;
vec3 applyFog(vec3 col, vec3 wp) {
  vec3 d = wp - uCam;
  float dist = length(d);
  vec3 rd = d / max(dist, 1e-3);
  float fy = uFogFall * rd.y * dist;
  float integ = abs(fy) > 1e-4 ? (1.0 - exp(-fy)) / fy : 1.0;
  float amount = uFogDen * exp(-uFogFall * uCam.y) * dist * integ;
  float f = clamp(1.0 - exp(-amount), 0.0, 1.0);
  float sunAmt = pow(max(dot(rd, uSunDir), 0.0), 8.0);
  vec3 fc = mix(uFogCol, uSunCol, sunAmt * 0.3);
  return mix(col, fc, f);
}
float hash13(vec3 c) {
  ivec3 i = ivec3(floor(c)) + 4096;
  uint h = as_hash(uvec2(i.xy)) ^ (uint(i.z) * 2654435761u);
  h = h * 1597334673u;
  return float(h) * (1.0 / 4294967296.0);
}
`;

/* ─── sky ─────────────────────────────────────────────────────────────────── */

const SKY_VS = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`;
const SKY_FS = /* glsl */ `
${NOISE_GLSL}
${COMMON}
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyHor;
uniform vec3 uGold;
uniform float uSunVis;
uniform float uStars;
varying vec3 vDir;
void main() {
  vec3 rd = normalize(vDir);
  float e = rd.y;
  float t = clamp(e, 0.0, 1.0);
  vec3 col = mix(uSkyHor, uSkyMid, smoothstep(0.0, 0.22, pow(t, 0.8)));
  col = mix(col, uSkyTop, smoothstep(0.12, 0.75, t));
  col = mix(col, uFogCol, smoothstep(0.03, -0.1, e));
  vec2 sa = normalize(uSunDir.xz + 1e-5);
  vec2 ra = normalize(rd.xz + 1e-5);
  float az = dot(sa, ra) * 0.5 + 0.5;
  col += uGold * exp(-max(e + 0.02, 0.0) * 10.0) * (0.25 + 0.75 * pow(az, 4.0));
  float sd = dot(rd, uSunDir);
  col += uSunCol * (pow(max(sd, 0.0), 420.0) * 1.4 + pow(max(sd, 0.0), 14.0) * 0.22) * uSunVis;
  col = mix(col, vec3(1.0, 0.97, 0.9), smoothstep(0.99955, 0.99975, sd) * uSunVis);
  if (uStars > 0.001) {
    vec3 sp = rd * 150.0;
    vec3 cell = floor(sp);
    float h = hash13(cell);
    vec3 jit = vec3(hash13(cell + 11.0), hash13(cell + 23.0), hash13(cell + 37.0)) - 0.5;
    float r = length(fract(sp) - 0.5 - jit * 0.6);
    float big = step(0.996, h);
    float star = smoothstep(0.1 + big * 0.07, 0.0, r) * step(0.975, h);
    star *= 0.55 + 0.45 * sin(uTime * (1.5 + h * 3.0) + h * 60.0);
    float band = smoothstep(0.35, 0.0, abs(rd.x * 0.6 + rd.y * 0.5 - rd.z * 0.62));
    float dust = (fbm(rd.xz * 7.0 + rd.y * 3.0, 3) * 0.5 + 0.5) * band * 0.06;
    col += (star * (0.8 + big * 1.4) + dust) * uStars * smoothstep(-0.02, 0.18, e);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ─── terrain ─────────────────────────────────────────────────────────────── */

const TERRAIN_VS = (oct) => /* glsl */ `
#define OCT ${oct}
${NOISE_GLSL}
${HEIGHT_GLSL}
varying vec3 vWorld;
varying vec3 vNrm;
void main() {
  vec2 p = position.xz;
  float h = terrainH(p, OCT);
  float e = 4.0;
  float hx = terrainH(p + vec2(e, 0.0), OCT);
  float hz = terrainH(p + vec2(0.0, e), OCT);
  vNrm = normalize(vec3(h - hx, e, h - hz));
  vWorld = vec3(p.x, h, p.y);
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;
const TERRAIN_FS = /* glsl */ `
${NOISE_GLSL}
${COMMON}
uniform vec3 uAmb;
uniform vec3 uAmbG;
uniform float uRim;
uniform vec3 uGold;
uniform float uTerm;
uniform float uSweep;
varying vec3 vWorld;
varying vec3 vNrm;
void main() {
  vec2 p = vWorld.xz;
  float dist = distance(vWorld, uCam);
  vec3 n = normalize(vNrm);
  // close-up relief the mesh is too coarse to carry
  float near = 1.0 - smoothstep(120.0, 900.0, dist);
  if (near > 0.0) {
    float e = 1.2;
    float b0 = fbm(p / 16.0, 3);
    float bx = fbm((p + vec2(e, 0.0)) / 16.0, 3);
    float bz = fbm((p + vec2(0.0, e)) / 16.0, 3);
    n = normalize(n + vec3(b0 - bx, 0.0, b0 - bz) * (3.2 / e) * near);
  }
  float slope = 1.0 - n.y;
  float h = vWorld.y;
  float nz = gnoise(p / 55.0);
  float rock = smoothstep(0.36, 0.52, slope + nz * 0.09 - smoothstep(1300.0, 1800.0, h) * 0.04);
  vec3 snow = vec3(0.95, 0.97, 0.995);
  vec3 rockC = mix(vec3(0.13, 0.15, 0.19), vec3(0.27, 0.26, 0.27), gnoise(p / 22.0) * 0.5 + 0.5);
  rockC *= 0.8 + 0.4 * smoothstep(-0.4, 0.6, gnoise(p / 9.0));
  float iceBand = smoothstep(170.0, 330.0, h) * smoothstep(1150.0, 820.0, h) * smoothstep(0.14, 0.3, slope);
  vec3 ice = vec3(0.55, 0.78, 0.94);
  vec3 alb = mix(snow, ice, iceBand * 0.75);
  // crevasses across the icefall and the lower basin
  float cz = smoothstep(2820.0, 2520.0, p.y) * smoothstep(1450.0, 1850.0, p.y) * smoothstep(520.0, 200.0, abs(p.x - (150.0 + 140.0 * sin(p.y / 650.0 + 0.4))));
  // crevasses run across the flow: stretched along x, tight along z, broken up
  float cn = gnoise(vec2(p.x / 150.0, p.y / 13.0) + vec2(gnoise(p / 60.0) * 0.6, 3.0));
  float crack = (1.0 - smoothstep(0.0, 0.09, abs(cn))) * smoothstep(-0.1, 0.35, gnoise(p / 45.0 + 9.0));
  float lip = (1.0 - smoothstep(0.09, 0.2, abs(cn))) * smoothstep(-0.1, 0.35, gnoise(p / 45.0 + 9.0));
  alb = mix(alb, vec3(0.7, 0.86, 0.96), lip * cz * 0.5);
  alb = mix(alb, vec3(0.04, 0.2, 0.4), crack * cz * (1.0 - smoothstep(350.0, 1300.0, dist) * 0.8));
  alb = mix(alb, rockC, rock);
  // sun: wrapped diffuse; at sunrise the first light sweeps down from the top
  float ndl = dot(n, uSunDir);
  float diff = clamp(ndl * 0.8 + 0.2, 0.0, 1.0);
  float lit = mix(1.0, smoothstep(uTerm - 60.0, uTerm + 60.0, h), uSweep);
  vec3 amb = mix(uAmbG, uAmb, n.y * 0.5 + 0.5);
  vec3 col = alb * (uSunCol * diff * uSunI * lit * 0.74 + amb * 0.66);
  vec3 V = normalize(uCam - vWorld);
  // snow glitter at grazing light
  float g = step(0.993, hash13(vWorld * 1.6)) * (1.0 - rock) * (1.0 - smoothstep(40.0, 260.0, dist));
  col += g * uSunCol * pow(max(dot(reflect(-uSunDir, n), V), 0.0), 4.0) * 1.8 * uSunI;
  // gold rim on the peak's edges at sunrise
  float fres = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 3.0);
  col += uGold * fres * max(ndl + 0.35, 0.0) * uRim * 0.8 * lit;
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ─── cloud sea ───────────────────────────────────────────────────────────── */

const CLOUD_VS = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const CLOUD_FS = (oct) => /* glsl */ `
#define OCTC ${oct}
${NOISE_GLSL}
${COMMON}
uniform float uClouds;
uniform vec3 uCloudLit;
uniform vec3 uCloudDark;
uniform vec3 uSkyHor;
varying vec3 vWorld;
void main() {
  vec2 p = vWorld.xz / 1700.0 + vec2(uTime * 0.0035, uTime * 0.0012);
  float d = fbm(p, OCTC) * 0.5 + 0.5;
  d = d * 0.72 + (fbm(p * 2.9 + 3.1, OCTC) * 0.5 + 0.5) * 0.28;
  float dens = smoothstep(0.26, 0.5, d);
  float ds = fbm(p + uSunDir.xz * 0.06, OCTC) * 0.5 + 0.5;
  float lit = clamp(0.5 + (d - ds) * 6.0, 0.0, 1.0);
  vec3 col = mix(uCloudDark, uCloudLit, lit);
  vec3 rd = normalize(vWorld - uCam);
  col += uSunCol * pow(max(dot(rd, uSunDir), 0.0), 5.0) * 0.45;
  float dist = distance(vWorld.xz, uCam.xz);
  col = mix(col, uSkyHor, smoothstep(2500.0, 17000.0, dist) * 0.85);
  // a sea, not scattered puffs: always nearly opaque, the texture is in the light
  col = mix(uCloudDark * 0.9 + uCloudLit * 0.1, col, 0.35 + 0.65 * dens);
  float a = mix(0.86, 1.0, dens) * uClouds * (1.0 - smoothstep(15000.0, 19500.0, dist));
  gl_FragColor = vec4(col, a);
}
`;

/* ─── snow ────────────────────────────────────────────────────────────────── */

const SNOW_VS = /* glsl */ `
attribute vec4 seed;
uniform vec3 uCam;
uniform vec3 uWind;
uniform float uTime;
uniform float uBox;
uniform float uSnow;
uniform float uStreak;
uniform vec2 uRes;
uniform float uPx;
varying float vA;
varying vec2 vDir;
varying float vLen;
void main() {
  float speed = 0.7 + seed.w * 0.6;
  vec3 off = seed.xyz * uBox + uWind * uTime * speed;
  off.y -= uTime * (2.5 + seed.w * 2.5);
  vec3 rel = mod(off - uCam, uBox) - 0.5 * uBox;
  vec3 wp = uCam + rel;
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  vec4 c1 = projectionMatrix * mv;
  vec4 c2 = projectionMatrix * viewMatrix * vec4(wp + (uWind * speed + vec3(0.0, -3.0, 0.0)) * 0.035, 1.0);
  vec2 dv = (c2.xy / c2.w - c1.xy / c1.w) * uRes * 0.5;
  float len = length(dv);
  vDir = len > 1e-4 ? dv / len : vec2(0.0, 1.0);
  vLen = clamp(len * uStreak * 0.35, 0.0, 7.0);
  float size = (0.6 + seed.w * 0.9) * uPx * 26.0 / max(-mv.z, 0.5);
  gl_PointSize = clamp(size, 1.0, 34.0) * (1.0 + vLen * 0.6);
  float on = step(seed.w, uSnow);
  vA = on * (1.0 - smoothstep(0.3 * uBox, 0.5 * uBox, length(rel))) * smoothstep(0.8, 3.0, -mv.z);
  gl_Position = c1;
}
`;
const SNOW_FS = /* glsl */ `
uniform vec3 uSnowCol;
varying float vA;
varying vec2 vDir;
varying float vLen;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  c.y = -c.y;
  vec2 q = vec2(dot(c, vDir), dot(c, vec2(-vDir.y, vDir.x)) * (1.0 + vLen * 0.6));
  float a = smoothstep(1.0, 0.15, length(q)) * vA;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uSnowCol, a * 0.85);
}
`;

/* ─── rope, anchors, props ────────────────────────────────────────────────── */

const ROPE_VS = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vN;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const ROPE_FS = /* glsl */ `
${NOISE_GLSL}
${COMMON}
uniform float uDraw;
uniform float uGlow;
uniform vec3 uRope;
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vN;
void main() {
  if (vUv.x > uDraw) discard;
  float tip = smoothstep(uDraw - 0.025, uDraw, vUv.x);
  vec3 V = normalize(uCam - vWorld);
  float face = clamp(dot(normalize(vN), V), 0.0, 1.0);
  float pulse = 0.5 + 0.5 * sin(vUv.x * 90.0 - uTime * 3.0);
  vec3 col = uRope * (1.1 + tip * 2.2 + pulse * 0.25);
  float a = 1.0;
  if (uGlow > 0.5) {
    a = pow(face, 2.2) * (0.28 + tip * 0.5);
    col = uRope * 1.6;
  }
  gl_FragColor = vec4(col, a);
}
`;

const ANCHOR_VS = /* glsl */ `
attribute float at;
uniform float uDraw;
uniform float uPx;
varying float vOn;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vOn = smoothstep(at - 0.01, at + 0.01, uDraw);
  gl_PointSize = clamp(uPx * 900.0 / max(-mv.z, 1.0), 4.0, 26.0);
  gl_Position = projectionMatrix * mv;
}
`;
const ANCHOR_FS = /* glsl */ `
varying float vOn;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r = length(c);
  float core = smoothstep(0.35, 0.1, r);
  float halo = smoothstep(1.0, 0.2, r) * 0.45;
  float a = (core + halo) * vOn;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(vec3(0.49, 0.83, 0.99), vec3(1.0), core), a);
}
`;

const PROP_VS = /* glsl */ `
varying vec3 vWorld;
varying vec3 vN;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const PROP_FS = /* glsl */ `
${NOISE_GLSL}
${COMMON}
uniform vec3 uColor;
uniform vec3 uAmb;
varying vec3 vWorld;
varying vec3 vN;
void main() {
  vec3 n = normalize(vN);
  float diff = clamp(dot(n, uSunDir) * 0.75 + 0.25, 0.0, 1.0);
  vec3 col = uColor * (uSunCol * diff * uSunI * 0.6 + uAmb * 0.5);
  gl_FragColor = vec4(applyFog(col, vWorld), 1.0);
}
`;

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const ss = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A grid denser where the climb happens: vertices crowd toward the route. */
function terrainGeometry(seg) {
  const g = new THREE.PlaneGeometry(1, 1, seg, seg);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const S = 7200;
  const CZ = 1500;
  const warp = (u) => u * (0.15 + 0.85 * u * u);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) * 2;
    const v = pos.getZ(i) * 2;
    pos.setXYZ(i, warp(u) * S, 0, CZ + warp(v) * S);
  }
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 900, CZ), 12000);
  return g;
}

export function createAscent({ canvas, tier, onLost, onFirstFrame }) {
  const high = tier === "high";
  const cfg = high
    ? { seg: 256, dpr: 2, snow: 4000, fps: 60, oct: 7, cloudOct: 5 }
    : { seg: 128, dpr: 1.25, snow: 1200, fps: 30, oct: 6, cloudOct: 3 };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: high,
    alpha: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.dpr));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 1, 60000);
  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };

  const common = {
    uCam: { value: new THREE.Vector3() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Vector3(1, 1, 1) },
    uSunI: { value: 1 },
    uFogCol: { value: new THREE.Vector3(1, 1, 1) },
    uFogDen: { value: 0.0002 },
    uFogFall: { value: 0.001 },
    uTime: { value: 0 },
  };
  const amb = { value: new THREE.Vector3() };
  const ambG = { value: new THREE.Vector3() };
  const gold = { value: new THREE.Vector3() };
  const skyHor = { value: new THREE.Vector3() };

  /* sky */
  const skyU = { ...common, uSkyTop: { value: new THREE.Vector3() }, uSkyMid: { value: new THREE.Vector3() }, uSkyHor: skyHor, uGold: gold, uSunVis: { value: 0 }, uStars: { value: 0 } };
  const sky = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1000, 48, 24)),
    keep(new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: skyU, side: THREE.BackSide, depthWrite: false, depthTest: false }))
  );
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  /* terrain */
  const terrU = { ...common, uAmb: amb, uAmbG: ambG, uRim: { value: 0 }, uGold: gold, uTerm: { value: 0 }, uSweep: { value: 0 } };
  const terrain = new THREE.Mesh(
    keep(terrainGeometry(cfg.seg)),
    keep(new THREE.ShaderMaterial({ vertexShader: TERRAIN_VS(cfg.oct), fragmentShader: TERRAIN_FS, uniforms: terrU }))
  );
  terrain.frustumCulled = false;
  scene.add(terrain);

  /* tents at base camp */
  const tentGeo = keep(new THREE.ConeGeometry(3.4, 4.2, 4, 1));
  tentGeo.translate(0, 2.1, 0);
  const TENT_COLORS = ["#c95a26", "#d69a2c", "#b23b33", "#3b7fb0", "#c95a26", "#c7a13a"];
  const tentMats = TENT_COLORS.map((c) =>
    keep(new THREE.ShaderMaterial({ vertexShader: PROP_VS, fragmentShader: PROP_FS, uniforms: { ...common, uAmb: amb, uColor: { value: v3(new THREE.Color(c).convertLinearToSRGB().toArray()) } } }))
  );
  const tents = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const z = 2905 + ((i * 37) % 150) - i * 1.5;
    const x = valleyX(z) + ((i * 53) % 110) - 55 + (i % 2 ? 28 : -24);
    const m = new THREE.Mesh(tentGeo, tentMats[i % tentMats.length]);
    m.position.set(x, terrainH(x, z) - 0.6, z);
    m.rotation.y = (i * 0.77) % Math.PI;
    const s = 0.62 + ((i * 29) % 7) / 20;
    m.scale.set(s, s, s * 1.25);
    tents.add(m);
  }
  scene.add(tents);

  /* ladders over the crevasses */
  const ladderPts = [];
  [2470, 2330, 2190].forEach((z, k) => {
    const cx = valleyX(z) + (k - 1) * 14;
    const len = 16;
    const yaw = 0.25 * (k - 1);
    const ax = Math.cos(yaw);
    const az = Math.sin(yaw);
    const y0 = Math.max(terrainH(cx - ax * len * 0.5, z - az * len * 0.5), terrainH(cx + ax * len * 0.5, z + az * len * 0.5), terrainH(cx, z)) + 1.2;
    const at = (t, side) => [cx + ax * (t - 0.5) * len - az * side, y0, z + az * (t - 0.5) * len + ax * side];
    for (const side of [-0.6, 0.6]) ladderPts.push(...at(0, side), ...at(1, side));
    for (let r = 0; r <= 20; r++) ladderPts.push(...at(r / 20, -0.6), ...at(r / 20, 0.6));
  });
  const ladderGeo = keep(new THREE.BufferGeometry());
  ladderGeo.setAttribute("position", new THREE.Float32BufferAttribute(ladderPts, 3));
  ladderGeo.setAttribute("normal", new THREE.Float32BufferAttribute(ladderPts.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  const ladders = new THREE.LineSegments(
    ladderGeo,
    keep(new THREE.ShaderMaterial({ vertexShader: PROP_VS, fragmentShader: PROP_FS, uniforms: { ...common, uAmb: amb, uColor: { value: new THREE.Vector3(0.78, 0.84, 0.9) } } }))
  );
  scene.add(ladders);

  /* the fixed rope */
  const ropeCurve = new THREE.CatmullRomCurve3(ropePoints().map(v3), false, "centripetal");
  const ropeU = { ...common, uDraw: { value: 0 }, uGlow: { value: 0 }, uRope: { value: new THREE.Vector3(0.22, 0.74, 0.97) } };
  const rope = new THREE.Mesh(
    keep(new THREE.TubeGeometry(ropeCurve, 600, 0.45, 6, false)),
    keep(new THREE.ShaderMaterial({ vertexShader: ROPE_VS, fragmentShader: ROPE_FS, uniforms: ropeU }))
  );
  const glowU = { ...ropeU, uGlow: { value: 1 } };
  const ropeGlow = new THREE.Mesh(
    keep(new THREE.TubeGeometry(ropeCurve, 600, 2.4, 8, false)),
    keep(new THREE.ShaderMaterial({ vertexShader: ROPE_VS, fragmentShader: ROPE_FS, uniforms: glowU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  );
  const anchorPos = [];
  const anchorAt = [];
  for (let i = 1; i <= 11; i++) {
    const t = i / 12;
    const q = ropeCurve.getPoint(t);
    anchorPos.push(q.x, q.y + 0.4, q.z);
    anchorAt.push(t);
  }
  const anchorGeo = keep(new THREE.BufferGeometry());
  anchorGeo.setAttribute("position", new THREE.Float32BufferAttribute(anchorPos, 3));
  anchorGeo.setAttribute("at", new THREE.Float32BufferAttribute(anchorAt, 1));
  const anchorU = { uDraw: ropeU.uDraw, uPx: { value: 1 } };
  const anchors = new THREE.Points(
    anchorGeo,
    keep(new THREE.ShaderMaterial({ vertexShader: ANCHOR_VS, fragmentShader: ANCHOR_FS, uniforms: anchorU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  );
  rope.renderOrder = 2;
  ropeGlow.renderOrder = 3;
  anchors.renderOrder = 4;
  scene.add(rope, ropeGlow, anchors);

  /* sea of cloud */
  const cloudU = { ...common, uClouds: { value: 0 }, uCloudLit: { value: new THREE.Vector3() }, uCloudDark: { value: new THREE.Vector3() }, uSkyHor: skyHor };
  const clouds = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(40000, 40000, 1, 1)),
    keep(new THREE.ShaderMaterial({ vertexShader: CLOUD_VS, fragmentShader: CLOUD_FS(cfg.cloudOct), uniforms: cloudU, transparent: true, depthWrite: false }))
  );
  clouds.rotation.x = -Math.PI / 2;
  clouds.renderOrder = 5;
  clouds.frustumCulled = false;
  scene.add(clouds);

  /* snow */
  const seeds = new Float32Array(cfg.snow * 4);
  let s = 1234567;
  const rnd = () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;
  for (let i = 0; i < seeds.length; i++) seeds[i] = rnd();
  const snowGeo = keep(new THREE.BufferGeometry());
  snowGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(cfg.snow * 3), 3));
  snowGeo.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 4));
  const snowU = {
    uCam: common.uCam,
    uTime: common.uTime,
    uWind: { value: new THREE.Vector3() },
    uBox: { value: 70 },
    uSnow: { value: 0 },
    uStreak: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uPx: { value: 1 },
    uSnowCol: { value: new THREE.Vector3(1, 1, 1) },
  };
  const snow = new THREE.Points(
    snowGeo,
    keep(new THREE.ShaderMaterial({ vertexShader: SNOW_VS, fragmentShader: SNOW_FS, uniforms: snowU, transparent: true, depthWrite: false }))
  );
  snow.frustumCulled = false;
  snow.renderOrder = 8;
  scene.add(snow);

  /* camera route */
  const camCurve = new THREE.CatmullRomCurve3(cameraSamples(0.05).map(v3), false, "catmullrom", 0.4);
  const lookCurve = new THREE.CatmullRomCurve3(lookTargets().map(v3), false, "catmullrom", 0.5);
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();
  const look = {};
  const touch = window.matchMedia("(hover: none)").matches;

  /* sizing */
  let width = 1;
  let height = 1;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    // portrait keeps a sensible horizontal field instead of a keyhole
    const hfov = (64 * Math.PI) / 180;
    const vfov = aspect < 1 ? Math.min((80 * Math.PI) / 180, 2 * Math.atan(Math.tan(hfov / 2) / aspect)) : (50 * Math.PI) / 180;
    camera.fov = (vfov * 180) / Math.PI;
    camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    snowU.uRes.value.set(w * pr, h * pr);
    snowU.uPx.value = (h * pr) / 900;
    anchorU.uPx.value = (h * pr) / 900;
  }
  resize();

  /* context loss → the page falls back to the stills */
  let lost = false;
  const onLostEvt = (e) => {
    e.preventDefault();
    lost = true;
    if (onLost) onLost();
  };
  canvas.addEventListener("webglcontextlost", onLostEvt);

  let last = 0;
  let first = true;
  let yaw = 0;
  let pitch = 0;
  const startT = performance.now();
  const setV = (u, a) => u.value.set(a[0], a[1], a[2]);

  function frame(p, now, pointer) {
    if (lost) return;
    if (cfg.fps < 60 && now - last < 1000 / cfg.fps - 2) return;
    last = now;
    const t = (now - startT) / 1000;
    const L = lookAt(p, look);

    const u = Math.min(1, Math.max(0, p / 6));
    camCurve.getPoint(u, camPos);
    lookCurve.getPoint(u, camTgt);
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    // desktop: the pointer leans the view ±3°; phones: a very slow sway
    const ty = touch ? Math.sin(t * 0.13) * 0.018 : -(pointer ? pointer.x : 0) * 0.052;
    const tp = touch ? Math.sin(t * 0.09 + 1.3) * 0.009 : (pointer ? pointer.y : 0) * 0.035;
    yaw += (ty - yaw) * 0.06;
    pitch += (tp - pitch) * 0.06;
    camera.rotateY(yaw);
    camera.rotateX(pitch);
    camera.updateMatrixWorld();

    common.uCam.value.copy(camera.position);
    common.uTime.value = t;
    setV(common.uSunDir, L.sun);
    setV(common.uSunCol, L.sunCol);
    common.uSunI.value = L.sunI;
    setV(common.uFogCol, L.fogCol);
    common.uFogDen.value = L.fogDen;
    common.uFogFall.value = L.fogFall;
    setV(amb, L.amb);
    setV(ambG, L.ambG);
    setV(gold, L.gold);
    setV(skyHor, L.skyHor);
    setV(skyU.uSkyTop, L.skyTop);
    setV(skyU.uSkyMid, L.skyMid);
    skyU.uSunVis.value = L.sunVis;
    skyU.uStars.value = L.stars;
    terrU.uRim.value = L.rim;
    // sunrise: the terminator slides from above the summit down the mountain
    const sweep = ss(4.85, 5.7, p);
    terrU.uSweep.value = ss(4.7, 4.95, p) * (1 - ss(5.8, 6.0, p));
    terrU.uTerm.value = 1950 - sweep * 1300;

    const draw = ss(2.97, 3.93, p);
    ropeU.uDraw.value = draw;
    const ropeOn = draw > 0.001;
    rope.visible = ropeOn;
    ropeGlow.visible = ropeOn;
    anchors.visible = ropeOn;

    cloudU.uClouds.value = L.clouds;
    setV(cloudU.uCloudLit, L.cloudLit);
    setV(cloudU.uCloudDark, L.cloudDark);
    clouds.visible = L.clouds > 0.01 && camera.position.y > CLOUD_Y + 40;
    clouds.position.set(camera.position.x, CLOUD_Y, camera.position.z);

    snowU.uSnow.value = L.snow;
    snowU.uStreak.value = L.streak;
    snowU.uWind.value.set(L.wind, -L.wind * 0.08, L.wind * 0.35);
    setV(snowU.uSnowCol, L.snowCol);
    snow.visible = L.snow > 0.01;

    sky.position.copy(camera.position);

    renderer.render(scene, camera);
    if (first) {
      first = false;
      if (onFirstFrame) onFirstFrame();
    }
  }

  function dispose() {
    canvas.removeEventListener("webglcontextlost", onLostEvt);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  }

  return { frame, resize, dispose, groundAt };
}
