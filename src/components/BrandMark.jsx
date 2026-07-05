/**
 * BrandMark — the official Fluentia F-mark (from the brand PDF).
 * Usage rules (per brand sheet):
 *  - `mark`    → the blue feather-F symbol, transparent. For DARK surfaces
 *                next to the طلاقة wordmark (site headers/footers/modals).
 *  - `appicon` → navy rounded tile with white F. Avatars/app-icon contexts
 *                only (favicon, social). Don't mix with the blue mark inline.
 * The black-text lockup (brand PDF p1) is for LIGHT backgrounds only — the
 * site is dark, so it is intentionally not shipped here.
 * Arabic contexts keep the طلاقة wordmark as TEXT (brand rule: never
 * transliterate) — the mark sits beside it, it never replaces it.
 */
export default function BrandMark({ size = 28, variant = "mark", style, alt = "" }) {
  const src = variant === "appicon" ? "/brand/fluentia-appicon.png" : "/brand/fluentia-mark.svg";
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      loading="eager"
      decoding="async"
      style={{ display: "block", objectFit: "contain", flexShrink: 0, ...style }}
    />
  );
}
