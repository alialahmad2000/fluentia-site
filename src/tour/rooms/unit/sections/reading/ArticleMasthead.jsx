/**
 * fluentia-lms components/curriculum/reading/ArticleMasthead.jsx.
 * Verbatim markup. Two tour changes:
 *   • «أدوات» opens the platform's tools drawer (AI summary, focus mode, a quiz on
 *     saved words — all server-backed); here it opens a note listing them.
 *   • The reading time uses the tab's own L2 rate (90 wpm) and a counted noun.
 *     Production prints «3 دقيقة قراءة» at 200 wpm directly above «تبقّت 6 دقائق»
 *     at 90 wpm, two different answers to one question on the same screen.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { minutesAr, readingNameAr } from "../../lib/platform";

const AR_RE = /[؀-ۿ]/;

function targetWordsLabel(n) {
  if (n === 1) return "كلمة واحدة مستهدفة";
  if (n === 2) return "كلمتان مستهدفتان";
  if (n >= 3 && n <= 10) return `${n} كلمات مستهدفة`;
  return `${n} كلمة مستهدفة`;
}

function firstSentence(paragraphs) {
  const first = Array.isArray(paragraphs) ? paragraphs[0] : "";
  if (!first) return "";
  const m = first.match(/^.*?[.!?](\s|$)/);
  const s = (m ? m[0] : first).trim();
  return s.length > 120 ? s.slice(0, 117).trimEnd() + "…" : s;
}

export default function ArticleMasthead({ reading, readingTime, wordCount, targetWordCount = 0 }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const rawSub = (reading?.title_ar || "").trim();
  const arabicSubtitle = rawSub && AR_RE.test(rawSub) ? rawSub : "";
  const englishDeck = rawSub && !AR_RE.test(rawSub) ? rawSub : "";
  const deck = englishDeck || (arabicSubtitle ? "" : firstSentence(reading?.passage_content?.paragraphs));

  const eyebrow = [reading?.reading_label ? readingNameAr(reading.reading_label) : null].filter(Boolean).join(" · ");
  const meta = [Number.isFinite(wordCount) && wordCount > 0 ? `${wordCount} كلمة` : null, readingTime ? `${minutesAr(readingTime)} قراءة` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="relative" dir="ltr">
      <div className="flex items-start justify-between gap-3">
        {eyebrow ? (
          <span
            dir="rtl"
            className="inline-flex items-center font-['Tajawal']"
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: ".02em",
              color: "var(--ds-text-secondary, #a8a396)",
              padding: "5px 13px",
              borderRadius: 999,
              border: "1px solid var(--ds-border-subtle, rgba(255,255,255,0.10))",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {eyebrow}
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => setToolsOpen((v) => !v)}
          aria-label="أدوات القراءة"
          aria-expanded={toolsOpen}
          dir="rtl"
          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full font-['Tajawal'] transition-colors"
          style={{
            minHeight: 44,
            minWidth: 44,
            padding: "0 14px",
            fontSize: 13,
            color: toolsOpen ? "var(--ds-accent-primary, #e9b949)" : "var(--ds-text-secondary, #a8a396)",
            border: `1px solid ${toolsOpen ? "rgba(233,185,73,0.4)" : "var(--ds-border-subtle, rgba(255,255,255,0.08))"}`,
          }}
        >
          <Settings2 size={15} />
          أدوات
        </button>
      </div>

      <AnimatePresence initial={false}>
        {toolsOpen && (
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="tu-note mt-3">
              <p className="tu-note__lead">أدوات القراءة متاحة داخل المنصة</p>
              <p className="tu-note__text">ملخص عربي للمقال، وضع التركيز فقرة بفقرة، واختبار سريع على الكلمات المحفوظة.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1
        className="mt-5"
        style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: "clamp(34px, 6.2vw, 52px)",
          lineHeight: 1.04,
          letterSpacing: "-.01em",
          color: "var(--ds-text-primary, #ece7dd)",
        }}
      >
        {reading?.title_en}
      </h1>

      {arabicSubtitle && (
        <h2 dir="rtl" className="mt-2" style={{ fontFamily: "'Amiri', serif", fontWeight: 700, fontSize: "clamp(21px, 4.4vw, 28px)", lineHeight: 1.25, color: "var(--ds-text-secondary, #a8a396)" }}>
          {arabicSubtitle}
        </h2>
      )}

      {deck && (
        <p
          className="mt-2"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(19px, 3vw, 25px)",
            lineHeight: 1.32,
            color: "var(--ds-text-secondary, #a8a396)",
            maxWidth: "100%",
          }}
        >
          {deck}
        </p>
      )}

      {(meta || targetWordCount > 0) && (
        <div dir="rtl" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-['Tajawal']">
          {meta && <span style={{ fontSize: 12.5, letterSpacing: ".02em", color: "var(--ds-text-tertiary, #8b8578)" }}>{meta}</span>}
          {targetWordCount > 0 && (
            <span
              className="inline-flex items-center"
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--ds-accent-primary, #e9b949)",
                textDecoration: "underline",
                textDecorationColor: "var(--ds-accent-rule, rgba(233,185,73,.42))",
                textDecorationThickness: "1.5px",
                textUnderlineOffset: "5px",
              }}
            >
              {targetWordsLabel(targetWordCount)}
            </span>
          )}
        </div>
      )}

      <div className="mt-6 h-px w-full" style={{ background: "var(--ds-border-subtle, rgba(255,255,255,0.06))" }} />
    </header>
  );
}
