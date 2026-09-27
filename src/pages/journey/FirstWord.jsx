import { useEffect, useRef } from "react";
import V5HeroShowcase from "../v5/V5HeroShowcase";
import Giant from "./Giant";
import { useJourney } from "./context";
import { TITLES } from "./copy";
import { voice, voiceTo, reducedMotion } from "./line";

/**
 * Leg 3 — «أول كلمة». A sticky stage held for ~2 screens, scrubbed like the
 * reference's crane: a phone rises from below in side view; the silent line
 * (LineLayer) is lifted by its middle and reeled into the phone's microphone;
 * the phone turns to face you and the line lives on inside as its recording
 * waveform; then the screen becomes the homepage's real, tappable showcase
 * (the word tap, the proverb, the verb ladder, the novel).
 *
 * The low tier gets the last frame as a still composition.
 */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const BARS = 40;

export default function FirstWord() {
  const { fx, cfg } = useJourney();
  const secRef = useRef(null);
  const phoneRef = useRef(null);
  const recRef = useRef(null);
  const demoRef = useRef(null);
  const titleRef = useRef(null);
  const barsRef = useRef([]);
  const moving = Boolean(fx && cfg && cfg.webgl);

  useEffect(() => {
    if (!moving) return undefined;
    const { ScrollTrigger } = fx;
    const sec = secRef.current;
    const phone = phoneRef.current;
    const rec = recRef.current;
    const demo = demoRef.current;
    const title = titleRef.current;
    let p = 0;
    let raf = 0;
    const reduce = reducedMotion();

    const apply = (prog) => {
      p = prog;
      const rise = easeOut(clamp01(p / 0.3));
      const turn = easeInOut(clamp01((p - 0.44) / 0.2));
      phone.style.setProperty("--ty", `${((1 - rise) * 78).toFixed(2)}vh`);
      phone.style.setProperty("--ry", `${(76 * (1 - turn)).toFixed(2)}deg`);
      phone.style.setProperty("--rx", `${(8 * (1 - turn)).toFixed(2)}deg`);
      const recA = clamp01((p - 0.44) / 0.06) * (1 - clamp01((p - 0.74) / 0.08));
      const demoA = clamp01((p - 0.74) / 0.1);
      rec.style.opacity = recA.toFixed(3);
      demo.style.opacity = demoA.toFixed(3);
      demo.style.visibility = demoA > 0.02 ? "visible" : "hidden";
      demo.toggleAttribute("inert", demoA < 0.6);
      sec.style.setProperty("--demo", demoA.toFixed(3));
      title.style.setProperty("--fade", clamp01((p - 0.7) / 0.12).toFixed(3));
    };
    // the recording bars: the same voice, now inside the phone
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (p < 0.4 || p > 0.86) return;
      const on = clamp01((p - 0.44) / 0.08);
      voiceTo({ amp: 18 + on * 14, energy: 0.6 + on * 0.4 });
      const v = voice(now);
      const bars = barsRef.current;
      for (let i = 0; i < BARS; i++) {
        const u = i / (BARS - 1);
        const env = Math.pow(Math.sin(Math.PI * (0.08 + u * 0.84)), 0.7);
        const s =
          0.5 + 0.5 * Math.sin(u * 19 + v.t * 3.1) * Math.sin(u * 7 - v.t * 1.9) * (reduce ? 0.3 : 1);
        const h = 6 + env * s * v.amp * 2.2 * on;
        if (bars[i]) bars[i].style.transform = `scaleY(${(h / 80).toFixed(3)})`;
      }
    };
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(st.progress);
    raf = requestAnimationFrame(loop);

    return () => {
      st.kill();
      cancelAnimationFrame(raf);
    };
  }, [moving, fx]);

  return (
    <section id="jn-first" ref={secRef} className="jn-first" data-theme="day" data-leg="3" aria-labelledby="jn-first-title">
      <div className="jn-first-stage">
        <div ref={titleRef} className="jn-first-head">
          <Giant id="jn-first-title" className="jn-first-title" lines={TITLES.firstWord} tones={["ink", "sky"]} />
        </div>
        <div className="jn-phone-stage">
          <div ref={phoneRef} className="jn-phone">
            <span className="jn-phone-edge" aria-hidden="true" />
            <div className="jn-phone-body">
              <span className="jn-phone-island" aria-hidden="true" />
              <div className="jn-phone-screen">
                <div ref={recRef} className="jn-rec" aria-hidden="true">
                  <span className="jn-rec-dot" />
                  <div className="jn-rec-bars">
                    {Array.from({ length: BARS }, (_, i) => (
                      <span key={i} ref={(el) => (barsRef.current[i] = el)} />
                    ))}
                  </div>
                </div>
                <div ref={demoRef} className="jn-demo">
                  <V5HeroShowcase />
                </div>
              </div>
            </div>
            <span className="jn-mic" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
