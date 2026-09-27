/**
 * The sea of voices (leg 5): hundreds of horizontal waveform lines seen from
 * a little above, like water. One LineSegments draw.
 *
 * The wake is a height field simulated on the GPU — two render targets
 * ping-ponged through a damped wave equation. The protagonist pulse crosses
 * the sea as the visitor scrolls and stamps it every frame (a moving source in
 * a wave field trails a V); a pointer or a finger stamps ripples too. Lines
 * sample the field to rise and brighten. Where half-float render targets are
 * not available the wake falls back to a few analytic rings, so every device
 * still answers a touch.
 *
 * `bound` lines (one per trusted entity) glow brighter; the page places a
 * label at each one's end and asks `hitLine(x, y)` which one a tap landed on.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  HalfFloatType,
  LineSegments,
  Mesh,
  LinearFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Raycaster,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  Plane,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const X0 = -1.9;
const X1 = 1.9;
const Z0 = -2.3; // far
const Z1 = 1.2; // near

const SIM_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const SIM_FS = /* glsl */ `
  uniform sampler2D uPrev; uniform vec2 uTexel; uniform vec4 uDrops[4]; uniform float uDamp;
  varying vec2 vUv;
  void main(){
    vec4 s = texture2D(uPrev, vUv);
    float n = texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).r
            + texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).r
            + texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).r
            + texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).r;
    float h = (n * 0.5 - s.g) * uDamp;
    for (int i = 0; i < 4; i++) {
      vec4 d = uDrops[i];
      if (d.z > 0.0) {
        float r = distance(vUv, d.xy);
        h += d.w * exp(-(r * r) / (d.z * d.z));
      }
    }
    // soften the edges so nothing reflects back in
    vec2 e = min(vUv, 1.0 - vUv);
    h *= smoothstep(0.0, 0.04, min(e.x, e.y));
    gl_FragColor = vec4(h, s.r, 0.0, 1.0);
  }`;

const LINE_VS = /* glsl */ `
  uniform float uTime; uniform sampler2D uWake; uniform float uWakeOn; uniform float uAmp;
  uniform vec4 uRings[4]; uniform vec2 uPulse; uniform float uPulseOn;
  attribute float aHi;
  varying float vH; varying float vDepth; varying float vHi; varying float vGlow;
  void main(){
    vec3 p = position;
    vec2 uv = vec2((p.x - ${X0.toFixed(2)}) / ${(X1 - X0).toFixed(2)}, (p.z - ${Z0.toFixed(2)}) / ${(Z1 - Z0).toFixed(2)});
    float t = uTime;
    float w = sin(p.x * 2.1 + t * 0.55 + p.z * 1.7) * 0.5
            + sin(p.x * 4.7 - t * 0.8 + p.z * 5.3) * 0.22
            + sin(p.x * 9.3 + t * 1.3 - p.z * 3.1) * 0.09;
    float h = 0.0;
    if (uWakeOn > 0.5) {
      h = texture2D(uWake, uv).r;
    } else {
      for (int i = 0; i < 4; i++) {
        vec4 r = uRings[i];
        if (r.w > 0.0) {
          float d = distance(uv, r.xy);
          float age = r.z;
          h += sin((d - age * 0.22) * 70.0) * exp(-abs(d - age * 0.22) * 28.0) * r.w * exp(-age * 1.4);
        }
      }
      // the pulse's own V: a wedge of crests trailing behind it
      vec2 q = uv - uPulse;
      float behind = -q.y;
      float lateral = abs(q.x);
      float inV = smoothstep(0.02, 0.0, abs(lateral - behind * 0.36)) * step(0.0, behind);
      h += inV * exp(-behind * 3.5) * 0.9 * uPulseOn;
    }
    p.y += w * uAmp + h * 0.12;
    vH = h;
    vHi = aHi;
    vDepth = uv.y;
    vGlow = 0.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const LINE_FS = /* glsl */ `
  uniform vec3 uNavy; uniform vec3 uSky; uniform vec3 uIce; uniform float uFade;
  varying float vH; varying float vDepth; varying float vHi; varying float vGlow;
  void main(){
    float lift = clamp(abs(vH) * 5.0, 0.0, 1.0);
    vec3 c = mix(uNavy, uSky, 0.18 + lift * 0.82);
    c = mix(c, uIce, lift * lift * 0.6);
    float a = mix(0.13, 0.62, smoothstep(0.15, 0.9, vDepth)) + lift * 0.55;
    if (vHi > 0.5) { c = mix(c, uIce, 0.8); a = 0.9; }
    a *= smoothstep(0.0, 0.3, vDepth) * uFade;
    gl_FragColor = vec4(c, a);
  }`;

const PULSE_VS = /* glsl */ `uniform float uSize; uniform float uPR; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = uSize * uPR * (2.0 / -mv.z); gl_Position = projectionMatrix * mv; }`;
const PULSE_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha;
  void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float core = smoothstep(0.08, 0.0, d); float halo = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor + core, (halo * 0.55 + core) * uAlpha); }`;

export function createSea(canvas, { cfg, bound = [], onLost, reduced = false }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const pr = Math.min(window.devicePixelRatio || 1, cfg.dpr);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.05, 50);

  // wake simulation (half float ping-pong), if the device can render to it
  const gl = renderer.getContext();
  const canFloat =
    renderer.capabilities.isWebGL2 &&
    (gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"));
  const RES = cfg.wake;
  let rtA = null;
  let rtB = null;
  let simScene = null;
  let simCam = null;
  let simMat = null;
  let simQuad = null;
  if (canFloat && RES) {
    const opts = { type: HalfFloatType, format: RGBAFormat, minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false };
    rtA = new WebGLRenderTarget(RES, RES, opts);
    rtB = new WebGLRenderTarget(RES, RES, opts);
    simMat = new ShaderMaterial({
      vertexShader: SIM_VS,
      fragmentShader: SIM_FS,
      uniforms: {
        uPrev: { value: rtA.texture },
        uTexel: { value: new Vector2(1 / RES, 1 / RES) },
        uDrops: { value: [0, 1, 2, 3].map(() => new Vector4()) },
        uDamp: { value: 0.986 },
      },
      depthTest: false,
      depthWrite: false,
    });
    simScene = new Scene();
    simCam = new Camera();
    simQuad = new Mesh(new PlaneGeometry(2, 2), simMat);
    simScene.add(simQuad);
    renderer.setRenderTarget(rtA);
    renderer.clear();
    renderer.setRenderTarget(rtB);
    renderer.clear();
    renderer.setRenderTarget(null);
  }

  // the line field
  const N = cfg.seaLines;
  const M = cfg.tier === "high" ? 160 : 110;
  const pos = new Float32Array(N * M * 3);
  const hi = new Float32Array(N * M);
  let boundIdx = bound.map((_, i) => Math.round(N * (0.4 + i * 0.1)));
  for (let j = 0; j < N; j++) {
    const z = Z0 + ((Z1 - Z0) * j) / (N - 1);
    for (let i = 0; i < M; i++) {
      const k = j * M + i;
      pos[k * 3] = X0 + ((X1 - X0) * i) / (M - 1);
      pos[k * 3 + 1] = 0;
      pos[k * 3 + 2] = z;
    }
  }
  const idx = new Uint32Array(N * (M - 1) * 2);
  let q = 0;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < M - 1; i++) {
      idx[q++] = j * M + i;
      idx[q++] = j * M + i + 1;
    }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aHi", new BufferAttribute(hi, 1));
  geo.setIndex(new BufferAttribute(idx, 1));
  const rings = [0, 1, 2, 3].map(() => new Vector4());
  const lineMat = new ShaderMaterial({
    vertexShader: LINE_VS,
    fragmentShader: LINE_FS,
    uniforms: {
      uTime: { value: 0 },
      uWake: { value: rtA ? rtA.texture : null },
      uWakeOn: { value: rtA ? 1 : 0 },
      uAmp: { value: 0.045 },
      uRings: { value: rings },
      uPulse: { value: new Vector2(0.5, 0) },
      uPulseOn: { value: 1 },
      uNavy: { value: new Color("#1f4a7e") },
      uSky: { value: new Color("#38bdf8") },
      uIce: { value: new Color("#bfe8ff") },
      uFade: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const lines = new LineSegments(geo, lineMat);
  scene.add(lines);

  // The bound lines are the ones that cross the lower half of THIS screen,
  // evenly — so on a tall phone and a wide desktop they are all in view.
  const lineZ = (j) => Z0 + ((Z1 - Z0) * j) / (N - 1);
  function chooseBound() {
    if (!bound.length) return;
    const ys = [];
    for (let j = 0; j < N; j++) ys.push(project(0, lineZ(j)).y / H);
    boundIdx = bound.map((_, i) => {
      const want = 0.5 + i * 0.09;
      let best = 0;
      let bd = Infinity;
      for (let j = 0; j < N; j++) {
        const d = Math.abs(ys[j] - want);
        if (d < bd) {
          bd = d;
          best = j;
        }
      }
      return best;
    });
    hi.fill(0);
    boundIdx.forEach((j, b) => hi.fill(b + 1, j * M, (j + 1) * M));
    geo.attributes.aHi.needsUpdate = true;
  }

  // the pulse — the visitor, crossing
  const pulseGeo = new BufferGeometry();
  const pulsePos = new Float32Array(3);
  pulseGeo.setAttribute("position", new BufferAttribute(pulsePos, 3));
  const pulseMat = new ShaderMaterial({
    vertexShader: PULSE_VS,
    fragmentShader: PULSE_FS,
    uniforms: { uSize: { value: 90 }, uPR: { value: pr }, uColor: { value: new Color("#7dd3fc") }, uAlpha: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const pulse = new Points(pulseGeo, pulseMat);
  scene.add(pulse);

  let W = 1;
  let H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // a phone sees the sea from higher up, so the field still fills a tall screen
    if (camera.aspect < 0.8) {
      camera.fov = 52;
      camera.position.set(0, 1.3, 1.7);
      camera.lookAt(0, 0, -0.5);
    } else {
      camera.fov = 40;
      camera.position.set(0, 1.0, 1.9);
      camera.lookAt(0, 0, -0.35);
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    chooseBound();
  }

  // pointer / finger → a point on the water
  const ray = new Raycaster();
  const water = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const ndc = new Vector2();
  function toUv(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(water, hit)) return null;
    return { x: (hit.x - X0) / (X1 - X0), y: (hit.z - Z0) / (Z1 - Z0) };
  }
  const stamps = [];
  let ringI = 0;
  let lastStamp = { x: -1, y: -1, t: 0 };
  function stampAt(clientX, clientY, strength = 0.35) {
    const uv = toUv(clientX, clientY);
    if (!uv || uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) return;
    const now = performance.now();
    if (Math.hypot(uv.x - lastStamp.x, uv.y - lastStamp.y) < 0.006 && now - lastStamp.t < 60) return;
    lastStamp = { ...uv, t: now };
    stamps.push({ x: uv.x, y: uv.y, s: strength });
    const r = rings[ringI++ % rings.length];
    r.x = uv.x;
    r.y = uv.y;
    r.z = 0;
    r.w = 1;
  }
  const onPointer = (e) => {
    if (e.pointerType === "touch") return;
    stampAt(e.clientX, e.clientY, 0.22);
  };
  const onTouch = (e) => {
    const t = e.touches[0];
    if (t) stampAt(t.clientX, t.clientY, 0.35);
  };
  canvas.addEventListener("pointermove", onPointer);
  const onPress = (e) => stampAt(e.clientX, e.clientY, 0.6);
  canvas.addEventListener("pointerdown", onPress);
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });

  let lost = false;
  const onContextLost = (e) => {
    e.preventDefault();
    lost = true;
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  let progress = 0;
  const pulseUv = { x: 0.5, y: 0.05 };
  const prevUv = { x: 0.5, y: 0.05 };
  function pulseAt(p) {
    // from far to near, with a slow S across the water
    const y = 0.14 + p * 0.8;
    const x = 0.5 + Math.sin(p * Math.PI * 1.6 + 0.4) * 0.16;
    return { x, y };
  }

  const v = new Vector3();
  function project(x, z, y = 0) {
    v.set(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
  }
  resize();

  let t0 = performance.now();
  let last = 0;
  let raf = 0;
  let running = false;
  const minDt = cfg.fps >= 60 ? 0 : 1000 / cfg.fps - 2;

  function simulate() {
    if (!rtA) return;
    const drops = simMat.uniforms.uDrops.value;
    // the pulse stamps every frame; its speed decides how hard
    const sp = Math.hypot(pulseUv.x - prevUv.x, pulseUv.y - prevUv.y);
    drops[0].set(pulseUv.x, pulseUv.y, 0.009, reduced ? 0 : Math.min(0.35, 0.012 + sp * 18));
    for (let i = 1; i < 4; i++) {
      const s = stamps.shift();
      if (s) drops[i].set(s.x, s.y, 0.02, s.s);
      else drops[i].set(0, 0, 0, 0);
    }
    for (let k = 0; k < 2; k++) {
      simMat.uniforms.uPrev.value = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, simCam);
      const tmp = rtA;
      rtA = rtB;
      rtB = tmp;
      if (k === 0) for (let i = 0; i < 4; i++) drops[i].set(0, 0, 0, 0);
    }
    renderer.setRenderTarget(null);
    lineMat.uniforms.uWake.value = rtA.texture;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (lost) return;
    if (now - last < minDt) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const t = (now - t0) / 1000;

    prevUv.x = pulseUv.x;
    prevUv.y = pulseUv.y;
    const target = pulseAt(progress);
    pulseUv.x += (target.x - pulseUv.x) * Math.min(1, dt * 6);
    pulseUv.y += (target.y - pulseUv.y) * Math.min(1, dt * 6);
    pulsePos[0] = X0 + pulseUv.x * (X1 - X0);
    pulsePos[1] = 0.02;
    pulsePos[2] = Z0 + pulseUv.y * (Z1 - Z0);
    pulseGeo.attributes.position.needsUpdate = true;

    for (const r of rings) if (r.w > 0) {
      r.z += dt;
      if (r.z > 3) r.w = 0;
    }
    lineMat.uniforms.uPulse.value.set(pulseUv.x, pulseUv.y);
    lineMat.uniforms.uTime.value = reduced ? 0 : t;
    simulate();
    renderer.render(scene, camera);
  }

  return {
    start() {
      if (running || lost) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resize,
    setProgress(p) {
      progress = clamp01(p);
    },
    /** Screen position of the far-right end of each bound line (for its label). */
    boundEnds(side = "right") {
      return boundIdx.map((j) => {
        const z = lineZ(j);
        // the label sits where the line leaves the visible water
        const a = project(0.0, z);
        const b = project(side === "left" ? X0 : X1, z);
        const x = side === "left" ? Math.max(24, b.x) : Math.min(W - 16, b.x);
        const f = (x - a.x) / (b.x - a.x || 1);
        return { x, y: a.y + (b.y - a.y) * f };
      });
    },
    /** Which bound line a tap at (clientX, clientY) is on, or -1. */
    hitLine(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      const y = clientY - r.top;
      let best = -1;
      let bd = 22;
      boundIdx.forEach((j, i) => {
        const z = lineZ(j);
        const p = project((clientX - r.left) / W > 0.5 ? 0.6 : -0.6, z);
        const d = Math.abs(p.y - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPress);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geo.dispose();
      lineMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
      if (rtA) {
        rtA.dispose();
        rtB.dispose();
        simMat.dispose();
        simQuad.geometry.dispose();
      }
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
}
