import { useEffect, useRef } from "react";

/**
 * Starfield — one fixed 2D canvas behind the whole page.
 *
 * Two depth layers plus a handful of bright stars, drifting very slowly and
 * sliding at two speeds against the scroll. It redraws at ~30 fps while the
 * page scrolls and ~12 fps when it is still (the drift is 1–2 px/s, so the eye
 * cannot tell), and not at all in a background tab. The loop starts only after
 * the page's load event + idle, so it never competes with hydration (it cost
 * ~0.8 s of main thread in a throttled mobile Lighthouse run when it started at
 * once). Reduced motion: one still frame. `density` 0 renders nothing.
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
    let lastSy = -1;
    let started = false;
    let visible = document.visibilityState === "visible";
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();

    const draw = (now) => {
      raf = 0;
      if (!visible) return;
      const sy = window.scrollY;
      const scrolling = sy !== lastSy;
      if (!still) raf = requestAnimationFrame(draw);
      if (!still && now - last < (scrolling ? 32 : 80)) return;
      last = now;
      lastSy = sy;
      const t = (now - t0) / 1000;
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
      if (canvas.style.opacity !== "1") canvas.style.opacity = "1";
    };
    const kick = () => {
      if (started && !raf && visible) raf = requestAnimationFrame(draw);
    };
    const onScrollStill = () => kick();
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
    if (still) window.addEventListener("scroll", onScrollStill, { passive: true });

    // Start after load + idle: the first screen and hydration get the main thread first.
    let idleId = 0;
    let startT = 0;
    const start = () => {
      started = true;
      kick();
    };
    const schedule = () => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(start, { timeout: 1500 });
      else startT = setTimeout(start, 400);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (idleId) window.cancelIdleCallback?.(idleId);
      clearTimeout(startT);
      window.removeEventListener("load", schedule);
      window.removeEventListener("scroll", onScrollStill);
      clearTimeout(resizeT);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      className="fx-stars"
      aria-hidden="true"
      style={{ opacity: 0, transition: "opacity 900ms ease-out" }}
    />
  );
}
