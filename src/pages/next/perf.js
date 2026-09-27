/**
 * Performance tiers for /next — high / medium / low.
 *
 *   high   shader at full fps, DPR ≤ 2, intro, full starfield, phone tilt/drag
 *   medium shader at 30 fps, DPR ≤ 1.5, intro, half the stars
 *   low    no WebGL (the static CSS orb), no intro, no starfield, no tilt,
 *          every reveal already in place
 *
 * Override: ?tier=low|medium|high, or localStorage["fl-perf-tier"] (the footer
 * control writes it). TikTok / Instagram / Facebook in-app browsers cap at medium.
 *
 * The first guess (overrides, reduced motion, save-data) is made by the inline
 * boot script in NextLanding before the first paint, so a forced-low visitor
 * never sees a transform. detectTier() refines it after hydration with the
 * hardware hints and a 40-frame rAF probe.
 */

export const TIERS = ["low", "medium", "high"];
export const TIER_KEY = "fl-perf-tier";
export const INTRO_KEY = "fl-intro-seen";

const IN_APP = /TikTok|musical_ly|Bytedance|BytedanceWebview|Instagram|FBAN|FBAV|Snapchat/i;

function readStore(key) {
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

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl", { failIfMajorPerformanceCaveat: true });
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

export async function detectTier() {
  const forced = forcedTier();
  if (forced) return forced;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  const conn = navigator.connection;
  if (conn && conn.saveData) return "low";
  if (!hasWebGL()) return "low";

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

export function tierConfig(tier) {
  if (tier === "high") return { webgl: true, fps: 60, dpr: 2, intro: true, stars: 1, tilt: true };
  if (tier === "medium") return { webgl: true, fps: 30, dpr: 1.5, intro: true, stars: 0.5, tilt: false };
  return { webgl: false, fps: 0, dpr: 1, intro: false, stars: 0, tilt: false };
}
