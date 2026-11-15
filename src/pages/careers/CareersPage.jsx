/**
 * /careers — «انضم لفريق طلاقة». Public application page: role cards → basics
 * form → chat interview → voice step → outcome (slot picker / kind thanks).
 * Talks ONLY to the `hiring-interview` edge function (careersApi.js).
 *
 * The stylesheet is inlined (?inline → <style>) rather than imported, same as
 * /join: the route is prerendered, and a lazy chunk's CSS file only arrives
 * with its JS — the page would paint unstyled first. Everything stateful
 * (localStorage, Turnstile, the mic) runs in effects/handlers, never in render.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import DawnSun from "../next/DawnSun";
import { startWavRecording } from "../../lib/wavRecorder";
import { getAttribution } from "../../lib/attribution";
import css from "./careers.css?inline";
import {
  call, ApiError, uploadAndAttach, loadSaved, saveApp, clearSaved,
  toAscii, phoneLooksValid, CV_EXT, AUDIO_MIME_EXT, extOf, TURNSTILE_SITEKEY,
} from "./careersApi";

const ROLES = {
  sales: {
    id: "sales",
    title: "مستشار/ة قبول",
    short: "مستشار القبول",
    line: "مكالمات مع المهتمين بتعلم الإنجليزي، تعرّف على أهدافهم، وتسجيلهم في البرنامج المناسب — عن بُعد.",
    meta: ["دوام مسائي من 4 إلى 10، السبت إلى الخميس", "السيرة الذاتية اختيارية", "تسجيلات صوتية قصيرة بالعربي — أهم خطوة"],
    cvRequired: false,
  },
  trainer: {
    id: "trainer",
    title: "مدرّب/ة لغة إنجليزية",
    short: "مدرّب اللغة",
    line: "تدريب متعلمين سعوديين بالغين أونلاين، في مجموعات وبشكل فردي، على منهج طلاقة وكتابة تقرير بعد كل لقاء.",
    meta: ["السيرة الذاتية مطلوبة", "تسجيل صوتي بالإنجليزي وآخر قصير بالعربي"],
    cvRequired: true,
  },
};

/** Pick the masculine/feminine form once gender is known; show both before. */
const g = (gender, both, m, f) => (gender === "m" ? m : gender === "f" ? f : both);

/** Forward in RTL = pointing left. */
const Arrow = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The bot's progress: the dawn rises with it (--rise on .cr-root). */
const STEPS = ["بياناتك", "المحادثة", "التسجيل", "النتيجة"];
// PDPL consent (2026-11-15). Bump the version whenever the wording below changes.
const CONSENT_VERSION = "careers-2026-11";
const ACADEMY_WA_DISPLAY = "+966 55 866 9974";
const MIN_BIRTH = 1956;
// up to 15 years back: the under-18 rule is the server's (it answers politely), the form only blocks typos
const maxBirthYear = () => new Date().getFullYear() - 15;
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const pad2 = (n) => String(n).padStart(2, "0");
/** "YYYY-MM-DD" from three selects, or null when incomplete / not a real date (31 Feb). */
function dobOf({ d, m, y }) {
  if (!d || !m || !y) return null;
  const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (dt.getUTCMonth() !== Number(m) - 1) return null;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}
function ageFromDob(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const now = new Date();
  let a = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) a -= 1;
  return a;
}
const splitDob = (iso) => {
  const [y, m, d] = String(iso || "").split("-");
  return { y: y || "", m: m ? String(Number(m)) : "", d: d ? String(Number(d)) : "" };
};
const STEP_OF = { landing: 0, chat: 1, voice: 2, finishing: 3, outcome: 3 };
const RISE_OF = { landing: 0, chat: 0.2, voice: 0.45, finishing: 0.7, outcome: 1 };
function Steps({ stage, keyVoice }) {
  const at = STEP_OF[stage] ?? 0;
  return (
    <ol className="cr-steps" aria-label="الخطوات">
      {STEPS.map((l, i) => (
        <li key={l} className={i < at ? "done" : i === at ? "now" : ""} aria-current={i === at ? "step" : undefined}>
          <span>{l}{keyVoice && i === 2 ? <em className="cr-key">الأهم</em> : null}</span>
        </li>
      ))}
    </ol>
  );
}

function BotBubbleText({ children }) {
  return <span className="cr-bubble-text" dir="auto">{children}</span>;
}

/* ───────────────────────── Turnstile (only if sitekey) ─────────────────────────
 * Managed widget, dark, Arabic. The start button stays disabled until a token
 * exists; an expired/errored token clears it, and Turnstile refreshes it by
 * itself. If Cloudflare's script never arrives (blocked network) the applicant
 * gets a short Arabic note and a retry button — never a silently dead button. */
const TS_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
function Turnstile({ onToken, resetKey }) {
  const box = useRef(null);
  const widget = useRef(null);
  const [state, setState] = useState("loading"); // loading | ready | failed
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!TURNSTILE_SITEKEY) return undefined;
    let dead = false;
    const mount = () => {
      if (dead || !box.current || !window.turnstile || widget.current != null) return;
      try {
        widget.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITEKEY,
          theme: "light",
          language: "ar",
          "refresh-expired": "auto",
          callback: (t) => onToken(t),
          "expired-callback": () => onToken(null),
          "timeout-callback": () => onToken(null),
          "error-callback": () => { onToken(null); return false; },
        });
        setState("ready");
      } catch { setState("failed"); }
    };
    const fail = () => { if (!dead && !window.turnstile) setState("failed"); };
    const timer = setTimeout(fail, 15000);
    let s = null;
    if (window.turnstile) mount();
    else {
      s = document.getElementById("cf-turnstile-api");
      if (!s) {
        s = document.createElement("script");
        s.id = "cf-turnstile-api";
        s.src = TS_SRC;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", mount);
      s.addEventListener("error", fail);
    }
    return () => {
      dead = true;
      clearTimeout(timer);
      if (s) { s.removeEventListener("load", mount); s.removeEventListener("error", fail); }
      try { if (widget.current != null) window.turnstile?.remove(widget.current); } catch { /* ignore */ }
      widget.current = null;
    };
  }, [onToken, attempt]);
  useEffect(() => {
    if (!resetKey) return;
    onToken(null); // a token is single-use: after a failed start, wait for a fresh one
    try { if (widget.current != null) window.turnstile?.reset(widget.current); } catch { /* ignore */ }
  }, [resetKey, onToken]);
  const retry = () => {
    document.getElementById("cf-turnstile-api")?.remove();
    setState("loading");
    setAttempt((n) => n + 1);
  };
  if (!TURNSTILE_SITEKEY) return null;
  return (
    <div className="cr-turnstile-wrap">
      <div ref={box} className="cr-turnstile" hidden={state === "failed"} />
      {state === "loading" ? <p className="cr-hint cr-center" aria-live="polite">لحظات، نجهّز خطوة التحقق…</p> : null}
      {state === "failed" ? (
        <div className="cr-err cr-err-box" role="alert">
          <p>ما قدرنا نحمّل خطوة التحقق. نرجو التأكد من الاتصال بالإنترنت ثم إعادة المحاولة.</p>
          <button type="button" className="cr-btn cr-btn-ghost cr-ts-retry" onClick={retry}>إعادة المحاولة</button>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Basics form ───────────────────────── */
function ApplyForm({ role, saved, onSubmit, busy, error, fieldError }) {
  const r = ROLES[role];
  const [f, setF] = useState(() => ({
    name: saved?.basics?.name || "", phone: saved?.basics?.phone || "", city: saved?.basics?.city || "",
    country: saved?.basics?.country || "السعودية", nationality: saved?.basics?.nationality || "",
    gender: saved?.basics?.gender || "", email: saved?.basics?.email || "",
  }));
  const [dob, setDob] = useState(() => splitDob(saved?.birth_date));
  const [agree, setAgree] = useState(false);
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState("");
  const [hp, setHp] = useState("");
  const [token, setToken] = useState(null);
  const [errs, setErrs] = useState({});
  const [resetKey, setResetKey] = useState(0);
  const shownAt = useRef(0);
  useEffect(() => { shownAt.current = Date.now(); }, []);
  useEffect(() => { if (error) setResetKey((k) => k + 1); }, [error]);
  useEffect(() => { if (fieldError) setErrs((e) => ({ ...e, [fieldError]: "نرجو مراجعة هذا الحقل" })); }, [fieldError]);

  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setErrs((p) => ({ ...p, [k]: "" })); };
  const gd = f.gender;

  const pickFile = (e) => {
    const file0 = e.target.files?.[0];
    setFileErr(""); setErrs((p) => ({ ...p, cv: "" }));
    if (!file0) { setFile(null); return; }
    if (!CV_EXT[extOf(file0.name)]) { setFileErr("صيغة الملف غير مدعومة. المسموح: PDF أو Word أو صورة."); e.target.value = ""; return; }
    if (file0.size > 10 * 1024 * 1024) { setFileErr("حجم الملف أكبر من 10 ميجابايت."); e.target.value = ""; return; }
    setFile(file0);
  };

  const submit = (e) => {
    e.preventDefault();
    const x = {};
    if (f.name.trim().length < 3) x.name = g(gd, "اكتب/ي اسمك الكامل", "اكتب اسمك الكامل", "اكتبي اسمك الكامل");
    if (!phoneLooksValid(f.phone)) x.phone = "رقم الواتساب غير مكتمل. مثال: 05xxxxxxxx أو +9665xxxxxxxx";
    if (!f.city.trim()) x.city = "المدينة مطلوبة";
    if (!f.country.trim()) x.country = "الدولة مطلوبة";
    if (!f.nationality.trim()) x.nationality = "الجنسية مطلوبة";
    if (!f.gender) x.gender = "نحتاجه عشان نخاطبك بالشكل الصحيح";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) x.email = "البريد الإلكتروني غير صحيح";
    if (!dobOf(dob)) x.birth_date = dob.d && dob.m && dob.y ? "التاريخ غير صحيح، نرجو مراجعته" : g(gd, "اختر/ي يوم وشهر وسنة ميلادك", "اختر يوم وشهر وسنة ميلادك", "اختاري يوم وشهر وسنة ميلادك");
    if (!agree) x.consent = "نحتاج موافقتك على شروط التقديم للمتابعة";
    if (r.cvRequired && !file) x.cv = g(gd, "ارفق/ي سيرتك الذاتية", "ارفق سيرتك الذاتية", "أرفقي سيرتك الذاتية");
    if (TURNSTILE_SITEKEY && !token) x.captcha = "أكّد أنك لست روبوت";
    setErrs(x);
    if (Object.keys(x).length) {
      requestAnimationFrame(() => document.querySelector(".cr-form [aria-invalid='true']")?.focus());
      return;
    }
    onSubmit({
      basics: { ...f, name: f.name.trim(), phone: toAscii(f.phone).trim(), city: f.city.trim(), country: f.country.trim(), nationality: f.nationality.trim(), email: f.email.trim() },
      birth_date: dobOf(dob), consent: { accepted: true, version: CONSENT_VERSION },
      file, hp, elapsed_ms: Date.now() - shownAt.current, turnstile_token: TURNSTILE_SITEKEY ? token : null,
    });
  };

  const field = (k, label, props = {}) => (
    <div className="cr-field">
      <label htmlFor={`cr-${k}`}>{label}</label>
      <input
        id={`cr-${k}`} value={f[k]} onChange={set(k)} aria-invalid={errs[k] ? "true" : "false"}
        aria-describedby={errs[k] ? `cr-${k}-e` : undefined} {...props}
      />
      {errs[k] ? <p className="cr-err" id={`cr-${k}-e`} role="alert">{errs[k]}</p> : null}
    </div>
  );

  return (
    <form className="cr-form cr-card" onSubmit={submit} noValidate aria-labelledby="cr-form-h">
      <p className="cr-form-k">الخطوة الأولى من أربع</p>
      <h2 id="cr-form-h">التقديم على وظيفة {r.title}</h2>
      <div className="cr-plan" role="group" aria-labelledby="cr-plan-h">
        <p className="cr-plan-h" id="cr-plan-h">الخطوات والوقت المتوقع <span>حوالي 10 دقائق</span></p>
        <ol>
          <li><b>بياناتك</b><span>دقيقة</span></li>
          <li><b>محادثة كتابية</b><span>5 إلى 7 دقائق</span></li>
          <li><b>{role === "sales" ? <>ثلاث تسجيلات صوتية <em className="cr-key">الأهم</em></> : "تسجيلان صوتيان"}</b><span>{role === "sales" ? "3 دقائق" : "دقيقتان"}</span></li>
          <li><b>النتيجة</b><span>فورًا بعد الإرسال</span></li>
        </ol>
      </div>

      {field("name", "الاسم الكامل", { autoComplete: "name", enterKeyHint: "next" })}
      {field("phone", "رقم الواتساب", { type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr", placeholder: "05xxxxxxxx", enterKeyHint: "next" })}
      <div className="cr-row">
        {field("city", "المدينة", { autoComplete: "address-level2", enterKeyHint: "next" })}
        {field("country", "الدولة", { autoComplete: "country-name", enterKeyHint: "next" })}
      </div>
      {field("nationality", "الجنسية", { enterKeyHint: "next" })}

      <fieldset className="cr-field cr-dob" aria-describedby={errs.birth_date ? "cr-birth_date-e" : "cr-birth_date-h"}>
        <legend>تاريخ الميلاد</legend>
        <div className="cr-dob-row">
          {[
            ["d", "اليوم", Array.from({ length: 31 }, (_, i) => [String(i + 1), String(i + 1)])],
            ["m", "الشهر", MONTHS_AR.map((n, i) => [String(i + 1), `${i + 1} · ${n}`])],
            ["y", "السنة", Array.from({ length: maxBirthYear() - MIN_BIRTH + 1 }, (_, i) => String(maxBirthYear() - i)).map((y) => [y, y])],
          ].map(([k, label, opts]) => (
            <select key={k} id={`cr-dob-${k}`} aria-label={label} value={dob[k]} dir="auto"
              aria-invalid={errs.birth_date ? "true" : "false"}
              onChange={(e) => { const v = e.target.value; setDob((p) => ({ ...p, [k]: v })); setErrs((p) => ({ ...p, birth_date: "" })); }}>
              <option value="">{label}</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
        <p className="cr-hint" id="cr-birth_date-h">{dobOf(dob) ? <>العمر: <b>{ageFromDob(dobOf(dob))} سنة</b></> : "بالتاريخ الميلادي."}</p>
        {errs.birth_date ? <p className="cr-err" id="cr-birth_date-e" role="alert">{errs.birth_date}</p> : null}
      </fieldset>

      <fieldset className="cr-field cr-gender" aria-describedby={errs.gender ? "cr-gender-e" : undefined}>
        <legend>الجنس</legend>
        <div className="cr-seg" role="radiogroup" aria-label="الجنس">
          {[["m", "ذكر"], ["f", "أنثى"]].map(([v, l]) => (
            <label key={v} className={`cr-seg-i${f.gender === v ? " on" : ""}`}>
              <input type="radio" name="gender" value={v} checked={f.gender === v} onChange={set("gender")} />
              <span>{l}</span>
            </label>
          ))}
        </div>
        <p className="cr-hint">نسأل فقط عشان نخاطبك بالصيغة الصحيحة.</p>
        {errs.gender ? <p className="cr-err" id="cr-gender-e" role="alert">{errs.gender}</p> : null}
      </fieldset>

      {field("email", "البريد الإلكتروني (اختياري)", { type: "email", inputMode: "email", autoComplete: "email", dir: "ltr", enterKeyHint: "done" })}

      <div className="cr-field">
        <span className="cr-lbl">السيرة الذاتية {r.cvRequired ? "(مطلوبة)" : "(اختيارية)"}</span>
        <label className="cr-filepick" htmlFor="cr-cv"><span className="cr-btn cr-btn-ghost">{file ? "تغيير الملف" : "اختيار ملف"}</span></label>
        <input id="cr-cv" type="file" className="cr-file-hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*" onChange={pickFile}
          aria-invalid={errs.cv ? "true" : "false"} aria-describedby="cr-cv-h" />
        <p className="cr-hint" id="cr-cv-h">{file ? file.name : "PDF أو Word أو صورة، حتى 10 ميجابايت."}</p>
        {fileErr || errs.cv ? <p className="cr-err" role="alert">{fileErr || errs.cv}</p> : null}
      </div>

      {/* honeypot: real people never see or fill this */}
      <div className="cr-hp" aria-hidden="true">
        <label>الموقع<input tabIndex={-1} autoComplete="off" name="website" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
      </div>

      <div className="cr-field">
        <label className={`cr-consent${errs.consent ? " bad" : ""}`}>
          <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrs((p) => ({ ...p, consent: "" })); }}
            aria-invalid={errs.consent ? "true" : "false"} aria-describedby={errs.consent ? "cr-consent-e" : undefined} />
          <span>
            أوافق على أن يحلّل الذكاء الاصطناعي إجاباتي المكتوبة والصوتية لترتيب الطلبات، وأن <b>القرار النهائي يتخذه شخص من فريق التوظيف</b>،
            وأن تُحفظ بياناتي 12 شهرًا ثم تُحذف. أقدر أطلب حذفها قبل ذلك في أي وقت عبر واتساب <bdi dir="ltr">{ACADEMY_WA_DISPLAY}</bdi>.
          </span>
        </label>
        {errs.consent ? <p className="cr-err" id="cr-consent-e" role="alert">{errs.consent}</p> : null}
      </div>

      <Turnstile onToken={setToken} resetKey={resetKey} />
      {errs.captcha ? <p className="cr-err" role="alert">{errs.captcha}</p> : null}
      {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}

      <button type="submit" className="cr-btn cr-btn-primary" disabled={busy || (!!TURNSTILE_SITEKEY && !token)}>
        {busy ? "لحظات…" : <>{g(gd, "بدء المحادثة", "ابدأ المحادثة", "ابدئي المحادثة")} <Arrow /></>}
      </button>
      <p className="cr-fine">بياناتك تُستخدم فقط لمراجعة طلب التوظيف، وتبقى سرّية.</p>
    </form>
  );
}

/* ───────────────────────── CV card (when still missing) ───────────────────────── */
function CvCard({ app, gender, required, onDone }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = extOf(file.name);
    if (!CV_EXT[ext]) { setErr("صيغة الملف غير مدعومة. المسموح: PDF أو Word أو صورة."); return; }
    if (file.size > 10 * 1024 * 1024) { setErr("حجم الملف أكبر من 10 ميجابايت."); return; }
    setBusy(true); setErr("");
    try {
      await uploadAndAttach(app, { kind: "cv", blob: file, mime: file.type || CV_EXT[ext], ext });
      onDone();
    } catch (x) { setErr(x.messageAr || "ما قدرنا نرفع الملف."); } finally { setBusy(false); }
  };
  return (
    <div className="cr-card cr-cvcard">
      <label htmlFor="cr-cv2"><strong>{g(gender, "ارفق/ي", "ارفق", "أرفقي")} سيرتك الذاتية</strong> {required ? "(مطلوبة قبل الإرسال)" : ""}</label>
      <label className="cr-filepick" htmlFor="cr-cv2"><span className="cr-btn cr-btn-ghost">اختيار ملف</span></label>
      <input id="cr-cv2" type="file" className="cr-file-hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*" onChange={pick} disabled={busy} />
      {busy ? <p className="cr-hint">جاري الرفع…</p> : null}
      {err ? <p className="cr-err" role="alert">{err}</p> : null}
    </div>
  );
}

/* ───────────────────────── Chat ───────────────────────── */
// How each written answer was produced (integrity signals, never scored): first keystroke → send,
// pasted characters, times the page lost focus. Reset after every send.
const freshSig = () => ({ first: 0, pasteChars: 0, paste: false, blur: 0, lastBlur: 0 });
function Chat({ messages, typing, onSend, error, gender, disabled, options }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const taRef = useRef(null);
  const sig = useRef(freshSig());
  useEffect(() => {
    const away = () => {
      const now = Date.now();
      if (now - sig.current.lastBlur > 1000) sig.current.blur += 1; // blur + visibilitychange fire together
      sig.current.lastBlur = now;
    };
    const vis = () => { if (document.visibilityState === "hidden") away(); };
    window.addEventListener("blur", away);
    document.addEventListener("visibilitychange", vis);
    return () => { window.removeEventListener("blur", away); document.removeEventListener("visibilitychange", vis); };
  }, []);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, typing]);

  const grow = () => {
    const t = taRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
  };
  const send = () => {
    const v = text.trim();
    if (!v || typing || disabled) return;
    const s = sig.current;
    onSend(v, () => setText(""), undefined, {
      typing_ms: s.first ? Date.now() - s.first : 0, paste: s.paste, paste_chars: s.pasteChars, blur_count: s.blur, chars: v.length,
    });
    sig.current = freshSig();
    requestAnimationFrame(() => { if (taRef.current) taRef.current.style.height = "auto"; });
  };
  const onKey = (e) => {
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    if (e.key === "Enter" && !e.shiftKey && fine && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
  };

  return (
    <>
      <div className="cr-chat" role="log" aria-live="polite" aria-label="المحادثة">
        {messages.map((m, i) => {
          const bot = m.role === "bot";
          // one avatar per run of bot messages: on the last bubble of the run
          const lastOfRun = bot && (i === messages.length - 1 ? !typing : messages[i + 1]?.role !== "bot");
          return (
            <div key={i} className={`cr-msg ${bot ? "bot" : "me"}`}>
              {bot ? <span className={`cr-ava${lastOfRun ? "" : " ghost"}`} aria-hidden="true"><BrandMark size={16} /></span> : null}
              <div className="cr-bubble"><BotBubbleText>{m.content}</BotBubbleText></div>
            </div>
          );
        })}
        {typing ? (
          <div className="cr-msg bot"><span className="cr-ava" aria-hidden="true"><BrandMark size={16} /></span><div className="cr-bubble cr-typing" role="status" aria-label="يكتب"><i /><i /><i /></div></div>
        ) : null}
        <div ref={endRef} />
      </div>
      <div className="cr-composer">
        {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
        {options?.length ? (
          <div className="cr-opts" role="group" aria-label="اختر إجابة">
            {options.map((o) => (
              <button key={o.id} type="button" className="cr-opt" disabled={typing || disabled} onClick={() => onSend(o.label, () => {}, o.id)}>{o.label}</button>
            ))}
          </div>
        ) : (
        <div className="cr-composer-row">
          <label htmlFor="cr-msg" className="cr-sr">{g(gender, "اكتب/ي ردّك", "اكتب ردّك", "اكتبي ردّك")}</label>
          <textarea
            id="cr-msg" ref={taRef} rows={1} dir="auto" value={text} maxLength={1500}
            placeholder={g(gender, "اكتب/ي ردّك هنا…", "اكتب ردّك هنا…", "اكتبي ردّك هنا…")}
            onChange={(e) => { if (!sig.current.first) sig.current.first = Date.now(); setText(e.target.value); grow(); }} onKeyDown={onKey} disabled={disabled}
            onPaste={(e) => { const n = (e.clipboardData?.getData("text") || "").length; if (n) { sig.current.paste = true; sig.current.pasteChars += n; } }}
          />
          <button type="button" className="cr-send" onClick={send} disabled={!text.trim() || typing || disabled} aria-label="إرسال">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3.4 11.2 20 3.6c.8-.4 1.6.4 1.2 1.2l-7.6 16.6c-.4.8-1.5.7-1.8-.1l-2-5.7-5.7-2c-.8-.3-.9-1.4-.1-1.8l-.6-.6Z" fill="currentColor" /></svg>
          </button>
        </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── What next (every outcome) ───────────────────────── */
function WhatNext({ kind, gender }) {
  return (
    <section className="cr-card cr-next" aria-labelledby="cr-next-h">
      <h3 id="cr-next-h">ماذا بعد؟</h3>
      <ul>
        {kind === "booked" || kind === "book"
          ? <li>في اللقاء القصير {g(gender, "نتعرّف عليك", "نتعرّف عليك", "نتعرّف عليكِ")} ونشرح تفاصيل العمل والراتب.</li>
          : <li>إذا ناسب ملفك فرصة عندنا، {g(gender, "نتواصل معك", "نتواصل معك", "نتواصل معكِ")} على واتساب.</li>}
        <li>المساعد الآلي يرتّب الطلبات فقط — <b>القرار النهائي يتخذه شخص من فريق التوظيف</b>.</li>
        <li>بياناتك محفوظة 12 شهرًا ثم تُحذف. لطلب حذفها قبل ذلك راسلنا على واتساب <bdi dir="ltr">{ACADEMY_WA_DISPLAY}</bdi>.</li>
      </ul>
    </section>
  );
}

/* ───────────────────────── Voice ───────────────────────── */
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function VoiceCard({ task, app, gender, onTasks }) {
  const [mode, setMode] = useState("idle"); // idle | opening | countdown | recording | recorded | uploading
  const [elapsed, setElapsed] = useState(0);
  const [rec, setRec] = useState(null); // { blob, seconds, url, mime, ext }
  const [err, setErr] = useState("");
  const [note, setNote] = useState(""); // server asked for a re-take (too short / unclear)
  const [noMic, setNoMic] = useState(false);
  const [scenario, setScenario] = useState(""); // role-play situation, revealed only after «ابدأ التسجيل»
  const [count, setCount] = useState(0);
  const [tries, setTries] = useState(task.attempts || 0);
  const recorder = useRef(null);
  const timer = useRef(null);
  const cd = useRef(null);
  const startedAt = useRef(0);
  const isRp = !!task.scenario;
  const maxTries = task.max_attempts || 2;

  useEffect(() => { setTries((t) => Math.max(t, task.attempts || 0)); }, [task.attempts]);
  useEffect(() => () => { clearInterval(timer.current); clearInterval(cd.current); recorder.current?.cancel(); }, []);
  useEffect(() => () => { if (rec?.url) URL.revokeObjectURL(rec.url); }, [rec]);

  const finishRecording = useCallback(async () => {
    clearInterval(timer.current);
    const r = recorder.current;
    if (!r) return;
    recorder.current = null;
    try {
      const { blob, seconds } = await r.stop();
      setRec({ blob, seconds, url: URL.createObjectURL(blob), mime: "audio/wav", ext: "wav" });
      setMode("recorded");
    } catch { setErr("ما قدرنا نحفظ التسجيل. نرجو المحاولة مرة ثانية."); setMode("idle"); }
  }, []);

  const beginClock = () => {
    startedAt.current = performance.now();
    setElapsed(0);
    setMode("recording");
    timer.current = setInterval(() => setElapsed((performance.now() - startedAt.current) / 1000), 200);
  };

  const micError = (x) => {
    setNoMic(true);
    setErr(x?.name === "NotAllowedError" || x?.name === "SecurityError"
      ? "ما قدرنا نوصل للمايك. يمكن السماح له من إعدادات المتصفح، أو رفع ملف صوتي بدلًا منه."
      : "التسجيل غير متاح في هذا المتصفح. يمكن رفع ملف صوتي بدلًا منه.");
  };

  const start = async () => {
    setErr(""); setNote("");
    // the mic is opened first, inside the tap (iOS needs that) — so a blocked mic never costs an attempt
    let r;
    try {
      r = await startWavRecording({ maxMs: task.max_s * 1000, onAutoStop: () => finishRecording() });
    } catch (x) { micError(x); return; }
    if (!isRp) { recorder.current = r; beginClock(); return; }
    setMode("opening");
    let res;
    try {
      res = await call("voice_begin", { application_id: app.id, token: app.token, kind: task.kind });
    } catch (x) {
      r.cancel(); setMode("idle");
      if (x instanceof ApiError && x.code === "AUTH") onTasks(null, x);
      else setErr(x.messageAr || "صار خلل. نرجو المحاولة مرة ثانية.");
      return;
    }
    recorder.current = r;
    setScenario(res.scenario_ar || "");
    setTries(res.attempts || tries + 1);
    let n = res.countdown_s || 3;
    setCount(n); setMode("countdown");
    cd.current = setInterval(() => {
      n -= 1;
      if (n > 0) { setCount(n); return; }
      clearInterval(cd.current);
      if (!recorder.current) return;
      recorder.current.restart(); // the take starts now; the countdown seconds are dropped
      beginClock();
    }, 1000);
  };

  const pickAudio = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(""); setNote("");
    const mime = (file.type || "").split(";")[0].toLowerCase();
    const ext = AUDIO_MIME_EXT[mime] || extOf(file.name);
    if (!["wav", "webm", "mp4", "m4a", "mp3", "ogg", "aac"].includes(ext)) { setErr("صيغة الملف الصوتي غير مدعومة."); return; }
    if (file.size > 10 * 1024 * 1024) { setErr("حجم الملف أكبر من 10 ميجابايت."); return; }
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      const seconds = isFinite(a.duration) ? a.duration : 0;
      setRec({ blob: file, seconds, url, mime: mime || "audio/mp4", ext });
      setMode("recorded");
    };
    a.onerror = () => { URL.revokeObjectURL(url); setErr("ما قدرنا نقرأ الملف الصوتي."); };
    a.src = url;
  };

  const left = Math.max(0, maxTries - tries);
  // a role-play re-take means a fresh reveal + countdown, so it is only offered while attempts remain
  const canRedo = !isRp || left > 0;
  const redo = () => { setRec(null); setMode("idle"); setErr(""); };
  // on the last role-play attempt a short take is still sent (nothing else is left to send)
  const tooShort = !!rec && rec.seconds < task.min_s && canRedo;

  const submit = async () => {
    if (!rec || tooShort) return;
    setMode("uploading"); setErr(""); setNote("");
    try {
      const res = await uploadAndAttach(app, { kind: task.kind, blob: rec.blob, mime: rec.mime, ext: rec.ext, seconds: Math.min(rec.seconds, task.max_s) });
      setRec(null); setMode("idle"); setScenario("");
      if (res.retry) { setNote(res.message_ar || ""); if (res.attempts != null) setTries(res.attempts); }
      onTasks(res.voice_tasks);
    } catch (x) {
      setMode("recorded");
      if (x instanceof ApiError && x.code === "AUTH") onTasks(null, x); else setErr(x.messageAr || "ما انرفع التسجيل. نرجو المحاولة مرة ثانية.");
    }
  };

  const isEn = task.kind === "voice_en";
  const startLabel = task.done
    ? g(gender, "أعد/ي التسجيل", "أعد التسجيل", "أعيدي التسجيل")
    : tries > 0 && isRp ? g(gender, "سجّل/ي مرة ثانية", "سجّل مرة ثانية", "سجّلي مرة ثانية")
      : g(gender, "ابدأ/ي التسجيل", "ابدأ التسجيل", "ابدئي التسجيل");
  const showStart = !noMic && (!isRp || (task.done ? task.can_retry && left > 0 : left > 0));
  return (
    <section className={`cr-card cr-voice${task.done && mode === "idle" ? " done" : ""}`} aria-labelledby={`cr-v-${task.kind}`}>
      <div className="cr-voice-head">
        <h3 id={`cr-v-${task.kind}`}>{task.title_ar}</h3>
        {task.done ? <span className="cr-badge">تم الإرسال</span> : null}
      </div>
      <p className="cr-voice-prompt" dir="auto">{task.prompt_ar}</p>
      {task.lead_ar ? (
        <figure className="cr-leadline">
          <figcaption>العميل يقول:</figcaption>
          <blockquote>«{task.lead_ar}»</blockquote>
        </figure>
      ) : null}
      {isRp && scenario && mode !== "idle" ? (
        <figure className="cr-leadline cr-scenario" aria-live="polite">
          <figcaption>الموقف:</figcaption>
          <blockquote dir="auto">{scenario}</blockquote>
        </figure>
      ) : null}
      <p className="cr-hint">
        المدة: من {task.min_s} إلى {task.max_s} ثانية{isEn ? " (بالإنجليزية)" : ""}.
        {isRp ? <> المحاولات: <b>{Math.min(tries, maxTries)} من {maxTries}</b>.</> : null}
      </p>
      {note ? <p className="cr-err cr-err-box" role="alert">{note}</p> : null}

      {mode === "idle" && (
        <div className="cr-voice-actions">
          {showStart ? (
            <button type="button" className="cr-btn cr-btn-primary" onClick={start}>
              <span className="cr-dot" aria-hidden="true" /> {startLabel}
            </button>
          ) : null}
          {isRp && !noMic && !showStart && !task.done ? <p className="cr-hint">انتهت المحاولات لهذا التسجيل.</p> : null}
          {(!isRp || noMic) && (
            <label className="cr-btn cr-btn-ghost cr-filebtn">
              {noMic ? "رفع ملف صوتي" : "أو رفع ملف صوتي"}
              <input type="file" accept="audio/*" onChange={pickAudio} />
            </label>
          )}
        </div>
      )}

      {mode === "opening" && <p className="cr-hint" role="status">لحظات…</p>}

      {mode === "countdown" && (
        <div className="cr-voice-rec cr-countdown" role="timer" aria-live="assertive">
          <b className="cr-count">{count}</b>
          <p className="cr-hint">{g(gender, "اقرأ/ي الموقف — التسجيل يبدأ بعد العدّ.", "اقرأ الموقف — التسجيل يبدأ بعد العدّ.", "اقرئي الموقف — التسجيل يبدأ بعد العدّ.")}</p>
        </div>
      )}

      {mode === "recording" && (
        <div className="cr-voice-rec">
          <div className="cr-timer" role="timer" aria-live="off">
            <span className="cr-rec-dot" aria-hidden="true" />
            <b>{fmt(elapsed)}</b> <span>/ {fmt(task.max_s)}</span>
          </div>
          <div className="cr-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (elapsed / task.max_s) * 100)}%` }} /><u style={{ insetInlineStart: `${(task.min_s / task.max_s) * 100}%` }} /></div>
          <button type="button" className="cr-btn cr-btn-primary" onClick={finishRecording} disabled={elapsed < 1}>إيقاف التسجيل</button>
          <p className="cr-hint">{elapsed < task.min_s ? `الحد الأدنى ${task.min_s} ثانية.` : g(gender, "تقدر/ين توقف/ين متى ما خلصت.", "تقدر توقف متى ما خلصت.", "تقدرين توقفين متى ما خلصتي.")}</p>
        </div>
      )}

      {(mode === "recorded" || mode === "uploading") && rec && (
        <div className="cr-voice-rec">
          <audio controls src={rec.url} className="cr-audio" preload="metadata" />
          <p className="cr-hint">مدة التسجيل: {fmt(rec.seconds)}</p>
          {tooShort ? <p className="cr-err" role="alert">التسجيل أقصر من {task.min_s} ثانية. {g(gender, "أعد/ي", "أعد", "أعيدي")} المحاولة.</p> : null}
          <div className="cr-voice-actions">
            <button type="button" className="cr-btn cr-btn-primary" onClick={submit} disabled={tooShort || mode === "uploading"}>{mode === "uploading" ? "جاري الرفع…" : "اعتمد هذا التسجيل"}</button>
            {canRedo ? (
              <button type="button" className="cr-btn cr-btn-ghost" onClick={redo} disabled={mode === "uploading"}>
                {isRp ? `${g(gender, "سجّل/ي مرة ثانية", "سجّل مرة ثانية", "سجّلي مرة ثانية")} (${left === 1 ? "آخر محاولة" : `باقي ${left}`})` : "إعادة التسجيل"}
              </button>
            ) : null}
          </div>
          {isRp && !canRedo ? <p className="cr-hint">هذه آخر محاولة — نعتمد هذا التسجيل.</p> : null}
        </div>
      )}
      {err ? <p className="cr-err" role="alert">{err}</p> : null}
    </section>
  );
}

/* ───────────────────────── Outcome screens ───────────────────────── */
function BookedCard({ booking, title, body }) {
  return (
    <div className="cr-card cr-done" role="status">
      <h2>{title || "تم تأكيد موعدك"}</h2>
      {body ? <p className="cr-lead">{body}</p> : null}
      <p className="cr-when"><small>موعد اللقاء</small><b>{booking.when_ar}</b></p>
      <div className="cr-actions">
        {booking.gcal ? <a className="cr-btn cr-btn-primary" href={booking.gcal} target="_blank" rel="noopener noreferrer">أضف للتقويم <Arrow /></a> : null}
        {booking.meet_link ? <a className="cr-btn cr-btn-ghost" href={booking.meet_link} target="_blank" rel="noopener noreferrer">رابط اللقاء (Google Meet)</a> : null}
        {booking.wa_link ? <a className="cr-btn cr-btn-ghost" href={booking.wa_link} target="_blank" rel="noopener noreferrer">تغيير الموعد عبر واتساب</a> : null}
      </div>
    </div>
  );
}

function SlotPicker({ outcome, slots, loading, onBook, busy, error, gender }) {
  const [sel, setSel] = useState(null);
  const days = useMemo(() => {
    const m = new Map();
    for (const s of slots) { if (!m.has(s.day_ar)) m.set(s.day_ar, []); m.get(s.day_ar).push(s); }
    return [...m.entries()];
  }, [slots]);
  return (
    <div className="cr-card cr-done">
      <h2>{outcome.title_ar}</h2>
      <p className="cr-lead">{outcome.body_ar}</p>
      {loading ? <p className="cr-hint" role="status">لحظات، نجهّز المواعيد المتاحة…</p> : slots.length === 0 ? (
        error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : <p className="cr-hint">ما فيه مواعيد متاحة الآن. سنتواصل معك على واتساب لتحديد الموعد.</p>
      ) : (
        <div className="cr-slots">
          <h3>{g(gender, "اختر/ي الوقت المناسب لك", "اختر الوقت المناسب لك", "اختاري الوقت المناسب لك")}</h3>
          {days.map(([day, list]) => (
            <div key={day} className="cr-day" role="group" aria-label={day}>
              <div className="cr-day-l">{day}</div>
              <div className="cr-chips">
                {list.map((s) => (
                  <button key={s.start} type="button" className={`cr-chip${sel === s.start ? " on" : ""}`} aria-pressed={sel === s.start} onClick={() => setSel(s.start)}>{s.time_ar}</button>
                ))}
              </div>
            </div>
          ))}
          {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
          <button type="button" className="cr-btn cr-btn-primary" disabled={!sel || busy} onClick={() => onBook(sel)}>{busy ? "لحظات…" : <>تأكيد الموعد <Arrow /></>}</button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export default function CareersPage() {
  const [role, setRole] = useState(null);
  const [stage, setStage] = useState("landing"); // landing | chat | voice | finishing | outcome
  const [saved, setSaved] = useState({ sales: null, trainer: null });
  const [app, setApp] = useState(null); // { id, token, role, basics }
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [options, setOptions] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [needsCv, setNeedsCv] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [notice, setNotice] = useState("");
  const [outcome, setOutcome] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const formRef = useRef(null);
  const gender = app?.basics?.gender || "";

  useEffect(() => {
    setSaved({ sales: loadSaved("sales"), trainer: loadSaved("trainer") });
    const want = new URLSearchParams(window.location.search).get("role");
    if (want && ROLES[want]) choose(want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback((r, msg) => {
    if (r) clearSaved(r);
    setSaved((s) => ({ ...s, ...(r ? { [r]: null } : {}) }));
    setApp(null); setMessages([]); setOptions(null); setTasks([]); setOutcome(null); setSlots([]); setBooking(null);
    setStage("landing"); setRole(r || null); setError(""); setNotice(msg || "");
    window.scrollTo?.(0, 0);
  }, []);

  /** Run an API call; AUTH resets to the form, anything else rethrows. */
  const guard = useCallback(async (fn, r) => {
    try { return await fn(); } catch (x) {
      if (x instanceof ApiError && x.code === "AUTH") { reset(r, "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة."); return undefined; }
      throw x;
    }
  }, [reset]);

  const showOutcome = useCallback(async (o, a) => {
    setOutcome(o); setStage("outcome"); setError("");
    if (o.kind === "booked" && o.booking) setBooking(o.booking);
    if (o.kind === "book") {
      setSlotsLoading(true);
      try { const r = await call("slots", { application_id: a.id, token: a.token }); setSlots(r.slots || []); }
      catch (x) { setSlots([]); setError(x.messageAr || ""); }
      finally { setSlotsLoading(false); }
    }
    window.scrollTo?.(0, 0);
  }, []);

  const enter = useCallback(async (res, a) => {
    setMessages(res.messages || []);
    setOptions(res.options || null);
    setTasks(res.voice_tasks || []);
    setNeedsCv(!!res.needs_cv && !res.has_cv);
    if (res.outcome) return showOutcome(res.outcome, a);
    if (res.step === "done") {
      setStage("finishing");
      try { const f = await call("finish", { application_id: a.id, token: a.token }); return showOutcome(f.outcome, a); }
      catch (x) { setStage("voice"); setError(x.messageAr || ""); return undefined; }
    }
    setStage(res.step === "voice" ? "voice" : "chat");
    window.scrollTo?.(0, 0);
    return undefined;
  }, [showOutcome]);

  const startFlow = useCallback(async ({ basics, birth_date, consent, file, hp, elapsed_ms, turnstile_token }) => {
    setBusy(true); setError(""); setFieldError(""); setNotice("");
    const prev = loadSaved(role);
    const att = (() => { try { return getAttribution(); } catch { return {}; } })();
    const qs = new URLSearchParams(window.location.search);
    const body = {
      role, turnstile_token, hp, elapsed_ms, birth_date, consent,
      basics: { name: basics.name, phone: basics.phone, city: basics.city, country: basics.country, nationality: basics.nationality, gender: basics.gender, email: basics.email },
      source: {
        utm_source: att.utm_source || qs.get("utm_source") || "", utm_medium: att.utm_medium || qs.get("utm_medium") || "",
        utm_campaign: att.utm_campaign || qs.get("utm_campaign") || "", ref: qs.get("ref") || att.referrer || "",
        src: qs.get("src") || "",
        landing: `${window.location.pathname}${window.location.search}`,
      },
    };
    if (prev) body.resume = { application_id: prev.application_id, token: prev.token };
    try {
      const res = await call("start", body);
      const a = { id: res.application_id, token: res.token, role, basics };
      saveApp(role, { application_id: a.id, token: a.token, basics, birth_date });
      setApp(a);
      let hasCv = res.has_cv;
      if (file && !hasCv) {
        try {
          const ext = (file.name.split(".").pop() || "").toLowerCase();
          await uploadAndAttach(a, { kind: "cv", blob: file, mime: file.type || CV_EXT[ext], ext });
          hasCv = true;
        } catch { /* the CV card offers a retry */ }
      }
      await enter({ ...res, has_cv: hasCv }, a);
    } catch (x) {
      if (x.code === "ALREADY_APPLIED") {
        setOutcome({ kind: "thanks", title_ar: "وصلنا طلبك، شكرًا لك", body_ar: x.messageAr || "طلبك على هذه الوظيفة وصلنا من قبل، وهو عندنا. إذا احتجنا شيئًا نتواصل معك على واتساب." });
        setStage("outcome");
      } else if (x.code === "AUTH") { clearSaved(role); setError("حصل خلل بسيط في المتابعة. نرجو المحاولة مرة ثانية."); }
      else { setError(x.messageAr || "صار خلل. نرجو المحاولة مرة ثانية."); if (x.code === "BAD_INPUT" && x.field) setFieldError(x.field); }
    } finally { setBusy(false); }
  }, [role, enter]);

  const resume = useCallback(async (role) => {
    const s = saved[role];
    if (!s) return;
    if (TURNSTILE_SITEKEY || !s.basics) { setRole(role); requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth" })); return; }
    setBusy(true); setError("");
    try {
      const res = await call("start", { role, turnstile_token: null, hp: "", elapsed_ms: 60000, basics: s.basics, ...(s.birth_date ? { birth_date: s.birth_date } : s.birth_year ? { birth_year: s.birth_year } : {}), source: { landing: "/careers" }, resume: { application_id: s.application_id, token: s.token } });
      const a = { id: res.application_id, token: res.token, role, basics: s.basics };
      saveApp(role, { application_id: a.id, token: a.token, basics: s.basics, birth_date: s.birth_date, birth_year: s.birth_year });
      setApp(a);
      await enter(res, a);
    } catch (x) {
      if (x.code === "AUTH") reset(role, "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة.");
      else setError(x.messageAr || "");
    } finally { setBusy(false); }
  }, [saved, enter, reset]);

  const choose = (id) => {
    setRole(id); setError(""); setNotice("");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  /* chat */
  const send = useCallback(async (text, clear, choice, signals) => {
    setError("");
    setMessages((m) => [...m, { role: "applicant", content: text }]);
    clear();
    setTyping(true);
    try {
      const res = await guard(() => call("message", { application_id: app.id, token: app.token, text, ...(choice ? { choice } : {}), ...(signals ? { signals } : {}) }), role);
      if (!res) return;
      setMessages((m) => [...m, { role: "bot", content: res.reply }]);
      setOptions(res.options || null);
      if (res.outcome) { clearSaved(role); await showOutcome(res.outcome, app); return; }
      if (res.step === "voice") { setTasks(res.voice_tasks || []); setStage("voice"); window.scrollTo?.(0, 0); }
    } catch (x) {
      setMessages((m) => m.slice(0, -1));
      setError(x.messageAr || "ما وصلت رسالتك. نرجو المحاولة مرة ثانية.");
    } finally { setTyping(false); }
  }, [app, role, guard, showOutcome]);

  /* voice */
  const onTasks = (next, authErr) => {
    if (authErr) { reset(role, "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة."); return; }
    setTasks(next || []);
  };
  const allDone = tasks.length > 0 && tasks.every((t) => t.done);
  const keyNote = tasks.find((t) => t.note_ar)?.note_ar || "";
  const cvRequired = ROLES[role]?.cvRequired;

  const finish = async () => {
    setError(""); setStage("finishing");
    try {
      const res = await guard(() => call("finish", { application_id: app.id, token: app.token }), role);
      if (res) await showOutcome(res.outcome, app);
    } catch (x) { setStage("voice"); setError(x.messageAr || "ما قدرنا نرسل الطلب. نرجو المحاولة مرة ثانية."); }
  };

  /* booking */
  const book = async (start) => {
    setBusy(true); setError("");
    try {
      const res = await guard(() => call("book", { application_id: app.id, token: app.token, start }), role);
      if (res) { setBooking(res.booking); window.scrollTo?.(0, 0); }
    } catch (x) {
      setError(x.messageAr || "");
      if (x.code === "SLOT_TAKEN") { try { const r = await call("slots", { application_id: app.id, token: app.token }); setSlots(r.slots || []); } catch { /* keep list */ } }
    } finally { setBusy(false); }
  };

  const inFlow = stage !== "landing";
  const r = ROLES[role] || null;

  return (
    <div className="cr-root" dir="rtl" lang="ar" style={{ "--rise": RISE_OF[stage] ?? 0 }}>
      <style>{css}</style>
      <Seo path="/careers" />
      <div className="cr-sky" aria-hidden="true" />

      <header className={`cr-top${inFlow ? "" : " wide"}`}>
        <a href="/" className="cr-brand" aria-label="أكاديمية طلاقة">
          <BrandMark size={26} /><span>طلاقة</span>
        </a>
        {inFlow && r ? <span className="cr-top-role">{r.title}</span> : null}
      </header>
      {inFlow ? <Steps stage={stage} keyVoice={role === "sales"} /> : null}

      {!inFlow && (
        <main className="cr-land">
          <section className="cr-hero">
            <p className="cr-eyebrow">وظائف في أكاديمية طلاقة</p>
            <h1>انضم لفريق <span className="cr-grad">طلاقة</span></h1>
            <p className="cr-lead">أكاديمية طلاقة تعلّم البالغين في السعودية الإنجليزي أونلاين، على منصّتها الخاصة.</p>
            <ul className="cr-facts">
              <li>عن بُعد بالكامل</li>
              <li>فريق صغير وقريب</li>
              <li>أثر حقيقي على المتعلمين</li>
            </ul>
          </section>
          <div className="cr-horizon" aria-hidden="true"><DawnSun id="cr-sun" /></div>

          <h2 className="cr-sec-h" id="cr-roles-h">الوظائف المتاحة</h2>
          <section className="cr-roles" aria-labelledby="cr-roles-h">
            {Object.values(ROLES).map((x, i) => (
              <article key={x.id} className={`cr-role${role === x.id ? " on" : ""}`}>
                <span className="cr-role-n" aria-hidden="true">0{i + 1}</span>
                <h3>{x.title}</h3>
                <p>{x.line}</p>
                <ul className="cr-role-meta">{x.meta.map((m) => <li key={m}>{m}</li>)}</ul>
                {saved[x.id] ? <p className="cr-role-saved">عندك طلب غير مكتمل لهذه الوظيفة.</p> : null}
                <button type="button" className="cr-role-go" onClick={() => choose(x.id)} aria-expanded={role === x.id}>
                  <span>التقديم على الوظيفة</span><span className="cr-arrow"><Arrow /></span>
                </button>
                {saved[x.id] ? <button type="button" className="cr-role-resume" disabled={busy} onClick={() => { setRole(x.id); resume(x.id); }}>إكمال الطلب السابق</button> : null}
              </article>
            ))}
          </section>

          {notice ? <p className="cr-notice" role="status">{notice}</p> : null}
          {error && !role ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}

          <div ref={formRef} className="cr-formwrap">
            {role ? <ApplyForm key={role} role={role} saved={saved[role]} onSubmit={startFlow} busy={busy} error={error} fieldError={fieldError} /> : null}
          </div>

          <section className="cr-how" aria-labelledby="cr-how-h">
            <h2 className="cr-sec-h" id="cr-how-h">كيف يتم التقديم</h2>
            <ol>
              <li><b>اختيار الوظيفة والبيانات</b><span>الاسم ورقم الواتساب والمدينة، والسيرة الذاتية للمدرّبين.</span></li>
              <li><b>محادثة قصيرة</b><span>أسئلة عن خبرتك مع مساعد التوظيف، بالكتابة.</span></li>
              <li><b>تسجيل صوتي</b><span>تسجيل قصير بصوتك، نسمع فيه طريقة كلامك. لمستشاري القبول: ردّ على عميل متردد كأنك في مكالمة.</span></li>
              <li><b>موعد لقاء</b><span>إذا ناسب ملفك الوظيفة، يظهر لك حجز موعد لقاء قصير مباشرة.</span></li>
            </ol>
            <p className="cr-how-total">كل الخطوات تاخذ حوالي 10 دقائق، وبياناتك تبقى سرّية.</p>
          </section>
        </main>
      )}

      {inFlow && (
        <main className={`cr-flow cr-flow-${stage}`}>
          {stage === "chat" && (
            <>
              {needsCv ? <CvCard app={app} gender={gender} required={cvRequired} onDone={() => setNeedsCv(false)} /> : null}
              <Chat messages={messages} typing={typing} onSend={send} error={error} gender={gender} options={options} />
            </>
          )}

          {stage === "voice" && (
            <div className="cr-voicewrap">
              <h1 className="cr-flow-h">{g(gender, "خطوة أخيرة: سجّل/ي صوتك", "خطوة أخيرة: سجّل صوتك", "خطوة أخيرة: سجّلي صوتك")}</h1>
              {messages.length ? <div className="cr-card cr-intro" dir="auto">{messages[messages.length - 1].content}</div> : null}
              {keyNote ? <p className="cr-keynote" role="note"><b>الأهم</b><span dir="auto">{keyNote}</span></p> : null}
              {tasks.map((t) => <VoiceCard key={t.kind} task={t} app={app} gender={gender} onTasks={onTasks} />)}
              {needsCv ? <CvCard app={app} gender={gender} required={cvRequired} onDone={() => setNeedsCv(false)} /> : null}
              {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
              <button type="button" className="cr-btn cr-btn-primary cr-submit" disabled={!allDone || (cvRequired && needsCv)} onClick={finish}>إرسال الطلب <Arrow /></button>
              {!allDone ? <p className="cr-hint cr-center">{g(gender, "اعتمد/ي كل التسجيلات عشان يفتح الإرسال.", "اعتمد كل التسجيلات عشان يفتح الإرسال.", "اعتمدي كل التسجيلات عشان يفتح الإرسال.")}</p> : null}
            </div>
          )}

          {stage === "finishing" && (
            <div className="cr-card cr-wait" role="status" aria-live="polite">
              <div className="cr-spinner" aria-hidden="true" />
              <h2>نراجع إجاباتك…</h2>
              <p className="cr-hint">يستغرق هذا من 10 إلى 30 ثانية. لا تغلق الصفحة.</p>
            </div>
          )}

          {stage === "outcome" && outcome && (
            <div className="cr-outcome">
            <div className="cr-horizon" aria-hidden="true"><DawnSun id="cr-sun-out" /></div>
            {booking ? <BookedCard booking={booking} title={outcome.kind === "booked" ? outcome.title_ar : "تم تأكيد موعدك"} body={outcome.kind === "booked" ? outcome.body_ar : ""} />
              : outcome.kind === "book" ? <SlotPicker outcome={outcome} slots={slots} loading={slotsLoading} onBook={book} busy={busy} error={error} gender={gender} />
                : (
                  <div className="cr-card cr-done" role="status">
                    <h2>{outcome.title_ar}</h2>
                    <p className="cr-lead">{outcome.body_ar}</p>
                    <a className="cr-btn cr-btn-ghost" href="/">العودة للرئيسية</a>
                  </div>
                )}
            <WhatNext kind={booking ? "booked" : outcome.kind} gender={gender} />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
