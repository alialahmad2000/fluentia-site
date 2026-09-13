/**
 * The Vocabulary section — fluentia-lms pages/student/curriculum/tabs/VocabularyTab.jsx
 * with curriculum/vocab/VocabStudyBand.jsx, WordArtPlate.jsx and the word
 * detail sheet.
 *
 * Kept: the study band («117 كلمة في هذه الوحدة», the three counts, the next
 * word as its own plate), the filter chips, search, cards/list toggle, «تمرّن»,
 * the state group «لم تبدأها بعد» with 12-per-page «عرض المزيد», every card with
 * its plate and pronunciation, and the detail sheet a card opens.
 *
 * A visitor has no mastery record, so every word is «جديدة». Sessions, «تمرّن»
 * and the per-word exercises need that record (SRS + exercise results): they
 * answer with a note of what they do inside. Omitted: NudgeBanners, the
 * onboarding tour, the settings gear, SaveStatus, VocabularyExercises.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Dumbbell, Flame, LayoutGrid, List, Search, Sparkles, Volume2 } from "lucide-react";
import data from "../../data/unit.json";
import SectionShell from "../../shared/SectionShell";
import WordArtPlate, { posHue } from "./WordArtPlate";
import WordDetailSheet from "./WordDetailSheet";
import { g } from "../../lib/platform";
import { playWordAudioOnce } from "../../lib/wordAudio";

const POS_AR = { noun: "اسم", verb: "فعل", adjective: "صفة", adverb: "ظرف", preposition: "حرف جر", conjunction: "حرف عطف", pronoun: "ضمير" };
const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديدة" },
  { key: "learning", label: "تتعلمها" },
  { key: "mastered", label: "أتقنتها" },
  { key: "hard", label: "صعبة", icon: Flame },
  { key: "stalled", label: "معلّقة" },
];
const PAGE_SIZE = 12;
const SESSION_SIZE = 10;
const makeContainer = (count) => ({ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: count > 30 ? 0.02 : 0.05 } } });
const cardVariant = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };

const ALL_WORDS = data.readings.flatMap((r) => r.vocabulary);
const BY_ID = new Map(ALL_WORDS.map((w) => [w.id, w]));

export default function TourVocab() {
  const [viewMode, setViewMode] = useState("cards");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailWord, setDetailWord] = useState(null);
  const [practiceNote, setPracticeNote] = useState(false);

  const totalWords = ALL_WORDS.length;
  const level = () => "new";

  const filterWord = (word) => {
    if (filter === "hard" || filter === "stalled") return false;
    if (filter !== "all" && level(word) !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return word.word?.toLowerCase().includes(q) || word.definition_ar?.includes(q) || word.definition_en?.toLowerCase().includes(q);
    }
    return true;
  };
  const visible = ALL_WORDS.filter(filterWord);

  return (
    <SectionShell activity="vocabulary" label="المفردات">
      <div className="space-y-6">
        <VocabStudyBand
          totalWords={totalWords}
          nextWord={ALL_WORDS[0]}
          onStartSession={() => setPracticeNote((v) => !v)}
          onOpenWord={() => setDetailWord(ALL_WORDS[0])}
        />
        <AnimatePresence initial={false}>
          {practiceNote && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden" dir="rtl">
              <div className="tu-note tu-note--sky">
                <p className="tu-note__lead">جلسات التمرين متاحة داخل المنصة</p>
                <p className="tu-note__text">
                  تضمّ الجلسة عشر كلمات لم تُتقن بعد، ولكل كلمة ثلاثة تمارين: المعنى، والجملة، والاستماع. ثم تعود الكلمات في مراجعة متباعدة حتى تثبت. هنا تستطيع تصفّح كل كلمة وسماعها.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 tu-vocab-toolbar">
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar tu-noscrollbar">
            {FILTERS.map((f, i) => {
              const Icon = f.icon;
              const isDisabled = f.key === "hard" || f.key === "stalled";
              const tooltip = f.key === "hard" ? "ما عندك كلمات صعبة في هذي الوحدة الآن" : f.key === "stalled" ? "ما عندك كلمات معلّقة في هذي الوحدة" : undefined;
              return (
                <motion.button
                  key={f.key}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !isDisabled && setFilter(f.key)}
                  disabled={isDisabled}
                  aria-pressed={filter === f.key}
                  aria-label={`فلتر: ${f.label}`}
                  title={tooltip}
                  className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold font-['Tajawal'] whitespace-nowrap transition-all border ${
                    filter === f.key
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                      : isDisabled
                        ? "bg-white/[0.02] text-white/20 border-white/[0.04] cursor-not-allowed"
                        : "bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60"
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  {f.label}
                  {f.key === "new" && <span className="mr-1 opacity-60">{totalWords}</span>}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className={`flex items-center rounded-full border transition-all overflow-hidden ${searchOpen ? "w-40 bg-white/[0.03] border-white/[0.1]" : "w-9 border-transparent"}`}>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (searchOpen) setSearchQuery("");
                }}
                className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white/60 flex-shrink-0"
                aria-label="ابحث عن كلمة"
              >
                <Search size={14} />
              </button>
              {searchOpen && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن كلمة..."
                  className="bg-transparent text-xs text-white placeholder:text-white/30 outline-none w-full pr-0 pl-2 py-1.5 font-['Tajawal'] tu-vocab-search"
                />
              )}
            </div>
            <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
              <button type="button" onClick={() => setViewMode("cards")} aria-label="بطاقات" aria-pressed={viewMode === "cards"} className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === "cards" ? "bg-sky-500/15 text-sky-400" : "text-white/30 hover:text-white/50"}`}>
                <LayoutGrid size={13} />
              </button>
              <button type="button" onClick={() => setViewMode("list")} aria-label="قائمة" aria-pressed={viewMode === "list"} className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-sky-500/15 text-sky-400" : "text-white/30 hover:text-white/50"}`}>
                <List size={13} />
              </button>
            </div>
            <button type="button" onClick={() => setPracticeNote((v) => !v)} className="flex items-center gap-1.5 px-3.5 h-8 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25 hover:bg-sky-500/25 transition-colors font-['Tajawal']">
              <Dumbbell size={12} />
              تمرّن
            </button>
          </div>
        </div>

        {visible.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm font-['Tajawal']">لا توجد كلمات تطابق الفلتر</p>
          </div>
        )}

        {visible.length > 0 && (
          <div className="space-y-3">
            <div className="w-full flex items-center gap-2.5 pt-1" dir="rtl">
              <i className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.3)" }} />
              <span className="text-[13px] font-bold text-white/75 font-['Tajawal']">{g("لم تبدأها بعد", "لم تبدئيها بعد")}</span>
              <span className="text-[11px] text-white/30 font-['Tajawal'] tabular-nums">{visible.length}</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>
            <PaginatedTier key={`${filter}|${searchQuery}|${viewMode}`} words={visible} viewMode={viewMode} onTapWord={setDetailWord} />
          </div>
        )}
      </div>

      <WordDetailSheet
        word={detailWord}
        isOpen={!!detailWord}
        onClose={() => setDetailWord(null)}
        onOpenRelated={(id) => BY_ID.get(id) && setDetailWord(BY_ID.get(id))}
        inUnit={(id) => BY_ID.has(id)}
      />
    </SectionShell>
  );
}

// curriculum/vocab/VocabStudyBand.jsx — the untouched-unit state.
function VocabStudyBand({ totalWords, nextWord, onStartSession, onOpenWord }) {
  const batch = Math.min(SESSION_SIZE, totalWords);
  return (
    <div dir="rtl" className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(129,140,248,0.05) 55%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 88% 8%, rgba(56,189,248,0.16) 0%, transparent 58%)" }} />
      <div className="relative flex flex-col-reverse md:flex-row md:items-stretch gap-4 p-4 md:p-5">
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-wide text-sky-300/70 font-['Tajawal']">مفردات الوحدة</p>
            <h3 className="text-lg md:text-xl font-bold text-white font-['Tajawal'] leading-snug mt-0.5">{totalWords} كلمة في هذه الوحدة</h3>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {[
                { n: 0, label: g("أتقنتها", "أتقنتِها"), c: "#4ade80" },
                { n: 0, label: g("تتعلمها", "تتعلمينها"), c: "#fbbf24" },
                { n: totalWords, label: "جديدة", c: "rgba(255,255,255,0.25)" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 text-[11px] font-['Tajawal'] text-white/45">
                  <i className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
                  <span className="tabular-nums text-white/70 font-bold">{s.n}</span> {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              onClick={onStartSession}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold font-['Tajawal'] flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#38bdf8 0%,#6366f1 100%)", color: "#04121f", boxShadow: "0 10px 26px rgba(56,189,248,0.28)" }}
            >
              <Sparkles size={16} />
              {g("ابدأ جلسة", "ابدئي جلسة")} · {batch} {batch === 2 ? "كلمتان" : batch <= 10 ? "كلمات" : "كلمة"}
            </motion.button>
          </div>
        </div>
        {nextWord?.word && (
          <button
            type="button"
            onClick={onOpenWord}
            aria-label={`ابدأ بكلمة ${nextWord.word}`}
            className="group relative rounded-xl overflow-hidden flex-shrink-0 w-full md:w-[240px] aspect-[21/9] md:aspect-[16/11]"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <WordArtPlate word={nextWord.word} partOfSpeech={nextWord.part_of_speech} style={{ position: "absolute", inset: 0 }} />
            <span className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold font-['Tajawal'] text-white/85" style={{ background: "linear-gradient(transparent, rgba(4,12,24,0.85))" }}>
              التالية
              <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function PaginatedTier({ words, viewMode, onTapWord }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shown = words.slice(0, visibleCount);
  const hasMore = visibleCount < words.length;
  const more = hasMore && (
    <button
      type="button"
      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
      className="w-full py-2.5 mt-3 rounded-xl text-xs font-bold font-['Tajawal'] text-white/40 hover:text-white/60 transition-colors tu-more"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", minHeight: 44 }}
    >
      عرض المزيد ({words.length - visibleCount} متبقي)
    </button>
  );
  if (viewMode === "cards") {
    return (
      <>
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" variants={makeContainer(shown.length)} initial="hidden" animate="show">
          {shown.map((v) => (
            <motion.div key={v.id} variants={cardVariant}>
              <WordCard word={v} onPractice={() => onTapWord(v)} />
            </motion.div>
          ))}
        </motion.div>
        {more}
      </>
    );
  }
  return (
    <>
      <div className="rounded-xl overflow-hidden divide-y divide-white/[0.04]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        {shown.map((v) => (
          <WordListItem key={v.id} word={v} onPractice={() => onTapWord(v)} />
        ))}
      </div>
      {more}
    </>
  );
}

function AudioButton({ playing, onPlay, onPlate = false }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      title="استمع للكلمة"
      aria-label="استمع للكلمة"
      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all tu-card-play ${onPlate ? "absolute top-2 right-2 z-10" : ""}`}
      style={{ background: playing ? "rgba(56,189,248,0.22)" : "rgba(10,22,40,0.45)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
    >
      {playing ? (
        <div className="flex items-end gap-[2px] h-3">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-[2px] bg-sky-400 rounded-full" animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
          ))}
        </div>
      ) : (
        <Volume2 size={15} className="text-white/60" />
      )}
    </button>
  );
}

function WordCard({ word, onPractice }) {
  const [playing, setPlaying] = useState(false);
  const playAudio = (e) => {
    e.stopPropagation();
    if (!word.audio_url) return;
    playWordAudioOnce(word.audio_url, { onStart: () => setPlaying(true), onEnd: () => setPlaying(false) });
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl overflow-hidden cursor-pointer group relative tu-wordcard"
      role="button"
      tabIndex={0}
      aria-label={`${word.word}: ${word.definition_ar}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPractice?.();
        }
      }}
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "2px solid rgba(255,255,255,0.06)", transition: "all 0.2s ease-out" }}
      onClick={() => onPractice?.()}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <WordArtPlate word={word.word} partOfSpeech={word.part_of_speech} ipa={word.pronunciation_ipa} style={{ position: "absolute", inset: 0 }} />
        <div className="absolute top-2 left-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        {word.audio_url && <AudioButton playing={playing} onPlay={playAudio} onPlate />}
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        <p className="font-['Tajawal'] text-[13px] text-white/85 leading-snug line-clamp-2">
          <span className="text-white/35">{POS_AR[word.part_of_speech] || word.part_of_speech} · </span>
          {word.definition_ar}
        </p>
      </div>
    </motion.div>
  );
}

function WordListItem({ word, onPractice }) {
  const hue = posHue(word.part_of_speech);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onPractice?.()}>
      <span className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ background: `hsl(${hue} 70% 62% / 0.75)` }} />
      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-5">
        <div className="flex items-baseline gap-2 sm:w-52 sm:flex-shrink-0">
          <bdi dir="ltr" className="text-[15px] font-bold text-white/90" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {word.word}
          </bdi>
        </div>
        <p className="text-[11px] text-white/50 font-['Tajawal'] line-clamp-1 mt-0.5 sm:mt-0 sm:flex-1">
          <span className="text-white/30">{POS_AR[word.part_of_speech] || word.part_of_speech} · </span>
          {word.definition_ar}
        </p>
      </div>
      {word.audio_url && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playWordAudioOnce(word.audio_url);
          }}
          aria-label="استمع للكلمة"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/[0.07]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Volume2 size={14} className="text-white/45" />
        </button>
      )}
      <span className="w-2 h-2 rounded-full flex-shrink-0" title="لم تبدأ" style={{ background: "rgba(255,255,255,0.12)" }} />
    </div>
  );
}

