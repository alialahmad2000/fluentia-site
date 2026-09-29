import { useEffect, useRef } from "react";
import BrandMark from "../../../components/BrandMark";
import DOTS from "../data/globe-dots.json";
import { wave } from "../core/voice";
import * as gl from "../gl/manager";

/**
 * Leg 0 — the intro. Desktop, first visit only (never on touch or in-app: those
 * visitors get content in the first paint). ~1.4 s.
 *
 * The world as dots — the globe's own grid, flat — and the voice drawing
 * itself across it: the line's length IS the counter. The count follows a
 * stepped curve (the reference's), waits for the globe up to 2 s, then the
 * voice falls silent and contracts onto Riyadh, and the night globe is
 * revealed around that point. The overlay is in the prerendered markup and
 * shows only under html.jn-intro, so the hero is painted underneath from the
 * first frame. Tap / Esc skips.
 */
const STEPS = [
  [0, 0],
  [0.1, 0.3],
  [0.35, 0.4],
  [0.45, 0.65],
  [0.6, 0.7],
  [0.8, 0.8],
  [0.85, 0.95],
  [1, 1],
];
const stepped = (x) => {
  for (let i = 1; i < STEPS.length; i++) {
    const [a, va] = STEPS[i - 1];
    const [b, vb] = STEPS[i];
    if (x <= b) return va + ((vb - va) * (x - a)) / (b - a);
  }
  return 1;
};
const DUR = 1300;
const RUH = { lat: 24.71, lon: 46.68 };

export default function Intro({ active, onDone }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // the flat world, same grid as the globe (every other dot keeps it light)
    const mapW = Math.min(W * 0.86, 1100);
    const mapH = mapW * 0.5;
    const mx = (W - mapW) / 2;
    const my = H * 0.44 - mapH / 2;
    const px = (lon) => mx + ((lon + 180) / 360) * mapW;
    const py = (lat) => my + ((80 - lat) / 160) * mapH;
    const dots = [];
    DOTS.rows.split(";").forEach((row, ri) => {
      if (ri % 2) return;
      const [r, cols] = row.split(":");
      const lat = DOTS.lat0 + Number(r) * DOTS.step;
      const lonStep = DOTS.step / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
      cols.split(",").forEach((k, j) => {
        if (j % 2) return;
        dots.push([px(-180 + Number(k) * lonStep), py(lat), Math.random()]);
      });
    });
    const rx = px(RUH.lon);
    const ry = py(RUH.lat);
    const lineY = H * 0.44 + mapH / 2 + 56;
    const x0 = W * 0.18;
    const x1 = W * 0.82;

    const globeReady = gl.warm("globe") || Promise.resolve();
    let ready = false;
    Promise.race([globeReady, new Promise((r) => setTimeout(r, 2000))]).then(() => (ready = true));

    const t0 = performance.now();
    let endAt = 0;
    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.setAttribute("data-out", "");
      setTimeout(onDone, 520);
    };
    const skip = () => {
      if (!endAt) endAt = performance.now();
    };
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };
    root.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const el = now - t0;
      let k = stepped(Math.min(1, el / DUR));
      if (!ready) k = Math.min(k, 0.95);
      if (k >= 1 && !endAt) endAt = now;
      countRef.current.textContent = String(Math.round(k * 100)).padStart(2, "0");
      ctx.clearRect(0, 0, W, H);
      const time = el / 1000;
      // map dots: pop in, then breathe
      for (const d of dots) {
        const a = Math.min(1, el / 500 + d[2] * 0.3) * (0.16 + 0.12 * Math.sin(time * 1.8 + d[2] * 20));
        ctx.fillStyle = `rgba(201,216,234,${a.toFixed(3)})`;
        ctx.fillRect(d[0] - 0.9, d[1] - 0.9, 1.8, 1.8);
      }
      // RUH: gold, waiting
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.sin(time * 4) * 0.8, 0, Math.PI * 2);
      ctx.fill();

      const out = endAt ? Math.min(1, (now - endAt) / 620) : 0;
      const silence = Math.min(1, out / 0.4);
      const pull = Math.max(0, (out - 0.25) / 0.75);
      const e = pull < 0.5 ? 4 * pull ** 3 : 1 - (-2 * pull + 2) ** 3 / 2;
      // contract onto Riyadh on the GLOBE (revealed behind), not on the flat map
      const g = gl.params("globe");
      const tx = g && g.ruh && g.ruh.x ? g.ruh.x : rx;
      const ty = g && g.ruh && g.ruh.x ? g.ruh.y : ry;
      const len = (x1 - x0) * k;
      const a0 = x0 + (x1 - x0 - len) / 2;
      const pts = [];
      for (let i = 0; i <= 90; i++) {
        const u = i / 90;
        const bx = a0 + len * u;
        const by = lineY + wave(u, time * 1.6, 22 * (1 - silence));
        pts.push([bx + (tx - bx) * e, by + (ty - by) * e]);
      }
      ctx.lineCap = "round";
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = "rgba(56,189,248,0.25)";
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      if (out >= 1) {
        cancelAnimationFrame(raf);
        finish();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
      canvas.width = canvas.height = 0;
    };
  }, [active, onDone]);

  return (
    <div ref={rootRef} className="jn-intro" aria-hidden="true">
      <canvas ref={canvasRef} className="jn-intro-canvas" />
      <div className="jn-intro-mark">
        <BrandMark size={40} />
      </div>
      <span ref={countRef} className="jn-intro-count">
        00
      </span>
    </div>
  );
}
