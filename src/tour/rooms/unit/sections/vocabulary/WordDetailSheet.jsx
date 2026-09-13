/**
 * fluentia-lms components/curriculum/word-detail/WordDetailSheet.jsx with its
 * DefinitionSection, RelationshipsSection and WordFamilySection — the sheet a
 * vocabulary card opens: side panel on desktop, bottom drawer on a phone.
 *
 * Tour changes:
 *   • Starts below the TourBar instead of at the very top of the viewport.
 *   • ProgressSection (the student's exercise record) and the pronunciation
 *     alert (not in this unit's data) are omitted.
 *   • A related word opens its own card only when it is one of this unit's 117
 *     words; others show as plain chips (production leaves those clickable and
 *     does nothing).
 *   • «تدرّب على هذي الكلمة» / «أضفها للمراجعة الفورية» need the student's SRS
 *     record; they answer with a line on what they do inside the platform.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Languages, RefreshCw, Repeat, Trees, Volume2, X, Zap } from "lucide-react";
import { playWordAudioOnce } from "../../lib/wordAudio";

const LEVEL_COLORS = {
  1: { bg: "rgba(34,197,94,0.18)", text: "rgb(34,197,94)", label: "A1" },
  2: { bg: "rgba(16,185,129,0.18)", text: "rgb(16,185,129)", label: "A2" },
  3: { bg: "rgba(56,189,248,0.18)", text: "rgb(56,189,248)", label: "B1" },
  4: { bg: "rgba(245,158,11,0.18)", text: "rgb(245,158,11)", label: "B2" },
  5: { bg: "rgba(239,68,68,0.18)", text: "rgb(239,68,68)", label: "C1" },
};
const clampLevel = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.min(5, Math.max(1, Math.round(v)));
};
const POS_COLS_AR = [
  { key: "verb", label: "فعل" },
  { key: "noun", label: "اسم" },
  { key: "adjective", label: "صفة" },
  { key: "adverb", label: "حال" },
];

function SectionHeading({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 font-['Tajawal'] font-bold" style={{ color: "var(--text-secondary, rgba(255,255,255,0.75))", fontSize: 13, opacity: 0.85 }}>
      <span style={{ color: "var(--text-tertiary)" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function DefinitionSection({ word, onPlayAudio }) {
  return (
    <section className="space-y-3" style={{ marginBottom: 20 }} dir="rtl">
      <SectionHeading icon={<Languages size={14} />} label="التعريف" />
      <p className="font-['Tajawal']" dir="rtl" style={{ color: "var(--text-primary, #faf5e6)", fontSize: 18, lineHeight: 1.5 }}>
        {word.definition_ar || <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>—</span>}
      </p>
      {word.example_sentence ? (
        <div className="rounded-xl" style={{ background: "var(--surface, rgba(255,255,255,0.04))", border: "1px solid var(--border, rgba(255,255,255,0.08))", padding: 12 }}>
          <div className="font-['Tajawal']" style={{ color: "var(--text-tertiary, rgba(255,255,255,0.55))", fontSize: 11, marginBottom: 6 }}>
            جملة مثال
          </div>
          <div className="flex items-start gap-2.5">
            {word.audio_url && (
              <button
                type="button"
                onClick={() => onPlayAudio?.(word.audio_url)}
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: "var(--surface-raised, rgba(255,255,255,0.05))", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
                aria-label="استمع للنطق"
              >
                <Volume2 size={14} />
              </button>
            )}
            <p dir="ltr" style={{ color: "var(--text-secondary, rgba(255,255,255,0.75))", fontSize: 15, lineHeight: 1.5, fontStyle: "italic", fontFamily: "'Inter', system-ui, sans-serif" }}>
              {word.example_sentence}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RelGroup({ icon, label, items, emptyMsg, onOpenRelated, inUnit }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 font-['Tajawal'] font-bold" style={{ color: "var(--text-secondary)", fontSize: 13 }}>
        <span style={{ color: "var(--text-tertiary)" }}>{icon}</span>
        <span>{label}</span>
      </div>
      {items.length === 0 ? (
        <p className="font-['Tajawal']" style={{ color: "var(--text-tertiary)", fontSize: 12, fontStyle: "italic" }}>
          {emptyMsg}
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => {
            const c = LEVEL_COLORS[clampLevel(item.level)];
            const known = !!item.vocabulary_id && inUnit(item.vocabulary_id);
            return (
              <button
                key={`${item.word}-${i}`}
                type="button"
                disabled={!known}
                onClick={() => known && onOpenRelated(item.vocabulary_id)}
                className="inline-flex items-center gap-1.5 font-en"
                style={{
                  background: known ? "var(--surface-raised, rgba(255,255,255,0.06))" : "var(--surface, rgba(255,255,255,0.04))",
                  border: known ? "1px solid rgba(168,85,247,0.30)" : "1px solid var(--border, rgba(255,255,255,0.08))",
                  color: "var(--text-primary)",
                  padding: "4px 10px",
                  borderRadius: 9999,
                  fontSize: 13,
                  cursor: known ? "pointer" : "default",
                  transition: "background 160ms ease",
                }}
                dir="ltr"
              >
                {item.is_strongest === true && (
                  <span aria-label="strongest synonym" style={{ color: "#fbbf24" }}>
                    ⭐
                  </span>
                )}
                <span>{item.word}</span>
                <span className="font-['Tajawal']" style={{ background: c.bg, color: c.text, padding: "1px 6px", borderRadius: 6, fontSize: 10, fontWeight: 700 }} dir="ltr">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MorphologyCard({ item }) {
  const m = item.morphology;
  if (!m) return null;
  return (
    <div className="rounded-lg p-2.5 mt-1.5 font-['Tajawal']" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)" }} dir="rtl">
      {m.note_ar && <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.6 }}>{m.note_ar}</p>}
      {m.affix && (
        <div className="space-y-1">
          <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.6 }}>
            <strong dir="ltr" style={{ fontFamily: "'Inter', system-ui", color: "rgb(168,85,247)" }}>
              {m.base_word}
            </strong>{" "}
            +{" "}
            <code dir="ltr" style={{ background: "rgba(168,85,247,0.16)", color: "rgb(168,85,247)", padding: "1px 6px", borderRadius: 4, fontFamily: "ui-monospace, monospace", fontSize: 11 }}>
              {m.affix}
            </code>
          </p>
          {m.rule_ar && <p style={{ color: "var(--text-primary)", fontSize: 12, lineHeight: 1.6 }}>{m.rule_ar}</p>}
          {Array.isArray(m.similar_examples) && m.similar_examples.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>أمثلة مشابهة:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {m.similar_examples.map((ex, i) => (
                  <span key={i} dir="ltr" className="font-en" style={{ background: "var(--surface-raised, rgba(255,255,255,0.05))", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WordFamilySection({ family, onOpenRelated, inUnit }) {
  const [openChipKey, setOpenChipKey] = useState(null);
  const items = Array.isArray(family) ? family : [];
  const groups = {};
  for (const col of POS_COLS_AR) groups[col.key] = [];
  for (const it of items) {
    const key = (it.pos || "").toLowerCase();
    if (groups[key]) groups[key].push(it);
  }
  return (
    <section style={{ marginBottom: 20 }} dir="rtl">
      <div className="flex items-center gap-1.5 font-['Tajawal'] font-bold" style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 10 }}>
        <Trees size={14} style={{ color: "var(--text-tertiary)" }} />
        <span>عائلة الكلمة</span>
      </div>
      {items.length === 0 ? (
        <p className="font-['Tajawal']" style={{ color: "var(--text-tertiary)", fontSize: 12, fontStyle: "italic" }}>
          ما عندنا عائلة كلمات لهالكلمة بعد
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {POS_COLS_AR.map((col) => (
            <div key={col.key} className="space-y-1.5">
              <div className="font-['Tajawal']" style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, textAlign: "center", borderBottom: "1px solid var(--border, rgba(255,255,255,0.06))", paddingBottom: 4 }}>
                {col.label}
              </div>
              <div className="flex flex-col gap-1.5">
                {groups[col.key].length === 0 ? (
                  <span style={{ color: "var(--text-tertiary)", fontSize: 11, textAlign: "center", opacity: 0.4 }}>—</span>
                ) : (
                  groups[col.key].map((it, i) => {
                    const chipKey = `${col.key}-${it.word}-${i}`;
                    const isOpen = openChipKey === chipKey;
                    const known = !!it.vocabulary_id && inUnit(it.vocabulary_id);
                    const isBase = it.is_base === true;
                    return (
                      <div key={chipKey}>
                        <button
                          type="button"
                          onClick={() => setOpenChipKey(isOpen ? null : chipKey)}
                          aria-expanded={isOpen}
                          className="font-en w-full"
                          style={{
                            background: isBase ? "rgba(251,191,36,0.10)" : isOpen ? "rgba(168,85,247,0.18)" : "var(--surface-raised, rgba(255,255,255,0.05))",
                            border: isBase ? "1px solid rgba(251,191,36,0.45)" : isOpen ? "1px solid rgba(168,85,247,0.40)" : "1px solid var(--border, rgba(255,255,255,0.08))",
                            color: "var(--text-primary)",
                            padding: "5px 10px",
                            borderRadius: 8,
                            fontSize: 12,
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "background 160ms ease",
                          }}
                          dir="ltr"
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isBase && <span style={{ color: "#fbbf24", fontSize: 11 }}>⭐</span>}
                            {it.is_opposite === true && <span style={{ color: "rgb(239,68,68)", fontSize: 11 }}>↔</span>}
                            <span>{it.word}</span>
                          </div>
                          {known && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenRelated(it.vocabulary_id);
                              }}
                              role="link"
                              style={{ display: "block", color: "var(--text-tertiary)", fontSize: 9, marginTop: 2, opacity: 0.65, cursor: "pointer", textDecoration: "underline", fontFamily: "'Tajawal', sans-serif" }}
                              dir="rtl"
                            >
                              افتح بطاقة
                            </span>
                          )}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                              <MorphologyCard item={it} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);
  return isMobile;
}

export default function WordDetailSheet({ word, isOpen, onClose, onOpenRelated, inUnit }) {
  const isMobile = useIsMobile();
  const [barH, setBarH] = useState(60);
  const [note, setNote] = useState(null);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const bar = document.querySelector(".tour-bar");
    if (bar) setBarH(Math.round(bar.getBoundingClientRect().height));
  }, [isOpen]);

  useEffect(() => setNote(null), [word?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const playAudio = useCallback((url) => { playWordAudioOnce(url); }, []);
  const synonyms = useMemo(() => (Array.isArray(word?.synonyms) ? word.synonyms : []), [word]);
  const antonyms = useMemo(() => (Array.isArray(word?.antonyms) ? word.antonyms : []), [word]);
  const family = useMemo(() => (Array.isArray(word?.word_family) ? word.word_family : []), [word]);

  const variants = isMobile ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } } : { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } };
  const panelStyle = isMobile
    ? { position: "fixed", bottom: 0, left: 0, right: 0, height: `min(85vh, calc(100dvh - ${barH + 12}px))`, borderTopLeftRadius: 24, borderTopRightRadius: 24 }
    : { position: "fixed", top: barH, bottom: 0, left: 0, width: "min(480px, 95vw)" };

  return createPortal(
    <AnimatePresence>
      {isOpen && word && (
        <>
          <motion.div
            key="word-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[58]"
            style={{ background: "rgba(2,6,15,0.62)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            aria-hidden="true"
          />
          <motion.aside
            key="word-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="word-detail-title"
            drag={isMobile ? "y" : false}
            dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
            dragElastic={isMobile ? 0.15 : 0}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.y > 140 || info.velocity.y > 600)) onClose?.();
            }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="z-[59] flex flex-col tu-wordsheet"
            style={{
              ...panelStyle,
              background: "linear-gradient(180deg, rgba(10,18,37,0.98) 0%, rgba(10,18,37,1) 60%)",
              borderInlineEnd: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
              borderTop: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
              color: "var(--text-primary, #faf5e6)",
              boxShadow: isMobile ? "0 -16px 40px rgba(0,0,0,0.45)" : "8px 0 40px rgba(0,0,0,0.45)",
            }}
            dir="rtl"
          >
            {isMobile && (
              <div className="flex justify-center pt-2">
                <span style={{ width: 40, height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.18)" }} aria-hidden="true" />
              </div>
            )}
            <header className="flex items-start justify-between gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,0.06))", background: "rgba(10,18,37,0.92)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  {word.audio_url && (
                    <button
                      type="button"
                      onClick={() => playAudio(word.audio_url)}
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center tu-sheet-play"
                      style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.20), rgba(168,85,247,0.10))", color: "rgb(56,189,248)", border: "1px solid rgba(168,85,247,0.30)" }}
                      aria-label="استمع للنطق"
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 id="word-detail-title" dir="ltr" className="font-en font-bold" style={{ fontSize: 26, lineHeight: 1.1, color: "var(--text-primary)", wordBreak: "break-word" }}>
                      {word.word}
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 mt-3 font-['Tajawal'] font-bold" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)", padding: "4px 10px", borderRadius: 9999, fontSize: 11 }}>
                  جديدة
                </span>
              </div>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface, rgba(255,255,255,0.04))", color: "var(--text-secondary)", border: "1px solid var(--border)" }} aria-label="إغلاق">
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ overscrollBehavior: "contain" }}>
              <DefinitionSection word={word} onPlayAudio={playAudio} />
              <section style={{ marginBottom: 20 }} dir="rtl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <RelGroup icon={<RefreshCw size={14} />} label="مرادفات" items={synonyms} emptyMsg="ما عندنا مرادفات لهالكلمة بعد" onOpenRelated={onOpenRelated} inUnit={inUnit} />
                  <RelGroup icon={<Repeat size={14} />} label="متضادات" items={antonyms} emptyMsg="ما عندنا متضادات لهالكلمة بعد" onOpenRelated={onOpenRelated} inUnit={inUnit} />
                </div>
              </section>
              <WordFamilySection family={family} onOpenRelated={onOpenRelated} inUnit={inUnit} />
              {note && (
                <p className="tu-popnote" role="status">
                  {note === "practice"
                    ? "داخل المنصة لكل كلمة ثلاثة تمارين: المعنى، والجملة، والاستماع. تُتقَن الكلمة حين تنجح فيها كلها."
                    : "داخل المنصة تدخل الكلمة مراجعتك اليومية، وتعود إليك في مواعيد متباعدة حتى تثبت."}
                </p>
              )}
            </div>

            <footer className="shrink-0 px-5 py-3 grid gap-2" style={{ background: "rgba(10,18,37,0.95)", borderTop: "1px solid var(--border, rgba(255,255,255,0.06))", gridTemplateColumns: "1fr 1fr", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
              <button type="button" onClick={() => setNote("practice")} className="font-['Tajawal'] font-bold inline-flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#0a1225", minHeight: 48, borderRadius: 14, fontSize: 14, boxShadow: "0 10px 22px rgba(217,119,6,0.30)" }}>
                <Dumbbell size={16} />
                تدرّب على هذي الكلمة
              </button>
              <button type="button" onClick={() => setNote("review")} className="font-['Tajawal'] font-bold inline-flex items-center justify-center gap-2" style={{ background: "var(--surface, rgba(255,255,255,0.04))", color: "var(--text-primary)", border: "1px solid var(--border, rgba(255,255,255,0.10))", minHeight: 48, borderRadius: 14, fontSize: 13 }}>
                <Zap size={14} />
                أضفها للمراجعة الفورية
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
