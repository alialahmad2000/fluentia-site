import { useEffect, useRef } from "react";
import { PROBLEM } from "../../landing-v2/content";
import { useJourney } from "../context";
import { STATEMENT } from "../copy";
import { useStage, win, ease } from "../core/stage";
import { vh, vw, isPhone } from "../core/viewport";
import { claim, anchor, strokeVoice, wave, voiceStep, voiceTo } from "../core/voice";
import { shared } from "../core/shared";

/**
 * Leg 2 — day, and silence. A held stage (1.6 screens): the floor of the
 * screen is reserved for the voice, so it never runs through a word.
 *
 *   0.00–0.42  the statement fills, line by line, ink over grey (scrubbed)
 *   0.42       «يسكت» — the line goes dead flat
 *   0.46–0.56  the statement leaves
 *   0.52–0.80  the two pains rise in its place; under them the voice tries
 *              to speak — a wave — and dies back to flat, again and again
 */
const PAINS = [PROBLEM.cards[0], PROBLEM.cards[3]].map((c) => ({ title: c.title, body: c.body.split(/(?<=\.)\s/)[0] }));

export default function Day() {
  const { fx, reduce } = useJourney();
  const secRef = useRef(null);
  const stRef = useRef(null);
  const painsRef = useRef(null);
  const lines = useRef([]);
  const last = useRef({ st: "", pa: "" });

  // split the statement into its visual lines once the display face is in
  useEffect(() => {
    if (!fx) return undefined;
    const { SplitText } = fx;
    let split = null;
    let alive = true;
    const run = () => {
      if (!alive) return;
      split = SplitText.create(stRef.current, { type: "lines", linesClass: "jn-fill-line" });
      lines.current = split.lines;
    };
    (document.fonts?.load("800 1em Alexandria") || Promise.resolve()).then(run, run);
    return () => {
      alive = false;
      lines.current = [];
      split?.revert();
    };
  }, [fx]);

  useStage(
    secRef,
    (p, { t, dt, enter }) => {
      const W = vw();
      const H = vh();
      const phone = isPhone();
      const ls = lines.current;
      // the fill, scrubbed line by line
      const n = ls.length || 1;
      ls.forEach((el, i) => {
        const f = reduce ? 1 : win(p, (i / n) * 0.38, ((i + 1) / n) * 0.38 + 0.02);
        el.style.setProperty("--fill", (f * 100).toFixed(1));
      });
      const stOut = reduce ? 0 : ease.inOut2(win(p, 0.46, 0.56));
      const paIn = reduce ? 1 : ease.out3(win(p, 0.52, 0.66));
      const st = stOut.toFixed(3);
      if (st !== last.current.st) {
        stRef.current.style.opacity = String(1 - stOut);
        stRef.current.style.transform = `translate3d(0, ${(-stOut * 6).toFixed(2)}vh, 0)`;
        last.current.st = st;
      }
      const pa = paIn.toFixed(3);
      if (pa !== last.current.pa) {
        painsRef.current.style.setProperty("--in", pa);
        last.current.pa = pa;
      }

      const floorY = H * (phone ? 0.87 : 0.85);
      const x0 = W * (phone ? 0.06 : 0.08);
      const x1 = W - x0;
      const silent = p > 0.42;
      const trying = p > 0.56;
      const time = t / 1000;
      const s = time % 3.6;
      const burst = reduce || !trying ? 0 : s < 1.6 ? 12 * Math.sin((s / 1.6) * Math.PI) * Math.exp(-s * 1.2) : 0;
      if (!shared.fallDone || enter < -0.2) return; // the fall still owns the line
      claim(
        "day",
        (ctx) => {
          voiceTo({ amp: (silent ? 0 : 2.8) + burst, energy: silent ? burst / 24 : 0.15, thick: 2.6, glow: 0 });
          const v = voiceStep(t, dt);
          const pts = [];
          for (let i = 0; i <= 120; i++) {
            const u = i / 120;
            pts.push([x0 + (x1 - x0) * u, floorY + wave(u, v.t, v.amp)]);
          }
          strokeVoice(ctx, pts, { thick: v.thick });
          anchor("day-line", x0, floorY);
        },
        t,
        1
      );
    },
    { margin: 0.3 }
  );

  return (
    <section id="jn-day" ref={secRef} className="jn-day" data-theme="day" data-leg="2">
      <div className="jn-stage jn-day-stage">
        <div className="jn-safe jn-day-safe">
          <p ref={stRef} className="jn-statement">
            {STATEMENT}
          </p>
          <ol ref={painsRef} className="jn-pains">
            {PAINS.map((c, i) => (
              <li key={c.title} className="jn-pain" style={{ "--k": i }}>
                <h3 className="jn-pain-title">{c.title}</h3>
                <p className="jn-pain-body">{c.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
