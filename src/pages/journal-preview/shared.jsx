import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

/**
 * Shared bits for the «مجلة طلاقة» art-direction previews.
 * Each direction lives in ./<id>/ (Home.jsx + Article.jsx) and owns its look
 * completely; only these helpers are common.
 */

/** Previews are never indexed: robots meta here + X-Robots-Tag in public/_headers. */
export function PreviewMeta({ title, description }) {
  // The shell's static «index, follow» tag would sit beside ours; a preview keeps
  // only «noindex, nofollow» (the X-Robots-Tag header in public/_headers is the backstop).
  useEffect(() => {
    document.querySelectorAll('meta[name="robots"]:not([data-rh])').forEach((m) => m.remove());
  }, []);
  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}

/**
 * useFontGate — the covers are set in a display face from Google Fonts. Injected
 * by Helmet after first render, a «swap» would reflow the type-led covers (CLS
 * 0.2–0.3 on a cold load). So the page stays visibility:hidden — invisible nodes
 * don't count as layout shift — until the stylesheet is in and the faces in
 * `specs` (every weight the stylesheet declares) are loaded, or `cap` ms pass. Faces already loaded (moving between
 * pages of one direction) show at once. Returns a style for the root element.
 */
const SAMPLE = "طلاقة abc";
const faceLoaded = (spec) => {
  try {
    const fam = spec.match(/"([^"]+)"/)[1];
    for (const f of document.fonts) if (f.family.replace(/["']/g, "") === fam && f.status === "loaded") return true;
  } catch { return true; }
  return false;
};
/** Every family × weight a Google Fonts css2 URL declares, as FontFaceSet.load() specs. */
export const facesOf = (href) =>
  [...href.matchAll(/family=([^:&]+):wght@([\d;]+)/g)].flatMap(([, fam, w]) =>
    w.split(";").map((wt) => `${wt} 1em "${decodeURIComponent(fam).replace(/\+/g, " ")}"`),
  );

export function useFontGate(href, specs, cap = 1500) {
  const [ready, setReady] = useState(() => typeof document === "undefined" || !document.fonts || specs.every(faceLoaded));
  useEffect(() => {
    if (ready) return undefined;
    let done = false;
    const finish = () => { if (!done) { done = true; setReady(true); } };
    const timer = setTimeout(finish, cap);
    const loadFaces = () => Promise.all(specs.map((s) => document.fonts.load(s, SAMPLE))).then(finish, finish);
    let link = document.querySelector(`link[rel="stylesheet"][data-pv-fonts="${href}"]`);
    if (link && link.sheet) loadFaces();
    else {
      if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.dataset.pvFonts = href;
        document.head.appendChild(link);
      }
      link.addEventListener("load", loadFaces, { once: true });
      link.addEventListener("error", finish, { once: true });
    }
    return () => { done = true; clearTimeout(timer); };
  }, [ready, href, cap]); // specs: a literal per shell, fixed for its lifetime
  return ready ? undefined : { visibility: "hidden" };
}

/**
 * <Art> — a generated image from public/images/journal/<dir>/, made by the
 * local pipeline as <name>-w800|1280|1920.webp (16:9) and <name>-t600|900|1200.webp
 * (4:5). Portrait screens get the 4:5 crop. Width/height are set so nothing shifts.
 *   eager   — the first plate only (LCP); everything else lazy-loads.
 *   wide    — 16:9 only (no 4:5 crop was made).
 */
export function Art({ dir, name, alt = "", eager = false, wide = false, sizes = "100vw", className, style }) {
  const base = `/images/journal/${dir}/${name}`;
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
        // A slot not rendered yet hides instead of showing a broken-image icon.
        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
      />
    </picture>
  );
}
