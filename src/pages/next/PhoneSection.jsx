import { useEffect, useRef, useState } from "react";
import V5HeroShowcase from "../v5/V5HeroShowcase";
import { SOLUTION, TRUSTED_LOGOS } from "../landing-v2/content";
import { track } from "./scroll";
import { CTA_LABEL } from "./copy";

/**
 * «من داخل المنصة» — a phone in 3D that straightens as the section rises.
 *
 * Inside the phone is the homepage's own showcase (V5HeroShowcase), fully
 * interactive: the word tap, the proverb, the verb ladder, the novel. Beside it
 * (below it on a phone) the homepage's platform pillar, verbatim, and the
 * primary action. Under both, the entities logo strip as a slow marquee.
 *
 * The straightening is pure CSS on the section's `--p`. On the high tier with
 * a mouse, the phone can be dragged ±12° and springs back — a drag only starts
 * on the frame or on empty screen, never on a control inside the demo.
 */

const PLATFORM = SOLUTION.pillars.find((p) => p.icon === "platform");
const MAX_TILT = 12;

function Marquee() {
  const { lead, emphasis, items } = TRUSTED_LOGOS;
  const [on, setOn] = useState(-1);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const tap = (i) => {
    clearTimeout(timer.current);
    setOn((cur) => (cur === i ? -1 : i));
    timer.current = setTimeout(() => setOn(-1), 2600);
  };

  const set = [...items, ...items];
  return (
    <div className="fx-logos">
      <p className="fx-logos-label">
        {lead} <b>{emphasis}</b>
      </p>
      <div className="fx-logos-view">
        <ul className="fx-logos-track">
          {[0, 1].map((copy) =>
            set.map((it, i) => {
              const repeat = copy > 0 || i >= items.length;
              const key = i % items.length;
              return (
                <li key={`${copy}-${i}`} aria-hidden={repeat || undefined}>
                  <button
                    type="button"
                    className="fx-logo"
                    data-on={on === key ? "" : undefined}
                    aria-pressed={on === key}
                    tabIndex={repeat ? -1 : 0}
                    onClick={() => tap(key)}
                  >
                    <img
                      src={it.src}
                      alt={repeat ? "" : it.name}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      style={{ "--h": `${Math.round(it.h * 0.62)}px` }}
                    />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export default function PhoneSection({ tilt }) {
  const secRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => track(secRef.current, { mode: "enter" }), []);

  useEffect(() => {
    const el = phoneRef.current;
    if (!tilt || !el) return undefined;
    let drag = null;
    const down = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.target.closest("button, a, [role='tab'], input")) return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
      el.setPointerCapture(e.pointerId);
      el.setAttribute("data-drag", "");
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const rx = Math.max(-MAX_TILT, Math.min(MAX_TILT, -(e.clientY - drag.y) / 10));
      const ry = Math.max(-MAX_TILT, Math.min(MAX_TILT, (e.clientX - drag.x) / 10));
      el.style.setProperty("--drx", `${rx}deg`);
      el.style.setProperty("--dry", `${ry}deg`);
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      el.removeAttribute("data-drag");
      el.style.setProperty("--drx", "0deg");
      el.style.setProperty("--dry", "0deg");
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [tilt]);

  return (
    <section id="fx-platform" ref={secRef} className="fx-platform" aria-label="من داخل المنصة">
      <div className="fx-platform-grid">
        <div className="fx-phone-stage">
          <div className="fx-phone-glow" aria-hidden="true" />
          <div ref={phoneRef} className={`fx-phone${tilt ? " is-tilt" : ""}`}>
            <div className="fx-phone-body">
              <span className="fx-phone-island" aria-hidden="true" />
              <span className="fx-phone-btn fx-phone-btn--a" aria-hidden="true" />
              <span className="fx-phone-btn fx-phone-btn--b" aria-hidden="true" />
              <div className="fx-phone-screen">
                <V5HeroShowcase />
              </div>
            </div>
          </div>
        </div>

        <div className="fx-card fx-rv fx-fade">
          <h2 className="fx-card-title">{PLATFORM.title}</h2>
          <p className="fx-card-lede">{PLATFORM.tagline}</p>
          <ul className="fx-card-points">
            {PLATFORM.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <button type="button" data-open-form className="fx-btn fx-btn--primary">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </div>
      <Marquee />
    </section>
  );
}
