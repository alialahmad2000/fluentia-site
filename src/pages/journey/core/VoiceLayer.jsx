import { useEffect, useRef } from "react";
import { subscribe } from "./ticker";
import { currentDrawer } from "./voice";

/**
 * The fixed screen layer the voice is drawn on whenever it is a screen-space
 * object (the fall, the silent floor line, the lift into the phone). It only
 * subscribes to the clock while a leg that uses it is near the screen; with
 * nobody claiming it, it clears once and stays idle.
 */
export default function VoiceLayer() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let dirty = false;
    const size = () => {
      const w = window.innerWidth;
      const h = window.__jnLVH || window.innerHeight;
      if (w === W && h === H) return;
      W = w;
      H = h;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
    };
    size();
    window.addEventListener("resize", size);
    const render = (t) => {
      const d = currentDrawer(t);
      if (!d) {
        if (dirty) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, c.width, c.height);
          dirty = false;
        }
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      d.drawer(ctx, W, H);
      dirty = true;
    };
    const unsub = subscribe(render, 1, { passive: true });
    return () => {
      unsub();
      window.removeEventListener("resize", size);
      c.width = c.height = 0;
    };
  }, []);
  return <canvas ref={ref} className="jn-voice" aria-hidden="true" />;
}
