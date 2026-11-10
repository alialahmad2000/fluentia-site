import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../../../styles/v1-tokens.css";
import "../../../styles/v5-tokens.css";
import NEXT_CSS from "../../next/next.css?inline";
import INK_CSS from "./ink.css?inline";
import V1LeadModal from "../../v1/V1LeadModal";
import { V1Footer } from "../../v1/V1Closing";
import Header from "../../next/Header";
import { Art, useFontGate, facesOf } from "../shared";
import { PREVIEW_PATH, previewPath } from "../../../content/journal/preview.js";
import { readLabel } from "../../../content/journal/index.js";
import { parseInline } from "../../../content/journal/index.js";

export const DIR = "ink";
const reduced = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Inline markup → React ({{English}} → isolated LTR run, **x** → bold). */
export function Inline({ text }) {
  return parseInline(text).map((tok, i) => {
    if (tok.t === "en") return <span key={i} className="ink-en" dir="ltr" lang="en">{tok.v}</span>;
    if (tok.t === "b") return <b key={i}>{tok.v}</b>;
    return tok.v;
  });
}

/** Fade-and-rise on first sight. */
export function Rise({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window) || reduced()) { el.classList.add("is-in"); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`ink-rise ${className}`} style={delay ? { "--d": `${delay}ms` } : undefined} {...rest}>{children}</Tag>;
}

/** A parallax image frame: wraps <Art>; moves slower than the page. */
export function Par({ name, eager, wide, factor = 0.12, className = "ink-plate-par", alt = "" }) {
  return (
    <div className={className} data-par={factor}>
      <Art dir={DIR} name={name} eager={eager} wide={wide} alt={alt} />
    </div>
  );
}

/**
 * One scroll loop for the whole page: reading progress, the ember glow that
 * warms with scroll, and parallax. transform/opacity only; passive listener.
 */
function useAtmosphere(rootRef, barRef, glowRef) {
  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    const glow = glowRef.current;
    if (!root) return undefined;
    const calm = reduced();
    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      const doc = document.documentElement;
      const total = Math.max(1, doc.scrollHeight - vh);
      const p = Math.min(1, Math.max(0, window.scrollY / total));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (glow && !calm) {
        glow.style.opacity = (0.14 + 0.8 * Math.pow(p, 0.8)).toFixed(3);
        glow.style.transform = `scale(${(1 + p * 0.5).toFixed(3)})`;
      }
      if (calm) return;
      const els = root.querySelectorAll("[data-par]");
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const r = (el.parentElement || el).getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const off = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-off * parseFloat(el.dataset.par)).toFixed(1)}px, 0)`;
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(frame); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    frame();
    if (glow && calm) glow.style.opacity = "0.4";
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rootRef, barRef, glowRef]);
}

const FONTS = "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap";

export function Shell({ children, share = null }) {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const glowRef = useRef(null);
  useAtmosphere(rootRef, barRef, glowRef);
  const gate = useFontGate(FONTS, facesOf(FONTS));
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    const prev = [h.style.backgroundColor, b.style.backgroundColor];
    h.style.backgroundColor = "#0e0b09"; b.style.backgroundColor = "#0e0b09";
    return () => { h.style.backgroundColor = prev[0]; b.style.backgroundColor = prev[1]; };
  }, []);
  return (
    <div className="v1-scope v5-scope fx-next pv-ink" dir="rtl" ref={rootRef} style={gate}>
      <style dangerouslySetInnerHTML={{ __html: NEXT_CSS + INK_CSS }} />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </Helmet>
      <svg className="ink-svgdefs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="ink-bleed" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="ink-glow" ref={glowRef} aria-hidden="true" />
      <div className="ink-grain" aria-hidden="true" />
      <div className="ink-bar" ref={barRef} aria-hidden="true" />
      <Header page="/journal" />
      <div className="ink-page">{children}</div>
      <div className="ink-foot-note">
        <Link className="ink-back" to={PREVIEW_PATH}>كل اتجاهات المعاينة</Link>
      </div>
      <div className="fx-footer"><V1Footer /></div>
      <V1LeadModal />
      {share}
    </div>
  );
}

/** Home / related card. variant: hero | tall | wide | big | sm */
export function Card({ article, index, variant = "wide", direction = DIR, eager = false }) {
  return (
    <Rise as="div" className={`ink-wrap ink-wrap--${variant}`}>
      <Link to={previewPath(direction, article.slug)} className={`ink-card ink-card--${variant}`}>
        <div className="ink-card-art">
          <Art dir={DIR} name={`plate-${article.slug}`} eager={eager} alt="" sizes="(min-width: 900px) 60vw, 100vw" />
          {index != null ? <span className="ink-card-no ink-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> : null}
        </div>
        <div className="ink-card-body">
          <h3 className="ink-card-t">{article.title}</h3>
          <p className="ink-card-l">{article.quote}</p>
          <div className="ink-card-m"><b>{article.category}</b><span>{readLabel(article)}</span></div>
        </div>
      </Link>
    </Rise>
  );
}
