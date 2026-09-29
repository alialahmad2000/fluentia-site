import { useEffect, useRef } from "react";
import { FINAL_CTA } from "../../landing-v2/content";
import Giant from "../Giant";
import { useJourney } from "../context";
import { CTA_LABEL, TITLES, TRUST_LINE } from "../copy";
import { useStage, win, ease, lerp } from "../core/stage";
import { vh, vw } from "../core/viewport";
import { claim, strokeVoice, wave, SKY } from "../core/voice";

/**
 * Leg 7 — arrival. The sea's pulse stays where it was — centre, 58% down —
 * while the arrival rises under it; the pulse starts to open into a wave
 * there (on the voice layer, so the rising section never wipes it), and the
 * stage takes it over at the width it was handed. A pure gold horizon — one
 * committed arc, no haze — comes up as the wave opens full width: the sky
 * voice with a gold harmonic, slower and larger than anything before
 * (confident is calm). The action sits on the wave.
 */
export default function Arrival() {
  const { reduce } = useJourney();
  const secRef = useRef(null);
  const canvasRef = useRef(null);
  const horizonRef = useRef(null);
  const ctaRef = useRef(null);
  const geo = useRef({ ctx: null, dpr: 1, W: 0, H: 0, top: 0 });
  const last = useRef({ rise: "", cta: "" });

  useEffect(() => {
    const c = canvasRef.current;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      geo.current = { ctx: c.getContext("2d"), dpr, W: c.clientWidth, H: c.clientHeight, top: c.offsetTop };
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  useStage(
    secRef,
    (p, { t, enter }) => {
      const SW = vw();
      const SH = vh();
      const time = t / 1000;
      const handW = SW * 0.14;
      // 1) while the section rises (its top above the 58% line), the pulse opens on the voice layer
      if (!reduce && enter > -0.58 && enter < 0) {
        const k = ease.out3(win(enter, -0.58, 0));
        claim(
          "arrival-in",
          (ctx) => {
            const half = lerp(5, handW, k);
            const pts = [];
            for (let i = 0; i <= 48; i++) {
              const u = i / 48;
              pts.push([SW / 2 - half + 2 * half * u, SH * 0.58 + wave(u, time * 1.4, 12 * k, 1)]);
            }
            strokeVoice(ctx, pts, { thick: 3 });
          },
          t,
          2
        );
      }
      // 2) the stage: horizon, then the full wave, then the action
      const open = reduce ? 1 : ease.out3(win(p, 0, 0.4));
      const rise = reduce ? 1 : ease.out3(win(p, 0.05, 0.45));
      const r = rise.toFixed(3);
      if (r !== last.current.rise) {
        horizonRef.current.style.transform = `translate3d(0, ${((1 - rise) * 30).toFixed(2)}vh, 0)`;
        last.current.rise = r;
      }
      const a = (reduce ? 1 : win(p, 0.35, 0.5)).toFixed(3);
      if (a !== last.current.cta) {
        ctaRef.current.style.opacity = a;
        ctaRef.current.style.transform = `translate3d(0, ${((1 - a) * 16).toFixed(1)}px, 0)`;
        last.current.cta = a;
      }
      const { ctx, dpr, W, H, top } = geo.current;
      if (!ctx || enter < 0) return;
      const mid = lerp(SH * 0.58 - top, H * 0.5, ease.inOut3(win(p, 0, 0.35)));
      const half = lerp(handW, W / 2, open);
      const breath = reduce ? 1 : 1 + Math.sin(time * 1.5) * 0.06;
      const amp = lerp(12, H * 0.3, open) * breath;
      const tt = reduce ? 1.2 : time * 0.8;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const line = (k, phase, color, lw) => {
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const u = i / 180;
          const x = W / 2 - half + half * 2 * u;
          const y = mid + wave(u, tt + phase, amp * k, 1);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.stroke();
      };
      line(0.7, 0.9, "#fbbf24", 2); // the gold harmonic
      line(1, 0, SKY, 4); // the voice
    },
    { margin: 0.6, phase: 1 }
  );

  return (
    <section id="jn-arrival" ref={secRef} className="jn-arrival" data-theme="night" data-leg="7" aria-labelledby="jn-arrival-title">
      <div className="jn-stage jn-arrival-stage">
        <div ref={horizonRef} className="jn-horizon" aria-hidden="true" />
        <div className="jn-safe">
          <div className="jn-arrival-head">
            <Giant id="jn-arrival-title" className="jn-arrival-title" lines={TITLES.arrival} tones={["cream", "gold"]} />
          </div>
          <canvas ref={canvasRef} className="jn-arrival-wave" aria-hidden="true" />
          <div ref={ctaRef} className="jn-arrival-cta">
            <p className="jn-arrival-lead">{FINAL_CTA.headline}</p>
            <button type="button" data-open-form className="jn-btn jn-btn--gold jn-btn--lg">
              {CTA_LABEL}
              <span aria-hidden="true">←</span>
            </button>
            <p className="jn-trust">{TRUST_LINE}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
