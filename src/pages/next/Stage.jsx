import { useEffect, useRef, useState } from "react";
import { PRODUCT } from "../landing-v2/content";
import Giant from "./Giant";
import Orb from "./Orb";
import { track } from "./scroll";
import { TITLES } from "./copy";
import { STAGE, PODCAST_ALSO, PODCAST_SHOWS, SCENES_FROM } from "./showcase";
import { NovelDemo, PodcastDemo, useLazyJson } from "./Demos";
import SceneLive from "./SceneLive";
import Rail from "./Rail";

/**
 * «بين الحصص» — the platform itself, on a stage.
 *
 * A cold moon rises while the title reveals; then a pinned stage (height =
 * items × 100vh, the inner box sticky) with a tinted light pool per item. Each
 * item is a real feature: its giant title drops in, and a phone rises onto the
 * floor playing a real screen recording of the platform (captured locally for
 * a fictional student). «مشاهد» is not a recording: it is live — the official
 * YouTube embed with the academy's synced transcript on top. Beside the phone,
 * two plain lines of what it is, and for the library and the podcast a demo the
 * visitor can touch.
 *
 * Videos: preload none, src attached only one item away, playing only while
 * their item is active and the stage is on screen. Low tier: posters only.
 */

function StageVideo({ it, near, playing, still }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || still) return;
    if (near && !v.getAttribute("src")) {
      v.setAttribute("src", it.video);
      v.load();
    }
  }, [near, still, it.video]);
  useEffect(() => {
    const v = ref.current;
    if (!v || still || !v.getAttribute("src")) return;
    if (playing) {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } else v.pause();
  }, [playing, near, still]);
  return (
    <video
      ref={ref}
      className="fx-dev-video"
      poster={near || still ? it.poster : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      disablePictureInPicture
    />
  );
}

function ScenesFrom({ load }) {
  const data = useLazyJson("/next/scenes-showcase.json", load);
  if (!data) return null;
  return (
    <p className="fx-from">
      <b>{SCENES_FROM}</b>{" "}
      <span dir="ltr">{data.titles.join(" · ")}</span>
    </p>
  );
}

export default function Stage({ gl, tier }) {
  const riseRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  // Two beats per item on a phone: «a» the recording plays, «b» the panel rises over it.
  const [phase, setPhase] = useState("a");
  const [onScreen, setOnScreen] = useState(false);
  const n = STAGE.length;
  const still = tier === "low";

  useEffect(() => track(riseRef.current, { mode: "through" }), []);
  useEffect(
    () =>
      track(stageRef.current, {
        mode: "pin",
        onP: (p) => {
          const x = p * n * 0.999;
          const i = Math.min(n - 1, Math.floor(x));
          setActive(i);
          setPhase(x - i > 0.42 ? "b" : "a");
        },
      }),
    [n]
  );
  // Media only work while the stage is on screen (and wake one screen early).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setOnScreen(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section id="fx-between" ref={riseRef} className="fx-moonrise">
        <div className="fx-moon">
          <Orb variant="moon" gl={gl} scale={0.9} />
        </div>
        <div className="fx-moonrise-copy">
          <Giant lines={TITLES.between} className="fx-center-title" />
          <p className="fx-moonrise-lede fx-rv fx-fade">{PRODUCT.intro}</p>
        </div>
      </section>

      <section ref={stageRef} className="fx-stage" style={{ "--n": n }} aria-label={TITLES.between.map((l) => l.text).join(" ")}>
        <div className="fx-stage-pin">
          <div className="fx-floor" aria-hidden="true">
            {STAGE.map((it, i) => (
              <span key={it.key} className="fx-floor-pool" style={{ "--c": it.rgb }} data-on={i === active ? "" : undefined} />
            ))}
            <span className="fx-floor-lines" />
          </div>
          <div className="fx-spot" aria-hidden="true" />
          <p className="fx-stage-count" dir="ltr" aria-hidden="true">
            <b>{active + 1}</b>
            <span> / {n}</span>
          </p>

          {STAGE.map((it, i) => {
            const isIn = i === active;
            const near = onScreen && Math.abs(i - active) <= 1;
            const live = onScreen && isIn;
            return (
              <article
                key={it.key}
                className="fx-item"
                data-key={it.key}
                data-state={isIn ? "in" : i < active ? "past" : "next"}
                data-phase={isIn ? phase : "a"}
                aria-hidden={isIn || still ? undefined : "true"}
              >
                <h3 className={`fx-item-title fx-tone-${it.tone}`}>{it.title}</h3>
                <div className="fx-item-stage">
                  <div className="fx-item-dev">
                    <div className="fx-dev fx-dev--phone">
                      <div className="fx-dev-body">
                        <span className="fx-phone-island" aria-hidden="true" />
                        <div className="fx-dev-screen">
                          {it.demo === "scenes" ? (
                            <SceneLive near={near && !still} active={live && !still} still={still} />
                          ) : (
                            <StageVideo it={it} near={near} playing={live} still={still} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fx-panel">
                    <p className="fx-panel-lede">{it.lines[0]}</p>
                    <p className="fx-panel-note">{it.lines[1]}</p>
                    {it.demo === "novel" ? <NovelDemo load={near || still} /> : null}
                    {it.demo === "podcast" ? (
                      <>
                        <PodcastDemo load={near || still} active={live} />
                        <p className="fx-from">
                          <b>{PODCAST_ALSO}</b> <span dir="ltr">{PODCAST_SHOWS.join(" · ")}</span>
                        </p>
                      </>
                    ) : null}
                    {it.demo === "scenes" ? <ScenesFrom load={near || still} /> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Rail />
    </>
  );
}
