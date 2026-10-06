import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IRREGULAR_VERBS, acceptedForms } from "../../content/irregularVerbs";
import { track } from "../../lib/track";
import { CTA, QUIZ_MISS, QUIZ_PRAISE, scoreLine, verbsWord } from "./copy";
import { KEYS, cleanAnswer, playVerb, readJson, shuffle, writeJson } from "./lib";
import { Icon } from "./VerbList";

/**
 * «وضع التدريب» — flashcards and a ten-question quiz over the verbs the
 * visitor is looking at: the current filter when one is on, otherwise the
 * whole list weighted towards the essential tier.
 *
 * Every random choice happens in an effect or a handler, never during render:
 * the prerendered HTML and the first client render must be identical or React
 * throws the server markup away.
 */

const QUIZ_LEN = 10;
const BY_ID = Object.fromEntries(IRREGULAR_VERBS.map((v) => [v.id, v]));

function pickQuiz(pool, filtered) {
  if (filtered) return shuffle(pool).slice(0, QUIZ_LEN).map((v) => v.id);
  const t = (n) => shuffle(pool.filter((v) => v.tier === n));
  return shuffle([...t(1).slice(0, 7), ...t(2).slice(0, 2), ...t(3).slice(0, 1)]).map((v) => v.id);
}

function pickDeck(pool, filtered) {
  const list = filtered ? pool : pool.filter((v) => v.tier === 1);
  return shuffle(list).map((v) => v.id);
}

/* ── Flashcards ──────────────────────────────────────────────────────────── */

function Flashcards({ pool, filtered, mastered, setMastered }) {
  const [deck, setDeck] = useState(() => (filtered ? pool : pool.filter((v) => v.tier === 1)).map((v) => v.id));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const poolKey = useMemo(() => pool.map((v) => v.id).join(","), [pool]);

  // A new filter is a new deck. Shuffled here, after hydration.
  useEffect(() => {
    setDeck(pickDeck(pool, filtered));
    setIdx(0);
    setFlipped(false);
    setKnown(0);
  }, [poolKey, filtered]); // pool is read through poolKey

  const verb = BY_ID[deck[idx]];
  const done = idx >= deck.length;

  const flip = useCallback(() => {
    setFlipped(true);
    if (verb) playVerb(verb);
  }, [verb]);

  const next = useCallback(
    (knewIt) => {
      if (!verb) return;
      setMastered((prev) => {
        const s = new Set(prev);
        if (knewIt) s.add(verb.id);
        else s.delete(verb.id);
        return s;
      });
      if (knewIt) setKnown((k) => k + 1);
      setFlipped(false);
      setIdx((i) => i + 1);
    },
    [verb, setMastered],
  );

  const again = useCallback(() => {
    setDeck(pickDeck(pool, filtered));
    setIdx(0);
    setFlipped(false);
    setKnown(0);
  }, [pool, filtered]);

  if (!deck.length) {
    return <p className="vb-empty-note">لا توجد أفعال في الفلتر الحالي.</p>;
  }

  if (done) {
    return (
      <div className="vb-card vb-card--end">
        <p className="vb-end-big"><span className="vb-num">{known}</span> من <span className="vb-num">{deck.length}</span></p>
        <p className="vb-end-sub">بطاقة انتهت بـ «أعرفه». المتقَن يظهر بعلامة خضراء في الجدول.</p>
        <button type="button" className="vb-btn vb-btn--primary" onClick={again}>جولة جديدة</button>
      </div>
    );
  }

  return (
    <div className="vb-card" data-flipped={flipped ? "" : undefined}>
      <div className="vb-card-top">
        <span className="vb-card-count">
          البطاقة <span className="vb-num">{idx + 1}</span> من <span className="vb-num">{deck.length}</span>
        </span>
        {mastered.has(verb.id) ? <span className="vb-chip-done"><Icon id="check" size={13} /> متقَن سابقاً</span> : null}
      </div>
      <div className="vb-progress" aria-hidden="true"><span style={{ width: `${(idx / deck.length) * 100}%` }} /></div>

      <p className="vb-card-base" lang="en" dir="ltr">{verb.base}</p>
      <p className="vb-card-ar">{verb.ar}</p>

      {flipped ? (
        <div className="vb-card-back" aria-live="polite">
          <div className="vb-card-forms">
            <span className="vb-cf vb-cf--v2"><small>الماضي</small><b lang="en" dir="ltr">{verb.past}</b></span>
            <span className="vb-cf vb-cf--v3"><small>التصريف الثالث</small><b lang="en" dir="ltr">{verb.participle}</b></span>
          </div>
          <button type="button" className="vb-ghost" onClick={() => playVerb(verb)}>
            <Icon id="vol" size={16} /> استماع مرة ثانية
          </button>
          <div className="vb-card-actions">
            <button type="button" className="vb-btn vb-btn--ok" onClick={() => next(true)}>
              <Icon id="check" /> أعرفه
            </button>
            <button type="button" className="vb-btn vb-btn--quiet" onClick={() => next(false)}>
              أراجعه لاحقاً
            </button>
          </div>
        </div>
      ) : (
        <div className="vb-card-front">
          <p className="vb-card-q">الماضي والتصريف الثالث؟ التذكّر أولاً، ثم الإجابة.</p>
          <button type="button" className="vb-btn vb-btn--primary" onClick={flip}>عرض الإجابة</button>
        </div>
      )}
    </div>
  );
}

/* ── Quiz ────────────────────────────────────────────────────────────────── */

function Quiz({ pool, filtered }) {
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [best, setBest] = useState(null);
  const [nudge, setNudge] = useState(false);
  const [shared, setShared] = useState("");
  const inputRef = useRef(null);
  const nextRef = useRef(null);
  const poolKey = useMemo(() => pool.map((v) => v.id).join(","), [pool]);

  useEffect(() => {
    const b = readJson(KEYS.best, null);
    if (b && typeof b.score === "number" && typeof b.total === "number") setBest(b);
  }, []);

  // Changing the filter mid-quiz starts over on the new set.
  useEffect(() => {
    setQs([]);
    setIdx(0);
    setResults([]);
    setFeedback(null);
    setValue("");
  }, [poolKey]);

  const started = qs.length > 0;
  const finished = started && idx >= qs.length;
  const verb = started && !finished ? BY_ID[qs[idx]] : null;
  const score = results.filter((r) => r.ok).length;

  useEffect(() => {
    if (verb && !feedback) inputRef.current?.focus({ preventScroll: true });
    if (feedback) nextRef.current?.focus({ preventScroll: true });
  }, [verb, feedback]);

  useEffect(() => {
    if (!finished) return;
    const total = qs.length;
    track("verbs_quiz_done", { score, total });
    setBest((prev) => {
      if (prev && prev.score / prev.total >= score / total) return prev;
      const b = { score, total };
      writeJson(KEYS.best, b);
      return b;
    });
  }, [finished]); // once per finished round; score/qs are final by then

  const start = useCallback(() => {
    setQs(pickQuiz(pool, filtered));
    setIdx(0);
    setResults([]);
    setFeedback(null);
    setValue("");
    setShared("");
  }, [pool, filtered]);

  const check = useCallback(
    (giveUp) => {
      if (!verb || feedback) return;
      const given = cleanAnswer(value);
      if (!given && !giveUp) {
        setNudge(true);
        return;
      }
      setNudge(false);
      const accepted = acceptedForms(verb, "past").map(cleanAnswer);
      // «was/were» typed whole is right too.
      const parts = given.split(/\s*(?:\/|,|\bor\b|\band\b)\s*/).filter(Boolean);
      const ok = !giveUp && parts.length > 0 && parts.every((p) => accepted.includes(p));
      const line = ok ? QUIZ_PRAISE[idx % QUIZ_PRAISE.length] : QUIZ_MISS[idx % QUIZ_MISS.length];
      setFeedback({ ok, line });
      setResults((r) => [...r, { id: verb.id, ok }]);
      playVerb(verb);
    },
    [verb, feedback, value, idx],
  );

  const next = useCallback(() => {
    setFeedback(null);
    setValue("");
    setIdx((i) => i + 1);
  }, []);

  const share = useCallback(async () => {
    const url = "https://fluentia.academy/verbs";
    const text = `جبت ${score} من ${qs.length} في اختبار الأفعال الشاذة من أكاديمية طلاقة. الاختبار مجاني هنا:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "اختبار الأفعال الشاذة", text, url });
        track("verbs_share", { method: "native" });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared("تم نسخ النتيجة والرابط.");
      track("verbs_share", { method: "clipboard" });
    } catch {
      setShared(`${text} ${url}`);
    }
  }, [score, qs.length]);

  if (!started) {
    return (
      <div className="vb-card vb-card--intro">
        <p className="vb-quiz-lead">
          <span className="vb-num">{QUIZ_LEN}</span> أسئلة: يظهر الفعل ومعناه، ويُكتب ماضيه بالإنجليزي. التصحيح فوري، مع النطق.
        </p>
        <p className="vb-quiz-pool">
          {filtered
            ? `الأسئلة من الفلتر الحالي: ${verbsWord(pool.length)}.`
            : "الأسئلة من القائمة كلها، والأولوية للأفعال الأساسية."}
        </p>
        {best ? (
          <p className="vb-quiz-best">أفضل نتيجة سابقة: <span className="vb-num">{best.score}</span> من <span className="vb-num">{best.total}</span></p>
        ) : null}
        <button type="button" className="vb-btn vb-btn--primary" onClick={start} disabled={!pool.length}>يلا نبدأ</button>
      </div>
    );
  }

  if (finished) {
    const missed = results.filter((r) => !r.ok).map((r) => BY_ID[r.id]);
    return (
      <div className="vb-card vb-card--end" aria-live="polite">
        <p className="vb-end-big"><span className="vb-num">{score}</span> من <span className="vb-num">{qs.length}</span></p>
        <p className="vb-end-sub">{scoreLine(score, qs.length)}</p>
        {missed.length ? (
          <div className="vb-missed">
            <p className="vb-missed-t">للمراجعة:</p>
            <ul>
              {missed.map((v) => (
                <li key={v.id}>
                  <button type="button" className="vb-missed-play" onClick={() => playVerb(v)} aria-label={`استماع: ${v.base}`}>
                    <Icon id="vol" size={15} />
                  </button>
                  <span lang="en" dir="ltr" className="vb-missed-forms">
                    <b className="vb-t1">{v.base}</b> · <b className="vb-t2">{v.past}</b> · <b className="vb-t3">{v.participle}</b>
                  </span>
                  <span className="vb-dim">{v.ar}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="vb-card-actions">
          <button type="button" className="vb-btn vb-btn--primary" onClick={start}>إعادة المحاولة</button>
          <button type="button" className="vb-btn vb-btn--quiet" onClick={share}>مشاركة النتيجة</button>
        </div>
        {shared ? <p className="vb-shared" role="status">{shared}</p> : null}
        <div className="vb-quiz-cta">
          <p>{CTA.quiz}</p>
          <a className="vb-link" href={CTA.href} onClick={() => track("verbs_cta", { where: "quiz" })}>{CTA.label} ←</a>
        </div>
      </div>
    );
  }

  return (
    <div className="vb-card">
      <div className="vb-card-top">
        <span className="vb-card-count">
          السؤال <span className="vb-num">{idx + 1}</span> من <span className="vb-num">{qs.length}</span>
        </span>
        <span className="vb-card-count">الصحيح: <span className="vb-num">{score}</span></span>
      </div>
      <div className="vb-progress" aria-hidden="true"><span style={{ width: `${(idx / qs.length) * 100}%` }} /></div>

      <p className="vb-card-q">ما الماضي من الفعل</p>
      <p className="vb-card-base" lang="en" dir="ltr">{verb.base}</p>
      <p className="vb-card-ar">{verb.ar}</p>

      <form
        className="vb-quiz-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (feedback) next();
          else check(false);
        }}
      >
        <label className="vb-sr" htmlFor="vb-answer">الماضي من {verb.base}</label>
        <input
          id="vb-answer"
          ref={inputRef}
          className="vb-input"
          data-state={feedback ? (feedback.ok ? "ok" : "no") : undefined}
          lang="en"
          dir="ltr"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setNudge(false);
          }}
          readOnly={Boolean(feedback)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          placeholder="Past Simple"
          aria-describedby="vb-quiz-fb"
        />
        <div id="vb-quiz-fb" className="vb-fb" aria-live="polite">
          {nudge ? <p className="vb-fb-nudge">الخانة فاضية — الإجابة أولاً، أو «ما أعرف».</p> : null}
          {feedback ? (
            <p className={feedback.ok ? "vb-fb-ok" : "vb-fb-no"}>
              <span>{feedback.line}</span>
              {!feedback.ok ? <b lang="en" dir="ltr">{verb.past}</b> : null}
              <span className="vb-fb-forms" lang="en" dir="ltr">
                {verb.base} · {verb.past} · {verb.participle}
              </span>
            </p>
          ) : null}
        </div>
        {feedback ? (
          <button ref={nextRef} type="submit" className="vb-btn vb-btn--primary">
            {idx + 1 >= qs.length ? "النتيجة" : "التالي"}
          </button>
        ) : (
          <div className="vb-card-actions">
            <button type="submit" className="vb-btn vb-btn--primary">تأكيد</button>
            <button type="button" className="vb-btn vb-btn--quiet" onClick={() => check(true)}>ما أعرف</button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function Practice({ pool, filtered, mastered, setMastered }) {
  const [mode, setMode] = useState("cards");
  const masteredCount = mastered.size;

  return (
    <div className="vb-practice">
      <div className="vb-tabs" role="tablist" aria-label="وضع التدريب">
        <button type="button" role="tab" id="vb-tab-cards" aria-selected={mode === "cards"} aria-controls="vb-panel" onClick={() => setMode("cards")}>
          بطاقات الحفظ
        </button>
        <button type="button" role="tab" id="vb-tab-quiz" aria-selected={mode === "quiz"} aria-controls="vb-panel" onClick={() => setMode("quiz")}>
          اختبار سريع
        </button>
      </div>
      <div className="vb-mastery" aria-live="polite">
        <span>المتقَن: <span className="vb-num">{masteredCount}</span> من <span className="vb-num">{IRREGULAR_VERBS.length}</span></span>
        <span className="vb-mastery-bar" aria-hidden="true"><span style={{ width: `${(masteredCount / IRREGULAR_VERBS.length) * 100}%` }} /></span>
      </div>
      <div id="vb-panel" role="tabpanel" aria-labelledby={mode === "cards" ? "vb-tab-cards" : "vb-tab-quiz"}>
        {mode === "cards" ? (
          <Flashcards pool={pool} filtered={filtered} mastered={mastered} setMastered={setMastered} />
        ) : (
          <Quiz pool={pool} filtered={filtered} />
        )}
      </div>
    </div>
  );
}
