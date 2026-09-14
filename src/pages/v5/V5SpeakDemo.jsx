import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, EASE, staggerParent, staggerItem } from "../v1/motion";
import { getVisitorId } from "../../utils/affiliateTracking";
import { startWavRecording, isInAppBrowser } from "../../lib/wavRecorder";
import { track } from "../../lib/track";

/**
 * V5SpeakDemo — «قلها بالإنجليزي».
 *
 * The hero promises «إنجليزي تتكلّمه». Everything else on the page describes that;
 * this section lets a stranger TEST it before scrolling any further: pick a real
 * situation, say one English sentence, and in a few seconds see what was heard,
 * the correct form, how a confident speaker says it (and hear it), and why — in
 * Arabic. It is the speaking coach inside the platform, handed to a visitor.
 *
 * Backend: the LMS edge function `speak-demo` (hear → coach → voice, each step
 * token-bound, budget-capped, nothing about the visitor stored). The scene TEXT
 * shown here is display only — the server holds its own copy of each scene and
 * only ever receives the id.
 *
 * Prerendered: nothing reads window/navigator during render; the in-app-browser
 * notice appears after mount.
 */

const FN = "https://nmjexpuycmqcxuxljier.supabase.co/functions/v1/speak-demo";
const MIN_SECONDS = 1.2; // shorter taps make Whisper invent words
const MAX_MS = 15000;

const SCENES = [
  { id: "late-meeting", label: "تأخّر عن اجتماع", ar: "إبلاغ الزميل بالتأخر 10 دقائق عن الاجتماع بسبب الزحمة" },
  { id: "introduce-yourself", label: "تعريف بنفسك", ar: "التعريف بنفسك وبعملك في أول اجتماع مع فريق جديد" },
  { id: "extend-deadline", label: "تمديد موعد تسليم", ar: "طلب يومين إضافيين من المدير لتسليم التقرير" },
  { id: "client-delay", label: "اعتذار لعميل", ar: "الاعتذار لعميل عن تأخر الشحنة وإعطاؤه موعداً جديداً" },
  { id: "coffee-order", label: "طلب قهوة", ar: "طلب قهوة لاتيه كبيرة بحليب قليل الدسم في مقهى" },
  { id: "airport-gate", label: "في المطار", ar: "السؤال في المطار عن بوابة الرحلة المتأخرة" },
  { id: "hotel-room", label: "في الفندق", ar: "طلب تغيير الغرفة في الفندق لأن المكيّف لا يعمل" },
  { id: "doctor-visit", label: "عند الطبيب", ar: "إخبار الطبيب أن الصداع مستمر منذ ثلاثة أيام" },
];

const VERDICT = {
  natural: { tone: "good", text: "جملة سليمة وطبيعية" },
  minor_fixes: { tone: "azure", text: "قريبة جداً — تعديلات بسيطة" },
  needs_work: { tone: "gold", text: "المعنى وصل — والجملة تحتاج بعض الضبط" },
  arabic_speech: { tone: "gold", text: "سمعناها بالعربي — وهكذا تُقال بالإنجليزي" },
  off_task: { tone: "gold", text: "يبدو أن الجملة لموقف آخر" },
};

const ERRORS = {
  denied: "لم نتمكّن من الوصول إلى الميكروفون. يمكن السماح بالوصول إليه من إعدادات المتصفح، أو كتابة الجملة في الأسفل.",
  unsupported: "هذا المتصفح لا يدعم التسجيل الصوتي. يمكن كتابة الجملة في الأسفل بدلاً منه.",
  short: "التسجيل قصير جداً — نحتاج جملة كاملة.",
  long: "الجملة طويلة — جملة واحدة قصيرة تكفي.",
  unclear: "ما وصلنا صوت واضح. جرّب مرة ثانية والجوال قريب منك.",
  busy: "الإقبال على التجربة كبير الآن. جرّب بعد دقائق.",
  failed: "تعذّر التصحيح هذه المرة. جرّب مرة ثانية.",
};

function visitor() {
  try { return getVisitorId(); } catch { return null; }
}

async function post(fields, ms = 30000) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => v != null && fd.append(k, v));
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(FN, { method: "POST", body: fd, signal: ctrl.signal });
    const isJson = (r.headers.get("content-type") || "").includes("json");
    return { ok: r.ok, status: r.status, data: isJson ? await r.json() : await r.blob() };
  } finally {
    clearTimeout(t);
  }
}

const errorKind = (res) => {
  if (!res) return "failed";
  const e = res.data?.error;
  if (res.status === 429 || e === "busy" || e === "slow_down") return "busy";
  if (e === "too_long") return "long";
  return "failed";
};

/**
 * Word-level diff of what was said against the corrected sentence (LCS on
 * normalised words). Returns, for each side, runs of { text, changed } so the
 * said line strikes exactly the words that changed and the corrected line
 * highlights exactly the words that replaced them — independent of the notes.
 */
function diffWords(a, b) {
  const A = String(a || "").split(/\s+/).filter(Boolean);
  const B = String(b || "").split(/\s+/).filter(Boolean);
  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
  const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let x = n - 1; x >= 0; x--)
    for (let y = m - 1; y >= 0; y--)
      L[x][y] = norm(A[x]) === norm(B[y]) ? L[x + 1][y + 1] + 1 : Math.max(L[x + 1][y], L[x][y + 1]);
  const keepA = new Array(n).fill(false), keepB = new Array(m).fill(false);
  for (let x = 0, y = 0; x < n && y < m; ) {
    if (norm(A[x]) === norm(B[y])) { keepA[x++] = true; keepB[y++] = true; }
    else if (L[x + 1][y] >= L[x][y + 1]) x++;
    else y++;
  }
  const runs = (words, keep) => words.reduce((out, w, k) => {
    const changed = !keep[k];
    const last = out[out.length - 1];
    if (last && last.changed === changed) last.text += " " + w;
    else out.push({ text: w, changed });
    return out;
  }, []);
  return { said: runs(A, keepA), fixed: runs(B, keepB) };
}

function Runs({ runs, tone }) {
  return runs.map((r, i) => (
    <span key={i}>
      {i > 0 ? " " : null}
      {r.changed ? <mark className={`sd-mark sd-mark-${tone}`}>{r.text}</mark> : r.text}
    </span>
  ));
}

export default function V5SpeakDemo() {
  const [sceneId, setSceneId] = useState(SCENES[0].id);
  const [phase, setPhase] = useState("idle"); // idle | recording | hearing | coaching | result | error
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [typedOpen, setTypedOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [inApp, setInApp] = useState(false);
  const [voice, setVoice] = useState({ state: "idle", url: null });
  const [playing, setPlaying] = useState(false);

  const recRef = useRef(null);
  const timerRef = useRef(null);
  const meterRef = useRef(null);
  const audioRef = useRef(null);
  const stageRef = useRef(null);
  const stoppingRef = useRef(false);
  const runRef = useRef(0); // bumps on every new attempt; late responses from an old one are dropped

  const scene = SCENES.find((s) => s.id === sceneId) || SCENES[0];

  useEffect(() => {
    const inside = isInAppBrowser();
    setInApp(inside);
    if (inside) setTypedOpen(true);
    return () => {
      recRef.current?.cancel();
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => () => { if (voice.url) URL.revokeObjectURL(voice.url); }, [voice.url]);

  const fail = (kind) => {
    setError(kind);
    setPhase("error");
    track("speak_demo_error", { reason: kind, scene: sceneId });
  };

  const loadVoice = async (natural, token, run) => {
    if (!natural || !token) return;
    setVoice({ state: "loading", url: null });
    try {
      const res = await post({ action: "voice", natural, voice_token: token }, 20000);
      if (!res.ok || !(res.data instanceof Blob)) throw new Error("voice");
      if (run !== runRef.current) return;
      setVoice({ state: "ready", url: URL.createObjectURL(res.data) });
    } catch {
      if (run === runRef.current) setVoice({ state: "failed", url: null });
    }
  };

  const runCoach = async (fields, typed) => {
    const run = runRef.current;
    setPhase("coaching");
    let res;
    try {
      res = await post({ action: "coach", scene_id: sceneId, visitor_id: visitor(), ...fields });
    } catch {
      return run === runRef.current && fail("failed");
    }
    if (run !== runRef.current) return;
    if (!res.ok || !res.data?.verdict) return fail(errorKind(res));
    setResult(res.data);
    setPhase("result");
    track("speak_demo_result", { verdict: res.data.verdict, typed, scene: sceneId });
    loadVoice(res.data.natural, res.data.voice_token, run);
    // On a phone the result grows below the fold — bring the stage up to it.
    requestAnimationFrame(() => {
      if (!window.matchMedia("(max-width: 900px)").matches) return;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      stageRef.current?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
    });
  };

  const reset = () => {
    runRef.current += 1;
    setPhase("idle");
    setTranscript("");
    setResult(null);
    setError(null);
    setPlaying(false);
    setVoice({ state: "idle", url: null });
  };

  const startRecording = async () => {
    if (phase === "recording") return;
    reset();
    stoppingRef.current = false;
    if (!visitor()) return fail("unsupported");
    try {
      recRef.current = await startWavRecording({
        maxMs: MAX_MS,
        onLevel: (lvl) => meterRef.current?.style.setProperty("--lvl", lvl.toFixed(3)),
        onAutoStop: () => stopRecording(),
      });
    } catch (e) {
      return fail(e?.name === "NotAllowedError" || e?.name === "SecurityError" ? "denied" : "unsupported");
    }
    track("speak_demo_start", { scene: sceneId });
    const t0 = Date.now();
    setElapsed(0);
    setPhase("recording");
    timerRef.current = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100);
  };

  async function stopRecording() {
    if (stoppingRef.current || !recRef.current) return;
    stoppingRef.current = true;
    clearInterval(timerRef.current);
    const rec = recRef.current;
    recRef.current = null;
    let out;
    try {
      out = await rec.stop();
    } catch {
      return fail("failed");
    }
    if (out.seconds < MIN_SECONDS) return fail("short");

    setPhase("hearing");
    let res;
    try {
      res = await post({ action: "hear", scene_id: sceneId, visitor_id: visitor(), audio: new File([out.blob], "sentence.wav", { type: "audio/wav" }) });
    } catch {
      return fail("failed");
    }
    if (res.ok && res.data?.unclear) return fail("unclear");
    if (!res.ok || !res.data?.hear_token) return fail(errorKind(res));
    setTranscript(res.data.transcript);
    runCoach({ transcript: res.data.transcript, hear_token: res.data.hear_token }, false);
  }

  const submitTyped = (e) => {
    e.preventDefault();
    const text = typedText.trim();
    if (text.length < 3) return;
    reset();
    setTranscript(text);
    track("speak_demo_start", { scene: sceneId, typed: true });
    runCoach({ text }, true);
  };

  const pickScene = (id) => {
    if (phase === "recording" || phase === "hearing" || phase === "coaching") return;
    setSceneId(id);
    reset();
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (!a.paused) { a.pause(); a.currentTime = 0; return; }
    a.play();
    track("speak_demo_listen", { scene: sceneId });
  };

  const busy = phase === "hearing" || phase === "coaching";
  const verdict = result ? VERDICT[result.verdict] : null;
  const notes = result?.notes || [];
  const diff = result && result.corrected && result.verdict !== "arabic_speech" && result.verdict !== "off_task"
    && result.corrected.trim() !== (result.transcript || "").trim()
    ? diffWords(result.transcript, result.corrected)
    : null;

  return (
    <section className="sd" id="speak" aria-labelledby="sd-title">
      <div className="v1-container sd-grid">
        {/* ── copy + situations ── */}
        <Reveal className="sd-copy">
          <span className="v1-eyebrow">جرّبها الآن · بصوتك</span>
          <h2 id="sd-title" className="v1-headline sd-title">
            قلها بالإنجليزي، <span className="sd-accent">ونصحّحها في ثوانٍ.</span>
          </h2>
          <p className="v1-intro sd-intro">
            اختر موقفاً من يومك وقل جملة واحدة بالإنجليزي. تظهر لك الصيغة الصحيحة، وتسمع كيف تُقال بثقة، مع
            شرح قصير بالعربي. هذا هو المدرّب الذكي نفسه الذي يرافق طلابنا داخل المنصة.
          </p>

          <div className="sd-scenes" role="radiogroup" aria-label="اختر موقفاً">
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={s.id === sceneId}
                className="sd-scene"
                onClick={() => pickScene(s.id)}
                disabled={busy || phase === "recording"}
              >
                {s.label}
              </button>
            ))}
          </div>

          <p className="sd-privacy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            لا نحتفظ بتسجيلك — يُحلَّل لحظياً للتصحيح فقط.
          </p>
        </Reveal>

        {/* ── the stage ── */}
        <Reveal delay={0.08} y={20}>
          <div className="sd-stage" data-phase={phase} data-tone={phase === "result" && verdict ? verdict.tone : undefined} ref={stageRef}>
            <div className="sd-stage-head">
              <span className="sd-live" aria-hidden />
              <span className="sd-stage-label">الموقف</span>
              <span className="sd-stage-tag">{scene.label}</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={scene.id}
                className="sd-prompt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {scene.ar}
              </motion.p>
            </AnimatePresence>

            <div className="sd-body" aria-live="polite">
              {(phase === "idle" || phase === "recording") && (
                <div className="sd-mic-wrap">
                  <button
                    type="button"
                    className={`sd-mic${phase === "recording" ? " is-rec" : ""}`}
                    onClick={phase === "recording" ? stopRecording : startRecording}
                    aria-label={phase === "recording" ? "إنهاء التسجيل" : "بدء التسجيل"}
                    ref={meterRef}
                    style={{ "--p": Math.min(1, elapsed / (MAX_MS / 1000)) }}
                  >
                    <span className="sd-mic-ring" aria-hidden />
                    <span className="sd-mic-pulse" aria-hidden />
                    {phase === "recording" ? (
                      <span className="sd-stop" aria-hidden />
                    ) : (
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                  <div className="sd-mic-caption">
                    {phase === "recording" ? (
                      <>
                        <b className="v1-num" dir="ltr">{elapsed.toFixed(1)}s</b>
                        <span>نسمعك… اضغط للإنهاء</span>
                      </>
                    ) : (
                      <span>اضغط مرة، ثم قل الجملة بالإنجليزي</span>
                    )}
                  </div>
                </div>
              )}

              {busy && (
                <div className="sd-working">
                  {transcript ? (
                    <div className="sd-heard">
                      <span className="sd-heard-k">سمعنا منك</span>
                      <p className="sd-en" dir="ltr">{transcript}</p>
                    </div>
                  ) : null}
                  <div className="sd-thinking">
                    <span className="sd-dots" aria-hidden><i /><i /><i /></span>
                    {phase === "hearing" ? "نسمع جملتك…" : "نراجع الجملة كما يراجعها مدرّب…"}
                  </div>
                </div>
              )}

              {phase === "result" && result && (
                <motion.div className="sd-result" variants={staggerParent} initial="hidden" animate="show">
                  {verdict && (
                    <motion.div variants={staggerItem}>
                      <span className={`sd-verdict sd-tone-${verdict.tone}`}>{verdict.text}</span>
                    </motion.div>
                  )}

                  {result.verdict !== "arabic_speech" && (
                    <motion.div variants={staggerItem} className="sd-diff" dir="ltr">
                      <div className="sd-diff-row is-said">
                        <p className="sd-en sd-said">{diff ? <Runs runs={diff.said} tone="bad" /> : result.transcript}</p>
                        <span className="sd-diff-k">قلت</span>
                      </div>
                      {diff && (
                        <div className="sd-diff-row is-fixed">
                          <p className="sd-en"><Runs runs={diff.fixed} tone="good" /></p>
                          <span className="sd-diff-k">الأصح</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {result.natural && (
                    <motion.div variants={staggerItem} className="sd-row-natural">
                      <span className="sd-natural-k">كيف تُقال بثقة</span>
                      <div className="sd-natural">
                        <p className="sd-en" dir="ltr">{result.natural}</p>
                        {voice.state !== "failed" && result.voice_token && (
                          <button
                            type="button"
                            className={`sd-play${playing ? " is-playing" : ""}`}
                            disabled={voice.state !== "ready"}
                            onClick={togglePlay}
                            aria-label="تشغيل الجملة"
                            aria-pressed={playing}
                          >
                            {voice.state === "ready" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                            ) : (
                              <span className="sd-dots sd-dots-sm" aria-hidden><i /><i /><i /></span>
                            )}
                          </button>
                        )}
                        {voice.url && (
                          <audio
                            ref={audioRef}
                            src={voice.url}
                            preload="auto"
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            onEnded={() => setPlaying(false)}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {notes.length > 0 && (
                    <motion.ul variants={staggerItem} className="sd-notes">
                      {notes.map((n, i) => (
                        <li key={i}>
                          {n.from || n.to ? (
                            <span className="sd-fix" dir="ltr">
                              {n.from ? <s>{n.from}</s> : null}
                              {n.from && n.to ? <span aria-hidden>→</span> : null}
                              {n.to ? <b>{n.to}</b> : null}
                            </span>
                          ) : null}
                          <span className="sd-why">{n.why_ar}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}

                  <motion.div variants={staggerItem} className="sd-actions">
                    <button type="button" className="v1-cta v1-cta-primary sd-cta" data-open-form data-tier="talaqa"
                      onClick={() => track("speak_demo_cta", { verdict: result.verdict })}>
                      ابدأ بمحادثة مع مدرّب
                    </button>
                    <button type="button" className="sd-again" onClick={reset}>جملة أخرى</button>
                  </motion.div>
                </motion.div>
              )}

              {phase === "error" && (
                <div className="sd-error" role="alert">
                  <p>{ERRORS[error] || ERRORS.failed}</p>
                  {error === "denied" || error === "unsupported" ? (
                    <button type="button" className="sd-again" onClick={() => { reset(); setTypedOpen(true); }}>اكتب الجملة بدلاً من ذلك</button>
                  ) : (
                    <button type="button" className="sd-again" onClick={reset}>جرّب مرة ثانية</button>
                  )}
                </div>
              )}
            </div>

            {/* typed fallback (in-app browsers, denied mic, or just preference) */}
            <div className="sd-typed">
              {inApp && (
                <p className="sd-inapp">داخل تطبيقات مثل تيك توك وإنستقرام قد لا يعمل الميكروفون. يمكن فتح الصفحة في المتصفح، أو كتابة الجملة هنا.</p>
              )}
              {typedOpen ? (
                <form onSubmit={submitTyped} className="sd-typed-form">
                  <input
                    dir="ltr"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="Type your sentence in English…"
                    maxLength={220}
                    disabled={busy}
                    aria-label="اكتب الجملة بالإنجليزي"
                  />
                  <button type="submit" disabled={busy || typedText.trim().length < 3}>صحّحها</button>
                </form>
              ) : (
                <button type="button" className="sd-typed-toggle" onClick={() => setTypedOpen(true)}>
                  أو اكتب الجملة بدل التسجيل
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        .v1-scope .sd { position: relative; padding-block: clamp(64px, 9vw, 120px); isolation: isolate; scroll-margin-top: 72px; }
        .v1-scope .sd::before {
          content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
          background:
            radial-gradient(ellipse 46% 60% at 22% 50%, rgba(56, 189, 248, 0.09), transparent 70%),
            radial-gradient(ellipse 30% 40% at 80% 20%, rgba(247, 169, 123, 0.05), transparent 70%);
        }
        .v1-scope .sd-grid {
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
          gap: clamp(32px, 5vw, 72px); align-items: start;
        }
        @media (min-width: 901px) {
          .v1-scope .sd-copy { position: sticky; top: 112px; padding-top: 18px; }
        }
        .v1-scope .sd-title { font-size: var(--v1-d2); margin-top: 14px; }
        .v1-scope .sd-accent {
          display: block; width: fit-content;
          background: linear-gradient(100deg, var(--v1-azure-soft), var(--v1-azure) 60%, #a5b4fc);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .v1-scope .sd-intro { max-width: 52ch; text-wrap: pretty; }

        .v1-scope .sd-scenes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 26px; }
        .v1-scope .sd-scene {
          display: inline-flex; align-items: center; min-height: 44px;
          font: 600 0.86rem/1.2 var(--v1-display); color: var(--v1-t-mute);
          padding: 0 16px; border-radius: 999px; cursor: pointer;
          background: rgba(148, 197, 255, 0.04); border: 1px solid var(--v1-line);
          transition: color var(--v1-fast), background var(--v1-fast), border-color var(--v1-fast), transform var(--v1-fast);
        }
        @media (min-width: 901px) {
          .v1-scope .sd-scenes { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); }
          .v1-scope .sd-scene { min-height: 46px; border-radius: 14px; text-align: start; padding-inline: 14px; }
        }
        .v1-scope .sd-scene:hover:not(:disabled) { color: var(--v1-t-strong); border-color: var(--v1-line-strong); }
        .v1-scope .sd-scene[aria-checked="true"] {
          color: var(--v1-t-strong); border-color: var(--v1-line-azure);
          background: linear-gradient(140deg, rgba(56, 189, 248, 0.18), rgba(2, 132, 199, 0.08));
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
        }
        .v1-scope .sd-scene:disabled { cursor: default; opacity: 0.55; }
        .v1-scope .sd-scene:focus-visible, .v1-scope .sd-mic:focus-visible, .v1-scope .sd-play:focus-visible,
        .v1-scope .sd-again:focus-visible, .v1-scope .sd-typed-toggle:focus-visible {
          outline: 2px solid var(--v1-azure-soft); outline-offset: 3px;
        }

        .v1-scope .sd-privacy {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 22px;
          font-size: 0.8rem; color: var(--v1-t-faint);
        }
        .v1-scope .sd-privacy svg { color: var(--v1-green); flex-shrink: 0; }

        /* ── stage ── */
        .v1-scope .sd-stage {
          position: relative; border-radius: var(--v1-r-lg); overflow: hidden; scroll-margin-top: 84px;
          border: 1px solid var(--v1-line-strong);
          background: linear-gradient(170deg, rgba(14, 23, 40, 0.94), rgba(7, 12, 22, 0.97));
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.07) inset, 0 34px 90px rgba(0, 0, 0, 0.55), 0 12px 44px rgba(2, 132, 199, 0.14);
          transition: border-color var(--v1-base) var(--v1-ease);
        }
        .v1-scope .sd-stage[data-tone="good"] { border-color: rgba(74, 222, 128, 0.5); }
        .v1-scope .sd-stage[data-tone="azure"] { border-color: rgba(56, 189, 248, 0.55); }
        .v1-scope .sd-stage[data-tone="gold"] { border-color: rgba(242, 193, 78, 0.55); }
        .v1-scope .sd-stage-head {
          display: flex; align-items: center; gap: 10px; padding: 14px 20px;
          border-bottom: 1px solid var(--v1-line);
        }
        .v1-scope .sd-live { width: 8px; height: 8px; border-radius: 50%; background: var(--v1-azure); box-shadow: 0 0 10px var(--v1-azure); }
        .v1-scope .sd-stage[data-phase="recording"] .sd-live { background: #fb7185; box-shadow: 0 0 12px #fb7185; animation: sd-blink 1s ease-in-out infinite; }
        .v1-scope .sd-stage-label { font: 700 0.8rem/1 var(--v1-display); color: var(--v1-t-mute); }
        .v1-scope .sd-stage-tag { margin-inline-start: auto; font: 600 0.75rem/1 var(--v1-display); color: var(--v1-t-faint); }

        .v1-scope .sd-prompt {
          margin: 0; padding: 22px 22px 0;
          font: 700 clamp(1.08rem, 2vw, 1.28rem)/1.75 var(--v1-display); color: var(--v1-t-strong);
          text-wrap: balance; transition: font-size var(--v1-base) var(--v1-ease), color var(--v1-base) var(--v1-ease);
        }
        .v1-scope .sd-stage[data-phase="result"] .sd-prompt { font-size: 0.95rem; font-weight: 600; color: var(--v1-t-mute); padding-top: 16px; }
        .v1-scope .sd-body { padding: 18px 22px 22px; min-height: 280px; display: flex; flex-direction: column; justify-content: center; }

        /* mic */
        .v1-scope .sd-mic-wrap { display: flex; flex-direction: column; align-items: center; gap: 18px; padding-block: 12px; }
        .v1-scope .sd-mic {
          --lvl: 0; --p: 0;
          position: relative; width: 108px; height: 108px; border-radius: 50%; border: 0; cursor: pointer;
          display: grid; place-items: center; color: #041018;
          background: radial-gradient(circle at 35% 30%, #bae6fd, var(--v1-azure) 55%, var(--v1-azure-deep));
          box-shadow: 0 14px 44px rgba(56, 189, 248, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -8px 18px rgba(2, 132, 199, 0.45);
          transition: transform var(--v1-base) var(--v1-ease), box-shadow var(--v1-base) var(--v1-ease);
          -webkit-tap-highlight-color: transparent;
        }
        .v1-scope .sd-mic:hover { transform: scale(1.04); }
        .v1-scope .sd-mic:active { transform: scale(0.97); }
        .v1-scope .sd-mic > svg, .v1-scope .sd-stop { position: relative; z-index: 2; }
        .v1-scope .sd-mic-ring {
          position: absolute; inset: -9px; border-radius: 50%; pointer-events: none;
          background: conic-gradient(var(--v1-azure-soft) calc(var(--p) * 360deg), rgba(160, 200, 240, 0.12) 0);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
                  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          opacity: 0; transition: opacity var(--v1-fast);
        }
        .v1-scope .sd-mic-pulse {
          position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
          background: rgba(56, 189, 248, 0.28);
          animation: sd-breathe 2.6s var(--v1-ease) infinite;
        }
        .v1-scope .sd-mic.is-rec {
          background: radial-gradient(circle at 35% 30%, #fecdd3, #fb7185 55%, #e11d48);
          box-shadow: 0 14px 44px rgba(251, 113, 133, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.45);
        }
        .v1-scope .sd-mic.is-rec .sd-mic-ring { opacity: 1; }
        .v1-scope .sd-mic.is-rec .sd-mic-pulse {
          animation: none; background: rgba(251, 113, 133, 0.22);
          transform: scale(calc(1 + var(--lvl) * 0.5)); transition: transform 90ms linear;
        }
        .v1-scope .sd-stop { width: 26px; height: 26px; border-radius: 7px; background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); }
        .v1-scope .sd-mic-caption { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.9rem; color: var(--v1-t-mute); }
        .v1-scope .sd-mic-caption b { font-size: 1.05rem; color: var(--v1-t-strong); font-variant-numeric: tabular-nums; }

        /* working */
        .v1-scope .sd-working { display: flex; flex-direction: column; gap: 18px; }
        .v1-scope .sd-heard { display: grid; gap: 6px; }
        .v1-scope .sd-heard-k { font: 600 0.74rem/1 var(--v1-display); color: var(--v1-t-faint); }
        .v1-scope .sd-thinking { display: flex; align-items: center; gap: 12px; font-size: 0.92rem; color: var(--v1-t-mute); }
        .v1-scope .sd-dots { display: inline-flex; gap: 5px; }
        .v1-scope .sd-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--v1-azure); animation: sd-dot 1.1s ease-in-out infinite; }
        .v1-scope .sd-dots i:nth-child(2) { animation-delay: 0.15s; }
        .v1-scope .sd-dots i:nth-child(3) { animation-delay: 0.3s; }
        .v1-scope .sd-dots-sm i { width: 4px; height: 4px; background: currentColor; }

        /* result */
        .v1-scope .sd-result { display: flex; flex-direction: column; gap: 14px; }
        .v1-scope .sd-verdict {
          display: inline-flex; font: 700 0.95rem/1 var(--v1-display);
          padding: 10px 16px; border-radius: 999px; border: 1px solid;
        }
        .v1-scope .sd-tone-good { color: var(--v1-green); background: rgba(74, 222, 128, 0.08); border-color: rgba(74, 222, 128, 0.3); }
        .v1-scope .sd-tone-azure { color: var(--v1-azure-soft); background: rgba(56, 189, 248, 0.08); border-color: var(--v1-line-azure); }
        .v1-scope .sd-tone-gold { color: var(--v1-gold-soft); background: rgba(242, 193, 78, 0.08); border-color: var(--v1-line-gold); }

        .v1-scope .sd-en {
          margin: 0; font: 500 1rem/1.6 var(--v1-num); color: var(--v1-t); text-align: left; unicode-bidi: isolate;
          overflow-wrap: anywhere;
        }
        /* one LTR comparison panel; physical left is right here — the panel is dir="ltr" English */
        .v1-scope .sd-diff { display: grid; gap: 10px; padding: 14px 16px; border-radius: 16px; background: rgba(4, 7, 14, 0.45); border: 1px solid var(--v1-line); }
        .v1-scope .sd-diff-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: baseline; column-gap: 14px; padding-left: 12px; border-left: 2px solid; }
        .v1-scope .sd-diff-row.is-said { border-left-color: rgba(251, 113, 133, 0.55); }
        .v1-scope .sd-diff-row.is-fixed { border-left-color: rgba(74, 222, 128, 0.6); }
        .v1-scope .sd-diff-k { font: 600 0.75rem/1 var(--v1-display); color: var(--v1-t-faint); }
        .v1-scope .sd-said { color: var(--v1-t-mute); }
        .v1-scope .sd-mark { color: inherit; border-radius: 3px; padding: 0 1px; }
        .v1-scope .sd-mark-bad {
          color: #fda4af;
          background: linear-gradient(rgba(251, 113, 133, 0.9), rgba(251, 113, 133, 0.9)) no-repeat 0 58% / 0% 1.5px;
          animation: sd-strike 0.42s 0.4s var(--v1-ease) forwards;
        }
        .v1-scope .sd-mark-good {
          color: var(--v1-green);
          background: linear-gradient(rgba(74, 222, 128, 0.16), rgba(74, 222, 128, 0.16)) no-repeat 0 0 / 0% 100%;
          animation: sd-hl 0.5s 0.7s var(--v1-ease) forwards;
        }

        .v1-scope .sd-row-natural {
          display: grid; gap: 8px; padding: 18px 20px; border-radius: 18px;
          background: rgba(56, 189, 248, 0.04); border: 1px solid rgba(56, 189, 248, 0.55);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .v1-scope .sd-natural-k { font: 600 0.78rem/1 var(--v1-display); color: var(--v1-azure-soft); }
        .v1-scope .sd-natural { display: flex; align-items: center; gap: 14px; direction: ltr; }
        .v1-scope .sd-natural .sd-en { flex: 1; font-size: clamp(1.12rem, 1.7vw, 1.32rem); line-height: 1.5; letter-spacing: -0.01em; font-weight: 600; color: var(--v1-t-strong); }
        .v1-scope .sd-play {
          flex-shrink: 0; width: 52px; height: 52px; border-radius: 50%; cursor: pointer;
          display: grid; place-items: center; color: var(--v1-azure-soft);
          background: transparent; border: 1.5px solid var(--v1-azure);
          transition: transform var(--v1-fast), background var(--v1-fast), color var(--v1-fast), opacity var(--v1-fast);
        }
        .v1-scope .sd-play:hover:not(:disabled) { transform: scale(1.06); background: rgba(56, 189, 248, 0.08); }
        .v1-scope .sd-play.is-playing { background: linear-gradient(135deg, var(--v1-azure-soft), var(--v1-azure)); color: #041018; }
        .v1-scope .sd-play:disabled { cursor: default; opacity: 0.6; }
        .v1-scope .sd-play svg { margin-left: 3px; }

        .v1-scope .sd-notes { list-style: none; margin: 0; padding: 0; display: grid; }
        .v1-scope .sd-notes li { display: grid; gap: 4px; padding: 12px 2px; border-top: 1px solid var(--v1-line); }
        .v1-scope .sd-fix { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 8px; justify-self: start; font: 500 0.88rem/1.5 var(--v1-num); }
        .v1-scope .sd-fix s { color: #fda4af; text-decoration-color: rgba(251, 113, 133, 0.6); }
        .v1-scope .sd-fix span { color: var(--v1-t-faint); }
        .v1-scope .sd-fix b { color: var(--v1-green); font-weight: 600; }
        .v1-scope .sd-why { font-size: 0.86rem; line-height: 1.8; color: var(--v1-t-mute); }

        .v1-scope .sd-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; margin-top: 4px; }
        .v1-scope .sd-cta { font-size: 0.95rem; padding: 13px 22px; }
        .v1-scope .sd-again {
          min-height: 44px; font: 600 0.88rem/1 var(--v1-display); color: var(--v1-t-mute); background: none; border: 0; cursor: pointer;
          padding: 10px 4px; text-decoration: underline; text-underline-offset: 5px; text-decoration-color: var(--v1-line-strong);
        }
        .v1-scope .sd-again:hover { color: var(--v1-t-strong); }

        .v1-scope .sd-error { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
        .v1-scope .sd-error p { margin: 0; max-width: 40ch; font-size: 0.95rem; line-height: 1.9; color: var(--v1-t); }

        /* typed fallback */
        .v1-scope .sd-typed { border-top: 1px solid var(--v1-line); padding: 12px 20px 14px; background: rgba(4, 7, 14, 0.35); }
        .v1-scope .sd-inapp { margin: 0 0 10px; font-size: 0.8rem; line-height: 1.8; color: var(--v1-gold-soft); }
        .v1-scope .sd-typed-toggle {
          width: 100%; min-height: 44px; background: none; border: 0; cursor: pointer; padding: 6px;
          font: 500 0.84rem/1.4 var(--v1-body); color: var(--v1-t-faint);
        }
        .v1-scope .sd-typed-toggle:hover { color: var(--v1-t-mute); }
        .v1-scope .sd-typed-form { display: flex; gap: 8px; }
        .v1-scope .sd-typed-form input {
          flex: 1; min-width: 0; height: 46px; padding: 0 14px; border-radius: 12px;
          font: 500 16px/1 var(--v1-num); color: var(--v1-t-strong);
          background: rgba(148, 197, 255, 0.05); border: 1px solid var(--v1-line-strong);
        }
        .v1-scope .sd-typed-form input::placeholder { color: var(--v1-t-faint); }
        .v1-scope .sd-typed-form input:focus { outline: none; border-color: var(--v1-line-azure); box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12); }
        .v1-scope .sd-typed-form button {
          flex-shrink: 0; height: 46px; padding: 0 18px; border-radius: 12px; cursor: pointer;
          font: 700 0.9rem/1 var(--v1-display); color: var(--v1-t-strong);
          background: rgba(148, 197, 255, 0.06); border: 1px solid var(--v1-line-strong);
          transition: border-color var(--v1-fast), background var(--v1-fast);
        }
        .v1-scope .sd-typed-form button:hover:not(:disabled) { border-color: var(--v1-line-azure); background: rgba(56, 189, 248, 0.08); }
        .v1-scope .sd-typed-form button:disabled { opacity: 0.45; cursor: default; }

        @keyframes sd-breathe { 0% { transform: scale(1); opacity: 0.7; } 70%, 100% { transform: scale(1.55); opacity: 0; } }
        @keyframes sd-dot { 0%, 80%, 100% { transform: translateY(0); opacity: 0.35; } 40% { transform: translateY(-4px); opacity: 1; } }
        @keyframes sd-blink { 50% { opacity: 0.35; } }
        @keyframes sd-strike { to { background-size: 100% 1.5px; } }
        @keyframes sd-hl { to { background-size: 100% 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .v1-scope .sd-mic-pulse, .v1-scope .sd-dots i, .v1-scope .sd-live { animation: none !important; }
          .v1-scope .sd-mark-bad { animation: none; background-size: 100% 1.5px; }
          .v1-scope .sd-mark-good { animation: none; background-size: 100% 100%; }
        }

        @media (max-width: 900px) {
          .v1-scope .sd-grid { grid-template-columns: minmax(0, 1fr); }
          .v1-scope .sd-scenes {
            flex-wrap: nowrap; overflow-x: auto; margin-inline: calc(var(--v1-gutter) * -1); padding-inline: var(--v1-gutter);
            scrollbar-width: none; margin-top: 20px;
            -webkit-mask-image: linear-gradient(to right, transparent 0, #000 48px);
                    mask-image: linear-gradient(to right, transparent 0, #000 48px);
          }
          .v1-scope .sd-scenes::-webkit-scrollbar { display: none; }
          .v1-scope .sd-scene { flex-shrink: 0; }
          .v1-scope .sd-privacy { margin-top: 14px; }
          .v1-scope .sd-body { min-height: 0; padding: 14px 18px 20px; }
          .v1-scope .sd-prompt { padding-inline: 18px; }
          .v1-scope .sd-mic-wrap { padding-block: 6px 2px; gap: 14px; }
          .v1-scope .sd-mic { width: 96px; height: 96px; }
          .v1-scope .sd-diff { padding: 12px 14px; }
          .v1-scope .sd-row-natural { padding: 16px; }
        }
      `}</style>
    </section>
  );
}
