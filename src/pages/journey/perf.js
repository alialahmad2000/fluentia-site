/**
 * Performance tiers for /journey — high / medium / low.
 *
 *   high    globe + sea at DPR ≤ 2, every arc, 400 sea lines, 256² wake, Lenis (desktop)
 *   medium  DPR ≤ 1.25, 200 lines, 128² wake, fewer arcs, WebGL capped at 30 fps
 *   low     no WebGL and no `three` download: the rendered stills, static
 *           compositions for the pinned scenes, no preloader
 *
 * Override: ?tier=low|medium|high, or localStorage["fl-perf-tier"] (the footer
 * control writes it). TikTok / Instagram / Facebook / Snapchat in-app browsers
 * cap at medium. A lost WebGL context drops the page to low.
 */

export const TIERS = ["low", "medium", "high"];
export const TIER_KEY = "fl-perf-tier";
export const INTRO_KEY = "fl-journey-intro";

const IN_APP = /TikTok|musical_ly|Bytedance|BytedanceWebview|Instagram|FBAN|FBAV|Snapchat/i;

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
    /* private mode: the choice lasts for this page view only */
  }
}

/** A forced tier from the URL or the footer control, else null (= automatic). */
export function forcedTier() {
  const q = new URLSearchParams(window.location.search).get("tier");
  if (TIERS.includes(q)) return q;
  const s = readStore(TIER_KEY);
  return TIERS.includes(s) ? s : null;
}

function hasWebGL2() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Mean frame time over `n` frames, in ms. */
function probe(n = 40) {
  return new Promise((resolve) => {
    let count = 0;
    let first = 0;
    const step = (t) => {
      if (!first) first = t;
      count += 1;
      if (count > n) {
        resolve((t - first) / n);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

const down = (t) => TIERS[Math.max(0, TIERS.indexOf(t) - 1)];

export const inAppBrowser = () => IN_APP.test(navigator.userAgent);

export async function detectTier() {
  const forced = forcedTier();
  if (forced) return forced;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  const conn = navigator.connection;
  if (conn && conn.saveData) return "low";
  if (!hasWebGL2()) return "low";

  const mem = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  let tier = "high";
  if ((mem && mem <= 2) || (cores && cores <= 2)) tier = "low";
  else if ((mem && mem <= 4) || (cores && cores <= 4)) tier = "medium";
  if (inAppBrowser() && tier === "high") tier = "medium";
  if (tier === "low") return tier;

  // A tab opened in the background never paints; don't mistake that for a slow phone.
  if (document.visibilityState !== "visible") return tier;
  const ms = await probe(40);
  if (ms > 34) return "low";
  if (ms > 22) return down(tier);
  return tier;
}

export function tierConfig(tier) {
  if (tier === "high")
    return { tier, webgl: true, fps: 60, dpr: 2, arcs: 8, seaLines: 400, wake: 256, intro: true };
  if (tier === "medium")
    return { tier, webgl: true, fps: 30, dpr: 1.25, arcs: 5, seaLines: 200, wake: 128, intro: true };
  return { tier: "low", webgl: false, fps: 0, dpr: 1, arcs: 0, seaLines: 0, wake: 0, intro: false };
}
