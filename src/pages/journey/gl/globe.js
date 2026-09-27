/**
 * The night globe (leg 1) and the fall through its atmosphere (leg 2).
 *
 * Dotted continents are the baked Natural Earth grid (../data/globe-dots.json)
 * as one Points draw. The planet body carries a fresnel rim — gold on the upper
 * limb, sky on the lower — and a back-face atmosphere shell glows past the edge.
 * Voice arcs leave RUH / JED / DMM for world cities, each a thin tube whose
 * head travels and lands on an airport tag (DOM, so the type stays crisp).
 *
 * The page drives two inputs: setDive(0..1) while the visitor scrolls into
 * the Gulf, and the pointer (drag rotates, and springs back). Rendering stops
 * off screen and on a hidden tab; a lost context calls onLost (→ low tier).
 */
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CubicBezierCurve3,
  Color,
  Group,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import DOTS from "../data/globe-dots.json";
import { HOMES, DESTS } from "../copy";

const DEG = Math.PI / 180;
const SKY = new Color("#38bdf8");
const ICE = new Color("#7dd3fc");
const GOLD = new Color("#fbbf24");

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
      const v = latLon(lat, -180 + Number(k) * lonStep, 1.003);
      out.push(v.x, v.y, v.z);
    }
  }
  return new Float32Array(out);
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ── shaders ── */
const BODY_VS = /* glsl */ `
  varying vec3 vN; varying vec3 vWN; varying vec3 vV;
  void main(){
    vec4 wp = modelMatrix * vec4(position,1.0);
    vWN = normalize(mat3(modelMatrix) * normal);
    vN = normalize(normalMatrix * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const BODY_FS = /* glsl */ `
  uniform vec3 uSky; uniform vec3 uGold; uniform float uDive;
  varying vec3 vN; varying vec3 vWN; varying vec3 vV;
  void main(){
    float f = 1.0 - max(dot(vWN, vV), 0.0);
    float rim = pow(f, 3.2);
    float top = smoothstep(-0.15, 0.55, vWN.y);
    vec3 rimC = mix(uSky, uGold, top);
    vec3 base = mix(vec3(0.012,0.028,0.058), vec3(0.03,0.08,0.16), uDive);
    // a whisper of sky on the lower hemisphere, like light scattered up from below
    base += uSky * 0.05 * smoothstep(0.2, -0.9, vWN.y);
    gl_FragColor = vec4(base + rimC * rim * 1.35, 1.0);
  }`;

const ATMO_VS = BODY_VS;
const ATMO_FS = /* glsl */ `
  uniform vec3 uSky; uniform vec3 uGold; uniform float uPower; uniform float uGain;
  varying vec3 vN; varying vec3 vWN; varying vec3 vV;
  void main(){
    float d = dot(vWN, vV);            // back faces: negative at the limb's far side
    float i = pow(clamp(0.62 + d, 0.0, 1.0), uPower);
    float top = smoothstep(-0.1, 0.6, vWN.y);
    vec3 c = mix(uSky, uGold, top);
    // the lower limb glows wider and bluer, the upper limb thinner and gold
    float w = mix(1.25, 0.8, top);
    gl_FragColor = vec4(c * i * uGain * w, i * w);
  }`;

const DOT_VS = /* glsl */ `
  uniform float uSize; uniform float uPR;
  attribute float aSeed;
  varying float vA; varying float vSeed;
  void main(){
    vec4 wp = modelMatrix * vec4(position,1.0);
    vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz);
    float facing = dot(n, normalize(cameraPosition - wp.xyz));
    vA = smoothstep(-0.05, 0.35, facing);
    vSeed = aSeed;
    vec4 mv = viewMatrix * wp;
    gl_PointSize = uSize * uPR * (3.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const DOT_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uTime; uniform float uAlpha;
  varying float vA; varying float vSeed;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.2, d) * vA * uAlpha;
    // the odd dot is a lit city: warmer, and it breathes
    float lit = step(0.985, vSeed);
    vec3 col = mix(uColor, vec3(1.0, 0.82, 0.45), lit);
    a *= mix(0.62, 1.0, lit * (0.6 + 0.4 * sin(uTime * 1.7 + vSeed * 40.0)));
    gl_FragColor = vec4(col, a);
  }`;

const ARC_VS = /* glsl */ `
  varying float vU;
  void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const ARC_FS = /* glsl */ `
  uniform float uHead; uniform float uFade; uniform vec3 uA; uniform vec3 uB;
  varying float vU;
  void main(){
    if (vU > uHead) discard;
    float trail = smoothstep(uHead - 0.55, uHead, vU);
    float head = smoothstep(uHead - 0.05, uHead, vU);
    vec3 c = mix(uA, uB, vU) + head * 0.8;
    float a = (0.28 + 0.72 * trail) * uFade;
    gl_FragColor = vec4(c, a);
  }`;

const STAR_VS = /* glsl */ `
  uniform float uPR; attribute float aS;
  varying float vS;
  void main(){ vS = aS; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = (1.0 + aS * 1.6) * uPR; gl_Position = projectionMatrix * mv; }`;
const STAR_FS = /* glsl */ `
  uniform float uAlpha; varying float vS;
  void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; gl_FragColor = vec4(0.85,0.92,1.0, (0.25 + 0.5 * vS) * smoothstep(0.5,0.0,d) * uAlpha); }`;

export function createGlobe(canvas, { cfg, labels, onLost, reduced = false }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const pr = Math.min(window.devicePixelRatio || 1, cfg.dpr);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.05, 200);
  const TAN = Math.tan((35 / 2) * DEG);

  const world = new Group(); // placed on screen
  const earth = new Group(); // rotated
  world.add(earth);
  scene.add(world);

  const bodyGeo = new SphereGeometry(1, 96, 96);
  const bodyMat = new ShaderMaterial({
    vertexShader: BODY_VS,
    fragmentShader: BODY_FS,
    uniforms: { uSky: { value: SKY }, uGold: { value: GOLD }, uDive: { value: 0 } },
  });
  earth.add(new Mesh(bodyGeo, bodyMat));

  const atmoGeo = new SphereGeometry(1.2, 64, 64);
  const atmoMat = new ShaderMaterial({
    vertexShader: ATMO_VS,
    fragmentShader: ATMO_FS,
    uniforms: { uSky: { value: SKY }, uGold: { value: GOLD }, uPower: { value: 5.5 }, uGain: { value: 1.6 } },
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const atmo = new Mesh(atmoGeo, atmoMat);
  world.add(atmo); // does not rotate: the light comes from a fixed sun

  const pos = landPositions();
  const seeds = new Float32Array(pos.length / 3);
  for (let i = 0; i < seeds.length; i++) {
    const h = Math.sin(i * 12.9898) * 43758.5453;
    seeds[i] = h - Math.floor(h);
  }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute("position", new BufferAttribute(pos, 3));
  dotGeo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  const dotMat = new ShaderMaterial({
    vertexShader: DOT_VS,
    fragmentShader: DOT_FS,
    uniforms: {
      uSize: { value: 2.3 },
      uPR: { value: pr },
      uColor: { value: new Color("#dbeeff") },
      uTime: { value: 0 },
      uAlpha: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
  });
  earth.add(new Points(dotGeo, dotMat));

  // stars — a shell far behind
  const starN = cfg.tier === "high" ? 900 : 450;
  const sp = new Float32Array(starN * 3);
  const ss = new Float32Array(starN);
  for (let i = 0; i < starN; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 30;
    const s = Math.sqrt(1 - u * u);
    sp[i * 3] = r * s * Math.cos(t);
    sp[i * 3 + 1] = r * u;
    sp[i * 3 + 2] = -Math.abs(r * s * Math.sin(t)) - 10;
    ss[i] = Math.random();
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute("position", new BufferAttribute(sp, 3));
  starGeo.setAttribute("aS", new BufferAttribute(ss, 1));
  const starMat = new ShaderMaterial({
    vertexShader: STAR_VS,
    fragmentShader: STAR_FS,
    uniforms: { uPR: { value: pr }, uAlpha: { value: 1 } },
    transparent: true,
    depthWrite: false,
  });
  scene.add(new Points(starGeo, starMat));

  // voice arcs
  const arcs = [];
  const dests = DESTS.slice(0, cfg.arcs);
  dests.forEach((d, i) => {
    const h = HOMES[i % HOMES.length];
    const a = latLon(h.lat, h.lon, 1.004);
    const b = latLon(d.lat, d.lon, 1.004);
    const dist = a.angleTo(b);
    const lift = 1 + 0.18 + dist * 0.16;
    const c1 = a.clone().lerp(b, 0.25).normalize().multiplyScalar(lift);
    const c2 = a.clone().lerp(b, 0.75).normalize().multiplyScalar(lift);
    const curve = new CubicBezierCurve3(a, c1, c2, b);
    const geo = new TubeGeometry(curve, 96, 0.0042, 6, false);
    const mat = new ShaderMaterial({
      vertexShader: ARC_VS,
      fragmentShader: ARC_FS,
      uniforms: { uHead: { value: 0 }, uFade: { value: 0 }, uA: { value: SKY.clone() }, uB: { value: ICE.clone() } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const mesh = new Mesh(geo, mat);
    earth.add(mesh);
    const tag = document.createElement("span");
    tag.className = "jn-tag";
    tag.textContent = d.code;
    labels.appendChild(tag);
    arcs.push({ mesh, mat, geo, end: b, tag, offset: i * 0.83, period: 7.5 + (i % 3) * 0.9 });
  });
  const homeTags = HOMES.map((h) => {
    const el = document.createElement("span");
    el.className = "jn-tag jn-tag--home";
    el.textContent = h.code;
    labels.appendChild(el);
    return { el, p: latLon(h.lat, h.lon, 1.004) };
  });

  // layout: where the globe sits on screen, and how big
  let W = 1;
  let H = 1;
  let layout = { cx: -0.5, cy: -0.2, r: 1 };
  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const aspect = W / H;
    if (aspect < 0.8) layout = { cx: 0.06, cy: -0.64, r: 0.62 };
    else if (aspect < 1.2) layout = { cx: -0.1, cy: -0.42, r: 0.8 };
    else layout = { cx: -0.46, cy: -0.14, r: 1.02 };
  }
  resize();

  // orientation: the Gulf a little right of centre, Europe over the upper limb
  const base = { x: 18 * DEG, y: -34 * DEG };
  const gulf = { x: 25 * DEG, y: -50 * DEG };
  const drag = { vx: 0, vy: 0, ox: 0, oy: 0, down: false, lx: 0, ly: 0 };
  let dive = 0;
  let divePrev = -1;

  const onDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.down = true;
    drag.lx = e.clientX;
    drag.ly = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.down) return;
    const dx = e.clientX - drag.lx;
    const dy = e.clientY - drag.ly;
    drag.lx = e.clientX;
    drag.ly = e.clientY;
    drag.vy = dx * 0.0042;
    drag.vx = e.pointerType === "touch" ? 0 : dy * 0.0028;
    drag.oy += drag.vy;
    drag.ox = Math.max(-0.5, Math.min(0.5, drag.ox + drag.vx));
  };
  const onUp = () => {
    drag.down = false;
  };
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  let lost = false;
  const onContextLost = (e) => {
    e.preventDefault();
    lost = true;
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const v = new Vector3();
  function placeTag(el, p, show) {
    v.copy(p).applyMatrix4(earth.matrixWorld);
    const n = v.clone().sub(world.position).normalize();
    const facing = n.dot(camera.position.clone().sub(v).normalize());
    v.project(camera);
    const vis = show * clamp01((facing - 0.05) * 5) * (1 - clamp01(dive * 3));
    el.style.opacity = vis.toFixed(3);
    if (vis > 0.01) el.style.transform = `translate3d(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * H}px, 0)`;
  }

  let t0 = performance.now();
  let last = 0;
  let raf = 0;
  let running = false;
  const minDt = cfg.fps >= 60 ? 0 : 1000 / cfg.fps - 2;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (lost) return;
    if (now - last < minDt) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const t = (now - t0) / 1000;

    // pointer inertia, then a slow spring back to the home view
    if (!drag.down) {
      drag.vy *= 0.94;
      drag.vx *= 0.9;
      drag.oy += drag.vy;
      drag.ox += drag.vx;
      drag.oy *= 1 - dt * 0.35;
      drag.ox *= 1 - dt * 0.8;
    }
    const idle = reduced ? 0 : Math.sin(t * 0.13) * 0.22;
    const e = easeInOut(dive);
    earth.rotation.x = lerp(base.x + drag.ox, gulf.x, e);
    earth.rotation.y = lerp(base.y + idle + drag.oy, gulf.y, e);

    // camera: fall toward the Gulf, the globe sliding to the centre as it grows
    const r = lerp(layout.r, 7.5, Math.pow(e, 1.6));
    const d = 1 / (r * TAN);
    camera.position.set(0, 0, d);
    const Hh = d * TAN;
    world.position.set(lerp(layout.cx, 0, e) * Hh * camera.aspect, lerp(layout.cy, 0, e) * Hh, 0);
    camera.lookAt(world.position.x * 0.0, world.position.y * 0.0, 0);
    bodyMat.uniforms.uDive.value = e;
    atmoMat.uniforms.uGain.value = 1.6 + e * 2.4;
    dotMat.uniforms.uTime.value = t;
    dotMat.uniforms.uAlpha.value = 1 - clamp01((dive - 0.3) * 4);
    starMat.uniforms.uAlpha.value = 1 - clamp01(dive * 2.2);
    dotMat.uniforms.uSize.value = 2.3 * (1 + e * 0.25);

    earth.updateMatrixWorld();
    for (const a of arcs) {
      const ph = reduced ? 0.6 : (((t + a.offset) / a.period) % 1 + 1) % 1;
      let head;
      let fade;
      if (ph < 0.42) {
        head = easeInOut(ph / 0.42);
        fade = 1;
      } else if (ph < 0.8) {
        head = 1;
        fade = 1 - ((ph - 0.42) / 0.38) * 0.45;
      } else {
        head = 1;
        fade = 0.55 * (1 - (ph - 0.8) / 0.2);
      }
      const gone = 1 - clamp01(dive * 2.5);
      a.mat.uniforms.uHead.value = head;
      a.mat.uniforms.uFade.value = fade * gone;
      const landed = ph >= 0.4 && ph < 0.86 ? 1 : 0;
      placeTag(a.tag, a.end, landed);
    }
    for (const h of homeTags) placeTag(h.el, h.p, 1);

    renderer.render(scene, camera);
    if (divePrev !== dive) divePrev = dive;
  }

  function start() {
    if (running || lost) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  return {
    start,
    stop,
    resize,
    setDive(p) {
      dive = clamp01(p);
    },
    /** One synchronous frame (for stills and the first paint behind the preloader). */
    renderOnce() {
      frame(performance.now() + 1000);
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(frame);
    },
    dispose() {
      stop();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      for (const a of arcs) {
        a.geo.dispose();
        a.mat.dispose();
        a.tag.remove();
      }
      for (const h of homeTags) h.el.remove();
      bodyGeo.dispose();
      bodyMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
}
