/**
 * The Listening section — fluentia-lms pages/student/curriculum/tabs/ListeningTab.jsx
 * with players/listening/ListeningSection.jsx, TranscriptReader.jsx and
 * ListeningPlayer.jsx.
 *
 * Kept: «🎯 محاكاة IELTS» + its banner, the hero with «محادثة», the hidden-
 * transcript notice, «إظهار النص» → the tappable transcript (ArticleBody +
 * WordPopup), the player, and the seven questions with difficulty tiers,
 * «تلميح» → «تشغيل هذا الجزء», the submit that walks to the first unanswered
 * question, confirm, verdicts and score.
 *
 * «محاكاة IELTS» is enforced here (one uninterrupted play, no seek or speed);
 * in production the toggle shows its banner but the player ignores it.
 *
 * Graded locally; nothing is saved. Omitted: listen counter, admin drift chip,
 * SaveStatus, SubmitReminderBar, XP badge, and the runtime AI translation
 * fallback (every transcript word is covered by the snapshot).
 * Options keep production's order — the correct answers already sit at
 * B, A, C, D, A, C, B.
 */
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, CheckCircle, Headphones, RotateCcw, XCircle } from "lucide-react";
import data from "../../data/unit.json";
import SectionShell from "../../shared/SectionShell";
import ArticleBody from "../../shared/ArticleBody";
import WordPopup from "../../shared/WordPopup";
import QuestionHint, { VerdictPanel } from "../../shared/QuestionHint";
import { ListeningPlayer } from "./ListeningPlayer";
import "../../shared/questionCards.css";

const QUESTION_TYPE_LABELS = {
  main_idea: "الفكرة الرئيسية",
  detail: "تفاصيل",
  vocabulary: "مفردات",
  inference: "استنتاج",
  speaker_attitude: "نبرة المتحدّث",
  sequence: "تسلسل الأحداث",
  cause_effect: "السبب والنتيجة",
};
const DIFFICULTY = {
  1: { label: "سهل جداً" },
  2: { label: "سهل" },
  3: { label: "متوسط" },
  4: { label: "متقدّم" },
  5: { label: "تحدٍّ", flame: true },
};
const AUDIO_TYPE_LABELS = { interview: "مقابلة", dialogue: "محادثة", monologue: "حديث فردي", lecture: "محاضرة" };
const NO_FLAGS = [];

export default function TourListening() {
  const listening = data.listening;
  const [onePlayMode, setOnePlayMode] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [transcriptHidden, setTranscriptHidden] = useState(true);
  const exercises = listening.exercises;

  return (
    <SectionShell activity="listening" label="الاستماع">
      <div className="space-y-6">
        <div className="space-y-5">
          <div dir="rtl" className="flex justify-end">
            <button
              type="button"
              onClick={() => { setOnePlayMode((v) => !v); setHasPlayed(false); }}
              aria-pressed={onePlayMode}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 font-['Tajawal'] ${
                onePlayMode ? "border-amber-500/50 text-amber-300 bg-amber-500/10" : "border-slate-600 text-slate-400 hover:text-slate-300"
              }`}
              style={{ minHeight: 36 }}
            >
              {onePlayMode ? "✓ وضع الامتحان" : "🎯 محاكاة IELTS"}
            </button>
          </div>

          {onePlayMode && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-4 flex items-center gap-3" dir="rtl">
              <span className="text-2xl flex-shrink-0">🎯</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-200 font-['Tajawal']">{hasPlayed ? "انتهى التشغيل (وضع الامتحان)" : "وضع الاستماع لمرة واحدة فقط (محاكاة IELTS)"}</p>
                <p className="text-xs text-amber-200/70 mt-0.5 font-['Tajawal']">
                  {hasPlayed ? "لا يمكن إعادة التشغيل. تابع للأسئلة بالأسفل." : "سيُسمح بتشغيل التسجيل مرة واحدة فقط. التحكم بالسرعة ومنزلق التقدّم معطّلان."}
                </p>
              </div>
              {!hasPlayed && <button type="button" onClick={() => setOnePlayMode(false)} className="text-xs text-amber-200/60 hover:text-amber-200 transition-colors flex-shrink-0 font-['Tajawal']" style={{ minHeight: 36 }}>
                إلغاء
              </button>}
            </div>
          )}

          {/* ListeningSection — hero */}
          <div className="space-y-5">
            <div dir="rtl" className="relative overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 50px -24px rgba(0,0,0,0.75)" }}>
              <motion.img src={listening.image_url} alt="" initial={{ scale: 1.09 }} animate={{ scale: 1 }} transition={{ duration: 9, ease: "easeOut" }} className="w-full h-44 sm:h-60 object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,14,28,0.10) 0%, rgba(6,14,28,0.34) 48%, rgba(6,14,28,0.90) 100%)" }} />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Headphones size={14} style={{ color: "#7dd3fc", flexShrink: 0 }} />
                  <span className="text-[11px] font-bold font-['Tajawal'] uppercase tracking-wide" style={{ color: "#7dd3fc" }}>
                    الاستماع
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-['Tajawal'] leading-snug" style={{ color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,0.55)" }}>
                  {listening.title_ar || listening.title_en}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg font-['Tajawal']" style={{ background: "rgba(56,189,248,0.18)", color: "#bae6fd", border: "1px solid rgba(56,189,248,0.32)", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)" }}>
                    {AUDIO_TYPE_LABELS[listening.audio_type] || listening.audio_type}
                  </span>
                </div>
              </div>
            </div>

            {transcriptHidden ? (
              <div className="rounded-2xl p-6 text-center space-y-1 tu-transcript-notice" style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)" }} dir="rtl">
                <p className="text-sm font-['Tajawal']" style={{ color: "var(--text-muted)" }}>
                  استمع للمقطع وحاول الإجابة بدون قراءة النص.
                </p>
                <p className="text-xs font-['Tajawal']" style={{ color: "var(--text-muted)", opacity: 0.65 }}>
                  يمكنك إظهار النص من زر &quot;إظهار النص&quot; داخل المشغّل بالأسفل.
                </p>
              </div>
            ) : (
              <TranscriptReader transcript={listening.transcript} vocabIndex={listening.word_index} />
            )}
          </div>

          {exercises.length > 0 && <ListeningExercises exercises={exercises} audioUrl={listening.audio_url} />}
        </div>
      </div>

      <div className="tu-player-dock">
        <ListeningPlayer
          audioUrl={listening.audio_url}
          speakerSegments={listening.speaker_segments}
          durationMs={listening.audio_duration_seconds * 1000}
          transcriptShown={!transcriptHidden}
          onTranscriptToggle={() => setTranscriptHidden((v) => !v)}
          onePlay={onePlayMode}
          spent={hasPlayed}
          onEnded={() => { if (onePlayMode) setHasPlayed(true); }}
        />
      </div>
    </SectionShell>
  );
}

// players/listening/TranscriptReader.jsx
function TranscriptReader({ transcript, vocabIndex }) {
  const [active, setActive] = useState(null);
  const paragraphs = (() => {
    const raw = (transcript || "").trim();
    if (!raw) return [];
    const byBlank = raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    if (byBlank.length > 1) return byBlank;
    return raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  })();
  const onWordTap = useCallback((word, rect, vocabRow) => setActive({ word, rect, vocabRow }), []);
  const close = useCallback(() => setActive(null), []);
  if (!paragraphs.length) return null;
  return (
    <div
      className="rounded-2xl overflow-hidden tu-transcript"
      style={{
        background: "var(--ds-surface-1, var(--surface-raised, #11131c))",
        border: "1px solid var(--ds-border-subtle, var(--border-subtle, rgba(255,255,255,0.07)))",
        boxShadow: "0 20px 50px -28px rgba(0,0,0,0.5)",
      }}
    >
      <div dir="rtl" className="flex items-center gap-2.5 px-5 py-3.5 flex-wrap" style={{ borderBottom: "1px solid var(--ds-border-subtle, rgba(255,255,255,0.06))" }}>
        <BookOpenText size={16} style={{ color: "var(--ds-accent-primary, #e9b949)" }} />
        <span className="font-bold font-['Tajawal'] text-sm" style={{ color: "var(--ds-text-primary, #f8fafc)" }}>
          النص
        </span>
        <span className="font-['Tajawal'] text-[11px]" style={{ color: "var(--ds-text-tertiary, #64748b)" }}>
          — اضغط على أي كلمة لسماع نطقها ومعرفة معناها
        </span>
      </div>
      <div className="py-6 px-5 sm:px-6">
        <ArticleBody paragraphs={paragraphs} vocabIndex={vocabIndex} difficultWords={NO_FLAGS} onWordTap={onWordTap} />
      </div>
      {active && <WordPopup word={active.word} vocabRow={active.vocabRow} anchorRect={active.rect} onClose={close} />}
    </div>
  );
}

function ListeningExercises({ exercises, audioUrl }) {
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scores, setScores] = useState([]);
  const [guide, setGuide] = useState(null);
  const guideTimer = useRef(null);

  const total = exercises.length;
  const answered = Object.values(answers).filter((a) => a.selected !== null && a.selected !== undefined).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const allAnswered = answered === total && total > 0;
  const bestScore = scores.length ? Math.max(...scores) : null;
  const latestScore = scores[scores.length - 1];

  const handleFinish = () => {
    if (isCompleted) return;
    if (!allAnswered) {
      const firstMissing = exercises.findIndex((_, i) => answers[i]?.selected == null);
      if (firstMissing >= 0) {
        const el = document.getElementById(`listen-q-${firstMissing}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.transition = "box-shadow .25s ease";
          el.style.boxShadow = "0 0 0 2px #a855f7";
          setTimeout(() => { if (el) el.style.boxShadow = ""; }, 1600);
        }
        const remaining = total - answered;
        setGuide(remaining === 1 ? "باقٍ سؤال واحد بدون إجابة — انتقلنا له" : `باقٍ ${remaining} أسئلة بدون إجابة — انتقلنا لأول سؤال`);
        clearTimeout(guideTimer.current);
        guideTimer.current = setTimeout(() => setGuide(null), 3200);
      }
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    setConfirmOpen(false);
    setScores((s) => [...s, Math.round((correctCount / total) * 100)]);
    setIsCompleted(true);
  };

  const retry = () => {
    setIsCompleted(false);
    setAnswers({});
  };

  return (
    <div className="space-y-4 qx-scope" data-accent="violet">
      <div className="qx-eyebrow" dir="rtl">
        <span className="qx-spark" />
        <h3 className="qx-eyebrow-title">أسئلة الاستماع</h3>
        <span className="qx-eyebrow-rule" />
        {bestScore != null && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md font-['Tajawal'] flex-shrink-0" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
            أفضل درجة: {bestScore}%
          </span>
        )}
      </div>

      {!isCompleted && (
        <div dir="rtl">
          <div className="qx-ticks">
            {exercises.map((_, i) => (
              <span key={i} className="qx-tick" data-on={answers[i]?.selected != null ? "true" : "false"} />
            ))}
          </div>
          <p className="qx-ticks-label text-left" dir="ltr">
            <span dir="rtl">{answered}/{total} مُجاب عليها</span>
          </p>
        </div>
      )}

      {isCompleted && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle size={18} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400 font-['Tajawal']">تم إكمال هذا القسم</span>
              {scores.length > 1 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-['Tajawal']">المحاولة {scores.length}</span>}
              <span className="text-xs text-emerald-400/70 font-['Tajawal']">— {latestScore}%</span>
            </div>
            <button type="button" onClick={retry} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-sky-400 hover:bg-sky-500/10 transition-colors font-['Tajawal'] border border-[var(--border-subtle)] tu-retry">
              <RotateCcw size={12} />
              محاولة جديدة
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <div key={idx} id={`listen-q-${idx}`} className="rounded-xl" style={{ scrollMarginTop: "calc(var(--header-height, 64px) + 24px)" }}>
            <ListeningMCQ exercise={ex} index={idx} answer={answers[idx]} audioUrl={audioUrl} revealCorrect={isCompleted} onAnswer={(ans) => !isCompleted && setAnswers((prev) => ({ ...prev, [idx]: ans }))} />
          </div>
        ))}
      </div>

      {!isCompleted && total > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-3 rounded-xl font-bold font-['Tajawal'] text-sm transition-all active:scale-95 tu-submit"
            style={{
              background: allAnswered ? "#a855f7" : "var(--surface-raised)",
              color: allAnswered ? "#fff" : "var(--text-muted)",
              border: "1px solid " + (allAnswered ? "#a855f7" : "var(--border-subtle)"),
            }}
          >
            {allAnswered ? `تسليم الإجابات (${answered}/${total})` : `أجب على جميع الأسئلة قبل التسليم (${answered}/${total})`}
          </button>
          <AnimatePresence>
            {guide && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-['Tajawal'] tu-guide" style={{ color: "#d8b4fe" }} role="status">
                {guide}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl tu-result"
          style={{
            background: latestScore === 100 ? "rgba(16,185,129,0.1)" : "rgba(56,189,248,0.1)",
            border: `1px solid ${latestScore === 100 ? "rgba(16,185,129,0.2)" : "rgba(56,189,248,0.2)"}`,
          }}
        >
          <CheckCircle size={20} className={latestScore === 100 ? "text-emerald-400" : "text-sky-400"} />
          <p className="text-sm font-medium font-['Tajawal']" style={{ color: latestScore === 100 ? "#34d399" : "#38bdf8" }}>
            {latestScore === 100 ? "ممتاز! أجبت على جميع الأسئلة بشكل صحيح" : `درجتك: ${latestScore}%`}
          </p>
        </motion.div>
      )}

      {confirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 tu-confirm" style={{ background: "rgba(0,0,0,0.6)", WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)" }} onClick={() => setConfirmOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)" }} dir="rtl" role="dialog" aria-modal="true" aria-label="تأكيد التسليم" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Tajawal']">تأكيد التسليم</h3>
              <p className="text-sm text-[var(--text-secondary)] font-['Tajawal']">
                لن تتمكن من تعديل هذه المحاولة بعد التسليم.
                <br />
                <span className="text-[var(--text-muted)] text-xs">يمكنك إعادة المحاولة لاحقاً — درجتك الأعلى هي المحتسبة.</span>
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button type="button" onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold font-['Tajawal'] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                  إلغاء
                </button>
                <button type="button" onClick={confirmSubmit} className="px-5 py-2 rounded-xl text-sm font-bold font-['Tajawal'] text-white" style={{ background: "#a855f7", border: "1px solid #a855f7" }}>
                  تسليم
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}

function ListeningMCQ({ exercise, index, answer, audioUrl, revealCorrect = false, onAnswer }) {
  const handleSelect = (optIdx) => {
    if (revealCorrect) return;
    onAnswer({ selected: optIdx, correct: optIdx === exercise.correct_answer_index });
  };
  const diff = DIFFICULTY[exercise.difficulty];
  return (
    <div className="qx-card" data-accent="violet" dir="rtl">
      <span className="qx-rail" />
      <span className="qx-node" />
      <span className="qx-ghost-num" aria-hidden="true">
        {index + 1}
      </span>
      {diff?.flame && <span data-hard-spine="" />}
      <div className="qx-meta">
        <span className="qx-spark" />
        {exercise.question_type && <span className="qx-type">{QUESTION_TYPE_LABELS[exercise.question_type] || exercise.question_type}</span>}
        {diff && (
          <>
            <span className="qx-sep">·</span>
            <span className="qx-diff" data-hard={diff.flame ? "true" : "false"}>
              {diff.flame ? "🔥 " : ""}
              {diff.label}
            </span>
          </>
        )}
        <span className="qx-qnum" dir="ltr">
          Q{index + 1}
        </span>
      </div>
      <p className="qx-question" dir="ltr">
        {exercise.question_en}
      </p>
      <div className="qx-well" dir="ltr">
        {exercise.options?.map((opt, i) => {
          const isSelected = answer?.selected === i;
          const isCorrectAnswer = i === exercise.correct_answer_index;
          const state = revealCorrect && isCorrectAnswer ? "correct" : revealCorrect && isSelected && !answer?.correct ? "wrong" : isSelected ? "selected" : "idle";
          return (
            <button key={i} type="button" onClick={() => handleSelect(i)} disabled={revealCorrect} className="qx-opt" data-state={state}>
              <span className="qx-marker">{state === "correct" ? <CheckCircle size={14} /> : state === "wrong" ? <XCircle size={14} /> : String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      <div className="qx-foot space-y-3">
        {!revealCorrect && <QuestionHint hint={exercise.hint} audioUrl={audioUrl} accent="violet" kind="listening" />}
        {revealCorrect && answer && answer.selected != null && (
          <VerdictPanel
            correct={!!answer.correct}
            selectedLabel={String.fromCharCode(65 + answer.selected)}
            selectedText={exercise.options?.[answer.selected]}
            correctLabel={String.fromCharCode(65 + exercise.correct_answer_index)}
            correctText={exercise.options?.[exercise.correct_answer_index]}
            wrongNote={exercise.wrong_notes?.[String(answer.selected)]}
            explanationAr={exercise.explanation_ar}
            hint={exercise.hint}
            audioUrl={audioUrl}
            accent="violet"
            kind="listening"
          />
        )}
      </div>
    </div>
  );
}
