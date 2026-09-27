import { useEffect, useRef } from "react";
import { wave } from "./line";

/**
 * Leg 0 — the void. ~120 dots drift in and gather into a waveform while a
 * counter runs 00 → 100; the counter follows real loading (the motion chunk,
 * the globe, the display font), never faster than 900 ms, never longer than
 * 1.6 s. At 100 the waveform falls silent into one thin line and the line
 * shrinks to a point over Riyadh, where the globe's arcs take it.
 *
 * The overlay is in the prerendered markup and only shows under html.jn-intro
 * (set by the boot script before first paint), so the hero headline is in the
 * DOM from the first paint underneath it. Tap / Esc / Enter skips.
 */
const N = 120;
const MIN = 900;
const MAX = 1600;

export default function Preloader({ active, sources, onDone }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const countRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active) return undefined;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    // deterministic scatter: dots start on a loose ring around the centre
    const dots = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 * 7.3;
      const r = 0.28 + ((i * 37) % 100) / 180;
      return { a, r, u: i / (N - 1), s: 0.6 + ((i * 53) % 10) / 10 };
    });

    // loading progress: each source settles once
    let settled = 0;
    const total = Math.max(1, sources.length);
    let cancelled = false;
    sources.forEach((p) =>
      Promise.resolve(p)
        .catch(() => null)
        .then(() => {
          if (!cancelled) settled += 1;
        })
    );

    const start = performance.now();
    let shown = 0;
    let phase = "gather"; // gather → silence → out
    let phaseAt = 0;
    let raf = 0;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      root.setAttribute("data-out", "");
      document.documentElement.classList.add("jn-intro-done");
      setTimeout(() => onDone?.(), 470);
    };

    const skip = () => {
      if (phase === "gather") {
        phase = "silence";
        phaseAt = performance.now();
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };
    root.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const el = Math.max(0, now - start);
      const real = settled / total;
      const floor = Math.min(1, el / MIN);
      const ceiling = Math.min(1, el / MAX);
      const goal = Math.max(ceiling, Math.min(real, floor));
      shown += (goal - shown) * 0.18;
      if (goal >= 1 && shown > 0.995) shown = 1;
      if (countRef.current) countRef.current.textContent = String(Math.round(shown * 100)).padStart(2, "0");
      if (phase === "gather" && shown >= 1) {
        phase = "silence";
        phaseAt = now;
      }

      const cx = W / 2;
      const cy = H * 0.5;
      const span = Math.min(W * 0.72, 560);
      const x0 = cx - span / 2;
      const time = el / 1000;
      let gatherK = Math.min(1, shown * 1.15);
      gatherK = 1 - Math.pow(1 - gatherK, 3);
      let amp = Math.min(H * 0.07, 46) * (0.35 + 0.65 * shown);
      let shrink = 0;
      if (phase !== "gather") {
        const k = Math.min(1, (now - phaseAt) / 420);
        amp *= 1 - k; // the voice falls silent
        shrink = Math.max(0, (now - phaseAt - 260) / 360); // then the line draws into a point
        if (shrink >= 1) {
          finish();
          cancelAnimationFrame(raf);
        }
      }
      ctx.clearRect(0, 0, W, H);

      // the line itself, once the dots have mostly arrived
      const lineA = Math.max(0, (gatherK - 0.6) / 0.4);
      if (lineA > 0) {
        const s = Math.min(1, shrink);
        const half = (span / 2) * (1 - s);
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const u = i / 120;
          const x = cx - half + half * 2 * u;
          const y = cy + wave(u, time * 1.3, amp);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = `rgba(125,211,252,${0.9 * lineA})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(56,189,248,0.9)";
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // the dots
      for (const d of dots) {
        const tx = x0 + span * d.u;
        const ty = cy + wave(d.u, time * 1.3, amp);
        const drift = time * 0.25 * d.s;
        const sx = cx + Math.cos(d.a + drift) * d.r * Math.min(W, H);
        const sy = cy + Math.sin(d.a + drift) * d.r * Math.min(W, H) * 0.8;
        const x = sx + (tx - sx) * gatherK;
        const y = sy + (ty - sy) * gatherK;
        const a = (0.35 + 0.65 * gatherK) * (1 - lineA * 0.85) * (1 - Math.min(1, shrink));
        ctx.fillStyle = `rgba(186,230,253,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6 * d.s, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("keydown", onKey);
      root.removeEventListener("pointerdown", skip);
    };
  }, [active, sources, onDone]);

  return (
    <div ref={rootRef} className="jn-pre" aria-hidden="true">
      <canvas ref={canvasRef} className="jn-pre-canvas" />
      <span ref={countRef} className="jn-pre-count">
        00
      </span>
    </div>
  );
}
