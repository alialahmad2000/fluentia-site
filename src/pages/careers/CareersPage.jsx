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
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import DawnSun from "../next/DawnSun";
import { startWavRecording } from "../../lib/wavRecorder";
import { getAttribution } from "../../lib/attribution";
import css from "./careers.css?inline";
import {
  call, ApiError, uploadAndAttach, loadSaved, saveApp, clearSaved, track,
  toAscii, phoneLooksValid, CV_EXT, AUDIO_MIME_EXT, extOf, TURNSTILE_SITEKEY, isPreview, setApiLang,
} from "./careersApi";
import { previewOutcome, previewSample, previewTag } from "./careersPreview";
import PledgeCard from "./PledgeCard";

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

/* English page (/en/careers, 2026-11-17): same page, LTR, English copy. The trainer role is fully English;
 * the admissions-advisor role needs fluent Arabic (the bot confirms it first). Arabic strings above/below are unchanged. */
const ROLES_EN = {
  trainer: {
    id: "trainer",
    title: "English trainer",
    short: "English trainer",
    line: "Teach Saudi adult learners online, in small groups and one-to-one, using the Fluentia curriculum, with a short report after each session.",
    meta: ["CV required", "A voice note in English, and a short one explaining a simple rule"],
    cvRequired: true,
  },
  sales: {
    id: "sales",
    title: "Admissions advisor",
    short: "Admissions advisor",
    line: "Calls with people who want to learn English: understand their goals and help them join the right programme — remote.",
    meta: ["Evening shift, 4–10 PM Riyadh time, Saturday to Thursday", "CV optional", "Short voice recordings in Arabic"],
    note: "Requires fluent Arabic (the role is conversations with Arabic-speaking students).",
    cvRequired: false,
  },
};
const LangCtx = createContext("ar");
const useEn = () => useContext(LangCtx) === "en";
const rolesFor = (en) => (en ? ROLES_EN : ROLES);
const RIYADH_TZ = "Asia/Riyadh";
/** The applicant's own time for a slot, only when their browser is not on Riyadh time. */
function localTimeOf(iso) {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === RIYADH_TZ) return "";
    const f = (zone) => new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
    const mine = f(tz).replace(/\u202f/g, " ");
    if (mine === f(RIYADH_TZ).replace(/\u202f/g, " ")) return "";
    const dayDiff = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date(iso))
      !== new Intl.DateTimeFormat("en-US", { timeZone: RIYADH_TZ, weekday: "short" }).format(new Date(iso));
    return dayDiff ? `${new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date(iso))} ${mine}` : mine;
  } catch { return ""; }
}

/** Pick the masculine/feminine form once gender is known; show both before. */
const g = (gender, both, m, f) => (gender === "m" ? m : gender === "f" ? f : both);

/** Forward in RTL = pointing left; on the English page (LTR) it points right. */
const Arrow = ({ size = 18 }) => {
  const en = useEn();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d={en ? "M5 12h14m0 0-6-6m6 6-6 6" : "M19 12H5m0 0 6-6m-6 6 6 6"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** The bot's progress: the dawn rises with it (--rise on .cr-root). */
const STEPS = ["بياناتك", "المحادثة", "التسجيل", "النتيجة"];
const STEPS_EN = ["Your details", "Chat", "Recording", "Result"];
// PDPL consent (2026-11-15). Bump the version whenever the wording below changes.
const CONSENT_VERSION = "careers-2026-11";
const ACADEMY_WA_DISPLAY = "+966 55 866 9974";
const MIN_BIRTH = 1956;
// up to 15 years back: the under-18 rule is the server's (it answers politely), the form only blocks typos
const maxBirthYear = () => new Date().getFullYear() - 15;
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
// «pay» = the short pay questions after the recordings (sales): still the last stage before «النتيجة»
const STEP_OF = { landing: 0, chat: 1, voice: 2, pay: 2, pledge: 3, finishing: 3, outcome: 3 };
const RISE_OF = { landing: 0, chat: 0.2, voice: 0.45, pay: 0.6, pledge: 0.7, finishing: 0.75, outcome: 1 };
function Steps({ stage, keyVoice }) {
  const en = useEn();
  const at = STEP_OF[stage] ?? 0;
  return (
    <ol className="cr-steps" aria-label={en ? "Steps" : "الخطوات"}>
      {(en ? STEPS_EN : STEPS).map((l, i) => (
        <li key={l} className={i < at ? "done" : i === at ? "now" : ""} aria-current={i === at ? "step" : undefined}>
          <span>{l}{keyVoice && i === 2 ? <em className="cr-key">{en ? "Key step" : "الأهم"}</em> : null}</span>
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
  const en = useEn();
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
          language: en ? "en" : "ar",
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
  }, [onToken, attempt, en]);
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
      {state === "loading" ? <p className="cr-hint cr-center" aria-live="polite">{en ? "One moment, loading the verification step…" : "لحظات، نجهّز خطوة التحقق…"}</p> : null}
      {state === "failed" ? (
        <div className="cr-err cr-err-box" role="alert">
          <p>{en ? "We couldn't load the verification step. Please check your internet connection and try again." : "ما قدرنا نحمّل خطوة التحقق. نرجو التأكد من الاتصال بالإنترنت ثم إعادة المحاولة."}</p>
          <button type="button" className="cr-btn cr-btn-ghost cr-ts-retry" onClick={retry}>{en ? "Try again" : "إعادة المحاولة"}</button>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Basics form ───────────────────────── */
function ApplyForm({ role, saved, onSubmit, busy, error, fieldError, preview }) {
  const en = useEn();
  const r = rolesFor(en)[role];
  const [f, setF] = useState(() => ({
    name: saved?.basics?.name || "", phone: saved?.basics?.phone || "", city: saved?.basics?.city || "",
    country: saved?.basics?.country || (en ? "" : "السعودية"), nationality: saved?.basics?.nationality || "",
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
  useEffect(() => { if (fieldError) setErrs((e) => ({ ...e, [fieldError]: en ? "Please check this field" : "نرجو مراجعة هذا الحقل" })); }, [fieldError, en]);

  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setErrs((p) => ({ ...p, [k]: "" })); };
  const gd = f.gender;

  const pickFile = (e) => {
    const file0 = e.target.files?.[0];
    setFileErr(""); setErrs((p) => ({ ...p, cv: "" }));
    if (!file0) { setFile(null); return; }
    if (!CV_EXT[extOf(file0.name)]) { setFileErr(en ? "This file type isn't supported. Please use PDF, Word or an image." : "صيغة الملف غير مدعومة. المسموح: PDF أو Word أو صورة."); e.target.value = ""; return; }
    if (file0.size > 10 * 1024 * 1024) { setFileErr(en ? "The file is larger than 10 MB." : "حجم الملف أكبر من 10 ميجابايت."); e.target.value = ""; return; }
    setFile(file0);
  };

  const submit = (e) => {
    e.preventDefault();
    if (preview) { // «وضع المعاينة»: nothing is required, empty fields get sample values
      onSubmit({
        basics: { name: f.name.trim() || "ضيف المعاينة", phone: toAscii(f.phone).trim() || "0500000000", city: f.city.trim() || "الرياض",
          country: f.country.trim() || "السعودية", nationality: f.nationality.trim() || "سعودي", gender: f.gender || "m", email: "" },
        birth_date: dobOf(dob), consent: { accepted: true, version: CONSENT_VERSION }, file, hp: "", elapsed_ms: 60000, turnstile_token: null,
      });
      return;
    }
    const x = {};
    if (en) {
      if (f.name.trim().length < 3) x.name = "Please enter your full name";
      if (!phoneLooksValid(f.phone)) x.phone = "The WhatsApp number looks incomplete. Include the country code, e.g. +44 7xxx xxxxxx";
      if (!f.city.trim()) x.city = "City is required";
      if (!f.country.trim()) x.country = "Country is required";
      if (!f.nationality.trim()) x.nationality = "Nationality is required";
      if (!f.gender) x.gender = "Please choose one";
      if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) x.email = "This email address doesn't look right";
      if (!dobOf(dob)) x.birth_date = dob.d && dob.m && dob.y ? "That date doesn't exist — please check it" : "Please choose your day, month and year of birth";
      if (!agree) x.consent = "Please agree to the application terms to continue";
      if (r.cvRequired && !file) x.cv = "Please attach your CV";
      if (TURNSTILE_SITEKEY && !token) x.captcha = "Please confirm you're not a robot";
    } else {
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
    }
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
      <p className="cr-form-k">{en ? "Step 1 of 4" : "الخطوة الأولى من أربع"}</p>
      {preview ? <p className="cr-pv-note" role="note">معاينة: كل الحقول اختيارية هنا — تقدر تضغط «ابدأ المحادثة» مباشرة.</p> : null}
      <h2 id="cr-form-h">{en ? `Apply: ${r.title}` : <>التقديم على وظيفة {r.title}</>}</h2>
      {en && r.note ? <p className="cr-role-note" role="note">{r.note}</p> : null}
      <div className="cr-plan" role="group" aria-labelledby="cr-plan-h">
        <p className="cr-plan-h" id="cr-plan-h">{en ? <>Steps and time <span>about 10 minutes</span></> : <>الخطوات والوقت المتوقع <span>حوالي 10 دقائق</span></>}</p>
        {en ? (
        <ol>
          <li><b>Your details</b><span>1 minute</span></li>
          <li><b>Written chat</b><span>5–7 minutes</span></li>
          <li><b>{role === "sales" ? <>Three voice recordings (in Arabic) <em className="cr-key">Key step</em></> : "Two voice recordings"}</b><span>{role === "sales" ? "3 minutes" : "2 minutes"}</span></li>
          <li><b>Result</b><span>right after you submit</span></li>
        </ol>
        ) : (
        <ol>
          <li><b>بياناتك</b><span>دقيقة</span></li>
          <li><b>محادثة كتابية</b><span>5 إلى 7 دقائق</span></li>
          <li><b>{role === "sales" ? <>ثلاث تسجيلات صوتية <em className="cr-key">الأهم</em></> : "تسجيلان صوتيان"}</b><span>{role === "sales" ? "3 دقائق" : "دقيقتان"}</span></li>
          <li><b>النتيجة</b><span>فورًا بعد الإرسال</span></li>
        </ol>
        )}
      </div>

      {field("name", en ? "Full name" : "الاسم الكامل", { autoComplete: "name", enterKeyHint: "next" })}
      {field("phone", en ? "WhatsApp number (with country code)" : "رقم الواتساب", { type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr", placeholder: en ? "+966 5x xxx xxxx" : "05xxxxxxxx", enterKeyHint: "next" })}
      <div className="cr-row">
        {field("city", en ? "City" : "المدينة", { autoComplete: "address-level2", enterKeyHint: "next" })}
        {field("country", en ? "Country" : "الدولة", { autoComplete: "country-name", enterKeyHint: "next" })}
      </div>
      {field("nationality", en ? "Nationality" : "الجنسية", { enterKeyHint: "next" })}

      <fieldset className="cr-field cr-dob" aria-describedby={errs.birth_date ? "cr-birth_date-e" : "cr-birth_date-h"}>
        <legend>{en ? "Date of birth" : "تاريخ الميلاد"}</legend>
        <div className="cr-dob-row">
          {[
            ["d", en ? "Day" : "اليوم", Array.from({ length: 31 }, (_, i) => [String(i + 1), String(i + 1)])],
            ["m", en ? "Month" : "الشهر", (en ? MONTHS_EN : MONTHS_AR).map((n, i) => [String(i + 1), `${i + 1} · ${n}`])],
            ["y", en ? "Year" : "السنة", Array.from({ length: maxBirthYear() - MIN_BIRTH + 1 }, (_, i) => String(maxBirthYear() - i)).map((y) => [y, y])],
          ].map(([k, label, opts]) => (
            <select key={k} id={`cr-dob-${k}`} aria-label={label} value={dob[k]} dir="auto"
              aria-invalid={errs.birth_date ? "true" : "false"}
              onChange={(e) => { const v = e.target.value; setDob((p) => ({ ...p, [k]: v })); setErrs((p) => ({ ...p, birth_date: "" })); }}>
              <option value="">{label}</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
        <p className="cr-hint" id="cr-birth_date-h">{en ? (dobOf(dob) ? <>Age: <b>{ageFromDob(dobOf(dob))}</b></> : "Gregorian calendar.") : dobOf(dob) ? <>العمر: <b>{ageFromDob(dobOf(dob))} سنة</b></> : "بالتاريخ الميلادي."}</p>
        {errs.birth_date ? <p className="cr-err" id="cr-birth_date-e" role="alert">{errs.birth_date}</p> : null}
      </fieldset>

      <fieldset className="cr-field cr-gender" aria-describedby={errs.gender ? "cr-gender-e" : undefined}>
        <legend>{en ? "Gender" : "الجنس"}</legend>
        <div className="cr-seg" role="radiogroup" aria-label={en ? "Gender" : "الجنس"}>
          {(en ? [["m", "Male"], ["f", "Female"]] : [["m", "ذكر"], ["f", "أنثى"]]).map(([v, l]) => (
            <label key={v} className={`cr-seg-i${f.gender === v ? " on" : ""}`}>
              <input type="radio" name="gender" value={v} checked={f.gender === v} onChange={set("gender")} />
              <span>{l}</span>
            </label>
          ))}
        </div>
        <p className="cr-hint">{en ? "We ask only so our team can address you correctly." : "نسأل فقط عشان نخاطبك بالصيغة الصحيحة."}</p>
        {errs.gender ? <p className="cr-err" id="cr-gender-e" role="alert">{errs.gender}</p> : null}
      </fieldset>

      {field("email", en ? "Email (optional — we send your interview details here)" : "البريد الإلكتروني (اختياري)", { type: "email", inputMode: "email", autoComplete: "email", dir: "ltr", enterKeyHint: "done" })}

      <div className="cr-field">
        <span className="cr-lbl">{en ? `CV ${r.cvRequired ? "(required)" : "(optional)"}` : <>السيرة الذاتية {r.cvRequired ? "(مطلوبة)" : "(اختيارية)"}</>}</span>
        <label className="cr-filepick" htmlFor="cr-cv"><span className="cr-btn cr-btn-ghost">{en ? (file ? "Change file" : "Choose a file") : file ? "تغيير الملف" : "اختيار ملف"}</span></label>
        <input id="cr-cv" type="file" className="cr-file-hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*" onChange={pickFile}
          aria-invalid={errs.cv ? "true" : "false"} aria-describedby="cr-cv-h" />
        <p className="cr-hint" id="cr-cv-h">{file ? file.name : en ? "PDF, Word or an image, up to 10 MB." : "PDF أو Word أو صورة، حتى 10 ميجابايت."}</p>
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
          {en ? (
          <span>
            I agree that AI may analyse my written and spoken answers to sort applications, that <b>the final decision is made by a person on the hiring team</b>,
            and that my data is kept for 12 months and then deleted. I can ask for it to be deleted sooner at any time on WhatsApp <bdi dir="ltr">{ACADEMY_WA_DISPLAY}</bdi>.
          </span>
          ) : (
          <span>
            أوافق على أن يحلّل الذكاء الاصطناعي إجاباتي المكتوبة والصوتية لترتيب الطلبات، وأن <b>القرار النهائي يتخذه شخص من فريق التوظيف</b>،
            وأن تُحفظ بياناتي 12 شهرًا ثم تُحذف. أقدر أطلب حذفها قبل ذلك في أي وقت عبر واتساب <bdi dir="ltr">{ACADEMY_WA_DISPLAY}</bdi>.
          </span>
          )}
        </label>
        {errs.consent ? <p className="cr-err" id="cr-consent-e" role="alert">{errs.consent}</p> : null}
      </div>

      {preview ? null : <Turnstile onToken={setToken} resetKey={resetKey} />}
      {errs.captcha ? <p className="cr-err" role="alert">{errs.captcha}</p> : null}
      {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}

      <button type="submit" className="cr-btn cr-btn-primary" disabled={busy || (!preview && !!TURNSTILE_SITEKEY && !token)}>
        {busy ? (en ? "One moment…" : "لحظات…") : <>{en ? "Start the chat" : g(gd, "بدء المحادثة", "ابدأ المحادثة", "ابدئي المحادثة")} <Arrow /></>}
      </button>
      <p className="cr-fine">{en ? "Your details are used only to review your job application, and they stay confidential." : "بياناتك تُستخدم فقط لمراجعة طلب التوظيف، وتبقى سرّية."}</p>
    </form>
  );
}

/* ───────────────────────── CV card (when still missing) ───────────────────────── */
function CvCard({ app, gender, required, onDone }) {
  const en = useEn();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = extOf(file.name);
    if (!CV_EXT[ext]) { setErr(en ? "This file type isn't supported. Please use PDF, Word or an image." : "صيغة الملف غير مدعومة. المسموح: PDF أو Word أو صورة."); return; }
    if (file.size > 10 * 1024 * 1024) { setErr(en ? "The file is larger than 10 MB." : "حجم الملف أكبر من 10 ميجابايت."); return; }
    setBusy(true); setErr("");
    try {
      await uploadAndAttach(app, { kind: "cv", blob: file, mime: file.type || CV_EXT[ext], ext });
      onDone();
    } catch (x) { setErr(x.messageAr || (en ? "We couldn't upload the file." : "ما قدرنا نرفع الملف.")); } finally { setBusy(false); }
  };
  return (
    <div className="cr-card cr-cvcard">
      <label htmlFor="cr-cv2">{en ? <><strong>Attach your CV</strong> {required ? "(required before you submit)" : ""}</> : <><strong>{g(gender, "ارفق/ي", "ارفق", "أرفقي")} سيرتك الذاتية</strong> {required ? "(مطلوبة قبل الإرسال)" : ""}</>}</label>
      <label className="cr-filepick" htmlFor="cr-cv2"><span className="cr-btn cr-btn-ghost">{en ? "Choose a file" : "اختيار ملف"}</span></label>
      <input id="cr-cv2" type="file" className="cr-file-hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*" onChange={pick} disabled={busy} />
      {busy ? <p className="cr-hint">{en ? "Uploading…" : "جاري الرفع…"}</p> : null}
      {err ? <p className="cr-err" role="alert">{err}</p> : null}
    </div>
  );
}

/* ───────────────────────── Chat ───────────────────────── */
// How each written answer was produced (integrity signals, never scored): first keystroke → send,
// pasted characters, times the page lost focus. Reset after every send.
const freshSig = () => ({ first: 0, pasteChars: 0, paste: false, blur: 0, lastBlur: 0 });
function Chat({ messages, typing, onSend, error, gender, disabled, options, multi, onSkip, onSkipAll, hint }) {
  const en = useEn();
  const [text, setText] = useState("");
  // «غير ذلك / أكتب» opens the text box instead of the buttons; multi = chips picked, then «تم»
  const [free, setFree] = useState(false);
  const [picked, setPicked] = useState([]);
  useEffect(() => { setFree(false); setPicked([]); }, [options]);
  const opts = options || [];
  const skipOpt = opts.length && opts.every((o) => o.id === "skip") ? opts[0] : null; // optional free-text question
  const showOpts = opts.length > 0 && !skipOpt && !(free && !multi);
  const showText = !opts.length || !!skipOpt || free;
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
    if (multi && picked.length) { sendPicked(v); return; }
    onSend(v, () => setText(""), free ? "other" : undefined, {
      typing_ms: s.first ? Date.now() - s.first : 0, paste: s.paste, paste_chars: s.pasteChars, blur_count: s.blur, chars: v.length,
    });
    sig.current = freshSig();
    requestAnimationFrame(() => { if (taRef.current) taRef.current.style.height = "auto"; });
  };
  const labelOf = (id) => opts.find((o) => o.id === id)?.label || id;
  const sendPicked = (typed = "") => {
    const named = picked.filter((id) => id !== "other").map(labelOf).join(en ? ", " : "، ");
    const t = typed || text.trim();
    const label = [named, picked.includes("other") ? t : ""].filter(Boolean).join(" — ");
    if (!label || typing || disabled) return;
    onSend(label, () => setText(""), picked.join(","));
  };
  const tap = (o) => {
    if (multi) {
      setPicked((p) => (p.includes(o.id) ? p.filter((x) => x !== o.id) : [...p, o.id]));
      if (o.id === "other") setFree((f) => !f);
      return;
    }
    if (o.id === "other") { setFree(true); requestAnimationFrame(() => taRef.current?.focus()); return; }
    onSend(o.label, () => {}, o.id);
  };
  const onKey = (e) => {
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    if (e.key === "Enter" && !e.shiftKey && fine && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
  };

  return (
    <>
      <div className="cr-chat" role="log" aria-live="polite" aria-label={en ? "Chat" : "المحادثة"}>
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
          <div className="cr-msg bot"><span className="cr-ava" aria-hidden="true"><BrandMark size={16} /></span><div className="cr-bubble cr-typing" role="status" aria-label={en ? "Typing" : "يكتب"}><i /><i /><i /></div></div>
        ) : null}
        <div ref={endRef} />
      </div>
      <div className="cr-composer">
        {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
        {showOpts ? (
          <div className={`cr-opts${multi ? " cr-opts-multi" : ""}`} role="group" aria-label={en ? (multi ? "Choose one or more" : "Choose an answer") : multi ? "اختر وقت أو أكثر" : "اختر إجابة"}>
            {opts.map((o) => (
              <button key={o.id} type="button" className={`cr-opt${o.id === "other" ? " cr-opt-other" : ""}${picked.includes(o.id) ? " on" : ""}`}
                aria-pressed={multi ? picked.includes(o.id) : undefined} disabled={typing || disabled} onClick={() => tap(o)}>
                {multi && o.id !== "other" ? <span className="cr-opt-tick" aria-hidden="true">{picked.includes(o.id) ? "✓" : ""}</span> : null}{o.label}
              </button>
            ))}
            {multi ? (
              <button type="button" className="cr-btn cr-btn-primary cr-opts-done" disabled={!picked.length || typing || disabled || (picked.includes("other") && picked.length === 1 && !text.trim())}
                onClick={() => sendPicked()}>{en ? "Done" : "تم"}</button>
            ) : null}
          </div>
        ) : null}
        {free && !multi ? <button type="button" className="cr-link cr-back-opts" onClick={() => setFree(false)}>{en ? "Back to the options" : "رجوع للخيارات"}</button> : null}
        {showText ? (
        <div className="cr-composer-row">
          <label htmlFor="cr-msg" className="cr-sr">{en ? "Write your reply" : g(gender, "اكتب/ي ردّك", "اكتب ردّك", "اكتبي ردّك")}</label>
          <textarea
            id="cr-msg" ref={taRef} rows={1} dir="auto" value={text} maxLength={1500}
            placeholder={en ? "Write your reply here…" : g(gender, "اكتب/ي ردّك هنا…", "اكتب ردّك هنا…", "اكتبي ردّك هنا…")}
            onChange={(e) => { if (!sig.current.first) sig.current.first = Date.now(); setText(e.target.value); grow(); }} onKeyDown={onKey} disabled={disabled}
            onPaste={(e) => { const n = (e.clipboardData?.getData("text") || "").length; if (n) { sig.current.paste = true; sig.current.pasteChars += n; } }}
          />
          <button type="button" className="cr-send" onClick={send} disabled={!text.trim() || typing || disabled} aria-label={en ? "Send" : "إرسال"}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3.4 11.2 20 3.6c.8-.4 1.6.4 1.2 1.2l-7.6 16.6c-.4.8-1.5.7-1.8-.1l-2-5.7-5.7-2c-.8-.3-.9-1.4-.1-1.8l-.6-.6Z" fill="currentColor" /></svg>
          </button>
        </div>
        ) : null}
        {skipOpt ? <button type="button" className="cr-link cr-skip-q" disabled={typing || disabled} onClick={() => onSend(skipOpt.label, () => {}, skipOpt.id)}>{skipOpt.label}</button> : null}
        {onSkip ? (
          <div className="cr-pv-tools" role="group" aria-label="أدوات المعاينة">
            <p className="cr-pv-hint">{hint || "بعد سؤالي الوضع والأوقات، الأسئلة هنا نموذج — في الحقيقة يكتبها المساعد حسب إجابات المتقدم."}</p>
            <button type="button" className="cr-pv-btn" disabled={typing} onClick={onSkip}>تخطي هذا السؤال</button>
            {onSkipAll ? <button type="button" className="cr-pv-btn" disabled={typing} onClick={onSkipAll}>تخطي المحادثة كلها</button> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

/* ───────────────────────── What next (every outcome) ───────────────────────── */
function WhatNext({ kind, gender }) {
  const en = useEn();
  if (kind === "withdrew") return null;
  if (en) {
    return (
      <section className="cr-card cr-next" aria-labelledby="cr-next-h">
        <h3 id="cr-next-h">What happens next?</h3>
        <ul>
          {kind === "booked" || kind === "book"
            ? <li>In the short call we get to know you and explain how the work is organised.</li>
            : <li>If your profile fits an opening, we'll contact you on WhatsApp.</li>}
          <li>The assistant only sorts applications — <b>the final decision is made by a person on the hiring team</b>.</li>
          <li>Your data is kept for 12 months and then deleted. To have it deleted sooner, message us on WhatsApp <bdi dir="ltr">{ACADEMY_WA_DISPLAY}</bdi>.</li>
        </ul>
      </section>
    );
  }
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

function VoiceCard({ task, app, gender, onTasks, onSkip }) {
  const en = useEn();
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
    } catch { setErr(en ? "We couldn't save the recording. Please try again." : "ما قدرنا نحفظ التسجيل. نرجو المحاولة مرة ثانية."); setMode("idle"); }
  }, [en]);

  const beginClock = () => {
    startedAt.current = performance.now();
    setElapsed(0);
    setMode("recording");
    timer.current = setInterval(() => setElapsed((performance.now() - startedAt.current) / 1000), 200);
  };

  const micError = (x) => {
    setNoMic(true);
    const blocked = x?.name === "NotAllowedError" || x?.name === "SecurityError";
    track(app, blocked ? "mic_denied" : "mic_error", x?.name || "unknown");
    if (en) {
      setErr(blocked ? "We couldn't reach your microphone. You can allow it in your browser settings, or upload an audio file instead."
        : "Recording isn't available in this browser. You can upload an audio file instead.");
      return;
    }
    setErr(blocked
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
    track(app, "rec_start", task.kind);
    if (!isRp) { recorder.current = r; beginClock(); return; }
    setMode("opening");
    let res;
    try {
      res = await call("voice_begin", { application_id: app.id, token: app.token, kind: task.kind });
    } catch (x) {
      r.cancel(); setMode("idle");
      if (x instanceof ApiError && x.code === "AUTH") onTasks(null, x);
      else setErr(x.messageAr || (en ? "Something went wrong. Please try again." : "صار خلل. نرجو المحاولة مرة ثانية."));
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
    track(app, "file_pick", task.kind);
    const mime = (file.type || "").split(";")[0].toLowerCase();
    const ext = AUDIO_MIME_EXT[mime] || extOf(file.name);
    if (!["wav", "webm", "mp4", "m4a", "mp3", "ogg", "aac"].includes(ext)) { setErr(en ? "This audio format isn't supported." : "صيغة الملف الصوتي غير مدعومة."); return; }
    if (file.size > 10 * 1024 * 1024) { setErr(en ? "The file is larger than 10 MB." : "حجم الملف أكبر من 10 ميجابايت."); return; }
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      const seconds = isFinite(a.duration) ? a.duration : 0;
      setRec({ blob: file, seconds, url, mime: mime || "audio/mp4", ext });
      setMode("recorded");
    };
    a.onerror = () => { URL.revokeObjectURL(url); setErr(en ? "We couldn't read the audio file." : "ما قدرنا نقرأ الملف الصوتي."); };
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
      track(app, "rec_done", task.kind);
      if (res.retry) { setNote(res.message_ar || ""); if (res.attempts != null) setTries(res.attempts); }
      onTasks(res.voice_tasks);
    } catch (x) {
      setMode("recorded");
      track(app, "upload_fail", x?.code || "unknown");
      if (x instanceof ApiError && x.code === "AUTH") onTasks(null, x); else setErr(x.messageAr || (en ? "The recording didn't upload. Please try again." : "ما انرفع التسجيل. نرجو المحاولة مرة ثانية."));
    }
  };

  const isEn = task.kind === "voice_en";
  const startLabel = en ? (task.done ? "Record again" : tries > 0 && isRp ? "Record again" : "Start recording") : task.done
    ? g(gender, "أعد/ي التسجيل", "أعد التسجيل", "أعيدي التسجيل")
    : tries > 0 && isRp ? g(gender, "سجّل/ي مرة ثانية", "سجّل مرة ثانية", "سجّلي مرة ثانية")
      : g(gender, "ابدأ/ي التسجيل", "ابدأ التسجيل", "ابدئي التسجيل");
  const showStart = !noMic && (!isRp || (task.done ? task.can_retry && left > 0 : left > 0));
  return (
    <section className={`cr-card cr-voice${task.done && mode === "idle" ? " done" : ""}`} aria-labelledby={`cr-v-${task.kind}`}>
      <div className="cr-voice-head">
        <h3 id={`cr-v-${task.kind}`}>{task.title_ar}</h3>
        {task.done ? <span className="cr-badge">{en ? "Sent" : "تم الإرسال"}</span> : null}
      </div>
      <p className="cr-voice-prompt" dir="auto">{task.prompt_ar}</p>
      {task.lead_ar ? (
        <figure className="cr-leadline">
          <figcaption>{en ? "The client says:" : "العميل يقول:"}</figcaption>
          <blockquote>«{task.lead_ar}»</blockquote>
        </figure>
      ) : null}
      {isRp && scenario && mode !== "idle" ? (
        <figure className="cr-leadline cr-scenario" aria-live="polite">
          <figcaption>{en ? "The situation:" : "الموقف:"}</figcaption>
          <blockquote dir="auto">{scenario}</blockquote>
        </figure>
      ) : null}
      {en ? (
      <p className="cr-hint">
        Length: {task.min_s} to {task.max_s} seconds{isEn ? " (in English)" : ""}.
        {isRp ? <> Attempts: <b>{Math.min(tries, maxTries)} of {maxTries}</b>.</> : null}
      </p>
      ) : (
      <p className="cr-hint">
        المدة: من {task.min_s} إلى {task.max_s} ثانية{isEn ? " (بالإنجليزية)" : ""}.
        {isRp ? <> المحاولات: <b>{Math.min(tries, maxTries)} من {maxTries}</b>.</> : null}
      </p>
      )}
      {note ? <p className="cr-err cr-err-box" role="alert">{note}</p> : null}

      {mode === "idle" && (
        <div className="cr-voice-actions">
          {showStart ? (
            <button type="button" className="cr-btn cr-btn-primary" onClick={start}>
              <span className="cr-dot" aria-hidden="true" /> {startLabel}
            </button>
          ) : null}
          {isRp && !noMic && !showStart && !task.done ? <p className="cr-hint">{en ? "No attempts left for this recording." : "انتهت المحاولات لهذا التسجيل."}</p> : null}
          {(!isRp || noMic) && (
            <label className="cr-btn cr-btn-ghost cr-filebtn">
              {en ? (noMic ? "Upload an audio file" : "Or upload an audio file") : noMic ? "رفع ملف صوتي" : "أو رفع ملف صوتي"}
              <input type="file" accept="audio/*" onChange={pickAudio} />
            </label>
          )}
          {onSkip && !task.done ? <button type="button" className="cr-pv-btn" onClick={() => onSkip(task.kind)}>{en ? "Skip this recording" : "تخطي هذا التسجيل"}</button> : null}
        </div>
      )}

      {mode === "opening" && <p className="cr-hint" role="status">{en ? "One moment…" : "لحظات…"}</p>}

      {mode === "countdown" && (
        <div className="cr-voice-rec cr-countdown" role="timer" aria-live="assertive">
          <b className="cr-count">{count}</b>
          <p className="cr-hint">{en ? "Read the situation — recording starts after the countdown." : g(gender, "اقرأ/ي الموقف — التسجيل يبدأ بعد العدّ.", "اقرأ الموقف — التسجيل يبدأ بعد العدّ.", "اقرئي الموقف — التسجيل يبدأ بعد العدّ.")}</p>
        </div>
      )}

      {mode === "recording" && (
        <div className="cr-voice-rec">
          <div className="cr-timer" role="timer" aria-live="off">
            <span className="cr-rec-dot" aria-hidden="true" />
            <b>{fmt(elapsed)}</b> <span>/ {fmt(task.max_s)}</span>
          </div>
          <div className="cr-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (elapsed / task.max_s) * 100)}%` }} /><u style={{ insetInlineStart: `${(task.min_s / task.max_s) * 100}%` }} /></div>
          <button type="button" className="cr-btn cr-btn-primary" onClick={finishRecording} disabled={elapsed < 1}>{en ? "Stop recording" : "إيقاف التسجيل"}</button>
          <p className="cr-hint">{en ? (elapsed < task.min_s ? `Minimum ${task.min_s} seconds.` : "You can stop whenever you're done.") : elapsed < task.min_s ? `الحد الأدنى ${task.min_s} ثانية.` : g(gender, "تقدر/ين توقف/ين متى ما خلصت.", "تقدر توقف متى ما خلصت.", "تقدرين توقفين متى ما خلصتي.")}</p>
        </div>
      )}

      {(mode === "recorded" || mode === "uploading") && rec && (
        <div className="cr-voice-rec">
          <audio controls src={rec.url} className="cr-audio" preload="metadata" />
          <p className="cr-hint">{en ? "Length" : "مدة التسجيل"}: {fmt(rec.seconds)}</p>
          {tooShort ? <p className="cr-err" role="alert">{en ? `The recording is shorter than ${task.min_s} seconds. Please try again.` : <>التسجيل أقصر من {task.min_s} ثانية. {g(gender, "أعد/ي", "أعد", "أعيدي")} المحاولة.</>}</p> : null}
          <div className="cr-voice-actions">
            <button type="button" className="cr-btn cr-btn-primary" onClick={submit} disabled={tooShort || mode === "uploading"}>{mode === "uploading" ? (en ? "Uploading…" : "جاري الرفع…") : en ? "Use this recording" : "اعتمد هذا التسجيل"}</button>
            {canRedo ? (
              <button type="button" className="cr-btn cr-btn-ghost" onClick={redo} disabled={mode === "uploading"}>
                {en ? (isRp ? `Record again (${left === 1 ? "last attempt" : `${left} left`})` : "Record again") : isRp ? `${g(gender, "سجّل/ي مرة ثانية", "سجّل مرة ثانية", "سجّلي مرة ثانية")} (${left === 1 ? "آخر محاولة" : `باقي ${left}`})` : "إعادة التسجيل"}
              </button>
            ) : null}
          </div>
          {isRp && !canRedo ? <p className="cr-hint">{en ? "This is the last attempt — we'll use this recording." : "هذه آخر محاولة — نعتمد هذا التسجيل."}</p> : null}
        </div>
      )}
      {err ? <p className="cr-err" role="alert">{err}</p> : null}
    </section>
  );
}

/* ───────────────────────── Outcome screens ───────────────────────── */
/** After submitting: the signed pledge's reference number + the applicant's read-only copy. */
function PledgeRef({ p }) {
  const en = useEn();
  return (
    <section className="cr-card pl-ref" aria-label={en ? "Your signed pledge" : "تعهّدك الموقّع"}>
      <p><small>{en ? "Pledge reference" : "رقم مرجع التعهّد"}</small><b dir="ltr">{p.ref}</b></p>
      {p.copy_url ? <a className="cr-btn cr-btn-ghost" href={p.copy_url} target="_blank" rel="noopener">{en ? "A copy of your pledge" : "نسخة من تعهّدك"}</a> : null}
    </section>
  );
}

function BookedCard({ booking, title, body }) {
  const en = useEn();
  const [mine, setMine] = useState(""); // the applicant's own time, read after hydration
  useEffect(() => { if (en && booking.start) setMine(localTimeOf(booking.start)); }, [en, booking.start]);
  return (
    <div className="cr-card cr-done" role="status">
      <h2>{title || (en ? "Your interview is booked" : "تم تأكيد موعدك")}</h2>
      {body ? <p className="cr-lead">{body}</p> : null}
      <p className="cr-when"><small>{en ? "Interview time" : "موعد اللقاء"}</small><b>{booking.when_en || booking.when_ar}{en ? " Riyadh time" : ""}</b>{en && mine ? <small>({mine} your time)</small> : null}</p>
      <div className="cr-actions">
        {booking.gcal ? <a className="cr-btn cr-btn-primary" href={booking.gcal} target="_blank" rel="noopener noreferrer">{en ? "Add to calendar" : "أضف للتقويم"} <Arrow /></a> : null}
        {booking.meet_link ? <a className="cr-btn cr-btn-ghost" href={booking.meet_link} target="_blank" rel="noopener noreferrer">{en ? "Meeting link (Google Meet)" : "رابط اللقاء (Google Meet)"}</a> : null}
        {booking.wa_link ? <a className="cr-btn cr-btn-ghost" href={booking.wa_link} target="_blank" rel="noopener noreferrer">{en ? "Change the time on WhatsApp" : "تغيير الموعد عبر واتساب"}</a> : null}
      </div>
    </div>
  );
}

function SlotPicker({ outcome, slots, loading, onBook, busy, error, gender }) {
  const en = useEn();
  const [sel, setSel] = useState(null);
  const [tzOk, setTzOk] = useState(false); // local times only after hydration (the server has no timezone)
  useEffect(() => { setTzOk(true); }, []);
  const days = useMemo(() => {
    const m = new Map();
    for (const s of slots) { if (!m.has(s.day_ar)) m.set(s.day_ar, []); m.get(s.day_ar).push(s); }
    return [...m.entries()];
  }, [slots]);
  return (
    <div className="cr-card cr-done">
      <h2>{outcome.title_ar}</h2>
      <p className="cr-lead">{outcome.body_ar}</p>
      {loading ? <p className="cr-hint" role="status">{en ? "One moment, loading the available times…" : "لحظات، نجهّز المواعيد المتاحة…"}</p> : slots.length === 0 ? (
        error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : <p className="cr-hint">{en ? "No times are available right now. We'll contact you on WhatsApp to set a time." : "ما فيه مواعيد متاحة الآن. سنتواصل معك على واتساب لتحديد الموعد."}</p>
      ) : (
        <div className="cr-slots">
          <h3>{en ? "Choose a time that suits you" : g(gender, "اختر/ي الوقت المناسب لك", "اختر الوقت المناسب لك", "اختاري الوقت المناسب لك")}</h3>
          {en ? <p className="cr-hint">Times are shown in Riyadh time (GMT+3){tzOk && slots[0] && localTimeOf(slots[0].start) ? ", with your own time underneath" : ""}.</p> : null}
          {days.map(([day, list]) => (
            <div key={day} className="cr-day" role="group" aria-label={day}>
              <div className="cr-day-l">{day}</div>
              <div className="cr-chips">
                {list.map((s) => (
                  <button key={s.start} type="button" className={`cr-chip${sel === s.start ? " on" : ""}`} aria-pressed={sel === s.start} onClick={() => setSel(s.start)}>{s.time_ar}{en && tzOk && localTimeOf(s.start) ? <span className="cr-local">{localTimeOf(s.start)} your time</span> : null}</button>
                ))}
              </div>
            </div>
          ))}
          {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
          <button type="button" className="cr-btn cr-btn-primary" disabled={!sel || busy} onClick={() => onBook(sel)}>{busy ? (en ? "One moment…" : "لحظات…") : <>{en ? "Confirm this time" : "تأكيد الموعد"} <Arrow /></>}</button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export default function CareersPage({ lang = "ar" }) {
  const en = lang === "en";
  setApiLang(lang); // module-level, read by every call(): the edge answers this page's language
  const R = rolesFor(en);
  const [langQs, setLangQs] = useState(""); // query string carried by the language switch (src, i, role…)
  const [suggestEn, setSuggestEn] = useState(false); // «Prefer English?» on /careers for non-Arabic browsers
  const [role, setRole] = useState(null);
  const [stage, setStage] = useState("landing"); // landing | chat | voice | pay | finishing | outcome
  const [saved, setSaved] = useState({ sales: null, trainer: null });
  const [app, setApp] = useState(null); // { id, token, role, basics }
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [options, setOptions] = useState(null);
  const [multi, setMulti] = useState(false);
  const finishRef = useRef(null); // send() → finish() once the last pay answer is in
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
  const [pledge, setPledge] = useState(null); // the trial-commitment pledge: the last step before submitting
  const [pledgeMsg, setPledgeMsg] = useState(""); // set after «ما أقدر ألتزم»
  const [preview, setPreview] = useState(false); // read after hydration: the prerendered HTML has no query string
  const formRef = useRef(null);
  const gender = app?.basics?.gender || "";

  useEffect(() => {
    setPreview(isPreview());
    setSaved({ sales: loadSaved("sales"), trainer: loadSaved("trainer") });
    const params = new URLSearchParams(window.location.search);
    const rz = params.get("resume");
    if (rz && /^[0-9a-f-]{36}\.[0-9a-f]{20,}$/i.test(rz)) { params.delete("resume"); resumeLink(rz); }
    const want = params.get("role");
    if (want && ROLES[want]) choose(want);
    // the switch keeps every param (src, i, role, utm…); «lang» is the page's own choice, so it is not carried
    const carry = new URLSearchParams(params);
    carry.delete("lang");
    setLangQs(carry.toString() ? `?${carry.toString()}` : "");
    if (!en) {
      let dismissed = false;
      try { dismissed = window.localStorage.getItem("flu_careers_lang") === "ar"; } catch { /* private mode */ }
      const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]).map((l) => String(l).toLowerCase());
      if (!dismissed && params.get("lang") !== "ar" && langs[0] && !langs.some((l) => l.startsWith("ar"))) setSuggestEn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback((r, msg) => {
    if (r) clearSaved(r);
    setSaved((s) => ({ ...s, ...(r ? { [r]: null } : {}) }));
    setApp(null); setMessages([]); setOptions(null); setTasks([]); setOutcome(null); setSlots([]); setBooking(null); setPledge(null); setPledgeMsg("");
    setStage("landing"); setRole(r || null); setError(""); setNotice(msg || "");
    window.scrollTo?.(0, 0);
  }, []);

  /** Run an API call; AUTH resets to the form, anything else rethrows. */
  const guard = useCallback(async (fn, r) => {
    try { return await fn(); } catch (x) {
      if (x instanceof ApiError && x.code === "AUTH") { reset(r, en ? "Your session expired. We need your details again to continue." : "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة."); return undefined; }
      throw x;
    }
  }, [reset, en]);

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
    setMulti(!!res.multi);
    setTasks(res.voice_tasks || []);
    setNeedsCv(!!res.needs_cv && !res.has_cv);
    if (res.outcome) return showOutcome(res.outcome, a);
    if (res.step === "done") {
      setStage("finishing");
      try { const f = await call("finish", { application_id: a.id, token: a.token }); return showOutcome(f.outcome, a); }
      catch (x) { setStage("voice"); setError(x.messageAr || ""); return undefined; }
    }
    setStage(res.step === "voice" ? "voice" : res.step === "pay" ? "pay" : "chat");
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
        setOutcome(en
          ? { kind: "thanks", title_ar: "We already have your application — thank you", body_ar: x.messageAr || "Your application for this role reached us before, and we have it. If we need anything, we'll contact you on WhatsApp." }
          : { kind: "thanks", title_ar: "وصلنا طلبك، شكرًا لك", body_ar: x.messageAr || "طلبك على هذه الوظيفة وصلنا من قبل، وهو عندنا. إذا احتجنا شيئًا نتواصل معك على واتساب." });
        setStage("outcome");
      } else if (x.code === "AUTH") { clearSaved(role); setError(en ? "Something went wrong while continuing. Please try again." : "حصل خلل بسيط في المتابعة. نرجو المحاولة مرة ثانية."); }
      else { setError(x.messageAr || (en ? "Something went wrong. Please try again." : "صار خلل. نرجو المحاولة مرة ثانية.")); if (x.code === "BAD_INPUT" && x.field) setFieldError(x.field); }
    } finally { setBusy(false); }
  }, [role, enter, en]);

  const resume = useCallback(async (role) => {
    const s = saved[role];
    if (!s) return;
    if (TURNSTILE_SITEKEY || !s.basics) { setRole(role); requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth" })); return; }
    setBusy(true); setError("");
    try {
      const res = await call("start", { role, turnstile_token: null, hp: "", elapsed_ms: 60000, basics: s.basics, ...(s.birth_date ? { birth_date: s.birth_date } : s.birth_year ? { birth_year: s.birth_year } : {}), source: { landing: en ? "/en/careers" : "/careers" }, resume: { application_id: s.application_id, token: s.token } });
      const a = { id: res.application_id, token: res.token, role, basics: s.basics };
      saveApp(role, { application_id: a.id, token: a.token, basics: s.basics, birth_date: s.birth_date, birth_year: s.birth_year });
      setApp(a);
      await enter(res, a);
    } catch (x) {
      if (x.code === "AUTH") reset(role, en ? "Your session expired. We need your details again to continue." : "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة.");
      else setError(x.messageAr || "");
    } finally { setBusy(false); }
  }, [saved, enter, reset, en]);

  /** The «كمّل طلبك» email link: ?resume=<id>.<token> → the draft exactly where it stopped, on this device. */
  const resumeLink = async (rz) => {
    const [id, rt] = rz.split(".");
    try { const u = new URL(window.location.href); u.searchParams.delete("resume"); window.history.replaceState(null, "", u.pathname + u.search + u.hash); } catch { /* old browser */ }
    setBusy(true); setError(""); setNotice("");
    try {
      const res = await call("resume", { application_id: id, resume_token: rt });
      const r = ROLES[res.role] ? res.role : "sales";
      const a = { id: res.application_id, token: res.token, role: r, basics: res.basics };
      const keep = { application_id: a.id, token: a.token, basics: res.basics, ...(res.birth_date ? { birth_date: res.birth_date } : res.birth_year ? { birth_year: res.birth_year } : {}) };
      saveApp(r, keep);
      setSaved((s) => ({ ...s, [r]: keep }));
      setRole(r); setApp(a);
      await enter(res, a);
    } catch (x) {
      if (x.code === "ALREADY_APPLIED") {
        setOutcome(en
          ? { kind: "thanks", title_ar: "We already have your application — thank you", body_ar: "Your application reached us and we have it. If we need anything, we'll contact you on WhatsApp." }
          : { kind: "thanks", title_ar: "وصلنا طلبك، شكرًا لك", body_ar: "طلبك وصلنا وهو عندنا. إذا احتجنا شيئًا نتواصل معك على واتساب." });
        setStage("outcome");
      } else if (x.code === "AUTH") {
        setNotice(en ? "This link no longer works. Enter your details with the same phone number and you'll continue where you left off."
          : "الرابط ما عاد يشتغل. اكتب بياناتك بنفس رقم الجوال وتكمّل من حيث وقفت.");
      } else setError(x.messageAr || (en ? "Something went wrong. Please try again." : "صار خلل. نرجو المحاولة مرة ثانية."));
    } finally { setBusy(false); }
  };

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
      setMulti(!!res.multi);
      if (res.outcome) { clearSaved(role); await showOutcome(res.outcome, app); return; }
      if (res.step === "voice") { setTasks(res.voice_tasks || []); setStage("voice"); window.scrollTo?.(0, 0); }
      if (res.step === "finish") { finishRef.current?.(); }
    } catch (x) {
      setMessages((m) => m.slice(0, -1));
      setError(x.messageAr || (en ? "Your message didn't go through. Please try again." : "ما وصلت رسالتك. نرجو المحاولة مرة ثانية."));
    } finally { setTyping(false); }
  }, [app, role, guard, showOutcome, en]);

  /* voice */
  const onTasks = (next, authErr) => {
    if (authErr) { reset(role, en ? "Your session expired. We need your details again to continue." : "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة."); return; }
    setTasks(next || []);
  };
  const allDone = tasks.length > 0 && tasks.every((t) => t.done);
  const viewed = useRef("");
  useEffect(() => {
    if (stage !== "voice" || !app?.id || viewed.current === app.id) return;
    viewed.current = app.id;
    track(app, "view", typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent || "") ? "ios" : /Android/.test(navigator.userAgent || "") ? "android" : "desktop");
  }, [stage, app]);
  const keyNote = tasks.find((t) => t.note_ar)?.note_ar || "";
  const cvRequired = R[role]?.cvRequired;

  const finish = async () => {
    const from = stage;
    setError("");
    // sales: «إرسال الطلب» first opens the pay questions (fast); show the review spinner only if it takes a while
    const slow = role === "sales" && from === "voice" ? setTimeout(() => setStage("finishing"), 1200) : null;
    if (!slow) setStage("finishing");
    else setTyping(true);
    try {
      const res = await guard(() => call("finish", { application_id: app.id, token: app.token }), role).finally(() => { if (slow) { clearTimeout(slow); setTyping(false); } });
      if (!res) return;
      // sales: a few pay questions come last, right before the result
      if (res.step === "pay") {
        if (res.reply) setMessages((m) => (m[m.length - 1]?.content === res.reply ? m : [...m, { role: "bot", content: res.reply }]));
        setOptions(res.options || null); setMulti(!!res.multi); setStage("pay"); window.scrollTo?.(0, 0);
        return;
      }
      // every application: the formal pledge is signed last, then the same «finish» submits it
      if (res.step === "pledge") { setPledge(res.pledge); setPledgeMsg(""); setStage("pledge"); window.scrollTo?.(0, 0); return; }
      clearSaved(role);
      await showOutcome(res.outcome, app);
    } catch (x) { setStage(from === "pay" ? "pay" : from === "pledge" ? "pledge" : "voice"); setError(x.messageAr || (en ? "We couldn't submit your application. Please try again." : "ما قدرنا نرسل الطلب. نرجو المحاولة مرة ثانية.")); }
  };
  finishRef.current = finish;

  /* the pledge */
  const signPledge = async (name) => {
    setBusy(true); setError(""); setFieldError("");
    try {
      const res = await guard(() => call("pledge_sign", { application_id: app.id, token: app.token, agree: true, name }), role);
      if (!res) return;
      setPledge(res.pledge);
      await finish();
    } catch (x) {
      setError(x.messageAr || (en ? "We couldn't record your signature. Please try again." : "ما قدرنا نسجّل توقيعك. نرجو المحاولة مرة ثانية."));
      if (x.field) setFieldError(x.field);
    } finally { setBusy(false); }
  };
  const declinePledge = async () => {
    setBusy(true); setError("");
    try {
      const res = await guard(() => call("pledge_decline", { application_id: app.id, token: app.token }), role);
      if (res) { setPledgeMsg(res.message || (en ? "We appreciate your honesty. Committing to the trial is a basic requirement for applying with us." : "نقدّر صراحتك، الالتزام بالتجربة شرط أساسي للتقديم عندنا.")); window.scrollTo?.(0, 0); }
    } catch (x) { setError(x.messageAr || ""); } finally { setBusy(false); }
  };

  /* «وضع المعاينة» shortcuts */
  const skipQuestion = () => { const x = previewSample(); send(x.text, () => {}, x.choice); };
  const skipChat = async () => {
    const res = await call("preview_skip_chat");
    setMessages((m) => [...m, { role: "bot", content: res.reply }]);
    setOptions(null); setTasks(res.voice_tasks || []); setStage("voice"); window.scrollTo?.(0, 0);
  };
  const skipVoice = async (kind) => { const res = await call("preview_skip_voice", { kind }); setTasks(res.voice_tasks || []); };
  const viewOutcome = (kind) => { setBooking(null); setSlots([]); showOutcome(previewOutcome(kind, gender, app?.basics?.name), app); };

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
  const r = R[role] || null;
  const otherHref = `${en ? "/careers" : "/en/careers"}${langQs}`;
  const pickLang = (l) => { try { window.localStorage.setItem("flu_careers_lang", l); } catch { /* private mode */ } };
  const tryTrainer = () => { reset(null); choose("trainer"); };

  return (
    <LangCtx.Provider value={en ? "en" : "ar"}>
    <div className="cr-root" dir={en ? "ltr" : "rtl"} lang={en ? "en" : "ar"} style={{ "--rise": RISE_OF[stage] ?? 0 }}>
      <style>{css}</style>
      <Seo path={en ? "/en/careers" : "/careers"} />
      {en ? <Helmet htmlAttributes={{ lang: "en", dir: "ltr" }} /> : null}
      <div className="cr-sky" aria-hidden="true" />

      <header className={`cr-top${inFlow ? "" : " wide"}`}>
        <a href="/" className="cr-brand" aria-label={en ? "Fluentia Academy" : "أكاديمية طلاقة"}>
          <BrandMark size={26} /><span>{en ? "Fluentia" : "طلاقة"}</span>
        </a>
        <div className="cr-top-end">
          {inFlow && r ? <span className="cr-top-role">{r.title}</span> : null}
          {!inFlow ? (
            <a className="cr-lang" href={otherHref} hrefLang={en ? "ar" : "en"} lang={en ? "ar" : "en"} dir={en ? "rtl" : "ltr"}
              onClick={() => pickLang(en ? "ar" : "en")}>{en ? "العربية" : "English"}</a>
          ) : null}
        </div>
      </header>
      {suggestEn && !inFlow ? (
        <div className="cr-lang-banner" role="note" dir="ltr" lang="en">
          <span>Prefer English?</span>
          <a href={otherHref} onClick={() => pickLang("en")}>Switch to English</a>
          <button type="button" aria-label="Dismiss" onClick={() => { pickLang("ar"); setSuggestEn(false); }}>×</button>
        </div>
      ) : null}
      {preview ? (
        <div className="cr-pv" role="note">
          <b>وضع المعاينة</b><span>لا يُحفظ شيء</span>
          {inFlow ? <button type="button" className="cr-pv-btn" onClick={() => reset(null)}>من البداية</button> : null}
        </div>
      ) : null}
      {inFlow ? <Steps stage={stage} keyVoice={role === "sales"} /> : null}

      {!inFlow && en && (
        <main className="cr-land">
          <section className="cr-hero">
            <p className="cr-eyebrow">Careers at Fluentia Academy</p>
            <h1>Join the <span className="cr-grad">Fluentia</span> team</h1>
            <p className="cr-lead">We're hiring English trainers and admissions advisors — fully remote.</p>
            <ul className="cr-facts">
              <li>Fully remote</li>
              <li>Flexible hours</li>
              <li>Apply in ~10 minutes</li>
            </ul>
          </section>
          <div className="cr-horizon" aria-hidden="true"><DawnSun id="cr-sun" /></div>

          <h2 className="cr-sec-h" id="cr-roles-h">Open roles</h2>
          <section className="cr-roles" aria-labelledby="cr-roles-h">
            {Object.values(R).map((x, i) => (
              <article key={x.id} className={`cr-role${role === x.id ? " on" : ""}`}>
                <span className="cr-role-n" aria-hidden="true">0{i + 1}</span>
                <h3>{x.title}</h3>
                <p>{x.line}</p>
                {x.note ? <p className="cr-role-note">{x.note}</p> : null}
                <ul className="cr-role-meta">{x.meta.map((m) => <li key={m}>{m}</li>)}</ul>
                {saved[x.id] ? <p className="cr-role-saved">You have an unfinished application for this role.</p> : null}
                <button type="button" className="cr-role-go" onClick={() => choose(x.id)} aria-expanded={role === x.id}>
                  <span>Apply for this role</span><span className="cr-arrow"><Arrow /></span>
                </button>
                {saved[x.id] ? <button type="button" className="cr-role-resume" disabled={busy} onClick={() => { setRole(x.id); resume(x.id); }}>Continue my application</button> : null}
              </article>
            ))}
          </section>

          {notice ? <p className="cr-notice" role="status">{notice}</p> : null}
          {error && !role ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}

          <div ref={formRef} className="cr-formwrap">
            {role ? <ApplyForm key={role} role={role} saved={saved[role]} onSubmit={startFlow} busy={busy} error={error} fieldError={fieldError} preview={preview} /> : null}
          </div>

          <section className="cr-how" aria-labelledby="cr-how-h">
            <h2 className="cr-sec-h" id="cr-how-h">How it works</h2>
            <ol>
              <li><b>Share your details</b><span>Your name, WhatsApp number and city — plus your CV for trainer roles.</span></li>
              <li><b>Chat with our hiring assistant</b><span>A few written questions about your experience, then a short voice recording.</span></li>
              <li><b>Book your interview directly</b><span>If your profile fits the role, you pick a time for a short call right away.</span></li>
            </ol>
            <p className="cr-how-total">It all takes about 10 minutes, and your details stay confidential.</p>
          </section>
        </main>
      )}

      {!inFlow && !en && (
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
            {role ? <ApplyForm key={role} role={role} saved={saved[role]} onSubmit={startFlow} busy={busy} error={error} fieldError={fieldError} preview={preview} /> : null}
          </div>

          <section className="cr-how" aria-labelledby="cr-how-h">
            <h2 className="cr-sec-h" id="cr-how-h">كيف يتم التقديم</h2>
            <ol>
              <li><b>اختيار الوظيفة والبيانات</b><span>الاسم ورقم الواتساب والمدينة، والسيرة الذاتية للمدرّبين.</span></li>
              <li><b>محادثة قصيرة</b><span>أسئلة عن خبرتك مع مساعد التوظيف، بالكتابة.</span></li>
              <li><b>تسجيل صوتي</b><span>تسجيلات قصيرة بصوتك، نسمع فيها طريقة كلامك. لمستشاري القبول: تعريف بنفسك ومكالمتين تمثيليتين قصيرتين.</span></li>
              <li><b>موعد لقاء</b><span>إذا ناسب ملفك الوظيفة، يظهر لك حجز موعد لقاء قصير مباشرة.</span></li>
            </ol>
            <p className="cr-how-total">كل الخطوات تاخذ حوالي 10 دقائق، وبياناتك تبقى سرّية.</p>
          </section>
        </main>
      )}

      {inFlow && (
        <main className={`cr-flow cr-flow-${stage}`}>
          {(stage === "chat" || stage === "pay") && (
            <>
              {needsCv && stage === "chat" ? <CvCard app={app} gender={gender} required={cvRequired} onDone={() => setNeedsCv(false)} /> : null}
              <Chat messages={messages} typing={typing} onSend={send} error={error} gender={gender} options={options} multi={multi}
                onSkip={preview ? skipQuestion : undefined} onSkipAll={preview && stage === "chat" ? skipChat : undefined}
                hint={stage === "pay" ? "أسئلة الراتب ثابتة بنصها — هذا بالضبط اللي يشوفه المتقدم." : undefined} />
            </>
          )}

          {stage === "voice" && (
            <div className="cr-voicewrap">
              <h1 className="cr-flow-h">{en ? "Last step: record your voice" : g(gender, "خطوة أخيرة: سجّل/ي صوتك", "خطوة أخيرة: سجّل صوتك", "خطوة أخيرة: سجّلي صوتك")}</h1>
              {messages.length ? <div className="cr-card cr-intro" dir="auto">{messages[messages.length - 1].content}</div> : null}
              {keyNote ? <p className="cr-keynote" role="note"><b>{en ? "Key step" : "الأهم"}</b><span dir="auto">{keyNote}</span></p> : null}
              <p className="cr-hint cr-saved" role="note">{en
                ? "Your application is saved. If you need to stop, come back to this page on the same device and continue where you left off — and if you gave your email, we'll send you a link that works on any device."
                : g(gender, "طلبك محفوظ: لو احتجت/ي توقف/ين، ارجع/ي لهالصفحة من نفس الجهاز وكمّل/ي من نفس النقطة — ولو كتبت/ي إيميلك نرسل لك رابط يرجّعك لها من أي جهاز.",
                  "طلبك محفوظ: لو احتجت توقف، ارجع لهالصفحة من نفس الجهاز وكمّل من نفس النقطة — ولو كتبت إيميلك نرسل لك رابط يرجّعك لها من أي جهاز.",
                  "طلبك محفوظ: لو احتجتي توقفين، ارجعي لهالصفحة من نفس الجهاز وكمّلي من نفس النقطة — ولو كتبتي إيميلك نرسل لك رابط يرجّعك لها من أي جهاز.")}</p>
              {tasks.map((t) => <VoiceCard key={t.kind} task={t} app={app} gender={gender} onTasks={onTasks} onSkip={preview ? skipVoice : undefined} />)}
              {needsCv ? <CvCard app={app} gender={gender} required={cvRequired} onDone={() => setNeedsCv(false)} /> : null}
              {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
              <button type="button" className="cr-btn cr-btn-primary cr-submit" disabled={!allDone || (cvRequired && needsCv)} onClick={finish}>{en ? "Submit application" : "إرسال الطلب"} <Arrow /></button>
              {!allDone ? <p className="cr-hint cr-center">{en ? "Approve every recording to unlock submitting." : g(gender, "اعتمد/ي كل التسجيلات عشان يفتح الإرسال.", "اعتمد كل التسجيلات عشان يفتح الإرسال.", "اعتمدي كل التسجيلات عشان يفتح الإرسال.")}</p> : null}
            </div>
          )}

          {stage === "pledge" && pledge && (
            <div className="pl-wrap">
              <h1 className="cr-flow-h">{en ? "Last step: the trial commitment" : "آخر خطوة: تعهّد الالتزام بالتجربة"}</h1>
              <p className="cr-hint">{en
                ? "Your answers are saved. Before we receive your application, please read this pledge and sign it with your full name."
                : g(gender, "إجاباتك محفوظة. قبل ما يوصلنا طلبك، اقرأ/ي التعهّد ووقّع/ي باسمك الكامل.", "إجاباتك محفوظة. قبل ما يوصلنا طلبك، اقرأ التعهّد ووقّع باسمك الكامل.", "إجاباتك محفوظة. قبل ما يوصلنا طلبك، اقرئي التعهّد ووقّعي باسمك الكامل.")}</p>
              <PledgeCard pledge={pledge} en={en} mode="flow" busy={busy} error={error} fieldError={fieldError}
                onSign={signPledge} onDecline={declinePledge} declinedMsg={pledgeMsg} onBack={() => { setPledgeMsg(""); setError(""); }} />
              {pledgeMsg ? <a className="cr-btn cr-btn-ghost cr-center" href={en ? "/en" : "/"}>{en ? "Back to the home page" : "العودة للرئيسية"}</a> : null}
            </div>
          )}

          {stage === "finishing" && (
            <div className="cr-card cr-wait" role="status" aria-live="polite">
              <div className="cr-spinner" aria-hidden="true" />
              <h2>{en ? "Reviewing your answers…" : "نراجع إجاباتك…"}</h2>
              <p className="cr-hint">{en ? "This takes 10 to 30 seconds. Please don't close the page." : "يستغرق هذا من 10 إلى 30 ثانية. لا تغلق الصفحة."}</p>
            </div>
          )}

          {stage === "outcome" && outcome && (
            <div className="cr-outcome">
            <div className="cr-horizon" aria-hidden="true"><DawnSun id="cr-sun-out" /></div>
            {booking ? <BookedCard booking={booking} title={outcome.kind === "booked" ? outcome.title_ar : en ? "Your interview is booked" : "تم تأكيد موعدك"} body={outcome.kind === "booked" ? outcome.body_ar : ""} />
              : outcome.kind === "book" ? <SlotPicker outcome={outcome} slots={slots} loading={slotsLoading} onBook={book} busy={busy} error={error} gender={gender} />
                : (
                  <div className="cr-card cr-done" role="status">
                    <h2>{outcome.title_ar}</h2>
                    <p className="cr-lead">{outcome.body_ar}</p>
                    {en && outcome.suggest === "trainer" ? <button type="button" className="cr-btn cr-btn-primary" onClick={tryTrainer}>Apply as an English trainer <Arrow /></button> : null}
                    <a className="cr-btn cr-btn-ghost" href="/">{en ? "Back to the home page" : "العودة للرئيسية"}</a>
                  </div>
                )}
            {outcome.pledge ? <PledgeRef p={outcome.pledge} /> : null}
            <WhatNext kind={booking ? "booked" : outcome.kind} gender={gender} />
            {preview ? (
              <section className="cr-card cr-pv-out" aria-labelledby="cr-pv-out-h">
                <h3 id="cr-pv-out-h">معاينة: كل الشاشات اللي ممكن تظهر في النهاية</h3>
                {previewTag() ? <p className="cr-pv-note" role="note">«شهية العمولة» من إجاباتك في المعاينة: <b>{previewTag()}</b> (تظهر للإدارة فقط)</p> : null}
                <div className="cr-pv-tools">
                  {[["book", "مؤهل: اختيار موعد"], ["booked", "بعد حجز الموعد"], ["thanks", "شكرًا (بعد المراجعة)"], ["ko", "شكرًا (الأوقات ما تشمل المساء)"], ["under18", "أقل من 18 سنة"], ["withdrew", "انسحب بعد معرفة طبيعة الوظيفة"]].map(([k, l]) => (
                    <button key={k} type="button" className="cr-pv-btn" onClick={() => viewOutcome(k)}>{l}</button>
                  ))}
                </div>
                <button type="button" className="cr-btn cr-btn-ghost" onClick={() => reset(null)}>بدء معاينة جديدة</button>
              </section>
            ) : null}
            </div>
          )}
        </main>
      )}
    </div>
    </LangCtx.Provider>
  );
}
