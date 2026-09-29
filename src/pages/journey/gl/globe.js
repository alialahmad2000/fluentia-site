/**
 * Scene: the night globe (leg 1) and the start of the fall (leg 1→2).
 *
 * Dots: the baked Natural Earth grid, one Points draw; dots shrink toward the
 * limb (fake foreshortening) and fade on the back hemisphere. Body: void, with
 * a thin gold fresnel band on the upper limb only; a back-face shell glows sky
 * below. Arcs: tubes that hug the surface (lift 4·alt·t(1−t)) and draw on /
 * draw off in the fragment shader; each landing pulses a ring at its city.
 * RUH breathes — that dot is "you". The feather-F is painted on the globe
 * itself: it brushes on once, then breathes in the same light as the limb.
 *
 * params (written by the Hero leg):
 *   dive     0..1  the fall: arcs retract into RUH, the camera closes on the Gulf
 *   dragX    radians of user drag (desktop)
 * outputs (read by the Hero leg):
 *   ruh      {x, y, f} RUH on screen (px) and how much it faces the camera
 *   tags     [{ code, x, y, a, home }]
 */
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Curve,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import DOTS from "../data/globe-dots.json";
import { HOMES, DESTS } from "../copy";
import { markCanvas } from "../../../lib/brandMark";

const DEG = Math.PI / 180;
const SKY = new Color("#38bdf8");
const GOLD = new Color("#fbbf24");
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function latLon(lat, lon, r = 1) {
  const p = lat * DEG;
  const l = lon * DEG;
  return new Vector3(r * Math.cos(p) * Math.sin(l), r * Math.sin(p), r * Math.cos(p) * Math.cos(l));
}

function landPositions() {
  const out = [];
  for (const row of DOTS.rows.split(";")) {
    const [ri, cols] = row.split(":");
    const lat = DOTS.lat0 + Number(ri) * DOTS.step;
    const lonStep = DOTS.step / Math.max(0.2, Math.cos(lat * DEG));
    for (const k of cols.split(",")) {
      const v = latLon(lat, -180 + Number(k) * lonStep, 1.002);
      out.push(v.x, v.y, v.z);
    }
  }
  return new Float32Array(out);
}

/** Great-circle path lifted off the surface: 1 + 4·alt·t(1−t). */
class ArcCurve extends Curve {
  constructor(a, b, alt) {
    super();
    this.a = a.clone().normalize();
    this.b = b.clone().normalize();
    this.w = this.a.angleTo(this.b);
    this.alt = alt;
  }
  getPoint(t, out = new Vector3()) {
    const s = Math.sin(this.w) || 1;
    const k1 = Math.sin((1 - t) * this.w) / s;
    const k2 = Math.sin(t * this.w) / s;
    out.copy(this.a).multiplyScalar(k1).addScaledVector(this.b, k2).normalize();
    return out.multiplyScalar(1.003 + 4 * this.alt * t * (1 - t));
  }
}

const BODY_VS = /* glsl */ `
  varying vec3 vWN; varying vec3 vV;
  void main(){
    vec4 wp = modelMatrix * vec4(position,1.0);
    vWN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const BODY_FS = /* glsl */ `
  uniform vec3 uSky; uniform vec3 uGold; uniform float uDive;
  varying vec3 vWN; varying vec3 vV;
  void main(){
    float f = 1.0 - max(dot(vWN, vV), 0.0);
    // a thin gold band on the upper limb only, a wider sky band below
    float top = smoothstep(0.05, 0.75, vWN.y);
    float bot = smoothstep(0.1, -0.8, vWN.y);
    // committed colour, not haze: one crisp gold limb above, one crisp sky limb below
    float goldRim = smoothstep(0.9, 0.93, f) * top;
    float skyRim = smoothstep(0.9, 0.93, f) * bot;
    // closing in, the limbs leave the frame: the rims fade, the body turns to deep sky
    vec3 c = mix(vec3(0.012, 0.022, 0.045), uGold, goldRim * (1.0 - uDive));
    c = mix(c, uSky, skyRim * (1.0 - uDive));
    c = mix(c, vec3(0.03, 0.12, 0.26), uDive);
    gl_FragColor = vec4(c, 1.0);
  }`;
const ATMO_FS = /* glsl */ `
  uniform vec3 uSky; uniform vec3 uGold; uniform float uGain;
  varying vec3 vWN; varying vec3 vV;
  void main(){
    float d = dot(vWN, vV);
    float i = pow(clamp(0.66 + d, 0.0, 1.0), 6.0);
    float top = smoothstep(0.1, 0.7, vWN.y);
    vec3 c = mix(uSky, uGold, top);
    float w = mix(1.3, 0.55, top);
    gl_FragColor = vec4(c * i * uGain * w, i * w);
  }`;
const DOT_VS = /* glsl */ `
  uniform float uSize; uniform float uPR; uniform float uTime;
  attribute float aSeed;
  varying float vA; varying float vLit;
  void main(){
    vec4 wp = modelMatrix * vec4(position,1.0);
    vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz);
    float ndv = dot(n, normalize(cameraPosition - wp.xyz));
    vA = smoothstep(0.0, 0.3, ndv);
    vLit = step(0.986, aSeed) * (0.65 + 0.35 * sin(uTime * 1.6 + aSeed * 50.0));
    vec4 mv = viewMatrix * wp;
    gl_PointSize = uSize * uPR * mix(0.55, 1.0, smoothstep(0.0, 0.3, ndv)) * (3.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const DOT_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha;
  varying float vA; varying float vLit;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.25, d) * vA * uAlpha;
    vec3 col = mix(uColor, vec3(1.0, 0.8, 0.42), step(0.01, vLit));
    a *= mix(0.55, 1.0, step(0.01, vLit));
    gl_FragColor = vec4(col, a);
  }`;

const MARK_VS = /* glsl */ `
  varying vec3 vP; varying float vF;
  void main(){
    vP = position;
    vec4 wp = modelMatrix * vec4(position,1.0);
    vec3 n = normalize(mat3(modelMatrix) * normal);
    vF = dot(n, normalize(cameraPosition - wp.xyz));
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const MARK_FS = /* glsl */ `
  uniform sampler2D uTex; uniform vec3 uC; uniform vec3 uE; uniform vec3 uN; uniform vec2 uHalf;
  uniform float uPaint; uniform float uTime; uniform float uAlpha;
  uniform vec3 uSky; uniform vec3 uCyan; uniform vec3 uDeep;
  varying vec3 vP; varying float vF;
  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1,0)), f.x), mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), f.x), f.y);
  }
  void main(){
    vec3 p = normalize(vP);
    if (dot(p, uC) < 0.5) discard;
    vec2 uv = vec2(dot(p, uE), dot(p, uN)) / uHalf * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
    vec3 m = texture2D(uTex, uv).rgb;
    // the brush: stroke order runs up the stem, then out along each feather
    float n = vn(uv * vec2(7.0, 9.0));
    float order = (1.0 - uv.y) * 0.55 + uv.x * 0.45 + (n - 0.5) * 0.14;
    float wet = uPaint * 1.25 - order;
    float laid = smoothstep(0.0, 0.05, wet);
    // bristle streaks run along the feathers; the edge frays like dry paint
    float bristle = vn(vec2(uv.x * 4.0, uv.y * 170.0)) * 0.6 + vn(vec2(uv.x * 9.0, uv.y * 60.0)) * 0.4;
    float fray = vn(uv * 90.0) * 0.6 + vn(uv * 24.0) * 0.4;
    float body = smoothstep(0.2 + fray * 0.5, 0.6 + fray * 0.35, m.r);
    vec3 ink = mix(uCyan, uDeep, m.b * 0.75);
    ink *= 0.62 + 0.55 * bristle;
    // it breathes with the globe, and a slow sheen sweeps the letter
    float breath = 0.82 + 0.18 * sin(uTime * 1.3);
    float sweep = mod(uTime * 0.16, 1.6) - 0.3;
    float sheen = smoothstep(0.1, 0.0, abs(uv.x * 0.7 + uv.y * 0.3 - sweep)) * body;
    // the wet edge of the brush: a thin bright line riding the paint, gone once it dries
    float edge = smoothstep(0.035, 0.0, abs(wet - 0.03)) * (1.0 - uPaint) * (body * 0.8 + m.g * 0.15);
    vec3 c = ink * body * laid * (0.4 + 0.18 * breath);
    c += uSky * m.g * (1.0 - body) * laid * 0.42 * breath;
    c += vec3(0.75, 0.95, 1.0) * (sheen * 0.3 * laid + edge * 1.2);
    float face = smoothstep(0.05, 0.4, vF);
    gl_FragColor = vec4(c * face * uAlpha, 1.0);
  }`;
const ARC_VS = /* glsl */ `varying float vU; void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const ARC_FS = /* glsl */ `
  uniform float uTime; uniform float uOffset; uniform float uRetract; uniform vec3 uColor;
  varying float vU;
  void main(){
    // draw on, then draw off; the fall pulls every head back home
    float pr = mod(uTime * 0.42 + uOffset, 2.6);
    float st = clamp(pr - 1.15, 0.0, 1.0);
    float en = clamp(pr, 0.0, 1.0);
    en = min(en, 1.0 - uRetract);
    st = min(st, en);
    if (vU < st || vU > en) discard;
    float tail = smoothstep(st, en + 0.001, vU);
    float head = smoothstep(en - 0.04, en, vU);
    gl_FragColor = vec4(uColor + head * 0.9, 0.25 + 0.75 * tail);
  }`;
const STAR_VS = /* glsl */ `uniform float uPR; attribute float aS; varying float vS; void main(){ vS = aS; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = (1.0 + aS * 1.5) * uPR; gl_Position = projectionMatrix * mv; }`;
const STAR_FS = /* glsl */ `uniform float uAlpha; uniform float uTime; varying float vS; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; float tw = 0.6 + 0.4 * sin(uTime * (0.6 + vS) + vS * 30.0); gl_FragColor = vec4(0.85,0.92,1.0, (0.18 + 0.45 * vS) * tw * smoothstep(0.5,0.0,d) * uAlpha); }`;

export function create(renderer, cfg) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.05, 200);
  const TAN = Math.tan((35 / 2) * DEG);
  const pr = renderer.getPixelRatio();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const world = new Group();
  const earth = new Group();
  world.add(earth);
  scene.add(world);
  const disposables = [];
  const keep = (...xs) => (disposables.push(...xs), xs[0]);

  const bodyGeo = keep(new SphereGeometry(1, 96, 96));
  const bodyMat = keep(new ShaderMaterial({ vertexShader: BODY_VS, fragmentShader: BODY_FS, uniforms: { uSky: { value: SKY }, uGold: { value: GOLD }, uDive: { value: 0 } } }));
  earth.add(new Mesh(bodyGeo, bodyMat));

  const atmoGeo = keep(new SphereGeometry(1.16, 64, 64));
  const atmoMat = keep(
    new ShaderMaterial({
      vertexShader: BODY_VS,
      fragmentShader: ATMO_FS,
      uniforms: { uSky: { value: SKY }, uGold: { value: GOLD }, uGain: { value: 1.25 } },
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
  );
  // (the additive atmosphere shell is kept but not added: the limb carries the light)

  const pos = landPositions();
  const seeds = new Float32Array(pos.length / 3);
  for (let i = 0; i < seeds.length; i++) {
    const h = Math.sin(i * 12.9898) * 43758.5453;
    seeds[i] = h - Math.floor(h);
  }
  const dotGeo = keep(new BufferGeometry());
  dotGeo.setAttribute("position", new BufferAttribute(pos, 3));
  dotGeo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  const dotMat = keep(
    new ShaderMaterial({
      vertexShader: DOT_VS,
      fragmentShader: DOT_FS,
      uniforms: { uSize: { value: 2.2 }, uPR: { value: pr }, uTime: { value: 0 }, uColor: { value: new Color("#c9d8ea") }, uAlpha: { value: 0.72 } },
      transparent: true,
      depthWrite: false,
    })
  );
  // the mark sits under the land dots, just north of home — clear of the headline on every width
  const ML = { lat: 45, lon: 38 };
  const MC = latLon(ML.lat, ML.lon);
  const markTex = keep(new CanvasTexture(markCanvas()));
  const markMat = keep(
    new ShaderMaterial({
      vertexShader: MARK_VS,
      fragmentShader: MARK_FS,
      uniforms: {
        uTex: { value: markTex },
        uC: { value: MC },
        uE: { value: new Vector3(Math.cos(ML.lon * DEG), 0, -Math.sin(ML.lon * DEG)) },
        uN: { value: new Vector3(-Math.sin(ML.lat * DEG) * Math.sin(ML.lon * DEG), Math.cos(ML.lat * DEG), -Math.sin(ML.lat * DEG) * Math.cos(ML.lon * DEG)) },
        uHalf: { value: new Vector2(0.28, 0.336) },
        uPaint: { value: reduce ? 1 : 0 },
        uTime: { value: 0 },
        uAlpha: { value: 1 },
        uSky: { value: SKY },
        uCyan: { value: new Color("#1ee8ff") },
        uDeep: { value: new Color("#2f8fe8") },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  );
  const markGeo = keep(new SphereGeometry(1.0012, 96, 96));
  earth.add(new Mesh(markGeo, markMat));
  earth.add(new Points(dotGeo, dotMat));

  const starN = cfg.tier === "high" ? 700 : 350;
  const sp = new Float32Array(starN * 3);
  const ss = new Float32Array(starN);
  for (let i = 0; i < starN; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 30;
    const s = Math.sqrt(1 - u * u);
    sp[i * 3] = r * s * Math.cos(th);
    sp[i * 3 + 1] = r * u;
    sp[i * 3 + 2] = -Math.abs(r * s * Math.sin(th)) - 10;
    ss[i] = Math.random();
  }
  const starGeo = keep(new BufferGeometry());
  starGeo.setAttribute("position", new BufferAttribute(sp, 3));
  starGeo.setAttribute("aS", new BufferAttribute(ss, 1));
  const starMat = keep(new ShaderMaterial({ vertexShader: STAR_VS, fragmentShader: STAR_FS, uniforms: { uPR: { value: pr }, uAlpha: { value: 1 }, uTime: { value: 0 } }, transparent: true, depthWrite: false }));
  scene.add(new Points(starGeo, starMat));

  const arcs = [];
  DESTS.slice(0, cfg.arcs || 6).forEach((d, i) => {
    const h = HOMES[i % HOMES.length];
    const a = latLon(h.lat, h.lon);
    const b = latLon(d.lat, d.lon);
    const curve = new ArcCurve(a, b, 0.02 + Math.min(0.24, a.angleTo(b) * 0.09));
    const geo = keep(new TubeGeometry(curve, 96, 0.0038, 6, false));
    const off = ((i * 0.618034) % 1) * 2.6;
    const mat = keep(
      new ShaderMaterial({
        vertexShader: ARC_VS,
        fragmentShader: ARC_FS,
        uniforms: { uTime: { value: 0 }, uOffset: { value: off }, uRetract: { value: 0 }, uColor: { value: SKY.clone() } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );
    earth.add(new Mesh(geo, mat));
    const ringGeo = keep(new RingGeometry(0.012, 0.018, 32));
    const ringMat = keep(new MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false, blending: AdditiveBlending }));
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.copy(b.clone().multiplyScalar(1.004));
    ring.lookAt(b.clone().multiplyScalar(2));
    earth.add(ring);
    arcs.push({ code: d.code, end: b, mat, ring, ringMat, off, land: 0 });
  });

  const homes = HOMES.map((h) => {
    const p = latLon(h.lat, h.lon, 1.004);
    const g = keep(new RingGeometry(0.0, 0.014, 24));
    const m = keep(new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.95, side: DoubleSide, depthWrite: false }));
    const mesh = new Mesh(g, m);
    mesh.position.copy(p);
    mesh.lookAt(p.clone().multiplyScalar(2));
    earth.add(mesh);
    return { code: h.code, p, m };
  });
  const haloGeo = keep(new RingGeometry(0.02, 0.025, 40));
  const haloMat = keep(new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.6, side: DoubleSide, depthWrite: false, blending: AdditiveBlending }));
  const halo = new Mesh(haloGeo, haloMat);
  halo.position.copy(homes[0].p);
  halo.lookAt(homes[0].p.clone().multiplyScalar(2));
  earth.add(halo);

  const params = { dive: 0, dragX: 0, ruh: { x: 0, y: 0, f: 1 }, tags: [] };
  let W = 1;
  let H = 1;
  let L = { cx: -0.44, cy: -0.04, r: 0.98 };
  function resize(w, h) {
    W = w;
    H = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const a = w / h;
    // phone: the globe owns the top of the screen, the headline sits on its lower glow
    if (a < 0.8) L = { cx: 0.0, cy: 0.3, r: 0.6 };
    else if (a < 1.2) L = { cx: 0.0, cy: 0.2, r: 0.7 };
    else L = { cx: -0.44, cy: -0.04, r: 0.98 };
  }

  const base = { x: 20 * DEG, y: -44 * DEG };
  const gulf = { x: 24.7 * DEG, y: -46.7 * DEG };
  let spin = 0;
  let born = -1; // the brush waits for the globe's own first frame, not page load
  const v = new Vector3();
  const q = new Vector3();
  const cam = new Vector3();

  function project(p, out) {
    v.copy(p).applyMatrix4(earth.matrixWorld);
    q.copy(v).sub(world.position).normalize();
    cam.copy(camera.position).sub(v).normalize();
    out.f = q.dot(cam);
    v.project(camera);
    out.x = ((v.x + 1) / 2) * W;
    out.y = ((1 - v.y) / 2) * H;
    return out;
  }

  function update(t, dt) {
    const time = t / 1000;
    const dive = clamp01(params.dive);
    const k = 1 - clamp01(dive * 4); // ambient life fades as the fall begins
    if (!reduce) spin += dt * 0.25 * k; // a 25 s sway: ~20 px/s on a phone, visible at a glance
    const e = inOut(clamp01((dive - 0.02) / 0.4));
    earth.rotation.x = lerp(base.x, gulf.x, e);
    earth.rotation.y = lerp(base.y + (Math.sin(spin) * 0.3 + params.dragX) * (1 - e), gulf.y, e);

    const zoom = inOut(clamp01((dive - 0.2) / 0.5));
    // screen radius in half-heights; 2.6 keeps the camera ~0.22 above the surface
    const r = lerp(L.r, 2.6, Math.pow(zoom, 1.4));
    const d = 1 / (r * TAN);
    camera.position.set(0, 0, d);
    const Hh = d * TAN;
    world.position.set(lerp(L.cx, 0, e) * Hh * camera.aspect, lerp(L.cy, 0, e) * Hh, 0);
    camera.lookAt(0, 0, 0);

    const retract = inOut(clamp01((dive - 0.04) / 0.24));
    for (const a of arcs) {
      a.mat.uniforms.uTime.value = reduce ? 0.6 : time;
      a.mat.uniforms.uRetract.value = retract;
      const prc = (((time * 0.42 + a.off) % 2.6) + 2.6) % 2.6;
      a.land = prc > 1 && prc < 1.7 ? 1 - (prc - 1) / 0.7 : 0;
      a.ring.scale.setScalar(1 + (1 - a.land) * 1.8);
      a.ringMat.opacity = a.land * 0.9 * (1 - retract);
      a.ring.visible = a.facing !== false;
    }
    const breath = 0.5 + 0.5 * Math.sin(time * 2.4);
    // the bead takes over from RUH: the city marks leave before the close-up
    const gone = 1 - clamp01(zoom * 8);
    halo.scale.setScalar(1 + breath * 0.9 + retract * 1.2);
    haloMat.opacity = (0.3 + breath * 0.4 + retract * 0.3) * gone;
    for (const h of homes) h.m.opacity = 0.95 * gone;
    dotMat.uniforms.uTime.value = time;
    // brushed on once, 1.2 s in, over 2.6 s; then it only breathes
    if (born < 0) born = time;
    markMat.uniforms.uPaint.value = reduce ? 1 : inOut(clamp01((time - born - 1.2) / 2.6));
    markMat.uniforms.uTime.value = reduce ? 0 : time;
    markMat.uniforms.uAlpha.value = 1 - clamp01((dive - 0.2) / 0.2);
    dotMat.uniforms.uAlpha.value = 0.72 * (1 - clamp01((dive - 0.3) / 0.25));
    starMat.uniforms.uTime.value = time;
    starMat.uniforms.uAlpha.value = 1 - clamp01(dive * 2.5);
    bodyMat.uniforms.uDive.value = zoom;
    atmoMat.uniforms.uGain.value = 1.25 * (1 - zoom);

    earth.updateMatrixWorld(true);
    const o = {};
    project(homes[0].p, o);
    params.ruh = { x: o.x, y: o.y, f: o.f };
    const tags = [];
    for (const h of homes) {
      project(h.p, o);
      tags.push({ code: h.code, x: o.x, y: o.y, a: clamp01((o.f - 0.1) * 5) * k, home: true });
    }
    for (const a of arcs) {
      project(a.end, o);
      a.facing = o.f > 0.1;
      tags.push({ code: a.code, x: o.x, y: o.y, a: clamp01((o.f - 0.1) * 5) * Math.min(1, a.land * 3) * k, home: false });
    }
    params.tags = tags;
  }

  return {
    params,
    update,
    render: (r) => r.render(scene, camera),
    resize,
    dispose: () => disposables.forEach((x) => x.dispose()),
  };
}
