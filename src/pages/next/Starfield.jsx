import { useEffect, useRef } from "react";

/**
 * Starfield — one fixed 2D canvas behind the whole page.
 *
 * Two depth layers plus a handful of bright stars, drifting very slowly and
 * sliding at two speeds against the scroll. It redraws at ~30 fps at most, and
 * not at all in a background tab. `density` 0 renders nothing (low tier).
 */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Starfield({ density = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !density) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars = [];

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const rand = rng(20210901);
      const count = Math.round(((w * h) / 5200) * density);
      stars = Array.from({ length: count }, (_, i) => {
        const near = rand() < 0.28;
        const bright = rand() < 0.035;
        return {
          x: rand() * w,
          y: rand() * h,
          r: bright ? 1.25 : near ? 0.55 + rand() * 0.45 : 0.35 + rand() * 0.3,
          a: bright ? 0.95 : near ? 0.45 + rand() * 0.35 : 0.2 + rand() * 0.3,
          par: near || bright ? 0.07 : 0.025,
          drift: near ? 2.2 : 1.1,
          tw: i % 9 === 0 ? 0.6 + rand() * 1.4 : 0,
          ph: rand() * 6.28,
        };
      });
    };
    build();

    let raf = 0;
    let last = 0;
    let visible = document.visibilityState === "visible";
    const t0 = performance.now();

    const draw = (now) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(draw);
      if (now - last < 32) return;
      last = now;
      const t = (now - t0) / 1000;
      const sy = window.scrollY;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        let x = (s.x - t * s.drift) % w;
        if (x < 0) x += w;
        let y = (s.y - sy * s.par) % h;
        if (y < 0) y += h;
        const a = s.tw ? s.a * (0.65 + 0.35 * Math.sin(t * s.tw + s.ph)) : s.a;
        ctx.globalAlpha = a;
        ctx.fillStyle = s.r > 1 ? "#f3ede2" : "#dbe8f5";
        ctx.fillRect(x, y, s.r * 2, s.r * 2);
      }
      ctx.globalAlpha = 1;
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      visible = document.visibilityState === "visible";
      kick();
    };
    let resizeT = 0;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        // Mobile browsers fire resize as the toolbar slides; only rebuild on a real change.
        if (Math.abs(window.innerWidth - w) > 2 || Math.abs(window.innerHeight - h) > 120) build();
      }, 150);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize, { passive: true });
    kick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={ref} className="fx-stars" aria-hidden="true" />;
}
