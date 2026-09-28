/**
 * The climb, as film. The mountain is the real Everest massif (Copernicus
 * GLO-30 DEM), rendered offline along the real route; this player scrubs those
 * frames with scroll.
 *
 *   ascent position p (0 base camp … 7 above the clouds)
 *     → frame index (per-chapter ranges from the manifest)
 *     → the two nearest decoded frames, cross-faded on a <canvas>
 *
 * Decoding happens in a worker (createImageBitmap); the page keeps an LRU of
 * decoded frames around the current position. If a frame isn't ready, the
 * nearest decoded one stands in and the canvas never goes blank.
 *
 * Live, cheap overlays on a second canvas: blowing snow (stronger with
 * altitude), stars that twinkle at night, and a 1–2 % pointer/sway parallax.
 *
 * Same interface the old WebGL engine had: frame(p, now, pointer), resize(), dispose().
 */

const LRU_MAX = 28;
const ss = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

async function supportsAvif() {
  const probe = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAKAAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAMG1kYXQSAAoIGAAGiAhoNCAyGhlHh4Yhh5555oAAAJBAyRxhZQao5pAOCoaA"; // 1×1, encoded with the same encoder as the frames
  try {
    const r = await fetch(probe);
    const b = await r.blob();
    const bm = await createImageBitmap(b);
    bm.close && bm.close();
    return true;
  } catch {
    return false;
  }
}

export async function createPlayer({ canvas, fxCanvas, tier, onFirstFrame, onProgress }) {
  const manifest = await fetch("/media/ascent/frames/manifest.json").then((r) => r.json());
  const portrait = () => window.innerWidth / window.innerHeight < 1;
  const avif = await supportsAvif();
  const ext = avif ? "avif" : "webp";
  const setFor = (port) => (port ? (tier === "high" ? "m" : "mm") : tier === "high" ? "d" : "dm");

  const ctx = canvas.getContext("2d", { alpha: false });
  const fx = fxCanvas ? fxCanvas.getContext("2d") : null;
  const count = manifest.count;
  const chapters = manifest.chapters; // [{ start, end }] per chapter, inclusive

  let set = setFor(portrait());
  let worker = null;
  const cache = new Map(); // i -> ImageBitmap (insertion order = LRU)
  const pending = new Set();
  let lastDrawn = -1;
  let lastKey = "";
  let first = true;
  let dead = false;

  const urlsFor = (s) => Array.from({ length: count }, (_, i) => `/media/ascent/frames/${s}/${String(i).padStart(3, "0")}.${ext}`);
  const order = () => {
    const seen = new Set();
    const out = [];
    for (const step of [8, 4, 2, 1])
      for (let i = 0; i < count; i += step)
        if (!seen.has(i)) {
          seen.add(i);
          out.push(i);
        }
    return out;
  };

  function startWorker() {
    if (worker) worker.terminate();
    cache.forEach((b) => b.close && b.close());
    cache.clear();
    pending.clear();
    worker = new Worker(new URL("./frames.worker.js", import.meta.url), { type: "module" });
    const coarse = [];
    for (let i = 0; i < count; i += 8) coarse.push(i);
    worker.postMessage({ type: "init", urls: urlsFor(set), coarse });
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "bitmap") {
        pending.delete(m.i);
        if (dead) {
          m.bitmap.close && m.bitmap.close();
          return;
        }
        cache.delete(m.i);
        cache.set(m.i, m.bitmap);
        while (cache.size > LRU_MAX) {
          const k = cache.keys().next().value;
          if (Math.abs(k - lastDrawn) < 3) {
            // never evict what is on screen: move it to the fresh end
            const b = cache.get(k);
            cache.delete(k);
            cache.set(k, b);
            if (cache.size <= LRU_MAX + 2) break;
            continue;
          }
          const b = cache.get(k);
          cache.delete(k);
          b.close && b.close();
        }
        lastKey = ""; // redraw with the new frame
      } else if (m.type === "error") pending.delete(m.i);
      else if (m.type === "progress" && onProgress) onProgress(m);
    };
    // bytes stream in the background — but only once the hero has painted
    const go = () => worker && worker.postMessage({ type: "order", indices: order() });
    if (document.readyState === "complete") setTimeout(go, 300);
    else window.addEventListener("load", () => setTimeout(go, 300), { once: true });
  }
  startWorker();

  /* p → fractional frame index, chapter by chapter */
  function frameAt(p) {
    const c = Math.max(0, Math.min(chapters.length - 1, Math.floor(p)));
    const f = Math.max(0, Math.min(1, p - c));
    const { start, end } = chapters[c];
    return Math.min(count - 1, start + f * (end + 1 - start) - (c === chapters.length - 1 ? f : 0));
  }

  function want(center, dir) {
    const list = [];
    const ahead = dir >= 0 ? 1 : -1;
    for (let d = 0; d <= 8; d++) {
      for (const s of d === 0 ? [0] : [d * ahead, -d * ahead]) {
        const i = Math.round(center) + s;
        if (i < 0 || i >= count) continue;
        if (Math.abs(s) > 4 && Math.sign(s) !== ahead) continue;
        if (!cache.has(i) && !pending.has(i)) list.push(i);
      }
    }
    if (list.length) {
      list.forEach((i) => pending.add(i));
      worker.postMessage({ type: "want", indices: list });
    }
  }

  function nearest(i) {
    if (cache.has(i)) return i;
    for (let d = 1; d < count; d++) {
      if (cache.has(i - d)) return i - d;
      if (cache.has(i + d)) return i + d;
    }
    return -1;
  }

  /* sizing */
  let W = 1;
  let H = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.round(canvas.clientWidth * dpr) || 1;
    H = Math.round(canvas.clientHeight * dpr) || 1;
    canvas.width = W;
    canvas.height = H;
    if (fxCanvas) {
      fxCanvas.width = Math.round(fxCanvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5)) || 1;
      fxCanvas.height = Math.round(fxCanvas.clientHeight * Math.min(window.devicePixelRatio || 1, 1.5)) || 1;
    }
    const s = setFor(portrait());
    if (s !== set) {
      set = s;
      startWorker();
    }
    lastKey = "";
  }
  resize();

  function cover(b, alpha, px, py, zoom) {
    const s = Math.max(W / b.width, H / b.height) * zoom;
    const w = b.width * s;
    const h = b.height * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(b, (W - w) / 2 + px * W, (H - h) / 2 + py * H, w, h);
  }

  /* overlays: snow + stars */
  const touch = window.matchMedia("(hover: none)").matches;
  const NSNOW = tier === "high" ? 150 : 60;
  const snow = Array.from({ length: NSNOW }, (_, k) => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, k }));
  const stars = Array.from({ length: tier === "high" ? 110 : 60 }, () => ({ x: Math.random(), y: Math.random() * 0.42, r: Math.random() < 0.08 ? 1.6 : 0.8 + Math.random() * 0.5, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.6 }));
  let lastT = 0;
  function drawFx(p, t) {
    if (!fx) return;
    const w = fxCanvas.width;
    const h = fxCanvas.height;
    fx.clearRect(0, 0, w, h);
    const dt = lastT ? Math.min(0.05, t - lastT) : 0.016;
    lastT = t;
    // stars: the night of the high zone
    const night = ss(3.85, 4.1, p) * (1 - ss(4.85, 5.05, p));
    if (night > 0.01) {
      fx.fillStyle = "#e8f0ff";
      for (const s of stars) {
        const a = night * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)));
        fx.globalAlpha = a;
        fx.beginPath();
        fx.arc(s.x * w, s.y * h, s.r * (w / 1200 + 0.6), 0, 6.283);
        fx.fill();
      }
    }
    // the sun on the horizon at the summit: a warm light that breathes
    const sun = ss(4.95, 5.25, p);
    if (sun > 0.01) {
      const port = w < h;
      const cx = port ? -0.05 * w : 0.08 * w;
      const cy = (port ? 0.44 : 0.4) * h;
      const r = (port ? 1.1 : 0.62) * w;
      const g = fx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const a = sun * (0.3 + 0.05 * Math.sin(t * 0.6));
      g.addColorStop(0, `rgba(255, 214, 150, ${a})`);
      g.addColorStop(0.35, `rgba(255, 170, 110, ${a * 0.45})`);
      g.addColorStop(1, "rgba(255, 150, 100, 0)");
      fx.globalCompositeOperation = "lighter";
      fx.globalAlpha = 1;
      fx.fillStyle = g;
      fx.fillRect(0, 0, w, h);
      fx.globalCompositeOperation = "source-over";
    }
    // snow: calm at base camp, still in the basin, wind-driven up high
    const alt = Math.min(1, p / 5);
    const basin = ss(2.05, 2.3, p) * (1 - ss(2.7, 2.95, p));
    const calmSky = ss(4.8, 5.1, p); // the sunrise is still air
    const amount = (0.2 + alt * 0.55) * (1 - basin * 0.8) * (1 - calmSky * 0.9);
    const wind = (0.02 + alt * 0.22 + ss(3.8, 4.4, p) * 0.2) * (1 - calmSky);
    const n = Math.round(NSNOW * amount);
    fx.fillStyle = "#ffffff";
    for (let k = 0; k < n; k++) {
      const s = snow[k];
      s.x += (wind * s.z) * dt * 0.6;
      s.y += (0.05 + s.z * 0.08) * dt * (1 - basin * 0.85);
      if (s.x > 1.05) s.x -= 1.1;
      if (s.y > 1.05) s.y -= 1.1;
      fx.globalAlpha = 0.25 + s.z * 0.4;
      const r = (0.6 + s.z * 1.5) * (w / 1200 + 0.5);
      if (wind > 0.25) {
        // a short soft streak, not a dash: a round flake with a faint tail
        fx.beginPath();
        fx.arc(s.x * w, s.y * h, r, 0, 6.283);
        fx.fill();
        fx.globalAlpha *= 0.35;
        fx.fillRect(s.x * w - r * wind * 5, s.y * h - r * 0.35, r * wind * 5, r * 0.7);
      } else {
        fx.beginPath();
        fx.arc(s.x * w, s.y * h, r, 0, 6.283);
        fx.fill();
      }
    }
    fx.globalAlpha = 1;
  }

  let lastF = 0;
  const t0 = performance.now();
  function frame(p, now, pointer) {
    if (dead) return;
    const t = (now - t0) / 1000;
    const f = frameAt(p);
    const dir = f - lastF;
    lastF = f;
    const i0 = Math.floor(f);
    const i1 = Math.min(count - 1, i0 + 1);
    const tf = f - i0;
    want(f, dir);

    const px = touch ? Math.sin(t * 0.13) * 0.006 : -(pointer ? pointer.x : 0) * 0.01;
    const py = touch ? Math.sin(t * 0.09 + 1.1) * 0.004 : -(pointer ? pointer.y : 0) * 0.008;
    const zoom = 1.03;
    const a = nearest(i0);
    const key = `${a}|${cache.has(i1) ? i1 : -1}|${tf.toFixed(3)}|${px.toFixed(4)}|${py.toFixed(4)}|${W}x${H}`;
    if (a >= 0 && key !== lastKey) {
      lastKey = key;
      cover(cache.get(a), 1, px, py, zoom);
      if (a === i0 && i1 !== i0 && cache.has(i1) && tf > 0.001) cover(cache.get(i1), tf, px, py, zoom);
      ctx.globalAlpha = 1;
      lastDrawn = a;
      if (first) {
        first = false;
        if (onFirstFrame) onFirstFrame();
      }
    }
    drawFx(p, t);
  }

  function dispose() {
    dead = true;
    if (worker) worker.terminate();
    worker = null;
    cache.forEach((b) => b.close && b.close());
    cache.clear();
  }

  return { frame, resize, dispose, ext };
}
