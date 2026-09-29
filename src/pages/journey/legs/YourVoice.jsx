import { useEffect, useRef } from "react";
import V5SpeakDemo from "../../v5/V5SpeakDemo";
import { useJourney } from "../context";
import { subscribe } from "../core/ticker";
import { vh, onLayout } from "../core/viewport";
import { shared } from "../core/shared";
import { wave, SKY } from "../core/voice";

/**
 * Leg 4 — your voice. The recording booth: one line through the dark.
 *
 * The voice comes down out of the phone's microphone, straight into the real
 * speaking demo's microphone (V5SpeakDemo — Whisper → coach → «كيف تُقال
 * بثقة», with a typed fallback in in-app browsers), and from there spreads
 * sideways across the whole booth, behind the card. From here the line is the
 * visitor's own: while they record, its amplitude is their microphone level,
 * read from the demo's meter (`--lvl`); while it thinks it shimmers; when the
 * answer lands it settles into a calm, confident wave. The demo's code is
 * untouched — its phase is read from `data-phase` on its stage.
 */
export default function YourVoice() {
  const { reduce } = useJourney();
  const secRef = useRef(null);
  const canvasRef = useRef(null);
  const connRef = useRef(null);
  const edgeRef = useRef(null);

  useEffect(() => {
    const sec = secRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let micX = 0;
    let micY = 0;
    let lineY = 0;
    let fromX = 0;
    let top = 0;
    let cardL = 0;
    let cardR = 0;
    let dipY = 0;
    const layout = () => {
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      const sr = sec.getBoundingClientRect();
      top = sr.top + window.scrollY;
      const mic = sec.querySelector(".sd-mic") || sec.querySelector(".sd-stage");
      if (mic) {
        const m = mic.getBoundingClientRect();
        micX = m.left + m.width / 2 - sr.left;
        micY = m.top + m.height / 2 - sr.top;
      }
      // on a phone the card fills the width: the line runs just below it instead
      const card = sec.querySelector(".sd-stage");
      lineY = micY;
      if (card) {
        const cr = card.getBoundingClientRect();
        cardL = cr.left - sr.left;
        cardR = cr.right - sr.left;
        if (W < 720) lineY = cr.bottom - sr.top + 40;
      }
      // on the text side the line dips below the scene chips, never through them
      const scenes = sec.querySelector(".sd-privacy") || sec.querySelector(".sd-scenes");
      dipY = scenes ? scenes.getBoundingClientRect().bottom - sr.top + 56 : lineY;
      // the thread from the phone's mic comes down to the booth, then bends into the demo's mic
      fromX = shared.firstMic.x - sr.left;
      const gap = shared.firstMic.fromBottom;
      const conn = connRef.current;
      conn.style.left = `${fromX - 1.5}px`;
      conn.style.top = `${-gap}px`;
      conn.style.height = `${gap}px`;
      conn.style.setProperty("--flow", `${gap}px`);
      const edge = edgeRef.current;
      const edgeTop = W < 720 ? lineY : lineY;
      edge.style.top = `${edgeTop}px`;
      edge.style.setProperty("--flow", `${H - edgeTop}px`);
    };
    layout();
    const offLayout = onLayout(layout);
    const ro = new ResizeObserver(layout);
    ro.observe(sec);

    let level = 0;
    let unsub = null;
    let meter = null;
    let stage = null;
    const draw = (t, dt, sy) => {
      const time = t / 1000;
      if (!meter || !meter.isConnected) meter = sec.querySelector(".sd-mic");
      if (!stage || !stage.isConnected) stage = sec.querySelector(".sd-stage");
      const phase = stage?.getAttribute("data-phase") || "idle";
      const lvl = meter ? parseFloat(meter.style.getPropertyValue("--lvl")) || 0 : 0;
      const want = phase === "recording" ? 0.14 + lvl * 1.5 : phase === "result" ? 0.34 : phase === "hearing" || phase === "coaching" ? 0.26 : 0.22;
      level += (Math.min(1.3, want) - level) * (1 - Math.exp(-dt * (phase === "recording" ? 18 : 4)));
      // opens sideways from the mic as the booth comes into view (scroll-driven: everyone sees it)
      const centre = top + micY - sy;
      const e = reduce ? 1 : 1 - Math.pow(1 - Math.min(1, Math.max(0, (vh() * 0.85 - centre) / (vh() * 0.4))), 3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const amp = Math.min(H * 0.2, 140) * level;
      const speed = phase === "recording" ? 3.2 : phase === "result" ? 0.9 : 1.3;
      ctx.strokeStyle = SKY;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (W < 720) {
        // phone: from the phone's mic the voice takes the right edge down, clear of every word
        ctx.moveTo(fromX, 0);
        ctx.bezierCurveTo(fromX, 40, W - 8, 20, W - 8, 70);
        ctx.lineTo(W - 8, lineY);
      } else {
        ctx.moveTo(fromX, 0);
        ctx.bezierCurveTo(fromX, micY * 0.55, micX, micY * 0.45, micX, micY);
      }
      ctx.stroke();
      const lo = W < 720 ? 0 : 24;
      const x0 = micX - (micX - lo) * e;
      const x1 = micX + (W - micX) * e;
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const u = i / 180;
        const x = x0 + (x1 - x0) * u;
        let base = lineY;
        if (W >= 720 && x > cardR) {
          const k = Math.min(1, (x - cardR) / 160);
          base = lineY + (dipY - lineY) * (k * k * (3 - 2 * k));
        }
        const y = base + wave(u, reduce ? 0 : time * speed, amp, phase === "result" ? 1 : 0);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.strokeStyle = SKY;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    };
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !unsub) {
        layout();
        unsub = subscribe(draw, 1);
      } else if (!en.isIntersecting && unsub) {
        unsub();
        unsub = null;
      }
    });
    io.observe(sec);
    return () => {
      io.disconnect();
      ro.disconnect();
      unsub?.();
      offLayout();
    };
  }, [reduce]);

  return (
    <section id="jn-voice" ref={secRef} className="jn-voice-leg" data-theme="night" data-leg="4">
      <canvas ref={canvasRef} className="jn-live" aria-hidden="true" />
      <span ref={connRef} className="jn-conn" aria-hidden="true" />
      <span ref={edgeRef} className="jn-voice-edge" aria-hidden="true" />
      <div className="jn-booth">
        <V5SpeakDemo />
      </div>
    </section>
  );
}
