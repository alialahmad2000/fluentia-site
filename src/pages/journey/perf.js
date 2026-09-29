/**
 * Performance tiers for /journey — decided ONCE, synchronously, by the inline
 * boot script before first paint (the same rules are mirrored there in ES5).
 * The tier only chooses renderers; the layout (every pinned length, every
 * section) is identical on all tiers, so nothing ever collapses under a thumb.
 *
 *   high    fine pointer, not in-app: WebGL at DPR ≤ 2, 8 arcs, 400 sea lines, 256² wake
 *   medium  touch or in-app browser: WebGL at DPR ≤ 1.5 (1.25 in-app), 5 arcs, 220 lines, 128² wake
 *   low     reduced motion / save-data / forced: no WebGL, no `three` download — stills,
 *           and the same legs drawn in 2D
 *
 * Override: ?tier=low|medium|high, or localStorage["fl-perf-tier"] (footer control).
 * A lost WebGL context shows the stills for the rest of the view; it never
 * changes the tier.
 */
export const TIERS = ["low", "medium", "high"];
export const TIER_KEY = "fl-perf-tier";
export const INTRO_KEY = "fl-journey-intro";
export const IN_APP = /TikTok|musical_ly|Bytedance|BytedanceWebview|Instagram|FBAN|FBAV|Snapchat/i;

export function readStore(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeStore(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

/** Mirrors boot(); used after hydration and by the footer control. */
export function decideTier() {
  const q = new URLSearchParams(window.location.search).get("tier");
  if (TIERS.includes(q)) return q;
  const s = readStore(TIER_KEY);
  if (TIERS.includes(s)) return s;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  if (navigator.connection && navigator.connection.saveData) return "low";
  try {
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2") && !c.getContext("webgl")) return "low";
  } catch {
    return "low";
  }
  if (IN_APP.test(navigator.userAgent)) return "medium";
  if (window.matchMedia("(pointer: coarse)").matches) return "medium";
  return "high";
}

export function tierConfig(tier) {
  const inApp = typeof navigator !== "undefined" && IN_APP.test(navigator.userAgent);
  if (tier === "high") return { tier, webgl: true, dpr: 2, arcs: 8, seaLines: 400, wake: 256 };
  if (tier === "medium") return { tier, webgl: true, dpr: inApp ? 1.25 : 1.5, arcs: 5, seaLines: 220, wake: 128 };
  return { tier: "low", webgl: false, dpr: 1, arcs: 0, seaLines: 0, wake: 0 };
}
