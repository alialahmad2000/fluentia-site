import { useEffect } from "react";
import { useFontGate } from "../shared";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "../../../styles/v1-tokens.css";
import "../../../styles/v5-tokens.css";
import NEXT_CSS from "../../next/next.css?inline";
import GALLERY_CSS from "./gallery.css?inline";
import V1LeadModal from "../../v1/V1LeadModal";
import { V1Footer } from "../../v1/V1Closing";
import Header from "../../next/Header";
import { parseInline } from "../../../content/journal/index.js";
import { PREVIEW_PATH } from "../../../content/journal/preview.js";

export const DIR = "gallery";

export const FONTS =
  "https://fonts.googleapis.com/css2?family=Alexandria:wght@600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap";

/** {{English}} → isolated LTR run, **x** → bold. */
export function Inline({ text }) {
  return parseInline(text).map((tok, i) => {
    if (tok.t === "en") return <span key={i} className="g-en" dir="ltr" lang="en">{tok.v}</span>;
    if (tok.t === "b") return <b key={i}>{tok.v}</b>;
    return tok.v;
  });
}

export const pad2 = (n) => String(n).padStart(2, "0");

/** One IntersectionObserver for every .g-rv on the page. */
export function useReveal(dep) {
  useEffect(() => {
    const els = [...document.querySelectorAll(".pv-gallery .g-rv:not(.is-in)")];
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((e) => e.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [dep]);
}

/** Page chrome: header, fonts, lead modal, footer, quiet link to all directions. */
export default function Shell({ children, grid = true }) {
  const gate = useFontGate(FONTS, ['800 1em "Alexandria"', '400 1em "IBM Plex Sans Arabic"']);
  useEffect(() => {
    document.documentElement.classList.add("pv-gallery-on");
    return () => document.documentElement.classList.remove("pv-gallery-on");
  }, []);
  return (
    <div className="v1-scope v5-scope fx-next pv-gallery" dir="rtl" style={gate}>
      <style dangerouslySetInnerHTML={{ __html: NEXT_CSS + GALLERY_CSS }} />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </Helmet>
      <Header page="/journal" />
      {grid ? (
        <div className="g-cols" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
        </div>
      ) : null}
      {children}
      <div className="fx-footer"><V1Footer /></div>
      <div className="g-allprev"><Link to={PREVIEW_PATH}>كل الاتجاهات التصميمية</Link></div>
      <V1LeadModal />
    </div>
  );
}
