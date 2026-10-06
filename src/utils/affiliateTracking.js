const REF_COOKIE = 'flu_ref';
const VISITOR_COOKIE = 'flu_vid';
const COOKIE_DAYS = 30;
const SUPABASE_URL = 'https://nmjexpuycmqcxuxljier.supabase.co';

// localStorage THROWS (not just returns null) when site data is blocked —
// Safari's «Block All Cookies», some in-app browsers. main.jsx calls
// captureRefFromUrl() before React mounts, so one unguarded read blanked every
// page of the site for those visitors. Same behaviour otherwise.
function lsGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* this visit only */ }
}
function lsRemove(key) {
  try { localStorage.removeItem(key); } catch { /* nothing stored */ }
}

export function getVisitorId() {
  let v = lsGet(VISITOR_COOKIE);
  if (!v) {
    v = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    lsSet(VISITOR_COOKIE, v);
  }
  return v;
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? m[2] : null;
}

export function getStoredRef() {
  const c = getCookie(REF_COOKIE);
  if (c) return c;
  const ls = lsGet(REF_COOKIE);
  if (!ls) return null;
  try {
    const { code, at } = JSON.parse(ls);
    if (Date.now() - at > COOKIE_DAYS * 24 * 60 * 60 * 1000) {
      lsRemove(REF_COOKIE);
      return null;
    }
    return code;
  } catch { return null; }
}

export function captureRefFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return getStoredRef();
  const cleanRef = ref.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  if (!cleanRef) return getStoredRef();

  // First-click attribution: don't overwrite existing
  const existing = getStoredRef();
  if (existing) return existing;

  setCookie(REF_COOKIE, cleanRef, COOKIE_DAYS);
  lsSet(REF_COOKIE, JSON.stringify({ code: cleanRef, at: Date.now() }));

  // Fire click tracker (non-blocking)
  fireClickTracker(cleanRef);
  return cleanRef;
}

async function fireClickTracker(refCode) {
  try {
    const p = new URLSearchParams(window.location.search);
    await fetch(`${SUPABASE_URL}/functions/v1/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref_code: refCode,
        landing_url: window.location.href,
        referrer: document.referrer || null,
        utm_source: p.get('utm_source'),
        utm_medium: p.get('utm_medium'),
        utm_campaign: p.get('utm_campaign'),
        visitor_id: getVisitorId(),
      }),
    });
  } catch (e) { /* silent */ }
}
