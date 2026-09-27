import { useEffect, useRef } from "react";
import { voice, voiceTo, wave } from "./line";

/**
 * The protagonist on the white page (legs 2 → 3), in one fixed layer.
 *
 * It appears as the atmosphere clears — drawn out from the centre, flat, at
 * the floor of the screen — and stays there, trembling faintly, while the
 * statement and the pains pass above it. When «أول كلمة» takes the screen,
 * the line is lifted by its middle (the crane), and reeled into the rising
 * phone's microphone; its trembling becomes a voice on the way in. After
 * that the phone's own recording bars carry it, and then the track.
 *
 * Geometry is read from the DOM every frame (the hero, the first-word stage
 * and the `.jn-mic` point), so it holds at any size.
 */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function LineLayer() {
  const svgRef = useRef(null);
  const glowRef = useRef(null);
  const coreRef = useRef(null);
  const floorRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const hero = document.getElementById("jn-top");
    const first = document.getElementById("jn-first");
    if (!svg || !hero || !first) return undefined;
    let raf = 0;
    let shown = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const hr = hero.getBoundingClientRect();
      const fr = first.getBoundingClientRect();
      const dive = clamp01(-hr.top / Math.max(1, hr.height - H));
      const lift = clamp01(-fr.top / Math.max(1, fr.height - H));
      const draw = clamp01((dive - 0.8) / 0.17);
      const s = clamp01((lift - 0.06) / 0.4); // 0 → 1: lifted, then reeled in
      const visible = dive > 0.8 && s < 1 && hr.bottom < H + 2;
      if (visible !== shown) {
        shown = visible;
        svg.style.opacity = visible ? "1" : "0";
        if (!visible) floorRef.current.style.opacity = "0";
      }
      if (!visible) return;
      // the floor's white fade only while text is passing over the line
      floorRef.current.style.opacity = (draw * (1 - clamp01(s / 0.25))).toFixed(3);

      const phone = W < 720;
      const floorY = H * (phone ? 0.87 : 0.85);
      const x0 = W * (phone ? 0.06 : 0.08);
      const x1 = W - x0;
      const cx = W / 2;
      let mx = cx;
      let my = H * 0.6;
      const mic = document.querySelector(".jn-mic");
      if (mic) {
        const r = mic.getBoundingClientRect();
        mx = r.left + r.width / 2;
        my = r.top + r.height / 2;
      }

      // the voice wakes as it rises
      voiceTo({ amp: 1.4 + s * 16, energy: s, thick: 2 + s * 1.2 });
      const v = voice(now);

      const e = ease(clamp01(s / 0.5));
      const reel = ease(clamp01((s - 0.5) / 0.5)) * 0.5;
      const px = cx + (mx - cx) * e;
      const py = floorY + (my - floorY) * e;
      const u0 = Math.max(reel, 0.5 - draw * 0.5);
      const u1 = 1 - u0;
      let d = "";
      for (let i = 0; i <= 120; i++) {
        const u = u0 + (u1 - u0) * (i / 120);
        const fx = x0 + (x1 - x0) * u;
        const w = Math.pow(Math.sin(Math.PI * u), 1.5 + 3 * e) * e;
        const x = fx + (px - fx) * w;
        const y = floorY + (py - floorY) * w + wave(u, v.t, v.amp) * (1 - w * 0.6);
        d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      if (u1 - u0 < 0.002) d = "";
      coreRef.current.setAttribute("d", d);
      glowRef.current.setAttribute("d", d);
      coreRef.current.setAttribute("stroke-width", v.thick.toFixed(2));
      glowRef.current.setAttribute("stroke-width", (v.thick * 5).toFixed(2));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div ref={floorRef} className="jn-floor" aria-hidden="true" />
      <svg ref={svgRef} className="jn-linelayer" aria-hidden="true">
        <path ref={glowRef} className="jn-ll-glow" fill="none" />
        <path ref={coreRef} className="jn-ll-core" fill="none" />
      </svg>
    </>
  );
}
