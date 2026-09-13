/**
 * The Reading section — fluentia-lms pages/student/curriculum/tabs/ReadingTab.jsx,
 * composed from its visible parts (the tab itself is 2,300 lines of persistence,
 * XP, notes, AI endpoints and telemetry, none of which a visitor can use).
 *
 * Kept, in the tab's own order and markup: the «القراءة الأولى/الثانية» sub-tabs,
 * the sticky progress hairline + section rail, the passage card (hero, masthead,
 * mode pill, time left, inline image, tap hint, ArticleBody with paragraph
 * letters), the anchored WordPopup, «لمحة بصرية», the vocabulary box and skill
 * box, the comprehension questions (seeded shuffle, «تلميح», submit + confirm,
 * verdicts, result, retry) and «تفكير ناقد».
 *
 * Graded locally; nothing is saved. Omitted: SaveStatus, SubmitReminderBar
 * (a fixed bar), XP badges, the read-along player (see «استماع» below).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { BookOpen, CheckCircle, ChevronDown, FileText, Headphones, History, ImageOff, Lightbulb, MessageSquare, RotateCcw, Volume2, XCircle } from "lucide-react";
import data from "../../data/unit.json";
import SectionShell from "../../shared/SectionShell";
import ArticleMasthead from "./ArticleMasthead";
import ArticleBody from "../../shared/ArticleBody";
import WordPopup from "../../shared/WordPopup";
import QuestionHint, { VerdictPanel } from "../../shared/QuestionHint";
import { SectionBand, SectionJumper, SCROLL_MARGIN } from "../../shared/SectionBand";
import { g, minutesAr, readingNameAr, seededShuffle } from "../../lib/platform";
import { playWordAudioOnce, prewarmWords } from "../../lib/wordAudio";
import "../../shared/questionCards.css";

const READING_MODES = [
  { id: "read", label: "قراءة" },
  { id: "listen", label: "استماع" },
];
const READING_WPM = 90;
const SECTION_NAV = [
  { id: "sec-text", label: "المقال", icon: FileText },
  { id: "sec-vocab", label: "المفردات", icon: BookOpen },
  { id: "sec-questions", label: "الأسئلة", icon: CheckCircle },
  { id: "sec-thinking", label: "تفكير ناقد", icon: MessageSquare },
];
const QUESTION_TYPE_LABELS = { main_idea: "الفكرة الرئيسية", detail: "تفاصيل", vocabulary: "مفردات", inference: "استنتاج" };
const NO_FLAGS = [];
// Salt for the seeded choice shuffle: with it the 14 answers land 4/3/4/3 over
// A-D and no letter repeats on consecutive questions.
const SHUFFLE_SALT = "t859:";

const RT = {
  ink: "var(--ds-text-primary, #faf5e6)",
  body: "var(--ds-text-secondary, #c9c3b0)",
  muted: "var(--ds-text-tertiary, #8b8578)",
  ground: "var(--ds-bg-elevated, #0d111b)",
  raise: "var(--ds-surface-1, rgba(255,255,255,0.028))",
  edge: "var(--ds-border-subtle, rgba(255,255,255,0.07))",
  gold: "var(--ds-accent-primary, #e9b949)",
  wash: "var(--ds-accent-wash, rgba(233,185,73,.08))",
  good: "var(--ds-accent-success, #84cc7a)",
  quiet: "var(--ds-accent-secondary, #8c95b8)",
};

function PremiumImage({ src, alt, className, aspectClass = "aspect-[16/9]", eager = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`${aspectClass} bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center ${className || ""}`}>
        <ImageOff size={32} className="text-slate-600" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={`${aspectClass} w-full object-cover ${className || ""}`} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
}

export default function TourReading() {
  const readings = data.readings;
  const [params, setParams] = useSearchParams();
  const activeReading = params.get("r") === "b" ? 1 : 0;
  const tabsRef = useRef(null);
  const reading = readings[activeReading];

  const select = (i) => {
    setParams(i === 1 ? { r: "b" } : {}, { replace: true });
    const el = tabsRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  };

  return (
    <SectionShell activity="reading" label="القراءة">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex gap-2" ref={tabsRef} style={{ scrollMarginTop: "calc(var(--header-height, 64px) + 16px)" }}>
          {readings.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => select(i)}
              aria-pressed={activeReading === i}
              className={`px-5 h-10 rounded-xl text-sm font-bold border transition-all duration-200 font-['Tajawal'] ${
                activeReading === i
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-lg shadow-sky-500/5"
                  : "bg-slate-900/50 text-slate-400 border-slate-800/60 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {readingNameAr(r.reading_label, i)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={reading.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <ReadingContent reading={reading} next={activeReading === 0 ? readings[1] : null} onNext={() => select(1)} />
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

function ReadingContent({ reading, next, onNext }) {
  const passageRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [wordPopup, setWordPopup] = useState(null);
  const [listenNote, setListenNote] = useState(false);
  const [attempt, setAttempt] = useState({ n: 1, scores: [], completed: false, key: 0 });

  const paragraphs = reading.passage_content?.paragraphs || [];
  const vocabulary = reading.vocabulary;
  const questions = reading.questions;

  const targetWordCount = useMemo(() => Object.values(reading.word_index).filter((r) => r?.is_vocab === true).length, [reading]);
  const readingTime = Math.max(1, Math.ceil((reading.passage_word_count || 0) / READING_WPM));

  // Prime this passage's target words (the ones a visitor is most likely to tap)
  // as in-memory clips. Every other word streams its small static mp3 on tap.
  useEffect(() => {
    const priority = Object.values(reading.word_index).filter((r) => r.is_vocab).map((r) => r.word);
    const t = setTimeout(() => prewarmWords(priority, 20), 800);
    return () => clearTimeout(t);
  }, [reading]);

  useEffect(() => {
    const handler = () => {
      const container = passageRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.height <= 0) return;
      const readLine = window.innerHeight * 0.6;
      const pct = ((readLine - rect.top) / rect.height) * 100;
      setScrollProgress(Math.round(Math.min(100, Math.max(0, pct))));
    };
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    handler();
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [reading.id]);

  const minutesLeft = Math.max(0, Math.ceil(((reading.passage_word_count || 0) * (1 - scrollProgress / 100)) / READING_WPM));
  const onWordTap = useCallback((word, rect, vocabRow) => setWordPopup({ word, rect, vocabRow }), []);
  const closePopup = useCallback(() => setWordPopup(null), []);

  const onSubmitted = (score) => setAttempt((a) => ({ ...a, completed: true, scores: [...a.scores, score] }));
  const onRetry = () => setAttempt((a) => ({ n: a.n + 1, scores: a.scores, completed: false, key: a.key + 1 }));

  return (
    <div className="space-y-6" style={{ paddingBottom: "var(--mobile-bottom-clearance, 100px)" }}>
      <div className="sticky z-rise -mx-4 px-4 pb-2 tu-reading-sticky" style={{ top: "calc(var(--impersonation-banner-height, 0px) + var(--header-height, 64px))" }}>
        <div className="h-1 rounded-full overflow-hidden bg-slate-800/50">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, var(--ds-accent-primary, #e9b949), var(--ds-accent-rule, rgba(233,185,73,.42)))" }}
            animate={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <SectionJumper className="mt-2" sections={SECTION_NAV} deps={reading.id} />
      </div>

      {attempt.completed && (
        <CompletedBanner attemptNumber={attempt.n} scores={attempt.scores} onRetry={onRetry} />
      )}
      {attempt.n > 1 && !attempt.completed && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25">
          <RotateCcw size={16} className="text-sky-400" />
          <span className="text-sm font-medium text-sky-400 font-['Tajawal']">محاولة جديدة — أجب على الأسئلة من جديد</span>
        </div>
      )}

      <div
        id="sec-text"
        className="relative rounded-2xl overflow-hidden transition-colors duration-300"
        style={{
          scrollMarginTop: SCROLL_MARGIN,
          background: "var(--ds-bg-elevated, #0d111b)",
          border: "1px solid var(--ds-border-subtle, rgba(255,255,255,0.07))",
          boxShadow: "0 1px 0 rgba(255,255,255,.05) inset, 0 2px 8px -2px rgba(0,0,0,.5), 0 24px 60px -24px rgba(0,0,0,.7)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64" style={{ background: "radial-gradient(120% 60% at 50% 0%, var(--ds-accent-wash, rgba(233,185,73,.08)), transparent 70%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, var(--ds-accent-rule, rgba(233,185,73,.42)), transparent)" }} />

        {reading.before_read_image_url && (
          <div className="relative rounded-t-2xl overflow-hidden">
            <PremiumImage src={reading.before_read_image_url} alt={reading.title_en} eager />
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, var(--ds-bg-elevated, #0d111b) 2%, transparent 62%)" }} />
          </div>
        )}

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <ArticleMasthead reading={reading} readingTime={readingTime} wordCount={reading.passage_word_count} targetWordCount={targetWordCount} />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 p-1 rounded-full" role="group" aria-label="طريقة القراءة" style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--ds-border-subtle, rgba(255,255,255,.07))" }}>
                {READING_MODES.map((m) => {
                  const active = m.id === "read";
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setListenNote(m.id === "listen" ? (v) => !v : false)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full font-['Tajawal'] transition-all duration-200"
                      style={{
                        minHeight: 38,
                        padding: "0 16px",
                        fontSize: 13.5,
                        fontWeight: active ? 700 : 500,
                        border: 0,
                        cursor: "pointer",
                        color: active ? "#14100a" : "var(--ds-text-tertiary, #8b8578)",
                        background: active ? "linear-gradient(180deg, var(--ds-accent-primary, #e9b949), var(--ds-accent-primary, #e9b949))" : "transparent",
                        boxShadow: active ? "0 1px 0 rgba(255,255,255,.28) inset" : "none",
                      }}
                    >
                      {m.id === "listen" ? <Headphones size={15} /> : <BookOpen size={15} />}
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <div className="left-time font-['Tajawal'] ms-auto" style={{ fontSize: 12.5, color: "var(--ds-text-tertiary, #8b8578)" }}>
                {scrollProgress >= 100 ? g("أنهيت المقال", "أنهيتِ المقال") : minutesLeft <= 1 ? "أقل من دقيقة" : `تبقّت ${minutesAr(minutesLeft)}`}
              </div>
            </div>
            <AnimatePresence initial={false}>
              {listenNote && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden" dir="rtl">
                  <div className="tu-note">
                    <p className="tu-note__lead">القراءة مع الصوت متاحة داخل المنصة</p>
                    <p className="tu-note__text">يُقرأ المقال بصوت واضح وتُضاء كل كلمة لحظة نطقها، مع التحكم في السرعة. هنا تسمع نطق أي كلمة حين تضغط عليها.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="border-b border-slate-800/50 pb-0" />
          </div>

          {reading.passage_image_urls?.length > 0 && (
            <div className="space-y-3">
              {reading.passage_image_urls.map((url, idx) => (
                <div key={idx} className="my-6">
                  <div className="rounded-lg overflow-hidden border border-slate-700/40 shadow-lg">
                    <PremiumImage src={url} alt={`${reading.title_en} — illustration ${idx + 1}`} aspectClass="aspect-[16/10]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs font-['Tajawal'] mb-3 mx-auto tu-tap-hint" dir="rtl" style={{ color: "var(--ds-text-tertiary, #8b8578)" }}>
            💡 {g("اضغط على أي كلمة لسماع نطقها ومعناها — الكلمات المهمّة تحتها خط.", "اضغطي على أي كلمة لسماع نطقها ومعناها — الكلمات المهمّة تحتها خط.")}
          </p>
          <div ref={passageRef}>
            <ArticleBody paragraphs={paragraphs} vocabIndex={reading.word_index} difficultWords={NO_FLAGS} lettered onWordTap={onWordTap} />
          </div>
        </div>
      </div>

      {wordPopup && <WordPopup word={wordPopup.word} vocabRow={wordPopup.vocabRow} anchorRect={wordPopup.rect} onClose={closePopup} />}

      {reading.infographic_image_url && (
        <div>
          <div className="rounded-xl overflow-hidden border border-slate-700/40 shadow-lg">
            <PremiumImage src={reading.infographic_image_url} alt={`Infographic: ${reading.title_en}`} aspectClass="" className="w-full" />
          </div>
          <p className="text-[12px] text-slate-500 text-center mt-2 font-['Tajawal']" dir="rtl">
            لمحة بصرية
          </p>
        </div>
      )}

      {(vocabulary?.length > 0 || reading.reading_skill_name_en) && (
        <SectionBand id="sec-vocab">
          {vocabulary?.length > 0 && <VocabularyBox vocabulary={vocabulary} />}
          {reading.reading_skill_name_en && <ReadingSkillBox reading={reading} />}
        </SectionBand>
      )}

      {questions?.length > 0 && (
        <SectionBand id="sec-questions">
          <ComprehensionSection key={attempt.key} lettered questions={questions} onSubmitted={onSubmitted} />
        </SectionBand>
      )}

      {reading.critical_thinking_prompt_en && (
        <SectionBand id="sec-thinking">
          <CriticalThinkingBox reading={reading} />
        </SectionBand>
      )}

      {next && (
        <button type="button" className="tu-nextreading" onClick={onNext}>
          <span className="tu-nextreading__kicker">{readingNameAr(next.reading_label, 1)}</span>
          <span className="tu-nextreading__title" dir="ltr">
            {next.title_en}
          </span>
          <span className="tu-nextreading__deck">عاصفة رملية تقترب من الرياض، بالأدوات نفسها: كلمات تُسمع، وأسئلة تُصحَّح.</span>
          <span className="tu-nextreading__go" aria-hidden>
            ←
          </span>
        </button>
      )}
    </div>
  );
}

function VocabularyBox({ vocabulary }) {
  const [expanded, setExpanded] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const playAudio = (v, e) => {
    e.stopPropagation();
    playWordAudioOnce(v.audio_url, { onStart: () => setPlayingId(v.id), onEnd: () => setPlayingId(null) });
  };
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: RT.ground, border: `1px solid ${RT.edge}` }}>
      <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.03]">
        <div className="flex items-center gap-2.5">
          <BookOpen size={16} style={{ color: RT.good }} />
          <span className="text-sm font-bold font-['Tajawal']" style={{ color: RT.ink }}>
            مفردات القراءة ({vocabulary.length})
          </span>
        </div>
        <ChevronDown size={16} style={{ color: RT.muted }} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-6 pb-5 space-y-2 tu-vocabbox" style={{ borderTop: `1px solid ${RT.edge}` }}>
              <div className="pt-4 space-y-2">
                {vocabulary.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: RT.raise, border: `1px solid ${RT.edge}` }}>
                    <div className="flex-1 min-w-0" dir="ltr">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm font-en" style={{ color: RT.ink }}>
                          {v.word}
                        </span>
                        <span className="text-[10px] font-en" style={{ color: RT.muted }}>
                          {v.part_of_speech}
                        </span>
                      </div>
                      <p className="text-xs font-en mt-0.5" style={{ color: RT.body }}>
                        {v.definition_en}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-['Tajawal']" style={{ color: RT.muted }}>
                        {v.definition_ar}
                      </span>
                      {v.audio_url && (
                        <button
                          type="button"
                          onClick={(e) => playAudio(v, e)}
                          aria-label={`استمع: ${v.word}`}
                          style={{ background: playingId === v.id ? RT.gold : RT.wash, color: playingId === v.id ? "#14100a" : RT.gold }}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-75 flex-shrink-0 tu-vocab-play"
                        >
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComprehensionSection({ questions, onSubmitted, lettered = false }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const allAnswered = answered === total && total > 0;

  const handleSubmit = () => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    onSubmitted?.(Math.round((correctCount / total) * 100));
  };

  return (
    <div className="space-y-4 qx-scope" data-accent="sky">
      <div className="qx-eyebrow" dir="rtl">
        <span className="qx-spark" />
        <h3 className="qx-eyebrow-title">أسئلة الفهم</h3>
        <span className="qx-eyebrow-rule" />
        {answered > 0 && submitted && (
          <span className="text-xs text-slate-400 font-['Tajawal'] flex-shrink-0">
            {correctCount}/{answered} صحيحة
          </span>
        )}
      </div>

      {!submitted && (
        <div dir="rtl">
          <div className="qx-ticks">
            {questions.map((q) => (
              <span key={q.id} className="qx-tick" data-on={answers[q.id] ? "true" : "false"} />
            ))}
          </div>
          {answered > 0 && (
            <p className="qx-ticks-label text-left" dir="ltr">
              <span dir="rtl">{answered}/{total} مُجاب عليها</span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <MCQQuestion key={q.id} question={q} index={idx} lettered={lettered} answer={answers[q.id]} revealCorrect={submitted} onAnswer={(ans) => setAnswers((prev) => ({ ...prev, [q.id]: ans }))} />
        ))}
      </div>

      {!submitted && total > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => allAnswered && setConfirmOpen(true)}
            disabled={!allAnswered}
            className="px-6 py-3 rounded-xl font-bold font-['Tajawal'] text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed tu-submit"
            style={{
              background: allAnswered ? "#38bdf8" : "rgba(255,255,255,0.05)",
              color: allAnswered ? "#0a1225" : "#94a3b8",
              border: "1px solid " + (allAnswered ? "#38bdf8" : "rgba(255,255,255,0.08)"),
            }}
          >
            {allAnswered ? `تسليم الإجابات (${answered}/${total})` : `أجب على جميع الأسئلة قبل التسليم (${answered}/${total})`}
          </button>
        </div>
      )}

      {confirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 tu-confirm" style={{ background: "rgba(0,0,0,0.6)", WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)" }} onClick={() => setConfirmOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-2xl p-6 space-y-4 bg-slate-900 border border-slate-700" dir="rtl" role="dialog" aria-modal="true" aria-label="تأكيد التسليم" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-white font-['Tajawal']">تأكيد التسليم</h3>
              <p className="text-sm text-slate-300 font-['Tajawal']">
                لن تتمكن من تعديل هذه المحاولة بعد التسليم.
                <br />
                <span className="text-slate-500 text-xs">يمكنك إعادة المحاولة لاحقاً — درجتك الأعلى هي المحتسبة.</span>
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button type="button" onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold font-['Tajawal'] text-slate-400 border border-slate-700 hover:text-white transition-colors">
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmOpen(false);
                    handleSubmit();
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-bold font-['Tajawal'] text-slate-900 bg-sky-400"
                >
                  تسليم
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {submitted && allAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl tu-result"
          style={{
            background: correctCount === total ? "rgba(16,185,129,0.1)" : "rgba(56,189,248,0.1)",
            border: `1px solid ${correctCount === total ? "rgba(16,185,129,0.2)" : "rgba(56,189,248,0.2)"}`,
          }}
        >
          <CheckCircle size={20} className={correctCount === total ? "text-emerald-400" : "text-sky-400"} />
          <p className="text-sm font-medium font-['Tajawal']" style={{ color: correctCount === total ? "#34d399" : "#38bdf8" }}>
            {correctCount === total ? "ممتاز! أجبت على جميع الأسئلة بشكل صحيح" : `أجبت على ${correctCount} من ${total} بشكل صحيح`}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function MCQQuestion({ question, index, answer, revealCorrect = false, onAnswer, lettered = false }) {
  const shuffledChoices = useMemo(() => seededShuffle(question.choices || [], SHUFFLE_SALT + question.id), [question.id, question.choices]);
  const isRight = (c) => c.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
  const handleSelect = (choice) => {
    if (revealCorrect) return;
    onAnswer({ selected: choice, correct: isRight(choice) });
  };
  const typeBadge = QUESTION_TYPE_LABELS[question.question_type] || question.question_type;

  return (
    <div className="qx-card" data-accent="sky" dir="rtl">
      <span className="qx-rail" />
      <span className="qx-node" />
      <span className="qx-ghost-num" aria-hidden="true">
        {index + 1}
      </span>
      <div className="qx-meta">
        <span className="qx-spark" />
        <span className="qx-type">{typeBadge}</span>
        <span className="qx-qnum" dir="ltr">
          Q{index + 1}
        </span>
      </div>
      <p className="qx-question" dir="ltr">
        {question.question_en}
      </p>
      {question.question_ar && (
        <p className="qx-question-ar" dir="rtl">
          {question.question_ar}
        </p>
      )}
      <div className="qx-well" dir="ltr">
        {shuffledChoices.map((choice, i) => {
          const isSelected = answer?.selected === choice;
          const isCorrectAnswer = isRight(choice);
          const state = revealCorrect && isCorrectAnswer ? "correct" : revealCorrect && isSelected && !answer?.correct ? "wrong" : isSelected ? "selected" : "idle";
          return (
            <button key={i} type="button" onClick={() => handleSelect(choice)} disabled={revealCorrect} className="qx-opt" data-state={state}>
              <span className="qx-marker">{state === "correct" ? <CheckCircle size={14} /> : state === "wrong" ? <XCircle size={14} /> : String.fromCharCode(65 + i)}</span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>
      <div className="qx-foot space-y-3">
        {!revealCorrect && <QuestionHint hint={question.hint} accent="sky" kind="reading" lettered={lettered} />}
        {revealCorrect && answer?.selected != null && (
          <VerdictPanel
            correct={!!answer.correct}
            selectedLabel={String.fromCharCode(65 + Math.max(0, shuffledChoices.indexOf(answer.selected)))}
            selectedText={answer.selected}
            correctLabel={String.fromCharCode(65 + Math.max(0, shuffledChoices.findIndex(isRight)))}
            correctText={question.correct_answer}
            wrongNote={question.wrong_notes?.[answer.selected]}
            explanationAr={question.explanation_ar}
            explanationEn={question.explanation_en}
            hint={question.hint}
            accent="sky"
            kind="reading"
            lettered={lettered}
          />
        )}
      </div>
    </div>
  );
}

function ReadingSkillBox({ reading }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6 space-y-3" style={{ background: RT.ground, border: `1px solid ${RT.edge}` }}>
      <div className="flex items-center gap-2">
        <Lightbulb size={16} style={{ color: RT.gold }} />
        <h3 className="text-sm font-bold font-['Tajawal']" style={{ color: RT.ink }}>
          مهارة القراءة: <bdi className="font-en" dir="ltr">{reading.reading_skill_name_en}</bdi>
          {reading.reading_skill_name_ar && ` — ${reading.reading_skill_name_ar}`}
        </h3>
      </div>
      {reading.reading_skill_explanation && (
        <p className="text-sm font-en leading-relaxed" dir="ltr" style={{ color: RT.body }}>
          {reading.reading_skill_explanation}
        </p>
      )}
    </div>
  );
}

function CriticalThinkingBox({ reading }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6 space-y-3" style={{ background: RT.ground, border: `1px solid ${RT.edge}` }}>
      <div className="flex items-center gap-2">
        <MessageSquare size={16} style={{ color: RT.quiet }} />
        <h3 className="text-sm font-bold font-['Tajawal']" style={{ color: RT.ink }}>
          تفكير ناقد
        </h3>
      </div>
      <p className="text-sm font-en leading-relaxed" dir="ltr" style={{ color: RT.ink }}>
        {reading.critical_thinking_prompt_en}
      </p>
      {reading.critical_thinking_prompt_ar && (
        <p className="text-sm font-['Tajawal']" dir="rtl" style={{ color: RT.body }}>
          {reading.critical_thinking_prompt_ar}
        </p>
      )}
    </div>
  );
}

function CompletedBanner({ attemptNumber, scores, onRetry }) {
  const [showHistory, setShowHistory] = useState(false);
  const score = scores[scores.length - 1];
  const best = Math.max(...scores);
  const prior = scores.slice(0, -1);
  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 overflow-hidden tu-completed">
      <div className="flex items-center justify-between px-4 py-2.5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400 font-['Tajawal']">تم إكمال هذا القسم</span>
          {attemptNumber > 1 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-['Tajawal']">المحاولة {attemptNumber}</span>}
          {score != null && <span className="text-xs text-emerald-400/70 font-['Tajawal']">— {score}%</span>}
          {best !== score && <span className="text-[10px] text-amber-400/70 font-['Tajawal']">· أفضل: {best}%</span>}
        </div>
        <div className="flex items-center gap-2">
          {prior.length > 0 && (
            <button type="button" onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors font-['Tajawal']">
              <History size={12} />
              السابقة
            </button>
          )}
          <button type="button" onClick={onRetry} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors font-['Tajawal'] border border-slate-700/50 tu-retry">
            <RotateCcw size={12} />
            محاولة جديدة
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showHistory && prior.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-3 border-t border-emerald-500/15">
              <div className="pt-2.5 space-y-1.5">
                {prior.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-['Tajawal']">
                    <span className="font-medium">محاولة {i + 1}</span>
                    <span>{s}%</span>
                    {s === best && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">الأفضل</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
