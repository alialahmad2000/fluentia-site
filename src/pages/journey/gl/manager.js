/**
 * One WebGL context for the whole page.
 *
 * A single fixed canvas sits behind the page (z 0). Legs whose stage is
 * transparent (the globe, the phone, the sea) show their scene through it:
 * each frame the leg calls `show(name, weight)`; the manager renders the
 * heaviest request and hides the canvas when nobody asked. Opaque legs simply
 * cover it — no clipping, no second context, and the canvas is a fixed layer
 * the compositor never has to scroll.
 *
 * Scenes are modules loaded on demand (`warm(name)` a screen or two early) with
 * `create(renderer, cfg)` → { params, update(t, dt), render(renderer), resize(w, h),
 * dispose() }. A scene far from the screen is disposed to keep iOS memory low.
 *
 * Context loss never changes the layout: the canvas hides, `data-jn-gl="lost"`
 * shows the stills, and a restored context rebuilds the scenes.
 */
import { subscribe } from "../core/ticker";

const FACTORIES = {
  globe: () => import("./globe"),
  phone: () => import("./phone"),
  sea: () => import("./sea"),
};

let THREE = null;
let renderer = null;
let canvas = null;
let cfg = null;
let lost = false;
const scenes = new Map(); // name → { inst, loading, lastShown }
let request = null;
let requestW = -1;
let requestT = -1;
let shownName = null;
let size = { w: 0, h: 0, dpr: 1 };
let unsub = null;
const listeners = new Set();

function setGLState(s) {
  document.documentElement.setAttribute("data-jn-gl", s);
  listeners.forEach((f) => f(s));
}
export function onGLState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function attach(el, config) {
  canvas = el;
  cfg = config;
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  unsub = subscribe(frame, 1, { passive: true });
  setGLState("idle");
}

export function detach() {
  unsub?.();
  unsub = null;
  for (const [, s] of scenes) s.inst?.dispose();
  scenes.clear();
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss?.();
  }
  renderer = null;
  canvas?.removeEventListener("webglcontextlost", onLost);
  canvas?.removeEventListener("webglcontextrestored", onRestored);
  canvas = null;
  document.documentElement.removeAttribute("data-jn-gl");
}

async function ensureRenderer() {
  if (renderer || !canvas || !cfg?.webgl) return renderer;
  if (!THREE) THREE = await import("three");
  if (renderer || !canvas) return renderer;
  const dpr = Math.min(window.devicePixelRatio || 1, cfg.dpr);
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: dpr < 2,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
  } catch {
    lost = true;
    setGLState("lost");
    return null;
  }
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  size = { w: 0, h: 0, dpr };
  setGLState("ready");
  return renderer;
}

/** Load a scene ahead of time (call when its leg is within a screen or two). */
export async function warm(name) {
  if (!cfg?.webgl || lost) return null;
  const s = scenes.get(name);
  if (s?.inst) return s.inst;
  if (s?.loading) return s.loading;
  const loading = (async () => {
    const r = await ensureRenderer();
    if (!r) return null;
    const mod = await FACTORIES[name]();
    if (!renderer || lost) return null;
    const inst = mod.create(renderer, cfg);
    inst.resize(size.w || window.innerWidth, size.h || window.innerHeight);
    scenes.set(name, { inst, loading: null, lastShown: 0 });
    return inst;
  })();
  scenes.set(name, { inst: null, loading, lastShown: 0 });
  return loading;
}

/** The scene's live params object (null until loaded). */
export function params(name) {
  return scenes.get(name)?.inst?.params || null;
}
export function scene(name) {
  return scenes.get(name)?.inst || null;
}

/** Ask for a scene this frame. The heaviest ask wins. */
export function show(name, weight, t) {
  if (t !== requestT) {
    requestT = t;
    request = null;
    requestW = -1;
  }
  if (weight > requestW) {
    request = name;
    requestW = weight;
  }
}

/** Free a scene that is far away. */
export function release(name) {
  const s = scenes.get(name);
  if (!s?.inst) return;
  s.inst.dispose();
  scenes.delete(name);
}

function resizeIfNeeded() {
  const w = window.innerWidth;
  // the canvas is 100lvh in CSS; its buffer and every scene use that exact height
  const h = window.__jnLVH || window.innerHeight;
  if (w === size.w && h === size.h) return;
  size.w = w;
  size.h = h;
  renderer.setSize(w, h, false);
  for (const [, s] of scenes) s.inst?.resize(w, h);
}

function frame(t, dt) {
  if (!canvas) return;
  const name = requestT === t ? request : null;
  const s = name ? scenes.get(name) : null;
  if (!s?.inst || lost || !renderer) {
    if (shownName) {
      canvas.style.visibility = "hidden";
      shownName = null;
    }
    return;
  }
  resizeIfNeeded();
  if (shownName !== name) {
    canvas.style.visibility = "visible";
    shownName = name;
  }
  s.lastShown = t;
  s.inst.update(t, dt);
  const [c, a] = s.inst.clear || [0x000000, 0];
  renderer.setClearColor(c, a);
  s.inst.render(renderer);
}

function onLost(e) {
  e.preventDefault();
  lost = true;
  canvas.style.visibility = "hidden";
  shownName = null;
  setGLState("lost");
}

function onRestored() {
  lost = false;
  for (const [, s] of scenes) s.inst?.dispose();
  scenes.clear();
  renderer?.dispose();
  renderer = null;
  setGLState("idle");
}
