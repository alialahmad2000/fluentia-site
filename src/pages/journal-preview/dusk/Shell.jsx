import { useEffect, useMemo, useRef } from "react";
import { useFontGate, facesOf } from "../shared";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../../../styles/v1-tokens.css";
import "../../../styles/v5-tokens.css";
import NEXT_CSS from "../../next/next.css?inline";
import DUSK_CSS from "./dusk.css?inline";
import Header from "../../next/Header";
import V1LeadModal from "../../v1/V1LeadModal";
import { V1Footer } from "../../v1/V1Closing";
import { PREVIEW_PATH } from "../../../content/journal/preview.js";
import { ridge, stars } from "./gen.js";

/** Four skies, cross-faded by scroll: dusk → late dusk → blue hour (plum) → night. */
const SKY_STOPS = [0, 0.34, 0.68, 1];

/** Fixed far-dune layers behind the text; they drift at different depths. */
function FixedDunes() {
  const layers = useMemo(() => [
    { d: ridge("fx-a", { w: 1600, base: 120, amp: 34, waves: 3 }), fill: "#4a2450", rim: "#d88a8a", rimO: 0.22, depth: 0.05 },
    { d: ridge("fx-b", { w: 1600, base: 150, amp: 40, waves: 3 }), fill: "#35183f", rim: "#e8b48a", rimO: 0.28, depth: 0.1 },
    { d: ridge("fx-c", { w: 1600, base: 176, amp: 30, waves: 2 }), fill: "#240f2e", rim: "#c9784a", rimO: 0.3, depth: 0.18 },
  ], []);
  return (
    <div className="dk-fixdunes" aria-hidden="true">
      {layers.map((l, i) => (
        <svg key={i} className="dk-fixdune" data-par={l.depth} viewBox="0 0 1600 200" preserveAspectRatio="none">
          <path d={l.d.fill(200)} fill={l.fill} />
          <path d={l.d.line} fill="none" stroke={l.rim} strokeOpacity={l.rimO} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
    </div>
  );
}

function Sky() {
  const st = useMemo(() => stars("dk-night", 70), []);
  return (
    <div className="dk-sky" aria-hidden="true">
      <div className="dk-sky-l dk-sky-0" data-sky="0" />
      <div className="dk-sky-l dk-sky-1" data-sky="1" />
      <div className="dk-sky-l dk-sky-2" data-sky="2" />
      <div className="dk-sky-l dk-sky-3" data-sky="3" />
      <svg className="dk-stars" data-stars="" width="100%" height="100%" preserveAspectRatio="none">
        {st.map(([x, y, r, o], i) => <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#f7ebe3" fillOpacity={o} />)}
      </svg>
      <div className="dk-glow" data-glow="" />
    </div>
  );
}

/** One passive scroll loop: sky cross-fade, fixed-dune parallax, plate parallax, reading bar, reveals. */
function useDuskMotion(rootRef, { barRef, bodyRef } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skies = [...root.querySelectorAll("[data-sky]")];
    const starsEl = root.querySelector("[data-stars]");
    const glow = root.querySelector("[data-glow]");
    const fix = [...root.querySelectorAll(".dk-fixdune")];
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const p = Math.min(1, Math.max(0, y / max));
      skies.forEach((el, i) => {
        const d = Math.abs(p - SKY_STOPS[i]);
        const o = Math.max(0, 1 - d / 0.36);
        el.style.opacity = o.toFixed(3);
      });
      if (starsEl) starsEl.style.opacity = Math.max(0, (p - 0.55) / 0.45).toFixed(3);
      if (glow) glow.style.opacity = (0.9 - p * 0.75).toFixed(3);
      if (!reduce) {
        fix.forEach((el) => {
          const k = parseFloat(el.dataset.par) || 0;
          el.style.transform = `translate3d(${(-p * 90 * k * 10).toFixed(1)}px, ${(p * 14 * k * 10).toFixed(1)}px, 0)`;
        });
        if (y < vh * 1.4) {
          root.querySelectorAll("[data-plx]").forEach((el) => {
            const k = parseFloat(el.dataset.plx) || 0;
            el.style.transform = `translate3d(0, ${(y * k).toFixed(1)}px, 0)`;
          });
        }
      }
      const bar = barRef && barRef.current;
      const body = bodyRef && bodyRef.current;
      if (bar && body) {
        const r = body.getBoundingClientRect();
        const total = r.height - vh * 0.6;
        const v = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        bar.style.transform = `scaleX(${v.toFixed(4)})`;
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    tick();
    // reveals
    let io = null;
    const seen = new WeakSet();
    const watch = () => {
      root.querySelectorAll(".dk-r:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io && io.observe(el);
      });
    };
    if ("IntersectionObserver" in window && !reduce) {
      io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
      watch();
    } else {
      root.querySelectorAll(".dk-r").forEach((el) => el.classList.add("is-in"));
    }
    const mo = new MutationObserver(() => { if (io) watch(); else root.querySelectorAll(".dk-r:not(.is-in)").forEach((el) => el.classList.add("is-in")); on(); });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
      if (io) io.disconnect();
      mo.disconnect();
    };
  }, [rootRef, barRef, bodyRef]);
}

/**
 * The page shell for both home and article: sky, fixed dunes, header, footer, lead modal.
 * Everything is scoped under .pv-dusk. (The phone menu sheet is portalled to <body> by the
 * site header, so its few overrides are unscoped; they live only while a dusk page is mounted.)
 */
const FONTS = "https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500&display=swap";

export default function Shell({ children, barRef, bodyRef, topId = true }) {
  const rootRef = useRef(null);
  useDuskMotion(rootRef, { barRef, bodyRef });
  const gate = useFontGate(FONTS, facesOf(FONTS));
  return (
    <div className="v1-scope v5-scope fx-next pv-dusk" dir="rtl" ref={rootRef} style={gate}>
      <style dangerouslySetInnerHTML={{ __html: NEXT_CSS + DUSK_CSS }} />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href={FONTS}
        />
        <meta name="theme-color" content="#2a1433" />
      </Helmet>
      <Sky />
      <FixedDunes />
      {barRef ? <div className="dk-progress" ref={barRef} aria-hidden="true" /> : null}
      <Header page="/journal" />
      {topId ? null : <div id="fx-top" />}
      <main className="dk-main">{children}</main>
      <div className="dk-back">
        <Link to={PREVIEW_PATH}>كل اتجاهات المعاينة</Link>
      </div>
      <div className="fx-footer"><V1Footer /></div>
      <V1LeadModal />
    </div>
  );
}
