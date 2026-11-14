/* Local persistence for one attempt (resume after refresh) and the ids this
 * device has already seen (fresh items on a retake). Storage can be missing
 * (private mode) — every call degrades to "nothing saved". */
const RUN = 'lt2_run';
const SEEN = 'lt2_seen';
const TTL = 3 * 86400_000;

export function readRun() {
  if (typeof window === 'undefined') return null;
  try {
    const r = JSON.parse(localStorage.getItem(RUN) || 'null');
    if (!r || r.v !== 1) return null;
    if (Date.now() - (r.updated || 0) > TTL) return null;
    return r;
  } catch { return null; }
}
export function writeRun(r) {
  try { localStorage.setItem(RUN, JSON.stringify({ ...r, updated: Date.now() })); } catch { /* none */ }
}
export function clearRun() {
  try { localStorage.removeItem(RUN); } catch { /* none */ }
}
export function readSeen() {
  try { const s = JSON.parse(localStorage.getItem(SEEN) || '[]'); return Array.isArray(s) ? s : []; } catch { return []; }
}
export function addSeen(ids) {
  try {
    const s = [...new Set([...readSeen(), ...ids])].slice(-400);
    localStorage.setItem(SEEN, JSON.stringify(s));
  } catch { /* none */ }
}
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
