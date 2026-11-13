import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
// Inlined, as on the homepage: the prerendered page paints styled at once.
import NEXT_CSS from "../next/next.css?inline";
import GALLERY_CSS from "./gallery.css?inline";
import SCENES_A_CSS from "./scenes-a.css?inline";
import SCENES_B_CSS from "./scenes-b.css?inline";
import TRIES_B_CSS from "./tries-b.css?inline";
import V1LeadModal from "../v1/V1LeadModal";
import { V1Footer } from "../v1/V1Closing";
import Header from "../next/Header";
import { JOURNAL_PATH, parseInline } from "../../content/journal/index.js";

const CSS = NEXT_CSS + GALLERY_CSS + SCENES_A_CSS + SCENES_B_CSS + TRIES_B_CSS;

/** {{English}} → isolated LTR run, **x** → bold. */
export function Inline({ text }) {
  return parseInline(text).map((tok, i) => {
    if (tok.t === "en") return <span key={i} className="g-en" dir="ltr" lang="en">{tok.v}</span>;
    if (tok.t === "b") return <b key={i}>{tok.v}</b>;
    return tok.v;
  });
}

export const pad2 = (n) => String(n).padStart(2, "0");

/**
 * One IntersectionObserver for every .g-rv on the page. The prerendered HTML
 * shows everything (the hide-until-seen state is only switched on by the
 * `jg-js` class this hook adds), so crawlers and no-JS readers see full text.
 */
export function useReveal(dep) {
  useEffect(() => {
    const root = document.documentElement;
    const els = [...document.querySelectorAll(".jg .g-rv:not(.is-in)")];
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((e) => e.classList.add("is-in"));
      return undefined;
    }
    // Anything already on screen stays visible: no flash on hydration.
    const vh = window.innerHeight;
    els.forEach((e) => { if (e.getBoundingClientRect().top < vh) e.classList.add("is-in"); });
    root.classList.add("jg-js");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((e) => { if (!e.classList.contains("is-in")) io.observe(e); });
    return () => io.disconnect();
  }, [dep]);
}

/**
 * A Gallery photo: 16:9 crops (w800/w1280/w1920) and, unless `wide`, 4:5 crops
 * (t600/t900/t1200) for portrait screens. Width/height set → no layout shift.
 * Only the first plate is `eager`; everything else lazy-loads.
 */
export function Art({ name, alt = "", eager = false, wide = false, sizes = "100vw", className, style }) {
  const base = `/images/journal/gallery/${name}`;
  return (
    <picture className={className} style={style}>
      {wide ? null : (
        <source
          media="(max-aspect-ratio: 1/1)"
          type="image/webp"
          sizes={sizes}
          srcSet={`${base}-t600.webp 600w, ${base}-t900.webp 900w, ${base}-t1200.webp 1200w`}
          width="1200"
          height="1500"
        />
      )}
      <img
        src={`${base}-w1280.webp`}
        srcSet={`${base}-w800.webp 800w, ${base}-w1280.webp 1280w, ${base}-w1920.webp 1920w`}
        sizes={sizes}
        alt={alt}
        width="1920"
        height="1080"
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
        // React 18: the DOM attribute is lowercase (fetchPriority warns as unknown).
        fetchpriority={eager ? "high" : undefined}
      />
    </picture>
  );
}

/** «مجلة طلاقة» chrome: self-hosted type, header, lead modal, footer. Journal pages only. */
export default function Shell({ children, grid = true, preloadImage }) {
  useEffect(() => {
    document.documentElement.classList.add("jg-on");
    return () => document.documentElement.classList.remove("jg-on", "jg-js");
  }, []);
  return (
    <div className="v1-scope v5-scope fx-next jg" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Helmet>
        <link rel="preload" as="font" type="font/woff2" href="/fonts/alexandria-var-arabic.woff2" crossOrigin="" />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/plex-arabic-400-arabic.woff2" crossOrigin="" />
        {preloadImage ? (
          <link
            rel="preload"
            as="image"
            type="image/webp"
            href={`/images/journal/gallery/${preloadImage}-w1280.webp`}
            imageSrcSet={`/images/journal/gallery/${preloadImage}-w800.webp 800w, /images/journal/gallery/${preloadImage}-w1280.webp 1280w, /images/journal/gallery/${preloadImage}-w1920.webp 1920w`}
            imageSizes="100vw"
            media="(min-aspect-ratio: 1/1)"
            fetchpriority="high"
          />
        ) : null}
      </Helmet>
      <Header page={JOURNAL_PATH} />
      {grid ? (
        <div className="g-cols" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
        </div>
      ) : null}
      {children}
      <div className="fx-footer"><V1Footer /></div>
      <V1LeadModal />
    </div>
  );
}
