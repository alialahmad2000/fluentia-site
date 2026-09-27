/**
 * Performance tiers for /ascent — high / medium / low.
 *
 *   high    WebGL mountain: 256² terrain, DPR ≤ 2, 4,000 snow flakes, full cloud sea, intro
 *   medium  WebGL mountain: 128² terrain, DPR ≤ 1.25, 1,200 flakes, simpler clouds, 30 fps, intro
 *   low     no WebGL and no three.js download: seven stills rendered from the high
 *           tier, cross-fading with scroll; no intro; every reveal already in place
 *
 * Reduced motion and save-data are low. TikTok / Instagram / Facebook / Snapchat
 * in-app browsers cap at medium. Override: ?tier=low|medium|high, or
 * localStorage["fl-perf-tier"] (the footer control writes it).
 */

export const TIERS = ["low", "medium", "high"];
export const TIER_KEY = "fl-perf-tier";
export const INTRO_KEY = "fl-ascent-intro";
export const SOUND_KEY = "fl-ascent-sound";

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
    /* private mode: the choice lasts for this page view */
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
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
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
  if (IN_APP.test(navigator.userAgent) && tier === "high") tier = "medium";
  if (tier === "low") return tier;

  // A tab opened in the background never paints; don't mistake that for a slow phone.
  if (document.visibilityState !== "visible") return tier;
  const ms = await probe(40);
  if (ms > 34) return "low";
  if (ms > 22) return down(tier);
  return tier;
}
