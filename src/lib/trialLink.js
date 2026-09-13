/**
 * trialLink — the link into «درسك الأول» (app.fluentia.academy/try) from any
 * site surface, carrying what the trial funnel needs to join the click to the
 * session it becomes (see the LMS table trial_funnel_events):
 *   utm_source   = the site surface that sent the visitor (home_band, work_english…)
 *   utm_medium   = site
 *   utm_campaign = the channel that brought the visitor to the SITE (tiktok,
 *                  google, direct…) — trial_sessions has only three utm columns
 *   job          = profession slug the trial preselects (nurse, accountant…)
 *   vid          = the site visitor id, adopted by /try across origins
 */
import { useEffect, useState } from "react";
import { getVisitorId } from "../utils/affiliateTracking";
import { getAttribution } from "./attribution";

export const TRIAL_URL = "https://app.fluentia.academy/try";

export function buildTrialHref({ source, job } = {}) {
  const p = new URLSearchParams({ utm_source: source || "site", utm_medium: "site" });
  try { p.set("utm_campaign", getAttribution().utm_source || "direct"); } catch { p.set("utm_campaign", "direct"); }
  if (job) p.set("job", job);
  try {
    const vid = getVisitorId();
    if (vid) p.set("vid", vid);
  } catch { /* storage blocked — the trial mints its own id */ }
  return `${TRIAL_URL}?${p.toString()}`;
}

/**
 * The same link as a hook, for anything that is PRERENDERED. The visitor id and
 * the remembered channel only exist in the browser, so the server's href would
 * differ from the client's — and React 18 does not patch attribute mismatches
 * during hydration: the DOM would keep the server href (no vid) until something
 * re-rendered it. First render (server + hydration) returns the storage-free
 * link; after mount the full link replaces it.
 */
export function useTrialHref({ source, job } = {}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (mounted) return buildTrialHref({ source, job });
  const p = new URLSearchParams({ utm_source: source || "site", utm_medium: "site" });
  if (job) p.set("job", job);
  return `${TRIAL_URL}?${p.toString()}`;
}
