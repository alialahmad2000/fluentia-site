import { useEffect, useRef, useState } from "react";
import { PRODUCT } from "../landing-v2/content";
import { SpeakingMock } from "../v1/V1Product";
import HomePicture from "../v5/HomePicture";
import Giant from "./Giant";
import Orb from "./Orb";
import { track } from "./scroll";
import { TITLES } from "./copy";

/**
 * «بين الحصص» — the platform proof, as a stage.
 *
 * First a cold moon rises from the bottom while the title reveals. Then a
 * pinned stage (height = items × 100vh, the inner box sticky): a dark floor, an
 * elliptical spotlight tinted per item, a soft reflection. The homepage's four
 * product cards take the stage in turn — the title drops in from above in its
 * own colour, the real visual rises onto the floor inside a device, and the
 * caption card (the homepage copy) overlaps its corner. Outgoing slides down and
 * fades; incoming drops in. A small `2/4` in the corner: it is a real sequence.
 *
 * Visuals are the homepage's own: the in-code speaking-feedback mock, the real
 * vocabulary screen, the trainer photograph, the real unit covers.
 */

const COVERS = ["cover-l1u02", "cover-l3u04", "cover-l2u01", "cover-l1u08", "cover-l1u03", "cover-l3u02"];

const LOOK = {
  speaking: { tone: "sky", rgb: "56,189,248", device: "phone" },
  vocab: { tone: "ice", rgb: "125,211,252", device: "phone" },
  recording: { tone: "gold", rgb: "251,191,36", device: "laptop" },
  curriculum: { tone: "cream", rgb: "243,237,226", device: "tablet" },
};

const ITEMS = PRODUCT.cards.map((c) => {
  const key = c.mockup || c.icon;
  return { ...c, key, ...LOOK[key] };
});

function Visual({ k }) {
  if (k === "speaking")
    return (
      <div className="fx-screen-pad">
        <SpeakingMock />
      </div>
    );
  if (k === "vocab")
    return (
      <HomePicture
        id="platform-vocab"
        variant="screen"
        sizes="(max-width: 700px) 46vw, 260px"
        reveal={false}
        alt="صفحة مفردات وحدة «الطقس المتطرف» كما تظهر للطالب في منصة طلاقة"
      />
    );
  if (k === "recording")
    return <HomePicture id="solution-trainer" variant="main" sizes="(max-width: 700px) 80vw, 620px" reveal={false} />;
  return (
    <div className="fx-covers">
      {COVERS.map((id) => (
        <div className="fx-cover" key={id}>
          <HomePicture id={id} variant="tile" sizes="(max-width: 700px) 26vw, 180px" reveal={false} />
        </div>
      ))}
    </div>
  );
}

function Device({ kind, children }) {
  return (
    <div className={`fx-dev fx-dev--${kind}`}>
      <div className="fx-dev-body">
        {kind === "phone" ? <span className="fx-phone-island" aria-hidden="true" /> : null}
        {kind === "laptop" ? <span className="fx-dev-cam" aria-hidden="true" /> : null}
        <div className="fx-dev-screen">{children}</div>
      </div>
      {kind === "laptop" ? <span className="fx-dev-base" aria-hidden="true" /> : null}
    </div>
  );
}

export default function Stage({ gl }) {
  const riseRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  const n = ITEMS.length;

  useEffect(() => track(riseRef.current, { mode: "through" }), []);
  useEffect(
    () =>
      track(stageRef.current, {
        mode: "pin",
        onP: (p) => setActive(Math.min(n - 1, Math.floor(p * n * 0.999))),
      }),
    [n]
  );

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

      <section
        ref={stageRef}
        className="fx-stage"
        style={{ "--n": n }}
        aria-label={PRODUCT.headline}
      >
        <div className="fx-stage-pin">
          <div className="fx-floor" aria-hidden="true">
            {ITEMS.map((it, i) => (
              <span key={it.key} className="fx-floor-pool" style={{ "--c": it.rgb }} data-on={i === active ? "" : undefined} />
            ))}
            <span className="fx-floor-lines" />
          </div>
          <div className="fx-spot" aria-hidden="true" />
          <p className="fx-stage-count" dir="ltr" aria-hidden="true">
            <b>{String(active + 1).padStart(2, "0")}</b>
            <span> / {String(n).padStart(2, "0")}</span>
          </p>

          {ITEMS.map((it, i) => (
            <article
              key={it.key}
              className="fx-item"
              data-dev={it.device}
              data-state={i === active ? "in" : i < active ? "past" : "next"}
              aria-hidden={i === active ? undefined : "true"}
            >
              <h3 className={`fx-item-title fx-tone-${it.tone}`}>{it.title}</h3>
              <div className="fx-item-stage">
                <div className="fx-item-dev">
                  <Device kind={it.device}>
                    <Visual k={it.key} />
                  </Device>
                </div>
                <div className="fx-caption">
                  <p className="fx-caption-lede">{it.tagline}</p>
                  {it.bullet ? <p className="fx-caption-note">{it.bullet}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
