import { useEffect, useRef, useState } from "react";
import Giant from "../Giant";
import { useJourney } from "../context";
import { PHONE_SCREENS, TITLES } from "../copy";
import { useStage, win, ease } from "../core/stage";
import { vh, vw, isPhone, onLayout } from "../core/viewport";
import { claim, anchor, strokeVoice, wave, voiceStep, voiceTo } from "../core/voice";
import * as gl from "../gl/manager";
import { phonePose } from "./phonePose";
import { shared } from "../core/shared";

/**
 * Leg 3 — «أول كلمة». A phone is lowered from above like the reference's crane
 * load, decelerating into the touch. Its microphone meets the silent line; the
 * phone lifts to rest and pulls the line up by its middle; the ends reel into
 * the mic; on its screen the voice arrives as a live recording. Then a matched
 * swap: the 3D phone gives way to a DOM phone of the exact same box, playing
 * real footage from the student platform — and the visitor can switch screens.
 *
 * On the low tier (no WebGL) the DOM phone does the same moves with CSS
 * transforms; the line is drawn the same way on both.
 */
const SWAP = 0.88;

function Screen({ item, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    v.muted = true; // the prop alone never reaches the element in React
    v.playsInline = true;
    if (active) v.play().catch(() => {});
    else v.pause();
    return undefined;
  }, [active]);
  if (item.video)
    return <video ref={ref} className="jn-dphone-media" src={active ? item.video : undefined} poster={item.poster} loop muted playsInline preload="none" aria-hidden="true" />;
  return <img className="jn-dphone-media" src={item.image} alt="" loading="lazy" decoding="async" />;
}

export default function FirstWord() {
  const { cfg, glAlive, reduce } = useJourney();
  const secRef = useRef(null);
  const stageRef = useRef(null);
  const restRef = useRef(null);
  const dphoneRef = useRef(null);
  const headRef = useRef(null);
  const geo = useRef({ x: 0, y: 0, w: 100, h: 200 });
  const [tab, setTab] = useState(0);
  const [live, setLive] = useState(false);
  const webgl = Boolean(cfg && cfg.webgl && glAlive);

  useEffect(() => {
    const measure = () => {
      const s = stageRef.current.getBoundingClientRect();
      const r = restRef.current.getBoundingClientRect();
      geo.current = { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      shared.firstMic = { x: r.left + r.width / 2, fromBottom: s.bottom - r.bottom };
    };
    measure();
    return onLayout(measure);
  }, []);

  useStage(
    secRef,
    (p, { t, dt, enter }) => {
      const H = vh();
      const W = vw();
      const phone = isPhone();
      const floorY = H * (phone ? 0.87 : 0.85);
      const x0 = W * (phone ? 0.06 : 0.08);
      const x1 = W - x0;
      const rest = geo.current;
      const time = t / 1000;
      const pose = phonePose(p, rest, floorY, H, time, reduce);
      const swapped = p >= SWAP || reduce;
      if (swapped !== live) setLive(swapped);
      stageRef.current.toggleAttribute("data-swapped", swapped);

      if (webgl) gl.warm("phone");
      // until the 3D phone exists the stage is simply day, with the DOM phone doing the moves
      const ready = webgl && Boolean(gl.params("phone"));
      stageRef.current.toggleAttribute("data-gl", ready && !swapped);
      if (ready && enter >= 0) {
        const ph = gl.params("phone");
        if (ph) {
          ph.p = p;
          ph.rest = rest;
          ph.floorY = floorY;
          ph.poster = PHONE_SCREENS[0].poster;
          if (!swapped) gl.show("phone", 2, t);
        }
      }
      // DOM phone: the low tier moves it; after the swap it simply rests
      const dp = dphoneRef.current;
      if (dp) {
        const dx = pose.cx - (rest.x + rest.w / 2);
        const dy = pose.cy - (rest.y + rest.h / 2);
        dp.style.transform = swapped ? "" : `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotateX(${pose.rx}rad) rotateY(${pose.ry}rad) rotateZ(${pose.rz}rad)`;
        dp.style.visibility = swapped || !ready ? "visible" : "hidden";
      }
      // on a phone the title steps aside while the phone comes down past it
      const fade = reduce ? 0 : phone ? Math.max(win(p, 0.04, 0.1) * (1 - win(p, 0.3, 0.38)), win(p, 0.84, 0.9)) : 0;
      if (headRef.current) headRef.current.style.setProperty("--fade", fade.toFixed(3));
      if (enter < -0.98) return;

      // the voice: flat → touched → lifted by the middle → reeled into the mic
      const reel = ease.inOut3(win(p, 0.46, 0.6)) * 0.5;
      const lifted = win(p, 0.29, 0.31);
      const pluck = reduce ? 0 : Math.sin(Math.PI * win(p, 0.3, 0.35));
      if (p > 0.61) {
        claim("first", () => {}, t, 2); // the line is inside the phone now
        anchor("first-mic", pose.micX, pose.micY);
        return;
      }
      claim(
        "first",
        (ctx) => {
          voiceTo({ amp: 2.6 + pose.lift * 14 + pose.down * 2 + pluck * 10, energy: 0.2 + pose.lift * 0.8 + pluck * 0.6, thick: 2.6 + pose.lift * 0.8, glow: 0 });
          const v = voiceStep(t, dt);
          const k = 8 - 6.6 * pose.lift;
          const pts = [];
          const u0 = reel;
          const u1 = 1 - reel;
          for (let i = 0; i <= 120; i++) {
            const u = u0 + (u1 - u0) * (i / 120);
            const fx = x0 + (x1 - x0) * u;
            const b = Math.pow(Math.sin(Math.PI * u), k) * lifted;
            const x = fx + (pose.micX - fx) * Math.pow(b, 1.5);
            const y = floorY + (pose.micY - floorY) * b + wave(u, v.t, v.amp) * (1 - b * 0.7);
            pts.push([x, y]);
          }
          if (u1 - u0 > 0.004) strokeVoice(ctx, pts, { thick: v.thick });
          anchor("first-mic", pose.micX, pose.micY);
        },
        t,
        2
      );
    },
    { margin: 0.3 }
  );

  const item = PHONE_SCREENS[tab];
  return (
    <section id="jn-first" ref={secRef} className="jn-first" data-theme="day" data-leg="3" aria-labelledby="jn-first-title">
      <div ref={stageRef} className="jn-stage jn-first-stage">
        <div className="jn-safe">
          <div ref={headRef} className="jn-first-head">
            <Giant id="jn-first-title" className="jn-first-title" lines={TITLES.firstWord} tones={["ink", "ink2"]} />
          </div>
          <div className="jn-first-tabs" data-live={live ? "" : undefined} role="tablist" aria-label={item.title}>
              {PHONE_SCREENS.map((s, i) => (
                <button key={s.key} type="button" role="tab" aria-selected={tab === i} className="jn-first-tab" onClick={() => setTab(i)} tabIndex={live ? 0 : -1}>
                  {s.title}
                </button>
              ))}
              <p className="jn-first-line" aria-live="polite">
                {item.line}
              </p>
          </div>
          <div ref={restRef} className="jn-phone-rest">
            <div ref={dphoneRef} className="jn-dphone">
              <div className="jn-dphone-screen">
                {PHONE_SCREENS.map((s, i) => (
                  <div key={s.key} className="jn-dphone-layer" data-on={tab === i ? "" : undefined}>
                    <Screen item={s} active={live && tab === i} />
                  </div>
                ))}
              </div>
              <span className="jn-mic" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
