import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import "./V5Cinema.css";

/**
 * V5Cinema — the hero's backdrop as a real 3D stage.
 *
 * «الساعة قبل الفجر». The page's arc is already night → dawn (DawnArc); the
 * hero is the last of the night. This gives that night depth instead of
 * painting another haze over it: five planes at real translateZ inside one
 * perspective, so scrolling moves the CAMERA through them rather than sliding
 * a gradient.
 *
 *   z −1500  stars, far
 *   z −1000  stars, near
 *   z  −700  the haze the dawn lights, low over the city
 *   z     0  the horizon — a Saudi desert city at dawn, the ONE light
 *                (a still plate, with a film laid over it when the link allows)
 *   z −1600 → +220  the fragments of the old way, falling past the camera
 *
 * Colour is assigned, not blended: the ground is opaque night, the amber is a
 * photograph and the only light in the frame, the stars are pure white, the
 * fragments are brand azure. Nothing here is a glow over a glow.
 *
 * Every layer moves on transform/opacity only — no canvas, no rAF, no
 * backdrop-filter — so it is safe on the phones that are most of the traffic
 * and on the Android tablets that flickered under an animated canvas
 * (see AmbientParticles, June 2026). The 2D word-rain it replaces was
 * `display:none` on every coarse pointer, so phones saw no hero motion at all.
 */

/* The old world falling away — the same fragments the 2D rain used, now
   given a Z. Deterministic layout: index-derived, so SSR and the client
   render the identical frame. */
const FRAGMENTS = [
  "am / is / are", "past perfect", "memorize", "unit 1 again", "20 students",
  "grammar drill", "he go...? goes?", "silent in class", "forgot again",
  "certificate?", "repeat after me", "conjugate", "worksheet",
  "start over", "too shy to speak", "irregular verbs", "translate this",
  "unit 1 again",
];

/* Deterministic hash — identical on the server and the client, so a
   prerendered frame and its hydration agree. Plain modular arithmetic
   (`(i * 613) % w`) was tried first and laid the stars out on a visible
   diagonal lattice: a cycle, not a sky. */
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* A starfield as ONE element per plane: a single dot carrying N box-shadows
   paints once and composites as a single layer, where N separate divs would
   be N layers for the compositor to juggle on every frame. The 4th length is
   the shadow's spread, which is what gives the field a range of star sizes. */
function starShadows(count, spread, seed) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round((hash(i + seed) * 2 - 1) * spread);
    const y = Math.round((hash(i + seed + 7919) * 2 - 1) * spread);
    /* Continuous, not three tiers: quantised alpha and size read as a
       repeating pattern rather than as a sky. */
    const m = hash(i + seed + 104729);
    const alpha = (0.18 + m * 0.72).toFixed(2);
    const size = (m * m * 1.1).toFixed(2);
    out.push(`${x}px ${y}px 0 ${size}px rgba(255,255,255,${alpha})`);
  }
  return out.join(", ");
}

/* The hero's film — the escarpment above a sea of mist at dawn, the motion
   the still plate could never have. A palindrome cut (forward, then the same
   frames reversed) so it loops with no jump, which a straight cut could not:
   the light travels warm across the clip and the seam showed.

   H.264 only, and not for want of trying webm — VP9 came out 747 kB against
   H.264's 329 kB on this footage, which is mostly smooth gradient and slow
   mist. One codec every browser decodes in hardware, at less than half the
   bytes. `media` on a <source> inside <video> is not reliably honoured, so
   the tier is chosen in JS instead. */
const FILM = {
  wide: { src: "/home/cine-dawn-1600.mp4", poster: "/home/cine-dawn-poster-1600.webp" },
  phone: { src: "/home/cine-dawn-800.mp4", poster: "/home/cine-dawn-poster-800.webp" },
};

const STARS_FAR = starShadows(300, 1100, 3);
const STARS_NEAR = starShadows(110, 900, 991);

export default function V5Cinema({ progress }) {
  const stageRef = useRef(null);
  /* The CSS @media block below stops the keyframes, but it cannot touch these
     — they are framer inline transforms. Without this, a reader who asked for
     reduced motion still had the camera fly 300px forward and tip 2.4° on
     scroll, which is the most vestibular motion on the page. */
  const reduce = useReducedMotion();

  /* The camera. Scrolling the hero flies it forward and tips it down toward
     the city; the plates separate because each sits at its own depth. */
  const camZ = useTransform(progress, [0, 1], [0, reduce ? 0 : 300]);
  const camY = useTransform(progress, [0, 1], [0, reduce ? 0 : -40]);
  const camRot = useTransform(progress, [0, 1], [0, reduce ? 0 : 2.4]);
  const veil = useTransform(progress, [0, 0.75], [0, reduce ? 0 : 0.65]);

  /* The film. It is the top tier of the backdrop, not its foundation: the
     poster below it is the plate the stage already draws, so if the video is
     never allowed to load — Low Power Mode, save-data, reduced motion, a slow
     link — nothing is missing, the scene simply does not move as much.

     Mounted from an effect, never from render, because every input here
     (matchMedia, connection, sessionStorage) differs between the server and
     the client and would be a hydration mismatch. */
  const [film, setFilm] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const c = navigator.connection;
    /* Most of this traffic is a phone on mobile data in KSA. A hero that
       silently spends bytes on a decoration is not a good trade, so the film
       waits for a link that can afford it. */
    if (c && (c.saveData || /^(slow-)?2g$/.test(c.effectiveType || ""))) return undefined;
    const tier = window.matchMedia("(max-width: 960px)").matches ? FILM.phone : FILM.wide;
    /* after first paint: the headline is the LCP element and must not queue
       behind 329 kB of scenery */
    const id = window.setTimeout(() => setFilm(tier), 600);
    return () => window.clearTimeout(id);
  }, []);

  /* Safari will NOT start a video that React inserts after first paint, even
     with autoplay+muted+playsinline — measured on production: WebKit reported
     paused:true / currentTime:0 while Chromium was already at 5.74s. Every
     Safari visitor, which is nearly all of this traffic, got a still poster
     with a play button on it. The attribute is not enough; play() has to be
     called, and it has to be called again once frames are actually decoded. */
  const kick = (el) => {
    if (!el) return;
    const go = () => { const r = el.play(); if (r && r.catch) r.catch(() => {}); };
    go();
    if (el.paused) setTimeout(go, 120);
  };
  const playNow = (el) => { if (el) kick(el); };

  /* Pointer yaw — fine pointers only, written straight to the node so the
     stage never re-renders, and never mounted where a touch would fake it. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof window === "undefined") return undefined;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = 0;
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--cine-yaw", `${(-x * 2.2).toFixed(2)}deg`);
        el.style.setProperty("--cine-pitch", `${(y * 1.4).toFixed(2)}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="v5cine" aria-hidden ref={stageRef}>
     <div className="v5cine-yaw">
      <div className="v5cine-drift">
      <motion.div
        className="v5cine-stage"
        style={{ z: camZ, y: camY, rotateX: camRot }}
      >
        <div className="v5cine-plane v5cine-stars v5cine-stars--far" style={{ boxShadow: STARS_FAR }} />
        <div className="v5cine-plane v5cine-stars v5cine-stars--near" style={{ boxShadow: STARS_NEAR }} />

        <div className="v5cine-plane v5cine-clouds" />

        {/* The dawn — the site's own render, already on the page at the
            closing CTA. It is the single light source in the frame, so the
            amber is a colour and not a CSS bloom over navy.
            Deliberately a GENERIC Saudi desert-city silhouette and not a
            portrait of Riyadh: shots.json's own note on this render reads
            "never ship a wrong Kingdom Centre", because the model would not
            hold the real landmarks. Don't re-label this as Riyadh. */}
        <div className="v5cine-plane v5cine-dawn">
          <picture>
            {/* A phone needs a TALLER cut, not the same panorama stretched:
                the wide band is 11.6:1, which renders 64px tall at 390px and
                only ~24px of it survives the fade. That is not a dawn. The
                phone band is 7.3:1 from a taller crop. */}
            <source
              type="image/avif"
              media="(max-width: 960px)"
              srcSet="/home/cine-horizon-phone-1024.avif 1024w, /home/cine-horizon-phone-1600.avif 1600w, /home/cine-horizon-phone-1920.avif 1920w"
              sizes="210vw"
            />
            <source
              type="image/webp"
              media="(max-width: 960px)"
              srcSet="/home/cine-horizon-phone-1024.webp 1024w, /home/cine-horizon-phone-1600.webp 1600w, /home/cine-horizon-phone-1920.webp 1920w"
              sizes="210vw"
            />
            <source
              type="image/avif"
              srcSet="/home/cine-horizon-1024.avif 1024w, /home/cine-horizon-1600.avif 1600w, /home/cine-horizon-1920.avif 1920w"
              sizes="110vw"
            />
            <img
              src="/home/cine-horizon-1600.webp"
              srcSet="/home/cine-horizon-1024.webp 1024w, /home/cine-horizon-1600.webp 1600w, /home/cine-horizon-1920.webp 1920w"
              sizes="110vw"
              alt=""
              decoding="async"
              loading="eager"
              fetchpriority="high"
            />
          </picture>

          {/* The moving frame sits ON the plate, matched to it, so the cut
              from still to film is invisible. playsinline is not optional —
              without it iOS takes the video fullscreen on play. */}
          {film && (
            <video
              className="v5cine-film"
              src={film.src}
              poster={film.poster}
              autoPlay
              muted
              loop
              /* not optional: without playsInline iOS takes the video
                 fullscreen the moment it plays */
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
              ref={playNow}
              onLoadedData={(e) => kick(e.currentTarget)}
              onPlaying={(e) => e.currentTarget.classList.add("is-lit")}
              /* Low Power Mode refuses autoplay outright; if it never plays
                 the element stays transparent and the still plate below is
                 what the reader sees, which is the whole point of the tier. */
              onError={(e) => e.currentTarget.remove()}
            />
          )}
        </div>

        {/* The noise of the old way, falling THROUGH the room and past you. */}
        <div className="v5cine-plane v5cine-noise">
          {FRAGMENTS.map((f, i) => {
            const x = (((i * 61) % 81) - 40) * 0.98; // −40..40 %, clear of the frame
            const y = ((i * 43) % 71) - 34;          // −34..36 %
            const dur = 14 + ((i * 7) % 9);          // 14..22s
            const delay = -((i * 6.7) % dur);        // already mid-flight
            const size = 0.66 + ((i * 13) % 5) * 0.06;
            return (
              <span
                key={`${f}-${i}`}
                className="v5cine-frag"
                dir="ltr"
                style={{
                  "--fx": `${x}%`,
                  "--fy": `${y}%`,
                  "--fd": `${dur}s`,
                  "--fdelay": `${delay}s`,
                  fontSize: `${size}rem`,
                }}
              >
                {f}
              </span>
            );
          })}
        </div>
      </motion.div>
      </div>
     </div>

      {/* Night closing back over the stage as the page leaves the hero, so the
          backdrop hands off to DawnArc instead of fighting it. */}
      <motion.div className="v5cine-veil" style={{ opacity: veil }} />
    </div>
  );
}
