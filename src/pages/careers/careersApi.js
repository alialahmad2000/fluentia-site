/**
 * Client for the `hiring-interview` edge function (contract: fluentia-lms
 * docs/hiring-bot/API.md). Everything here runs in the browser only — nothing
 * executes at import time, so the prerender can import the page safely.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY || "";

export class ApiError extends Error {
  constructor(code, messageAr, field) {
    super(messageAr || code);
    this.code = code;
    this.messageAr = messageAr;
    this.field = field;
  }
}

const NETWORK_MSG = "تعذّر الاتصال. نرجو التأكد من الإنترنت والمحاولة مرة ثانية.";
const RATE_MSG = "كثرت المحاولات خلال وقت قصير. نرجو المحاولة بعد قليل.";

export async function call(action, payload = {}) {
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/hiring-interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new ApiError("NETWORK", NETWORK_MSG);
  }
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  if (!json || json.ok !== true) {
    const code = json?.error || (res.status === 429 ? "RATE_LIMITED" : "SERVER");
    const msg = code === "RATE_LIMITED" ? RATE_MSG : json?.message_ar || "صار خلل بسيط من عندنا. نرجو المحاولة بعد قليل.";
    throw new ApiError(code, msg, json?.field);
  }
  return json;
}

let clientPromise = null;
async function storage() {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false, autoRefreshToken: false } }),
    );
  }
  return (await clientPromise).storage.from("hr-cvs");
}

/** upload_url → uploadToSignedUrl → attach. Returns the attach response. */
export async function uploadAndAttach(app, { kind, blob, mime, ext, seconds }) {
  const base = { application_id: app.id, token: app.token };
  const up = await call("upload_url", { ...base, kind, mime, size: blob.size, ext });
  const bucket = await storage();
  const { error } = await bucket.uploadToSignedUrl(up.path, up.upload_token, blob, { contentType: mime });
  if (error) throw new ApiError("UPLOAD", "ما قدرنا نرفع الملف. نرجو المحاولة مرة ثانية.");
  const payload = { ...base, kind, path: up.path };
  if (seconds != null) payload.seconds = Math.round(seconds * 10) / 10;
  return call("attach", payload);
}

/* ── localStorage (never trust it to exist) ── */
const key = (role) => `flu_careers:${role}`;
export function loadSaved(role) {
  try {
    const v = JSON.parse(window.localStorage.getItem(key(role)) || "null");
    return v && v.application_id && v.token ? v : null;
  } catch { return null; }
}
export function saveApp(role, data) {
  try { window.localStorage.setItem(key(role), JSON.stringify(data)); } catch { /* private mode */ }
}
export function clearSaved(role) {
  try { window.localStorage.removeItem(key(role)); } catch { /* ignore */ }
}

/* ── input helpers ── */
export function toAscii(s) {
  return String(s || "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
export function phoneLooksValid(raw) {
  const d = toAscii(raw).replace(/[^\d]/g, "");
  return d.length >= 8 && d.length <= 15;
}

export const CV_EXT = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic" };
export const AUDIO_MIME_EXT = { "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav", "audio/webm": "webm", "video/webm": "webm", "audio/mp4": "mp4", "audio/x-m4a": "m4a", "audio/m4a": "m4a", "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/ogg": "ogg", "audio/aac": "aac" };
export const extOf = (name) => (String(name).split(".").pop() || "").toLowerCase();
