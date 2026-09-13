/**
 * fluentia-lms components/curriculum/reading/WordPopup.jsx — the anchored word
 * card: word, Arabic meaning, «في سياق», and the pronunciation that auto-plays.
 *
 * Changes for the tour:
 *   • Portaled to <body>, so no transformed ancestor can move it (the platform
 *     positions it from getBoundingClientRect as position:fixed).
 *   • pronounceWord → lib/wordAudio (the platform's clip, copied; no DB/edge call).
 *   • «احفظ في مفرداتي» and «صعبة عليّ» write to the student's vocab_cards. They
 *     stay visible and answer with a one-line note of what they do inside.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Flag, Loader2, Plus, Volume2, X } from "lucide-react";
import { pronounceWord } from "../lib/wordAudio";

const POPUP_W = 320;
const MARGIN = 16;

export default function WordPopup({ word, vocabRow, anchorRect, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const [audioState, setAudioState] = useState("idle");
  const [note, setNote] = useState(null);

  const play = useCallback(async () => {
    setAudioState("loading");
    try {
      const res = await pronounceWord(word);
      setAudioState(res?.ok ? "curriculum" : "failed");
    } catch {
      setAudioState("failed");
    }
  }, [word]);

  // Auto-play once on open — the tap that opened the card is the user gesture.
  useEffect(() => {
    play();
  }, [play]);

  useLayoutEffect(() => {
    if (!anchorRect) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(POPUP_W, vw - 2 * MARGIN);
    const left = Math.min(Math.max(anchorRect.left, MARGIN), vw - width - MARGIN);
    const belowRoom = vh - anchorRect.bottom;
    const placeBelow = belowRoom >= 180;
    const top = placeBelow ? anchorRect.bottom + 8 : Math.max(MARGIN, anchorRect.top - 8);
    setPos({ left, top, width, placeBelow });
  }, [anchorRect]);

  // Above the word: measure the card and lift it by its own height.
  useLayoutEffect(() => {
    if (!pos || pos.placeBelow || pos.lifted || !ref.current) return;
    const h = ref.current.getBoundingClientRect().height;
    setPos((p) => ({ ...p, top: Math.max(MARGIN, anchorRect.top - 8 - h), lifted: true }));
  }, [pos, anchorRect]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest?.(".aw")) onClose();
    };
    const startY = window.scrollY;
    const onScroll = () => { if (Math.abs(window.scrollY - startY) > 200) onClose(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onClose]);

  if (!pos) return null;

  const audioSolid = audioState === "curriculum";
  const meaningAr = vocabRow?.definition_ar;

  return createPortal(
      <motion.div
        ref={ref}
        key={word}
        initial={{ opacity: 0, y: pos.placeBelow ? -6 : 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        dir="rtl"
        role="dialog"
        aria-label={`معنى ${word}`}
        className="fixed z-[120] tu-wordpopup"
        style={{
          left: pos.left,
          top: pos.top,
          width: pos.width,
          visibility: pos.placeBelow || pos.lifted ? "visible" : "hidden",
          background: "var(--ds-bg-elevated, var(--ds-surface-1, #11131c))",
          border: "1px solid var(--ds-border-subtle, rgba(255,255,255,0.08))",
          borderRadius: 14,
          boxShadow: "0 24px 64px -20px rgba(0,0,0,0.5), 0 8px 24px -12px rgba(0,0,0,0.4)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          backdropFilter: "blur(20px) saturate(140%)",
          padding: "18px 20px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ color: "var(--ds-text-tertiary, #64748b)" }}
        >
          <X size={15} />
        </button>

        <div className="flex items-center justify-between gap-3" dir="ltr">
          <div className="min-w-0">
            <div
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 26,
                lineHeight: 1.1,
                color: "var(--ds-text-primary, #f8fafc)",
              }}
              className="truncate"
            >
              {word}
            </div>
          </div>
          <button
            type="button"
            onClick={play}
            aria-label="نطق الكلمة"
            title="نطق الكلمة"
            className="shrink-0 flex items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              width: 48,
              height: 48,
              background: audioSolid ? "var(--ds-accent-primary, #e9b949)" : "transparent",
              color: audioSolid ? "#0a0d14" : "var(--ds-accent-primary, #e9b949)",
              border: "1.5px solid var(--ds-accent-primary, #e9b949)",
            }}
          >
            {audioState === "loading" ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
          </button>
        </div>

        <div className="mt-4">
          <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--ds-accent-primary, #e9b949)", opacity: 0.8 }}>
            المعنى
          </div>
          <div
            className="mt-1.5 tu-wordpopup__meaning"
            style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 17, color: meaningAr ? "var(--ds-text-primary, #f8fafc)" : "var(--ds-text-tertiary, #64748b)" }}
          >
            {meaningAr || "لا توجد ترجمة لهذه الكلمة في القاموس"}
          </div>
        </div>

        {vocabRow?.example_sentence && (
          <div className="mt-3.5" dir="ltr">
            <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--ds-text-tertiary, #64748b)" }} dir="rtl">
              في سياق
            </div>
            <p className="mt-1" style={{ fontFamily: "'Readex Pro', sans-serif", fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: "var(--ds-text-secondary, #94a3b8)" }}>
              {vocabRow.example_sentence}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setNote("save")}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium font-['Tajawal'] px-3 py-1.5 transition-colors"
          style={{ color: "var(--ds-accent-primary, #e9b949)", border: "1px solid rgba(233,185,73,0.4)", background: "transparent" }}
        >
          <Plus size={14} />
          احفظ في مفرداتي
        </button>
        <button
          type="button"
          onClick={() => setNote("hard")}
          className="mt-2 ms-2 inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium font-['Tajawal'] px-3 py-1.5 transition-colors"
          style={{ color: "var(--ds-text-tertiary, #64748b)", border: "1px solid var(--ds-border-subtle, rgba(255,255,255,0.10))", background: "transparent" }}
        >
          <Flag size={14} />
          صعبة عليّ
        </button>
        {note && (
          <p className="tu-popnote" role="status">
            {note === "save"
              ? "داخل المنصة تُحفظ الكلمة في مفرداتك، وتعود إليك في المراجعة الذكية."
              : "داخل المنصة تُميَّز الكلمة بعلامة «صعبة» في كل نص تظهر فيه، وتدخل مراجعتك."}
          </p>
        )}
      </motion.div>,
    document.body
  );
}
