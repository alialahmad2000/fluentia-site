import { useEffect, useState } from "react";
import Orb from "./Orb";

/**
 * Intro — once per visitor, medium/high tier only, ≤ 2.4 s.
 *
 *   0.08 s  «العالم يتحدث الإنجليزية.» rises word by word
 *   0.85 s  it dissolves
 *   0.95 s  «وأنت؟» rises, giant, its letters filled with the live planet shader
 *   1.65 s  the Fluentia mark fades in at the centre
 *   1.80 s  the overlay lifts (opacity + a small rise, 600 ms), the hero is
 *           already rendered underneath
 *
 * The whole choreography is CSS, keyed on `html.fx-intro`, which the inline
 * boot script sets before the first paint — so it runs even before the bundle
 * arrives, and can never stick: its last keyframe hides the overlay for good.
 * The lettering is a knockout: a void layer with white type, blended `darken`
 * over the shader canvas, shows the shader only inside the glyphs.
 *
 * Any tap, key or wheel skips it. The hero's headline is restarted so it rises
 * right away instead of waiting out the intro's delay.
 */

const DONE_AFTER = 2450;

function restartHero() {
  document.querySelectorAll(".fx-hero-rv .fx-w, .fx-hero-after").forEach((el) => {
    el.style.animation = "none";
    // Reading a layout property flushes the style change, so clearing it restarts the animation.
    void el.offsetWidth;
    el.style.animation = "";
  });
}

export default function Intro({ gl, onDone }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("fx-intro") || root.classList.contains("fx-intro-done")) {
      onDone();
      return undefined;
    }
    setActive(true);
    let finished = false;
    const finish = (skipped) => {
      if (finished) return;
      finished = true;
      if (skipped) {
        root.classList.add("fx-skip");
        restartHero();
      }
      root.classList.add("fx-intro-done");
      setActive(false);
      onDone();
    };
    const timer = setTimeout(() => finish(false), DONE_AFTER);
    const skip = () => finish(true);
    window.addEventListener("pointerdown", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
    // Runs once: onDone is a stable callback owned by the page.
  }, []);

  return (
    <div className="fx-veil" aria-hidden="true">
      <p className="fx-intro-l1">
        {["العالم", "يتحدث", "الإنجليزية."].map((w, i) => (
          <span key={w} className="fx-intro-mask">
            <span className="fx-intro-w" style={{ "--i": i }}>
              {w}
            </span>{" "}
          </span>
        ))}
      </p>
      <div className="fx-intro-fill">
        {active && <Orb fill gl={gl} className="fx-intro-orb" />}
        <div className="fx-intro-knock">
          <span className="fx-intro-mask">
            <span className="fx-intro-l2">وأنت؟</span>
          </span>
        </div>
      </div>
      <img className="fx-intro-mark" src="/brand/fluentia-mark.svg" alt="" width="64" height="80" />
    </div>
  );
}
