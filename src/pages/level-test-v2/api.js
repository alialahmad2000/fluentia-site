/* ============================================================================
 * Level test v2 — the only door to the server. Every call goes to the public
 * edge function `level-test-submit` with the attempt's (id, token) pair; the
 * page never reads a table. Calls never throw: a network blip must not cost
 * anyone their place in the test.
 * ========================================================================== */
import { SUPABASE_URL } from '../../utils/tracking';
import { getStoredRef, getVisitorId } from '../../utils/affiliateTracking';
import { getAttribution } from '../../lib/attribution';

const FN = `${SUPABASE_URL}/functions/v1/level-test-submit`;

async function call(action, payload, { keepalive = false } = {}) {
  try {
    const res = await fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
      keepalive,
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { ...data, error: data?.error || `http_${res.status}`, status: res.status };
  } catch {
    return { error: 'network' };
  }
}

/** Click ids live on the first URL only; keep them for the session. */
const CLICK_KEY = 'lt2_click';
export function clickIds() {
  if (typeof window === 'undefined') return {};
  try {
    const q = new URLSearchParams(window.location.search);
    const fresh = {};
    for (const k of ['ttclid', 'fbclid', 'gclid']) if (q.get(k)) fresh[k] = q.get(k).slice(0, 200);
    const old = JSON.parse(sessionStorage.getItem(CLICK_KEY) || '{}');
    const merged = { ...old, ...fresh };
    sessionStorage.setItem(CLICK_KEY, JSON.stringify(merged));
    return merged;
  } catch { return {}; }
}

export function startAttempt(bankVersion) {
  let a = {};
  try { a = getAttribution() || {}; } catch { /* none */ }
  return call('v2_start', {
    visitor_id: getVisitorId(),
    ref_code: getStoredRef() || null,
    utm_source: a.utm_source || null,
    utm_medium: a.utm_medium || null,
    utm_campaign: a.utm_campaign || null,
    referrer: a.referrer || (typeof document !== 'undefined' ? document.referrer : '') || null,
    landing_path: a.landing_path || '/level-test',
    bank_version: bankVersion,
    device: {
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio,
      ua: navigator.userAgent.slice(0, 300),
      lang: navigator.language,
    },
    ...clickIds(),
  });
}

export const saveProgress = (att, step, patch = {}, opts) => call('v2_progress', { id: att.id, token: att.token, step, ...patch }, opts);
export const submitContact = (att, payload) => call('v2_contact', { id: att.id, token: att.token, ...payload });
export const getSlots = (att) => call('v2_slots', { id: att.id, token: att.token });
export const bookSlot = (att, start) => call('v2_book', { id: att.id, token: att.token, start });

/** Optional voice note: signed upload URL → PUT the blob → confirm. */
export async function uploadVoice(att, blob, seconds) {
  const u = await call('v2_voice_url', { id: att.id, token: att.token, mime: blob.type || 'audio/webm' });
  if (!u?.signed_url) return { ok: false };
  try {
    const put = await fetch(u.signed_url, {
      method: 'PUT',
      headers: { 'Content-Type': blob.type || 'audio/webm', 'x-upsert': 'false' },
      body: blob,
    });
    if (!put.ok) return { ok: false };
  } catch { return { ok: false }; }
  const done = await call('v2_voice_done', { id: att.id, token: att.token, path: u.path, seconds });
  return { ok: !!done?.ok };
}

/** The result fields the server stores (shared by teaser save and contact). */
export function resultFields(r) {
  return {
    level_index: r.lvl,
    level_ar: r.level.ar,
    track: r.level.track,
    confidence: r.confidence,
    top_prob: Math.round(r.confidenceScore * 100),
    alt_level: r.alt ? r.alt.cefr : null,
    alt_prob: r.alt ? r.altProb : null,
    theta: r.theta,
    se: r.se,
    correct: r.correct,
    total: r.total,
    pct: r.pct,
    skills: r.skills,
    level_probs: r.probs,
    integrity: r.integrity,
    listening_skipped: r.listeningSkipped,
  };
}
