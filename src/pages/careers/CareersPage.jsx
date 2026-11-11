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
    title: "مستشار/ة قبول ومبيعات",
    short: "مستشار القبول",
    line: "التواصل مع المهتمين الجدد بالأكاديمية بالمكالمات، وتقديم لقاء مبدئي مجاني لهم على Google Meet، ومساعدتهم في التسجيل، بالتعاون مع منسّقة الأكاديمية.",
    cvRequired: false,
  },
  trainer: {
    id: "trainer",
    title: "مدرّب/ة لغة إنجليزية",
    short: "مدرّب اللغة",
    line: "تدريب متعلمين سعوديين بالغين أونلاين، في مجموعات وبشكل فردي، على منهج طلاقة وكتابة تقرير بعد كل لقاء.",
    cvRequired: true,
  },
};

/** Pick the masculine/feminine form once gender is known; show both before. */
const g = (gender, both, m, f) => (gender === "m" ? m : gender === "f" ? f : both);

function BotBubbleText({ children }) {
  return <span className="cr-bubble-text" dir="auto">{children}</span>;
}

/* ───────────────────────── Turnstile (only if sitekey) ───────────────────────── */
function Turnstile({ onToken, resetKey }) {
  const box = useRef(null);
  const widget = useRef(null);
  useEffect(() => {
    if (!TURNSTILE_SITEKEY) return undefined;
    let dead = false;
    const mount = () => {
      if (dead || !box.current || !window.turnstile || widget.current != null) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITEKEY,
        theme: "dark",
        language: "ar",
        callback: (t) => onToken(t),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };
    if (window.turnstile) mount();
    else {
      let s = document.getElementById("cf-turnstile-api");
      if (!s) {
        s = document.createElement("script");
        s.id = "cf-turnstile-api";
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", mount);
    }
    return () => {
      dead = true;
      try { if (widget.current != null) window.turnstile?.remove(widget.current); } catch { /* ignore */ }
      widget.current = null;
    };
  }, [onToken]);
  useEffect(() => {
    try { if (widget.current != null) window.turnstile?.reset(widget.current); } catch { /* ignore */ }
  }, [resetKey]);
  if (!TURNSTILE_SITEKEY) return null;
  return <div ref={box} className="cr-turnstile" />;
}

/* ───────────────────────── Basics form ───────────────────────── */
function ApplyForm({ role, saved, onSubmit, busy, error, fieldError }) {
  const r = ROLES[role];
  const [f, setF] = useState(() => ({
    name: saved?.basics?.name || "", phone: saved?.basics?.phone || "", city: saved?.basics?.city || "",
    country: saved?.basics?.country || "السعودية", nationality: saved?.basics?.nationality || "",
    gender: saved?.basics?.gender || "", email: saved?.basics?.email || "",
  }));
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
    if (r.cvRequired && !file) x.cv = g(gd, "ارفق/ي سيرتك الذاتية", "ارفق سيرتك الذاتية", "أرفقي سيرتك الذاتية");
    if (TURNSTILE_SITEKEY && !token) x.captcha = "أكّد أنك لست روبوت";
    setErrs(x);
    if (Object.keys(x).length) {
      requestAnimationFrame(() => document.querySelector(".cr-form [aria-invalid='true']")?.focus());
      return;
    }
    onSubmit({
      basics: { ...f, name: f.name.trim(), phone: toAscii(f.phone).trim(), city: f.city.trim(), country: f.country.trim(), nationality: f.nationality.trim(), email: f.email.trim() },
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
      <h2 id="cr-form-h">{g(gd, "قدّم/ي على", "قدّم على", "قدّمي على")} وظيفة {r.title}</h2>
      <p className="cr-sub">{g(gd, "عبّ/ي بياناتك الأساسية، وبعدها محادثة قصيرة مع مساعد التوظيف. تاخذ منك حوالي 10 دقائق.", "عبّ بياناتك الأساسية، وبعدها محادثة قصيرة مع مساعد التوظيف. تاخذ منك حوالي 10 دقائق.", "عبّي بياناتك الأساسية، وبعدها محادثة قصيرة مع مساعد التوظيف. تاخذ منك حوالي 10 دقائق.")}</p>

      {field("name", "الاسم الكامل", { autoComplete: "name", enterKeyHint: "next" })}
      {field("phone", "رقم الواتساب", { type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr", placeholder: "05xxxxxxxx", enterKeyHint: "next" })}
      <div className="cr-row">
        {field("city", "المدينة", { autoComplete: "address-level2", enterKeyHint: "next" })}
        {field("country", "الدولة", { autoComplete: "country-name", enterKeyHint: "next" })}
      </div>
      {field("nationality", "الجنسية", { enterKeyHint: "next" })}

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

      <Turnstile onToken={setToken} resetKey={resetKey} />
      {errs.captcha ? <p className="cr-err" role="alert">{errs.captcha}</p> : null}
      {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}

      <button type="submit" className="cr-btn cr-btn-primary" disabled={busy}>
        {busy ? "لحظات…" : g(gd, "ابدأ/ي المحادثة", "ابدأ المحادثة", "ابدئي المحادثة")}
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
function Chat({ messages, typing, onSend, error, gender, disabled }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const taRef = useRef(null);
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
    onSend(v, () => setText(""));
    requestAnimationFrame(() => { if (taRef.current) taRef.current.style.height = "auto"; });
  };
  const onKey = (e) => {
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    if (e.key === "Enter" && !e.shiftKey && fine && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
  };

  return (
    <>
      <div className="cr-chat" role="log" aria-live="polite" aria-label="المحادثة">
        {messages.map((m, i) => (
          <div key={i} className={`cr-msg ${m.role === "bot" ? "bot" : "me"}`}>
            <div className="cr-bubble"><BotBubbleText>{m.content}</BotBubbleText></div>
          </div>
        ))}
        {typing ? (
          <div className="cr-msg bot"><div className="cr-bubble cr-typing" role="status" aria-label="يكتب"><i /><i /><i /></div></div>
        ) : null}
        <div ref={endRef} />
      </div>
      <div className="cr-composer">
        {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
        <div className="cr-composer-row">
          <label htmlFor="cr-msg" className="cr-sr">{g(gender, "اكتب/ي ردّك", "اكتب ردّك", "اكتبي ردّك")}</label>
          <textarea
            id="cr-msg" ref={taRef} rows={1} dir="auto" value={text} maxLength={1500}
            placeholder={g(gender, "اكتب/ي ردّك هنا…", "اكتب ردّك هنا…", "اكتبي ردّك هنا…")}
            onChange={(e) => { setText(e.target.value); grow(); }} onKeyDown={onKey} disabled={disabled}
          />
          <button type="button" className="cr-send" onClick={send} disabled={!text.trim() || typing || disabled} aria-label="إرسال">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3.4 11.2 20 3.6c.8-.4 1.6.4 1.2 1.2l-7.6 16.6c-.4.8-1.5.7-1.8-.1l-2-5.7-5.7-2c-.8-.3-.9-1.4-.1-1.8l-.6-.6Z" fill="currentColor" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Voice ───────────────────────── */
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function VoiceCard({ task, app, gender, onTasks }) {
  const [mode, setMode] = useState("idle"); // idle | recording | recorded | uploading
  const [elapsed, setElapsed] = useState(0);
  const [rec, setRec] = useState(null); // { blob, seconds, url, mime, ext }
  const [err, setErr] = useState("");
  const [noMic, setNoMic] = useState(false);
  const recorder = useRef(null);
  const timer = useRef(null);
  const startedAt = useRef(0);

  useEffect(() => () => { clearInterval(timer.current); recorder.current?.cancel(); }, []);
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

  const start = async () => {
    setErr("");
    try {
      const r = await startWavRecording({ maxMs: task.max_s * 1000, onAutoStop: () => finishRecording() });
      recorder.current = r;
      startedAt.current = performance.now();
      setElapsed(0);
      setMode("recording");
      timer.current = setInterval(() => setElapsed((performance.now() - startedAt.current) / 1000), 200);
    } catch (x) {
      setNoMic(true);
      setErr(x?.name === "NotAllowedError" || x?.name === "SecurityError"
        ? "ما قدرنا نوصل للمايك. يمكن السماح له من إعدادات المتصفح، أو رفع ملف صوتي بدلًا منه."
        : "التسجيل غير متاح في هذا المتصفح. يمكن رفع ملف صوتي بدلًا منه.");
    }
  };

  const pickAudio = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
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

  const redo = () => { setRec(null); setMode("idle"); setErr(""); };
  const tooShort = rec && rec.seconds < task.min_s;

  const submit = async () => {
    if (!rec || tooShort) return;
    setMode("uploading"); setErr("");
    try {
      const res = await uploadAndAttach(app, { kind: task.kind, blob: rec.blob, mime: rec.mime, ext: rec.ext, seconds: Math.min(rec.seconds, task.max_s) });
      setRec(null); setMode("idle");
      onTasks(res.voice_tasks);
    } catch (x) {
      setMode("recorded");
      if (x instanceof ApiError && x.code === "AUTH") onTasks(null, x); else setErr(x.messageAr || "ما انرفع التسجيل. نرجو المحاولة مرة ثانية.");
    }
  };

  const isEn = task.kind === "voice_en";
  return (
    <section className={`cr-card cr-voice${task.done && mode === "idle" ? " done" : ""}`} aria-labelledby={`cr-v-${task.kind}`}>
      <div className="cr-voice-head">
        <h3 id={`cr-v-${task.kind}`}>{task.title_ar}</h3>
        {task.done ? <span className="cr-badge">تم الإرسال</span> : null}
      </div>
      <p className="cr-voice-prompt" dir="auto">{task.prompt_ar}</p>
      <p className="cr-hint">المدة: من {task.min_s} إلى {task.max_s} ثانية{isEn ? " (بالإنجليزية)" : ""}.</p>

      {mode === "idle" && (
        <div className="cr-voice-actions">
          {!noMic && (
            <button type="button" className="cr-btn cr-btn-primary" onClick={start}>
              <span className="cr-dot" aria-hidden="true" /> {task.done ? g(gender, "أعد/ي التسجيل", "أعد التسجيل", "أعيدي التسجيل") : g(gender, "ابدأ/ي التسجيل", "ابدأ التسجيل", "ابدئي التسجيل")}
            </button>
          )}
          <label className="cr-btn cr-btn-ghost cr-filebtn">
            {noMic ? "رفع ملف صوتي" : "أو رفع ملف صوتي"}
            <input type="file" accept="audio/*" onChange={pickAudio} />
          </label>
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
            <button type="button" className="cr-btn cr-btn-ghost" onClick={redo} disabled={mode === "uploading"}>إعادة التسجيل</button>
          </div>
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
      <div className="cr-check" aria-hidden="true">✓</div>
      <h2>{title || "تم تأكيد موعدك"}</h2>
      {body ? <p className="cr-lead">{body}</p> : null}
      <p className="cr-when">{booking.when_ar}</p>
      <div className="cr-actions">
        {booking.gcal ? <a className="cr-btn cr-btn-primary" href={booking.gcal} target="_blank" rel="noopener noreferrer">أضف للتقويم</a> : null}
        {booking.meet_link ? <a className="cr-btn cr-btn-ghost" href={booking.meet_link} target="_blank" rel="noopener noreferrer">رابط اللقاء (Google Meet)</a> : null}
        {booking.wa_link ? <a className="cr-btn cr-btn-ghost" href={booking.wa_link} target="_blank" rel="noopener noreferrer">تغيير الموعد عبر واتساب</a> : null}
      </div>
    </div>
  );
}

function SlotPicker({ outcome, slots, onBook, busy, error, gender }) {
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
      {slots.length === 0 ? <p className="cr-hint">ما فيه مواعيد متاحة الآن. سنتواصل معك على واتساب لتحديد الموعد.</p> : (
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
          <button type="button" className="cr-btn cr-btn-primary" disabled={!sel || busy} onClick={() => onBook(sel)}>{busy ? "لحظات…" : "أكّد الموعد"}</button>
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
  const [tasks, setTasks] = useState([]);
  const [needsCv, setNeedsCv] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [notice, setNotice] = useState("");
  const [outcome, setOutcome] = useState(null);
  const [slots, setSlots] = useState([]);
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
    setApp(null); setMessages([]); setTasks([]); setOutcome(null); setSlots([]); setBooking(null);
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
      try { const r = await call("slots", { application_id: a.id, token: a.token }); setSlots(r.slots || []); }
      catch (x) { setSlots([]); setError(x.messageAr || ""); }
    }
    window.scrollTo?.(0, 0);
  }, []);

  const enter = useCallback(async (res, a) => {
    setMessages(res.messages || []);
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

  const startFlow = useCallback(async ({ basics, file, hp, elapsed_ms, turnstile_token }) => {
    setBusy(true); setError(""); setFieldError(""); setNotice("");
    const prev = loadSaved(role);
    const att = (() => { try { return getAttribution(); } catch { return {}; } })();
    const qs = new URLSearchParams(window.location.search);
    const body = {
      role, turnstile_token, hp, elapsed_ms,
      basics: { name: basics.name, phone: basics.phone, city: basics.city, country: basics.country, nationality: basics.nationality, gender: basics.gender, email: basics.email },
      source: {
        utm_source: att.utm_source || qs.get("utm_source") || "", utm_medium: att.utm_medium || qs.get("utm_medium") || "",
        utm_campaign: att.utm_campaign || qs.get("utm_campaign") || "", ref: qs.get("ref") || att.referrer || "",
        landing: `${window.location.pathname}${window.location.search}`,
      },
    };
    if (prev) body.resume = { application_id: prev.application_id, token: prev.token };
    try {
      const res = await call("start", body);
      const a = { id: res.application_id, token: res.token, role, basics };
      saveApp(role, { application_id: a.id, token: a.token, basics });
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
      const res = await call("start", { role, turnstile_token: null, hp: "", elapsed_ms: 60000, basics: s.basics, source: { landing: "/careers" }, resume: { application_id: s.application_id, token: s.token } });
      const a = { id: res.application_id, token: res.token, role, basics: s.basics };
      saveApp(role, { application_id: a.id, token: a.token, basics: s.basics });
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
  const send = useCallback(async (text, clear) => {
    setError("");
    setMessages((m) => [...m, { role: "applicant", content: text }]);
    clear();
    setTyping(true);
    try {
      const res = await guard(() => call("message", { application_id: app.id, token: app.token, text }), role);
      if (!res) return;
      setMessages((m) => [...m, { role: "bot", content: res.reply }]);
      if (res.step === "voice") { setTasks(res.voice_tasks || []); setStage("voice"); window.scrollTo?.(0, 0); }
    } catch (x) {
      setMessages((m) => m.slice(0, -1));
      setError(x.messageAr || "ما وصلت رسالتك. نرجو المحاولة مرة ثانية.");
    } finally { setTyping(false); }
  }, [app, role, guard]);

  /* voice */
  const onTasks = (next, authErr) => {
    if (authErr) { reset(role, "انتهت جلسة طلبك. نحتاج بياناتك من جديد للمتابعة."); return; }
    setTasks(next || []);
  };
  const allDone = tasks.length > 0 && tasks.every((t) => t.done);
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
    <div className="cr-root" dir="rtl" lang="ar">
      <style>{css}</style>
      <Seo path="/careers" />

      <header className="cr-top">
        <a href="/" className="cr-brand" aria-label="أكاديمية طلاقة">
          <BrandMark size={26} /><span>طلاقة</span>
        </a>
        {inFlow && r ? <span className="cr-top-role">{r.title}</span> : null}
      </header>

      {!inFlow && (
        <main>
          <section className="cr-hero">
            <p className="cr-eyebrow">وظائف في أكاديمية طلاقة</p>
            <h1>انضم لفريق طلاقة</h1>
            <p className="cr-lead">أكاديمية إنجليزي أونلاين للبالغين في السعودية، مدرّبونا حقيقيون ونشتغل على منصّتنا الخاصة.</p>
            <ul className="cr-perks">
              <li>عن بُعد بالكامل</li>
              <li>ساعات مرنة</li>
              <li>أثر حقيقي على المتعلمين</li>
            </ul>
          </section>

          <section className="cr-roles" aria-label="الوظائف المتاحة">
            {Object.values(ROLES).map((x) => (
              <article key={x.id} className={`cr-card cr-role${role === x.id ? " on" : ""}`}>
                <h2>{x.title}</h2>
                <p>{x.line}</p>
                {saved[x.id] ? <p className="cr-hint">عندك طلب غير مكتمل لهذه الوظيفة.</p> : null}
                <button type="button" className="cr-btn cr-btn-primary" onClick={() => choose(x.id)} aria-expanded={role === x.id}>قدّم/ي الآن</button>
                {saved[x.id] ? <button type="button" className="cr-btn cr-btn-ghost" disabled={busy} onClick={() => { setRole(x.id); resume(x.id); }}>أكمل/ي طلبك</button> : null}
              </article>
            ))}
          </section>

          {notice ? <p className="cr-notice" role="status">{notice}</p> : null}
          {error && !role ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}

          <div ref={formRef} className="cr-formwrap">
            {role ? <ApplyForm key={role} role={role} saved={saved[role]} onSubmit={startFlow} busy={busy} error={error} fieldError={fieldError} /> : null}
          </div>
        </main>
      )}

      {inFlow && (
        <main className={`cr-flow cr-flow-${stage}`}>
          {stage === "chat" && (
            <>
              {needsCv ? <CvCard app={app} gender={gender} required={cvRequired} onDone={() => setNeedsCv(false)} /> : null}
              <Chat messages={messages} typing={typing} onSend={send} error={error} gender={gender} />
            </>
          )}

          {stage === "voice" && (
            <div className="cr-voicewrap">
              <h1 className="cr-flow-h">{g(gender, "خطوة أخيرة: سجّل/ي صوتك", "خطوة أخيرة: سجّل صوتك", "خطوة أخيرة: سجّلي صوتك")}</h1>
              {messages.length ? <div className="cr-card cr-intro" dir="auto">{messages[messages.length - 1].content}</div> : null}
              {tasks.map((t) => <VoiceCard key={t.kind} task={t} app={app} gender={gender} onTasks={onTasks} />)}
              {needsCv ? <CvCard app={app} gender={gender} required={cvRequired} onDone={() => setNeedsCv(false)} /> : null}
              {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
              <button type="button" className="cr-btn cr-btn-primary cr-submit" disabled={!allDone || (cvRequired && needsCv)} onClick={finish}>إرسال الطلب</button>
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
            booking ? <BookedCard booking={booking} title={outcome.kind === "booked" ? outcome.title_ar : "تم تأكيد موعدك"} body={outcome.kind === "booked" ? outcome.body_ar : ""} />
              : outcome.kind === "book" ? <SlotPicker outcome={outcome} slots={slots} onBook={book} busy={busy} error={error} gender={gender} />
                : (
                  <div className="cr-card cr-done" role="status">
                    <div className="cr-check" aria-hidden="true">✓</div>
                    <h2>{outcome.title_ar}</h2>
                    <p className="cr-lead">{outcome.body_ar}</p>
                    <a className="cr-btn cr-btn-ghost" href="/">العودة للرئيسية</a>
                  </div>
                )
          )}
        </main>
      )}
    </div>
  );
}
