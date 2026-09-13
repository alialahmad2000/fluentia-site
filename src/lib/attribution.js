/**
 * attribution — remember where a visitor came from, for every conversion later.
 *
 * WHY: every form read `window.location.search` at SUBMIT time. A visitor who
 * lands on /?utm_source=tiktok, scrolls, and clicks through to /level-test
 * (a full-reload <a href>) has lost the query string by the time they submit —
 * so on 2026-09-13 only 2 of 66 site conversions in 30 days carried any source.
 * Ad spend could not be tied to a single lead.
 *
 * HOW: `captureAttribution()` runs once at boot (main.jsx) and stores:
 *   - FIRST touch  → localStorage  (90 days): the channel that found us.
 *   - LAST touch   → sessionStorage: the channel that brought THIS visit.
 * `getAttribution()` answers "which source does this conversion belong to":
 * the current URL, else this visit's last touch, else the first touch.
 *
 * No schema change: leads and level_test_results already have utm_source /
 * utm_medium / utm_campaign. Click ids (gclid, ttclid, …) and a search/social
 * referrer are translated into those three fields when the URL has no UTMs,
 * so an organic Google visit is recorded as google/organic, not "direct".
 */

const FIRST_KEY = "flu_attr_first";
const LAST_KEY = "flu_attr_last";
const FIRST_TTL_MS = 90 * 24 * 60 * 60 * 1000;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

/** Ad click ids → the channel they prove. Order matters only for ties. */
const CLICK_IDS = [
  ["gclid", "google", "cpc"],
  ["gbraid", "google", "cpc"],
  ["wbraid", "google", "cpc"],
  ["ttclid", "tiktok", "paid"],
  ["ScCid", "snapchat", "paid"],
  ["fbclid", "facebook", "social"],
  ["twclid", "twitter", "paid"],
  ["msclkid", "bing", "cpc"],
];

/** Referrer host → source/medium, for visits that arrive with no tags at all. */
const REFERRERS = [
  [/(^|\.)google\./, "google", "organic"],
  [/(^|\.)bing\.com$/, "bing", "organic"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "organic"],
  [/(^|\.)yahoo\./, "yahoo", "organic"],
  [/(^|\.)yandex\./, "yandex", "organic"],
  [/(^|\.)tiktok\.com$/, "tiktok", "social"],
  [/(^|\.)instagram\.com$/, "instagram", "social"],
  [/(^|\.)(facebook\.com|fb\.me|l\.facebook\.com)$/, "facebook", "social"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "twitter", "social"],
  [/(^|\.)snapchat\.com$/, "snapchat", "social"],
  [/(^|\.)youtube\.com$/, "youtube", "social"],
  [/(^|\.)linkedin\.com$/, "linkedin", "social"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp", "social"],
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/, "ai_assistant", "referral"],
];

const OWN_HOSTS = /(^|\.)(fluentia\.academy|fluentia\.online|fluentia-site\.vercel\.app|localhost|127\.0\.0\.1)$/;

function safeGet(store, key) {
  try { return JSON.parse(store.getItem(key) || "null"); } catch { return null; }
}
function safeSet(store, key, value) {
  try { store.setItem(key, JSON.stringify(value)); } catch { /* private mode / blocked storage */ }
}

/** Read one touch from the current URL + referrer. null = nothing to record. */
function readTouch() {
  if (typeof window === "undefined") return null;
  let params;
  try { params = new URLSearchParams(window.location.search); } catch { return null; }

  const touch = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) touch[k] = v.slice(0, 100);
  }

  for (const [param, source, medium] of CLICK_IDS) {
    const v = params.get(param);
    if (v) {
      touch.click_id_type = param;
      if (!touch.utm_source) touch.utm_source = source;
      if (!touch.utm_medium) touch.utm_medium = medium;
      break;
    }
  }

  let refHost = "";
  try { refHost = document.referrer ? new URL(document.referrer).hostname : ""; } catch { /* opaque */ }
  const external = refHost && !OWN_HOSTS.test(refHost);
  if (external) touch.referrer = refHost;

  if (!touch.utm_source && external) {
    const hit = REFERRERS.find(([re]) => re.test(refHost));
    touch.utm_source = hit ? hit[1] : refHost;
    touch.utm_medium = hit ? hit[2] : "referral";
  }

  if (!touch.utm_source) return null;
  touch.landing_path = window.location.pathname;
  touch.at = Date.now();
  return touch;
}

/** Call once at boot, before anything can navigate away from the landing URL. */
export function captureAttribution() {
  const touch = readTouch();
  if (!touch) return;

  const first = safeGet(window.localStorage, FIRST_KEY);
  if (!first || Date.now() - (first.at || 0) > FIRST_TTL_MS) {
    safeSet(window.localStorage, FIRST_KEY, touch);
  }
  safeSet(window.sessionStorage, LAST_KEY, touch);

  // Legacy readers (utils/tracking.js getSource, level-test utm()) look here.
  try { window.sessionStorage.setItem("utm_source", touch.utm_source); } catch { /* ignore */ }
}

/**
 * The attribution a conversion should carry: current URL → this visit's last
 * touch → the stored first touch. Always returns an object (fields may be null).
 */
export function getAttribution() {
  const pick = readTouch()
    || (typeof window !== "undefined" && safeGet(window.sessionStorage, LAST_KEY))
    || (typeof window !== "undefined" && safeGet(window.localStorage, FIRST_KEY))
    || {};
  const first = (typeof window !== "undefined" && safeGet(window.localStorage, FIRST_KEY)) || null;
  return {
    utm_source: pick.utm_source || null,
    utm_medium: pick.utm_medium || null,
    utm_campaign: pick.utm_campaign || null,
    utm_content: pick.utm_content || null,
    utm_term: pick.utm_term || null,
    click_id_type: pick.click_id_type || null,
    referrer: pick.referrer || null,
    landing_path: pick.landing_path || null,
    first_source: first?.utm_source || null,
  };
}
