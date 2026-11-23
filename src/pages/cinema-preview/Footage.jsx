import { useEffect, useRef, useState } from "react";
import { MARK_PATHS, MARK_VIEWBOX } from "./markPaths";

/** The Fluentia F-mark in one flat colour (currentColor). */
export function Mark({ className, title }) {
  return (
    <svg className={className} viewBox={MARK_VIEWBOX} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {MARK_PATHS.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}

const canMove = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  !(navigator.connection && navigator.connection.saveData);

const isLandscape = () => window.matchMedia("(orientation: landscape)").matches;

/**
 * Poster first, loop second.
 *
 * The poster (<picture>, AVIF → WebP) is the only thing in the HTML, so it is the
 * LCP candidate and the page is complete without JavaScript. The <video> gets its
 * source only when the slot nears the viewport (IntersectionObserver), plays muted
 * and inline, fades in over the poster once it actually plays, and pauses again
 * off screen. Reduced motion or Save-Data: the poster stays and no video loads.
 * Full-bleed slots with a landscape cut pick 16:9 on landscape screens, 9:16 on
 * portrait ones, and switch if the phone turns.
 */
export function Footage({ m, alt = "", priority = false, className = "", fit = "cover" }) {
  const box = useRef(null);
  const vid = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = box.current;
    const video = vid.current;
    if (!m || !m.video || !el || !video || !canMove() || !("IntersectionObserver" in window)) return undefined;

    let loaded = "";
    const pick = () => m.mp4 || (m.l && isLandscape() ? m.l : m.p);
    const load = () => {
      const base = pick();
      if (base === loaded) return;
      loaded = base;
      setPlaying(false);
      // iOS autoplays only a muted video; React does not always reflect `muted` to the DOM.
      video.muted = true;
      video.innerHTML = "";
      const list = m.mp4
        ? [[m.mp4, "video/mp4"]]
        : [[`${base}.webm`, 'video/webm; codecs="vp9"'], [`${base}.mp4`, "video/mp4"]];
      for (const [src, type] of list) {
        const s = document.createElement("source");
        s.src = src;
        s.type = type;
        video.appendChild(s);
      }
      video.load();
    };

    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          load();
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        } else if (loaded) {
          video.pause();
        }
      },
      { rootMargin: "240px 0px" },
    );
    // The hero's loop must not compete with its poster (the LCP): start watching
    // only after the page has loaded. Other slots are below the fold anyway.
    let started = false;
    let dead = false;
    const start = () => {
      if (started || dead) return;
      started = true;
      io.observe(el);
    };
    const later = () => setTimeout(start, 300);
    if (!priority || document.readyState === "complete") start();
    else window.addEventListener("load", later, { once: true });

    const onPlaying = () => setPlaying(true);
    video.addEventListener("playing", onPlaying);

    const mq = m.l ? window.matchMedia("(orientation: landscape)") : null;
    const onTurn = () => {
      if (!loaded) return;
      load();
      if (visible) video.play().catch(() => {});
    };
    mq?.addEventListener?.("change", onTurn);

    return () => {
      dead = true;
      window.removeEventListener("load", later);
      io.disconnect();
      video.removeEventListener("playing", onPlaying);
      mq?.removeEventListener?.("change", onTurn);
    };
  }, [m, priority]);

  if (!m) {
    return (
      <div className={`cf cf-pending ${className}`} aria-hidden="true">
        <Mark className="cf-pending-mark" />
      </div>
    );
  }

  return (
    <div ref={box} className={`cf ${playing ? "is-playing" : ""} ${className}`} data-fit={fit}>
      <picture>
        {m.l && <source media="(orientation: landscape)" type="image/avif" srcSet={`${m.l}.avif`} />}
        {m.l && <source media="(orientation: landscape)" type="image/webp" srcSet={`${m.l}.webp`} />}
        {!m.poster && <source type="image/avif" srcSet={`${m.p}.avif`} />}
        <img
          src={m.poster || `${m.p}.webp`}
          alt={alt}
          width={m.w}
          height={m.h}
          loading={priority ? "eager" : "lazy"}
          // React 18: the DOM attribute is lowercase (fetchPriority warns as unknown).
          fetchpriority={priority ? "high" : undefined}
          decoding={priority ? "sync" : "async"}
        />
      </picture>
      {m.video && <video ref={vid} muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1} />}
    </div>
  );
}
