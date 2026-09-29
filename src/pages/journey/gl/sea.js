/**
 * Scene: the sea of voices (leg 6), at night.
 *
 * Hundreds of horizontal waveform lines seen from above, one LineSegments draw.
 * The pulse — you — stays at a fixed point on the screen (58% down, swaying
 * gently); the WATER travels under it as the visitor scrolls, lines wrapping
 * from the horizon. The wake is a height field simulated on the GPU (two half
 * float targets ping-ponged through a damped wave equation) and ADVECTED with
 * the water every frame, so the pulse, stamping in place, trails a real V.
 * Touch and pointer stamp ripples too.
 *
 * Five marks travel with the water — one per real institution the homepage
 * names; the line under each lights as it passes the pulse, and the leg places
 * the logo there (DOM). Near the end the near water warms to gold: the horizon
 * of the next leg.
 *
 * params: p (0..1), marks → [{ x, y, a, lit }] screen positions (output)
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  HalfFloatType,
  LinearFilter,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Points,
  Raycaster,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
} from "three";

const X0 = -3.2; // far wider than any frustum: no edge is ever seen
const X1 = 3.2;
const Z0 = -2.6; // horizon side
const Z1 = 1.3; // near side
const SPAN = Z1 - Z0;
const MARKS = 5;

const SIM_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const SIM_FS = /* glsl */ `
  uniform sampler2D uPrev; uniform vec2 uTexel; uniform vec4 uDrops[4]; uniform float uDamp; uniform float uShift;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv - vec2(0.0, uShift);            // the water moves toward you: advect
    vec4 s = texture2D(uPrev, uv);
    float n = texture2D(uPrev, uv + vec2(uTexel.x, 0.0)).r + texture2D(uPrev, uv - vec2(uTexel.x, 0.0)).r
            + texture2D(uPrev, uv + vec2(0.0, uTexel.y)).r + texture2D(uPrev, uv - vec2(0.0, uTexel.y)).r;
    float h = (n * 0.5 - s.g) * uDamp;
    for (int i = 0; i < 4; i++) {
      vec4 d = uDrops[i];
      if (d.z > 0.0) { float r = distance(vUv, d.xy); h += d.w * exp(-(r * r) / (d.z * d.z)); }
    }
    vec2 e = min(vUv, 1.0 - vUv);
    h *= smoothstep(0.0, 0.05, min(e.x, e.y));
    gl_FragColor = vec4(h, s.r, 0.0, 1.0);
  }`;

const LINE_VS = /* glsl */ `
  uniform float uTime; uniform float uTravel; uniform sampler2D uWake; uniform float uWakeOn; uniform float uAmp;
  uniform vec4 uRings[4]; uniform float uMarkZ[${MARKS}];
  varying float vH; varying float vDepth; varying float vLit; varying float vX;
  void main(){
    vec3 p = position;
    vX = p.x;
    p.z = ${Z0.toFixed(2)} + mod(p.z - ${Z0.toFixed(2)} + uTravel, ${SPAN.toFixed(2)});
    vec2 uv = vec2((p.x - ${X0.toFixed(2)}) / ${(X1 - X0).toFixed(2)}, (p.z - ${Z0.toFixed(2)}) / ${SPAN.toFixed(2)});
    float t = uTime;
    float w = sin(p.x * 2.1 + t * 0.55 + p.z * 1.7) * 0.5 + sin(p.x * 4.7 - t * 0.8 + p.z * 5.3) * 0.22 + sin(p.x * 9.3 + t * 1.3 - p.z * 3.1) * 0.09;
    float h = 0.0;
    if (uWakeOn > 0.5) h = texture2D(uWake, uv).r;
    else {
      for (int i = 0; i < 4; i++) {
        vec4 r = uRings[i];
        if (r.w > 0.0) { float d = distance(uv, r.xy); h += sin((d - r.z * 0.22) * 70.0) * exp(-abs(d - r.z * 0.22) * 28.0) * r.w * exp(-r.z * 1.4); }
      }
    }
    float lit = 0.0;
    for (int i = 0; i < ${MARKS}; i++) lit = max(lit, 1.0 - smoothstep(0.0, 0.012, abs(p.z - uMarkZ[i])));
    p.y += w * uAmp + h * 0.12 + lit * 0.02 * sin(p.x * 6.0 + t * 2.0);
    vH = h; vDepth = uv.y; vLit = lit;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const LINE_FS = /* glsl */ `
  uniform vec3 uNavy; uniform vec3 uSky; uniform vec3 uIce; uniform vec3 uGold; uniform float uDawn;
  varying float vH; varying float vDepth; varying float vLit; varying float vX;
  void main(){
    // steel water; the wake lifts it toward ice; sky is kept for the lit line only
    float lift = clamp(abs(vH) * 5.0, 0.0, 1.0);
    vec3 c = mix(uNavy, uIce, lift * 0.75);
    float a = mix(0.16, 0.55, smoothstep(0.15, 0.9, vDepth)) + lift * 0.45;
    if (vLit > 0.02) { c = mix(c, uSky, vLit); a = max(a, vLit); }
    // dawn: one hard gold line at the horizon row, not a tint
    float row = step(abs(vDepth - 0.035), 0.012) * uDawn;
    c = mix(c, uGold, row); a = max(a, row);
    a *= smoothstep(0.0, 0.12, vDepth) * (1.0 - smoothstep(1.6, 3.0, abs(vX)));
    gl_FragColor = vec4(c, a);
  }`;
const PULSE_VS = /* glsl */ `uniform float uSize; uniform float uPR; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = uSize * uPR * (2.0 / -mv.z); gl_Position = projectionMatrix * mv; }`;
const PULSE_FS = /* glsl */ `uniform vec3 uColor; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; float ring = step(0.36, d) * step(d, 0.46); float core = step(d, 0.2); gl_FragColor = vec4(mix(uColor, vec3(0.88, 0.96, 1.0), core), max(core, ring)); }`;

export function create(renderer, cfg) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.05, 50);
  const pr = renderer.getPixelRatio();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const disposables = [];
  const keep = (x) => (disposables.push(x), x);

  // wake
  const gl = renderer.getContext();
  const canFloat = renderer.capabilities.isWebGL2 && (gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"));
  const RES = cfg.wake || 128;
  let rtA = null;
  let rtB = null;
  let simScene = null;
  let simMat = null;
  const simCam = new Camera();
  if (canFloat) {
    const o = { type: HalfFloatType, format: RGBAFormat, minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false };
    rtA = keep(new WebGLRenderTarget(RES, RES, o));
    rtB = keep(new WebGLRenderTarget(RES, RES, o));
    simMat = keep(
      new ShaderMaterial({
        vertexShader: SIM_VS,
        fragmentShader: SIM_FS,
        uniforms: { uPrev: { value: rtA.texture }, uTexel: { value: new Vector2(1 / RES, 1 / RES) }, uDrops: { value: [0, 1, 2, 3].map(() => new Vector4()) }, uDamp: { value: 0.985 }, uShift: { value: 0 } },
        depthTest: false,
        depthWrite: false,
      })
    );
    simScene = new Scene();
    simScene.add(new Mesh(keep(new PlaneGeometry(2, 2)), simMat));
    [rtA, rtB].forEach((rt) => {
      renderer.setRenderTarget(rt);
      renderer.clear();
    });
    renderer.setRenderTarget(null);
  }

  // lines
  const N = cfg.seaLines || 220;
  const M = cfg.tier === "high" ? 150 : 100;
  const pos = new Float32Array(N * M * 3);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < M; i++) {
      const k = (j * M + i) * 3;
      pos[k] = X0 + ((X1 - X0) * i) / (M - 1);
      pos[k + 2] = Z0 + (SPAN * j) / N;
    }
  const idx = new Uint32Array(N * (M - 1) * 2);
  let q = 0;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < M - 1; i++) {
      idx[q++] = j * M + i;
      idx[q++] = j * M + i + 1;
    }
  const geo = keep(new BufferGeometry());
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setIndex(new BufferAttribute(idx, 1));
  const rings = [0, 1, 2, 3].map(() => new Vector4());
  const lineMat = keep(
    new ShaderMaterial({
      vertexShader: LINE_VS,
      fragmentShader: LINE_FS,
      uniforms: {
        uTime: { value: 0 },
        uTravel: { value: 0 },
        uWake: { value: rtA ? rtA.texture : null },
        uWakeOn: { value: rtA ? 1 : 0 },
        uAmp: { value: 0.045 },
        uRings: { value: rings },
        uMarkZ: { value: new Array(MARKS).fill(99) },
        uNavy: { value: new Color("#2a4a73") },
        uSky: { value: new Color("#38bdf8") },
        uIce: { value: new Color("#cdeeff") },
        uGold: { value: new Color("#fbbf24") },
        uDawn: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  );
  scene.add(new LineSegments(geo, lineMat));

  const pulseGeo = keep(new BufferGeometry());
  const pulsePos = new Float32Array(3);
  pulseGeo.setAttribute("position", new BufferAttribute(pulsePos, 3));
  const pulseMat = keep(new ShaderMaterial({ vertexShader: PULSE_VS, fragmentShader: PULSE_FS, uniforms: { uSize: { value: 44 }, uPR: { value: pr }, uColor: { value: new Color("#7dd3fc") } }, transparent: true, depthWrite: false, blending: AdditiveBlending }));
  scene.add(new Points(pulseGeo, pulseMat));

  // pointer / finger → the water
  const ray = new Raycaster();
  const water = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const ndc = new Vector2();
  let W = 1;
  let H = 1;
  let pulseUvY = 0.7;
  const toUv = (sx, sy) => {
    ndc.set((sx / W) * 2 - 1, -(sy / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(water, hit)) return null;
    return { x: (hit.x - X0) / (X1 - X0), y: (hit.z - Z0) / SPAN, z: hit.z, wx: hit.x };
  };
  function resize(w, h) {
    W = w;
    H = h;
    camera.aspect = w / h;
    const phone = camera.aspect < 0.8;
    camera.fov = phone ? 52 : 40;
    camera.position.set(0, phone ? 1.3 : 1.0, phone ? 1.75 : 1.9);
    camera.updateProjectionMatrix();
    // pitch up until the water's far edge sits below the title — the title is never on water
    const want = (params.titleBottom || 0) + 40;
    let lookY = 0;
    for (let k = 0; k < 40; k++) {
      camera.lookAt(0, lookY, phone ? -0.45 : -0.35);
      camera.updateMatrixWorld();
      v.set(0, 0, Z0 + 0.3).project(camera);
      const hy = ((1 - v.y) / 2) * H;
      if (hy >= want) break;
      lookY += 0.03;
    }
    const u = toUv(W / 2, H * 0.58);
    if (u) pulseUvY = u.y;
  }

  const stamps = [];
  let ringI = 0;
  let last = { x: -1, y: -1, t: 0 };
  function stampAt(sx, sy, s) {
    const u = toUv(sx, sy);
    if (!u || u.x < 0 || u.x > 1 || u.y < 0 || u.y > 1) return;
    const now = performance.now();
    if (Math.hypot(u.x - last.x, u.y - last.y) < 0.006 && now - last.t < 60) return;
    last = { x: u.x, y: u.y, t: now };
    stamps.push([u.x, u.y, s]);
    const r = rings[ringI++ % 4];
    r.set(u.x, u.y, 0, 1);
  }

  const params = { p: 0, marks: [], pulse: { x: 0, y: 0 }, stamp: stampAt, side: "right", titleBottom: 0 };
  const v = new Vector3();
  let lastTB = 0;
  const project = (x, z) => {
    v.set(x, 0, z).project(camera);
    return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
  };
  const markStart = (i) => Z0 - 0.35 - i * 0.62; // spaced upstream, arrive one by one
  let prevTravel = 0;
  let pulseX = 0.5;
  let prevPulseX = 0.5;

  function update(t, dt) {
    if (params.titleBottom !== lastTB) {
      lastTB = params.titleBottom;
      resize(W, H);
    }
    const time = t / 1000;
    const p = params.p;
    const travel = p * SPAN * 1.5;
    const shift = (travel - prevTravel) / SPAN;
    prevTravel = travel;
    prevPulseX = pulseX;
    // sways, and comes back to the centre by the end — where the arrival opens from it
    pulseX = 0.5 + Math.sin(p * Math.PI * 2) * 0.1;
    pulseMat.uniforms.uSize.value = 44 * (1 + (reduce ? 0 : 0.12 * Math.sin(time * 2.4)));
    // pulse sits still on the screen; the water moves under it
    const pz = Z0 + pulseUvY * SPAN;
    const pxw = X0 + pulseX * (X1 - X0);
    pulsePos[0] = pxw;
    pulsePos[1] = 0.02 + (reduce ? 0 : Math.sin(time * 2.8) * 0.004);
    pulsePos[2] = pz;
    pulseGeo.attributes.position.needsUpdate = true;
    const pp = project(pxw, pz);
    params.pulse = pp;

    // marks travel with the water
    const mz = lineMat.uniforms.uMarkZ.value;
    const marks = [];
    for (let i = 0; i < MARKS; i++) {
      const z = markStart(i) + travel;
      mz[i] = z >= Z0 && z <= Z1 ? z : 99;
      const vis = z > Z0 + 0.25 && z < Z1 - 0.05;
      // the logo rides its line beside the pulse's path, never off the screen
      const b = project(params.side === "left" ? -0.9 : 0.42, z);
      marks.push({ x: b.x, y: b.y, a: vis ? 1 : 0, lit: Math.abs(z - pz) < 0.08, passed: z > pz });
    }
    params.marks = marks;
    lineMat.uniforms.uTravel.value = travel;
    lineMat.uniforms.uTime.value = reduce ? 0 : time;
    lineMat.uniforms.uDawn.value = Math.min(1, Math.max(0, (p - 0.72) / 0.18));
    for (const r of rings)
      if (r.w > 0) {
        r.z += dt;
        if (r.z > 3) r.w = 0;
      }

    if (rtA) {
      const drops = simMat.uniforms.uDrops.value;
      const sp = Math.abs(shift) * 60 + Math.abs(pulseX - prevPulseX) * 30;
      drops[0].set(pulseX, pulseUvY, 0.008, reduce ? 0 : Math.min(0.4, 0.03 + sp * 9));
      for (let i = 1; i < 4; i++) {
        const s = stamps.shift();
        if (s) drops[i].set(s[0], s[1], 0.02, s[2]);
        else drops[i].set(0, 0, 0, 0);
      }
      simMat.uniforms.uShift.value = shift;
      for (let k = 0; k < 2; k++) {
        simMat.uniforms.uPrev.value = rtA.texture;
        renderer.setRenderTarget(rtB);
        renderer.render(simScene, simCam);
        [rtA, rtB] = [rtB, rtA];
        if (k === 0) {
          simMat.uniforms.uShift.value = 0;
          for (let i = 0; i < 4; i++) drops[i].set(0, 0, 0, 0);
        }
      }
      renderer.setRenderTarget(null);
      lineMat.uniforms.uWake.value = rtA.texture;
    }
  }

  return {
    params,
    clear: [0x050b16, 1],
    update,
    render: (r) => r.render(scene, camera),
    resize,
    dispose: () => disposables.forEach((x) => x.dispose()),
  };
}
