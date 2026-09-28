/**
 * Performance tiers for /ascent — high / medium / low.
 *
 *   high    the rendered climb at full crops (1600×900 / 720×1280), live snow + stars, intro
 *   medium  smaller crops (1280×720 / 540×960), fewer snow flakes, intro
 *   low     no frame sequence: seven stills from the same render, cross-fading with
 *           scroll; no intro; every reveal already in place
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

/** The frame player decodes in a worker with createImageBitmap. */
function canPlay() {
  return typeof Worker !== "undefined" && typeof createImageBitmap === "function";
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
  if (!canPlay()) return "low";

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
