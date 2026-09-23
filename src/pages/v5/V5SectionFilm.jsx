import { useEffect, useRef, useState } from "react";
import { useCinema } from "./cinemaContext";
import "./V5SectionFilm.css";

/**
 * V5SectionFilm — a full-bleed film behind one section.
 *
 * Everything the hero's film learned, in a form the rest of the page can use,
 * so the site reads as one film rather than one animated page:
 *
 *  · The <video> is BUILT IMPERATIVELY and only appended once every attribute
 *    is on it. React's `muted` prop sets the property and never the attribute,
 *    and WebKit decides autoplay eligibility at insertion — so a JSX <video>
 *    is judged unmuted and refused. This was traced, not guessed: 26 play()
 *    calls, all NotAllowedError, with every attribute correct by then.
 *  · A slow push runs in CSS on the ELEMENT, so it animates the POSTER too.
 *    If a browser refuses autoplay the section still moves instead of showing
 *    a still frame — which is the failure Ali saw on his own Safari.
 *  · It only mounts when the section is near the viewport, so five films do
 *    not all fetch at once on a phone on mobile data.
 *  · Never under reduced-motion, never on save-data or 2g.
 *
 * `side` picks where the reading ground sits, since that is the half the copy
 * occupies: "right" for RTL text columns, "center" for centred sections.
 */
export default function V5SectionFilm({ src, poster, side = "center", strength = 1 }) {
  /* These sections are SHARED with the live homepage at `/`. Without this the
     films would appear there too, and `/` is not mine to change. Film mode
     only — everywhere else this renders nothing at all. */
  const cine = useCinema();
  const slot = useRef(null);
  const [near, setNear] = useState(false);

  /* Only wake up when the section is close. Five films that all load on first
     paint would cost more than the hero ever did. */
  useEffect(() => {
    const el = slot.current;
    if (!el || typeof window === "undefined") return undefined;
    if (!("IntersectionObserver" in window)) { setNear(true); return undefined; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const host = slot.current;
    if (!host || !near) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const c = navigator.connection;
    if (c && (c.saveData || /^(slow-)?2g$/.test(c.effectiveType || ""))) return undefined;

    const v = document.createElement("video");
    v.className = "v5sf-video is-lit";
    v.setAttribute("muted", "");
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("autoplay", "");
    v.autoplay = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.playsInline = true;
    v.loop = true;
    v.preload = "auto";
    if (poster) v.poster = poster;
    v.setAttribute("aria-hidden", "true");
    v.tabIndex = -1;
    v.disablePictureInPicture = true;
    v.src = src;
    v.addEventListener("error", () => v.remove());
    host.appendChild(v);

    const go = () => { const r = v.play(); if (r && r.catch) r.catch(() => {}); };
    go();
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if ((!v.paused && v.currentTime > 0) || tries > 20) { clearInterval(id); return; }
      go();
    }, 250);

    /* If autoplay is refused outright, the first real interaction starts it. */
    const onGesture = () => go();
    const gestures = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"];
    gestures.forEach((g) => window.addEventListener(g, onGesture, { once: true, passive: true }));

    return () => {
      clearInterval(id);
      gestures.forEach((g) => window.removeEventListener(g, onGesture));
      v.remove();
    };
  }, [near, src, poster]);

  if (cine !== "film") return null;

  return (
    <div className="v5sf" data-side={side} style={{ "--sf-strength": strength }} aria-hidden>
      <div className="v5sf-slot" ref={slot} />
      <div className="v5sf-ground" />
    </div>
  );
}
