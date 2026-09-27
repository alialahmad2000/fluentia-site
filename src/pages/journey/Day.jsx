import { useEffect, useRef } from "react";
import { PROBLEM } from "../landing-v2/content";
import { useJourney } from "./context";
import { STATEMENT } from "./copy";

/**
 * Leg 2b — day. The statement fills word by word as it passes (grey → ink,
 * scrubbed), with the visitor's voice lying flat and silent at the floor of
 * the screen (LineLayer). Then the homepage's four pains, verbatim, as a clean
 * list whose markers are the same flat line, small.
 */

function FlatGlyph() {
  return (
    <svg className="jn-glyph" viewBox="0 0 40 10" aria-hidden="true">
      <path d="M1 5 H39" />
    </svg>
  );
}

export default function Day() {
  const { fx, cfg } = useJourney();
  const stRef = useRef(null);

  useEffect(() => {
    if (!fx) return undefined;
    const { gsap, SplitText } = fx;
    const el = stRef.current;
    let split = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, { type: "words,lines", linesClass: "jn-st-line", wordsClass: "jn-st-word" });
      gsap.fromTo(
        split.words,
        { color: "rgba(10,26,51,0.18)" },
        {
          color: "#0a1a33",
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: true },
        }
      );
      gsap.utils.toArray(".jn-pain").forEach((li) => {
        gsap.fromTo(
          li,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 88%", once: true } }
        );
      });
    }, el.parentNode);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [fx]);

  return (
    <section id="jn-day" className="jn-day" data-theme="day" data-leg="2">
      <div className="jn-wrap">
        <p ref={stRef} className="jn-statement">
          {STATEMENT}
        </p>
        {cfg && !cfg.webgl ? (
          <svg className="jn-still-line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 10 H1000" />
          </svg>
        ) : null}

        <div className="jn-pains">
          <span className="jn-eyebrow">{PROBLEM.eyebrow}</span>
          <ol className="jn-pain-list">
            {PROBLEM.cards.map((c) => (
              <li key={c.title} className="jn-pain">
                <FlatGlyph />
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
