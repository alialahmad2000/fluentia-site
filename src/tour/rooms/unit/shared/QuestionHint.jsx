/**
 * fluentia-lms components/curriculum/questions/QuestionHint.jsx + VerdictPanel.jsx.
 * Verbatim apart from: trackEvent removed, gender shim, and «*markers*» stripped
 * from quotes (splitQuote already did for the quote; the paragraph label and
 * everything else is the platform's).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Square, Volume2, XCircle } from "lucide-react";
import { g, paraLetter } from "../lib/platform";

const ACCENTS = {
  violet: {
    text: "var(--qx-accent-strong, #c084fc)",
    border: "var(--qx-edge, rgba(168,85,247,0.35))",
    bg: "var(--qx-tint, rgba(168,85,247,0.10))",
    soft: "var(--qx-soft, rgba(168,85,247,0.06))",
  },
  sky: {
    text: "var(--qx-accent-strong, #7dd3fc)",
    border: "var(--qx-edge, rgba(56,189,248,0.35))",
    bg: "var(--qx-tint, rgba(56,189,248,0.10))",
    soft: "var(--qx-soft, rgba(56,189,248,0.06))",
  },
};

const normalize = (s) => (s || "").toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

function splitQuote(quote, phrase) {
  if (!quote) return null;
  const clean = quote.replace(/\*/g, "");
  if (!phrase) return { before: clean, match: "", after: "" };
  const cleanPhrase = phrase.replace(/\*/g, "");
  const idx = normalize(clean).indexOf(normalize(cleanPhrase));
  if (idx < 0) return { before: clean, match: "", after: "" };
  return { before: clean.slice(0, idx), match: clean.slice(idx, idx + cleanPhrase.length), after: clean.slice(idx + cleanPhrase.length) };
}

export function EvidenceExcerpt({ hint, audioUrl, accent = "sky", kind = "reading", headerLabel, lettered = false }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const stopTimerRef = useRef(null);
  const colors = ACCENTS[accent] || ACCENTS.sky;
  const parts = useMemo(() => splitQuote(hint?.quote, hint?.answer_phrase), [hint]);
  const canReplay = kind === "listening" && !!audioUrl && Number.isFinite(hint?.start_ms) && Number.isFinite(hint?.end_ms) && hint.end_ms > hint.start_ms;
  const paraSuffix = lettered && kind !== "listening" && Number.isInteger(hint?.paragraph_index) ? ` — الفقرة ${paraLetter(hint.paragraph_index)}` : "";

  const stopReplay = useCallback(() => {
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    const el = audioRef.current;
    if (el) { try { el.pause(); } catch { /* noop */ } }
    setPlaying(false);
  }, []);

  useEffect(() => () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    const el = audioRef.current;
    if (el) { try { el.pause(); } catch { /* noop */ } }
  }, []);

  if (!hint?.quote) return null;

  const handleReplay = () => {
    if (playing) { stopReplay(); return; }
    const el = audioRef.current;
    if (!el) return;
    const PAD = 350;
    const startSec = Math.max(0, (hint.start_ms - PAD) / 1000);
    const stopSec = (hint.end_ms + PAD) / 1000;
    const begin = () => {
      el.currentTime = startSec;
      el.play().then(() => {
        setPlaying(true);
        const onTimeUpdate = () => {
          if (el.currentTime >= stopSec) {
            el.removeEventListener("timeupdate", onTimeUpdate);
            stopReplay();
          }
        };
        el.addEventListener("timeupdate", onTimeUpdate);
        el.addEventListener("ended", () => stopReplay(), { once: true });
        stopTimerRef.current = setTimeout(() => {
          el.removeEventListener("timeupdate", onTimeUpdate);
          stopReplay();
        }, (stopSec - startSec) * 1000 + 1500);
      }).catch(() => setPlaying(false));
    };
    if (!el.src) el.src = audioUrl;
    if (el.readyState >= 1) {
      begin();
    } else {
      el.addEventListener("loadedmetadata", begin, { once: true });
      el.addEventListener("error", () => setPlaying(false), { once: true });
      try { el.load(); } catch { setPlaying(false); }
    }
  };

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      dir="rtl"
      style={{ background: "linear-gradient(180deg, rgba(2,6,16,0.35), rgba(2,6,16,0.55))", border: `1px solid ${colors.border}`, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3)" }}
    >
      {canReplay && <audio ref={audioRef} preload="none" playsInline style={{ display: "none" }} data-hint-replay="" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <p className="text-xs font-bold font-['Tajawal']" style={{ color: colors.text }}>
            {(headerLabel || (kind === "listening" ? "موضع الإجابة في التسجيل" : "موضع الإجابة في النص")) + paraSuffix}
          </p>
          <p className="text-xs font-medium font-['Tajawal'] mt-0.5" style={{ color: "var(--text-muted)" }}>
            الإجابة مظلّلة بالأخضر
          </p>
        </div>
        {canReplay && (
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-lg text-xs font-bold font-['Tajawal'] transition-colors w-full sm:w-auto"
            style={{
              color: playing ? "#fda4af" : colors.text,
              background: playing ? "rgba(244,63,94,0.12)" : colors.bg,
              border: `1px solid ${playing ? "rgba(244,63,94,0.35)" : colors.border}`,
            }}
          >
            {playing ? <Square size={12} /> : <Volume2 size={13} />}
            {playing ? "إيقاف" : "تشغيل هذا الجزء"}
          </button>
        )}
      </div>
      <p className="text-sm font-en leading-[1.9] text-[var(--text-secondary)]" dir="ltr">
        {parts.before}
        {parts.match && (
          <mark className="rounded-md px-1 py-0.5 font-semibold" style={{ background: "rgba(16,185,129,0.18)", color: "#6ee7b7", boxShadow: "inset 0 -1.5px 0 rgba(16,185,129,0.55)" }}>
            {parts.match}
          </mark>
        )}
        {parts.after}
      </p>
    </div>
  );
}

export default function QuestionHint({ hint, audioUrl, accent = "sky", kind = "reading", lettered = false }) {
  const [open, setOpen] = useState(false);
  const colors = ACCENTS[accent] || ACCENTS.sky;
  if (!hint?.quote) return null;
  return (
    <div dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-full text-xs font-bold font-['Tajawal'] transition-all duration-200 active:scale-95 tu-hint-btn"
        style={{
          color: open ? colors.text : "var(--text-muted)",
          background: open ? colors.bg : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? colors.border : "rgba(255,255,255,0.08)"}`,
        }}
      >
        <Lightbulb size={13} className={open ? "" : "opacity-70"} style={open ? { color: colors.text } : undefined} />
        {open ? "إخفاء التلميح" : "تلميح"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
            <div className="mt-2">
              <EvidenceExcerpt hint={hint} audioUrl={audioUrl} accent={accent} kind={kind} lettered={lettered} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VerdictPanel({ correct, selectedLabel, selectedText, correctLabel, correctText, wrongNote, explanationAr, explanationEn, hint, audioUrl, accent = "sky", kind = "reading", lettered = false }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="qx-verdict" data-ok={correct ? "true" : "false"} dir="rtl">
      <div className="qx-verdict-head">
        <span className="qx-verdict-icon">{correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />}</span>
        <span className="qx-verdict-title">{correct ? <>إجابة صحيحة — {g("أحسنت", "أحسنتِ")}</> : "إجابة غير صحيحة"}</span>
      </div>
      <div className="qx-verdict-body">
        {!correct && (
          <div className="qx-vchips" dir="ltr">
            <div className="qx-vchip" data-kind="yours">
              <span className="qx-vchip-label" dir="rtl">إجابتك</span>
              {selectedLabel && <span className="qx-vchip-letter">{selectedLabel}</span>}
              <span className="qx-vchip-text">{selectedText}</span>
            </div>
            <div className="qx-vchip" data-kind="correct">
              <span className="qx-vchip-label" dir="rtl">الإجابة الصحيحة</span>
              {correctLabel && <span className="qx-vchip-letter">{correctLabel}</span>}
              <span className="qx-vchip-text">{correctText}</span>
            </div>
          </div>
        )}
        {!correct && wrongNote && (
          <div className="qx-vwhy" data-tone="wrong">
            <p className="qx-vwhy-label">لماذا خيارك غير صحيح؟</p>
            <p className="qx-vwhy-text">{wrongNote}</p>
          </div>
        )}
        {(explanationAr || explanationEn) && (
          <div className="qx-vwhy" data-tone="right">
            <p className="qx-vwhy-label">{correct ? "لماذا هذه هي الإجابة الصحيحة؟" : "ولماذا هذه هي الإجابة الصحيحة؟"}</p>
            {explanationAr && <p className="qx-vwhy-text">{explanationAr}</p>}
            {explanationEn && (
              <p className="qx-vwhy-text-en" dir="ltr">
                {explanationEn}
              </p>
            )}
          </div>
        )}
        {hint?.quote && (
          <EvidenceExcerpt hint={hint} audioUrl={audioUrl} accent={accent} kind={kind} headerLabel={kind === "listening" ? "الدليل من التسجيل" : "الدليل من النص"} lettered={lettered} />
        )}
      </div>
    </motion.div>
  );
}
