import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandMark from "../../components/BrandMark";
import { ROOMS } from "../../tour/rooms";
import data from "./heroMoments.json";

/**
 * V5HeroShowcase — «من داخل المنصة».
 *
 * The hero used to tell with a scripted chat (a made-up student, a trainer who
 * has since left). This shows instead: four moments of the real student
 * platform, replayed from the /tour snapshots — a word tapped in a real unit
 * reading, a proverb beside its Arabic twin, the verb ladder catching «writen»,
 * and the opening line of a library novel unfolding its Arabic. Every string
 * comes from heroMoments.json (scripts/hero/build-moments.mjs), and each moment
 * opens its own /tour room.
 *
 * Render is pure (SSR): the prerendered HTML carries moment 1 fully resolved.
 * Everything that moves starts in effects —
 *   • nothing plays until the card is on screen; off screen, all of it pauses;
 *   • prefers-reduced-motion keeps the resolved still, with tabs to switch;
 *   • CSS keyframes only, no rAF loops or canvas (the Android flicker rule);
 *   • audio exists only after a tap, one clip at a time.
 */

const M = data.moments;
const roomTitle = (slug) => ROOMS.find((r) => r.slug === slug)?.title || "";

/**
 * Keep short negations and joiners with their neighbour, by whole word, so a
 * line never ends on «لا» / «لن» or starts on «—» / «·». (No regex lookbehind:
 * it breaks the bundle on iOS Safari below 16.4.)
 */
const GLUE_NEXT = new Set(["لا", "ولا", "لن", "لم", "—", "·"]);
const GLUE_PREV = new Set(["—", "·"]);
export function glueAr(text) {
  const w = String(text).split(" ");
  return w
    .map((word, i) => {
      if (i === w.length - 1) return word;
      const bind = GLUE_NEXT.has(word) || GLUE_PREV.has(w[i + 1]);
      return word + (bind ? "\u00A0" : " ");
    })
    .join("");
}

/* Arabic copy that quotes English: every Latin run gets its own isolate. */
const LATIN = /([A-Za-z][A-Za-z0-9'’-]*(?:[ ]+[A-Za-z0-9][A-Za-z0-9'’-]*)*)/;
function Iso({ text }) {
  return String(text)
    .split(LATIN)
    .map((part, i) =>
      i % 2 ? (
        <span key={i} className="hs-ltr" dir="ltr">
          {part}
        </span>
      ) : (
        part
      )
    );
}

/* ─── Icons (inline; lucide would pull its runtime into the main chunk) ─── */
const Speaker = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Check = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Cross = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

function SpeakBtn({ id, playing, onListen, label, compact = false }) {
  const on = playing === id;
  return (
    <button
      type="button"
      className="hs-speak"
      data-compact={compact || undefined}
      data-playing={on}
      aria-pressed={on}
      aria-label={label}
      onClick={() => onListen(id)}
    >
      {on ? (
        <span className="hs-bars" aria-hidden>
          <i style={{ "--i": 0 }} />
          <i style={{ "--i": 1 }} />
          <i style={{ "--i": 2 }} />
          <i style={{ "--i": 3 }} />
        </span>
      ) : (
        <Speaker />
      )}
      {!compact && <span>{on ? "إيقاف" : "استمع"}</span>}
    </button>
  );
}

/* ─── 1 · A word tapped in a unit reading ─── */
function ReadingScene({ anim, playing, onListen }) {
  const r = M.reading;
  const [artLoaded, setArtLoaded] = useState(false);
  const at = r.sentence.search(new RegExp(`\\b${r.word}\\b`));
  const before = r.sentence.slice(0, at);
  const after = r.sentence.slice(at + r.word.length);
  const wordRef = useRef(null);
  const popRef = useRef(null);

  // Point the card's caret at the tapped word, wherever the line wrapped it.
  useEffect(() => {
    const place = () => {
      const w = wordRef.current;
      const p = popRef.current;
      if (!w || !p) return;
      const wr = w.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      const x = Math.min(Math.max(wr.left + wr.width / 2 - pr.left, 22), pr.width - 22);
      p.style.setProperty("--caret-x", `${Math.round(x)}px`);
      p.setAttribute("data-caret", "");
    };
    place();
    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return; // iOS toolbar height changes: ignore
      lastW = window.innerWidth;
      place();
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready?.then(place).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="hs-scene hs-reading" data-anim={anim ? "on" : "off"}>
      {r.image && (
        <div className="hs-art" data-loaded={artLoaded} aria-hidden>
          {/* the reading's own art, as the student sees it above the passage; it is the
              first scene, so it loads with the card rather than lazily */}
          <img src={r.image} alt="" decoding="async" fetchpriority="high" onLoad={() => setArtLoaded(true)} />
        </div>
      )}
      <p className="hs-cap">تضغط على أي كلمة، فيظهر معناها ونطقها</p>
      <div className="hs-body">
      <div className="hs-page" dir="ltr" lang="en">
        <span className="hs-kicker">
          {r.cefr} · {r.titleEn}
        </span>
        <p className="hs-passage">
          {before}
          <button
            type="button"
            className="hs-word"
            data-playing={playing === "reading"}
            ref={wordRef}
            onClick={() => onListen("reading")}
            aria-label={`استمع لنطق ${r.word}`}
          >
            <span className="hs-ripple" aria-hidden />
            {r.word}
          </button>
          {after}
        </p>
      </div>
      <div className="hs-pop" ref={popRef}>
        <div className="hs-pop-head">
          <span className="hs-pop-word" dir="ltr" lang="en">
            {r.word}
          </span>
          {r.pos && (
            <span className="hs-pos" dir="ltr">
              {r.pos}
            </span>
          )}
          <SpeakBtn id="reading" playing={playing} onListen={onListen} label={`استمع لنطق ${r.word}`} />
        </div>
        <dl className="hs-pop-grid">
          <dt className="hs-lbl hs-stag" style={{ "--d": "1250ms" }}>المعنى</dt>
          <dd className="hs-meaning hs-stag" style={{ "--d": "1250ms" }}>{r.meaningAr}</dd>
          {r.example && (
            <>
              <dt className="hs-lbl hs-stag" style={{ "--d": "1450ms" }}>في سياق</dt>
              <dd className="hs-ex hs-stag" style={{ "--d": "1450ms" }} dir="ltr" lang="en">
                {r.example}
              </dd>
            </>
          )}
        </dl>
      </div>
      </div>
    </div>
  );
}

/* ─── 2 · A proverb beside its Arabic twin ─── */
const PROVERB_WORDS = M.proverb.textEn.split(" ");
function ProverbScene({ anim, playing, onListen }) {
  const p = M.proverb;
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="hs-scene hs-proverb" data-anim={anim ? "on" : "off"}>
      {p.image && (
        <div className="hs-art" data-loaded={loaded} aria-hidden>
          <img src={p.image} alt="" loading="lazy" decoding="async" onLoad={() => setLoaded(true)} />
        </div>
      )}
      <p className="hs-cap">مثل إنجليزي، وما يقابله عندنا</p>
      <div className="hs-prov-body">
        <blockquote className="hs-prov-en" dir="ltr" lang="en">
          {PROVERB_WORDS.map((w, i) => (
            <span key={i}>
              <span className="hs-pw" style={{ "--d": `${350 + i * 85}ms` }}>{w}</span>
              {i < PROVERB_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </blockquote>
        <div className="hs-twin-rule">توأمه العربي</div>
        <p className="hs-twin">{glueAr(p.twinAr)}</p>
        <p className="hs-prov-meaning">{glueAr(p.meaningAr)}</p>
        <SpeakBtn id="proverb" playing={playing} onListen={onListen} label="استمع إلى نطق المثل" />
      </div>
    </div>
  );
}

/* ─── 3 · The verb ladder catching a one-letter miss ─── */
const typed = (word, start, step = 95) =>
  word.split("").map((ch, i) => (
    <i key={i} style={{ "--d": `${start + i * step}ms` }}>
      {ch}
    </i>
  ));
function VerbScene({ anim, playing, onListen }) {
  const v = M.verb;
  return (
    <div className="hs-scene hs-verb" data-anim={anim ? "on" : "off"}>
      <p className="hs-cap">تكتب التصريفات بنفسك، والتصحيح فوري</p>
      <div className="hs-body">
      <div className="hs-drill">
        <div className="hs-base">
          <span className="hs-base-en" dir="ltr" lang="en">
            {v.base}
          </span>
          <span className="hs-base-ar">{v.meaningAr}</span>
        </div>
        <div className="hs-slots">
          <div className="hs-slot" data-v="ok">
            <span className="hs-slot-k">التصريف الثاني</span>
            <span className="hs-in" dir="ltr" lang="en">
              <span className="hs-typed">{typed(v.v2, 450)}</span>
              <span className="hs-mark">
                <Check />
              </span>
            </span>
          </div>
          <div className="hs-slot" data-v="no">
            <span className="hs-slot-k">التصريف الثالث</span>
            <span className="hs-in" dir="ltr" lang="en">
              <span className="hs-typed">{typed(v.given, 1080)}</span>
              <span className="hs-mark">
                <Cross />
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="hs-verdict">
        <div className="hs-verdict-top">
          <b className="hs-verdict-title">{v.errorTitle}</b>
          <span className="hs-fix">
            <span className="hs-fix-k">الصواب</span>
            <span className="hs-diff" dir="ltr" lang="en">
              {v.diff.map((d, i) => (
                <span key={i} className={`hs-ch hs-ch--${d.t}`}>
                  {d.ch}
                </span>
              ))}
            </span>
          </span>
          <SpeakBtn id="verb" playing={playing} onListen={onListen} label={`استمع لنطق ${v.v3}`} compact />
        </div>
        <p className="hs-trap">
          <b>انتبه:</b> <Iso text={glueAr(v.trapAr)} />
        </p>
      </div>
      </div>
    </div>
  );
}

/* ─── 4 · A library novel: the narrated line, then its Arabic ─── */
const NOVEL_WORDS = (() => {
  const words = M.novel.en.split(" ");
  const total = M.novel.en.length;
  let offset = 0;
  return words.map((w) => {
    // light each word at its share of the sentence, over the narration's span
    const at = offset / total;
    offset += w.length + 1;
    return { w, d: Math.round(400 + at * 2800) };
  });
})();
function NovelScene({ anim, playing, onListen }) {
  const n = M.novel;
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="hs-scene hs-novel" data-anim={anim ? "on" : "off"}>
      {n.image && (
        <div className="hs-art" data-loaded={loaded} aria-hidden>
          <img src={n.image} alt="" loading="lazy" decoding="async" onLoad={() => setLoaded(true)} />
        </div>
      )}
      <p className="hs-cap">تسمع الراوي، ثم تكشف معنى كل جملة</p>
      <div className="hs-novel-body">
        <div className="hs-book">
          <span className="hs-book-en" dir="ltr" lang="en">
            {n.titleEn}
          </span>
          <span className="hs-book-ar">
            {n.titleAr} · الفصل {n.chapter}
          </span>
          <SpeakBtn id="novel" playing={playing} onListen={onListen} label="استمع للجملة بصوت الراوي" />
        </div>
        <p className="hs-novel-en" dir="ltr" lang="en">
          {NOVEL_WORDS.map(({ w, d }, i) => (
            <span key={i} className="hs-kw" style={{ "--d": `${d}ms` }}>
              {w}
              {i < NOVEL_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <div className="hs-veil">
          <p>{glueAr(n.ar)}</p>
        </div>
      </div>
    </div>
  );
}

/* Arabic counted noun after a Western-digit number (the counts come from data). */
function counted(n, { acc, gen, pl }) {
  const r = n % 100;
  if (r >= 3 && r <= 10) return `${n} ${pl}`;
  if (r >= 11) return `${n} ${acc}`;
  return `${n} ${gen}`; // 100, 200, … and the rare 101/102
}
const MITHL = { acc: "مثلاً", gen: "مثل", pl: "أمثال" };
const TAABIR = { acc: "تعبيراً", gen: "تعبير", pl: "تعابير" };
const FIIL = { acc: "فعلاً شاذاً", gen: "فعل شاذ", pl: "أفعال شاذة" };

const MOMENTS = [
  {
    id: "reading",
    tab: "القراءة",
    ms: 8500,
    room: M.reading.room,
    meta: `الوحدة ${M.reading.unitNumber} · ${M.reading.themeAr}`,
    audio: { url: M.reading.audio },
    Scene: ReadingScene,
  },
  {
    id: "proverb",
    tab: "الأمثال",
    ms: 9000,
    room: M.proverb.room,
    meta: `ضمن ${counted(M.proverb.proverbs, MITHL)} و${counted(M.proverb.idioms, TAABIR)}`,
    audio: { url: M.proverb.audio },
    Scene: ProverbScene,
  },
  {
    id: "verb",
    tab: "الأفعال",
    ms: 10500,
    room: M.verb.room,
    meta: `ضمن ${counted(M.verb.catalogue, FIIL)}`,
    audio: { url: M.verb.audio },
    Scene: VerbScene,
  },
  {
    id: "novel",
    tab: "الروايات",
    ms: 10500,
    room: M.novel.room,
    meta: `رواية «${M.novel.titleAr}» · مستوى ${M.novel.cefr}`,
    audio: { url: M.novel.audio, t1: M.novel.t1 },
    Scene: NovelScene,
  },
];

export default function V5HeroShowcase() {
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0); // bump to replay the same moment
  const [live, setLive] = useState(false); // on screen once, motion allowed
  const [shown, setShown] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [held, setHeld] = useState(false); // pointer over / keyboard focus inside
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(null);
  const rootRef = useRef(null);
  const audioRef = useRef(null);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.ontimeupdate = null;
    }
    setPlaying(null);
  }, []);

  // First sight: reveal the card and start the reel together. Off screen: pause.
  useEffect(() => {
    const el = rootRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = () => {
      setShown(true);
      if (!reduce) setLive(true);
    };
    if (!("IntersectionObserver" in window) || !el) {
      setOnScreen(true);
      start();
      return undefined;
    }
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        const visible = e.isIntersecting && e.intersectionRatio >= 0.2;
        setOnScreen(e.isIntersecting);
        if (visible && !started) {
          started = true;
          start();
        }
      },
      { threshold: [0, 0.2, 0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A hidden tab counts as off screen.
  const [tabHidden, setTabHidden] = useState(false);
  useEffect(() => {
    const on = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  const idle = !onScreen || tabHidden;
  useEffect(() => {
    if (idle) stopAudio();
  }, [idle, stopAudio]);
  useEffect(() => () => audioRef.current?.pause(), []);

  const go = useCallback(
    (i) => {
      stopAudio();
      setActive((i + MOMENTS.length) % MOMENTS.length);
      setRun((r) => r + 1);
    },
    [stopAudio]
  );

  const onListen = useCallback(
    (id) => {
      if (playing === id) {
        stopAudio();
        return;
      }
      const m = MOMENTS.find((x) => x.id === id);
      if (!m) return;
      let a = audioRef.current;
      if (!a) {
        a = new Audio();
        a.playsInline = true;
        audioRef.current = a;
      }
      a.pause();
      a.src = m.audio.url;
      a.currentTime = 0;
      a.onended = () => setPlaying(null);
      a.onerror = () => setPlaying(null);
      a.ontimeupdate = m.audio.t1
        ? () => {
            if (a.currentTime * 1000 >= m.audio.t1) {
              a.pause();
              a.ontimeupdate = null;
              setPlaying(null);
            }
          }
        : null;
      setPlaying(id);
      if (live) setUserPaused(true);
      const p = a.play();
      if (p && p.catch) p.catch(() => setPlaying(null));
    },
    [playing, stopAudio, live]
  );

  const onTabKey = (e) => {
    // RTL: the next tab sits to the LEFT
    if (e.key === "ArrowLeft") go(active + 1);
    else if (e.key === "ArrowRight") go(active - 1);
    else return;
    e.preventDefault();
    if (live) setUserPaused(true);
    const tabs = rootRef.current?.querySelectorAll(".hs-tab");
    const next = tabs?.[(active + (e.key === "ArrowLeft" ? 1 : -1) + MOMENTS.length) % MOMENTS.length];
    next?.focus();
  };

  const m = MOMENTS[active];
  const Scene = m.Scene;
  const holdFill = held || userPaused || playing !== null;
  const room = roomTitle(m.room);

  return (
    <div className="hs-wrap" data-shown={shown} ref={rootRef}>
      <div
        className="hs"
        data-m={m.id}
        data-idle={idle}
        data-hold={holdFill}
        data-user-paused={userPaused}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHeld(false)}
        onFocus={(e) => {
          if (e.target.matches?.(":focus-visible")) setHeld(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
        }}
      >
        <div className="hs-head">
          <BrandMark size={18} />
          <span className="hs-head-title">من داخل المنصة</span>
          <span className="hs-head-note">محتوى حقيقي كما يراه الطالب</span>
          {live && (
            <button
              type="button"
              className="hs-pause"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "استئناف العرض" : "إيقاف العرض مؤقتاً"}
            >
              {userPaused ? (
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
                  <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
                  <rect x="5" y="4" width="4.5" height="16" rx="1.2" fill="currentColor" />
                  <rect x="14.5" y="4" width="4.5" height="16" rx="1.2" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="hs-tabs" role="tablist" aria-label="لقطات من المنصة" onKeyDown={onTabKey}>
          {MOMENTS.map((x, i) => {
            const state = i === active ? "active" : i < active ? "done" : "todo";
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                id={`hs-tab-${x.id}`}
                aria-selected={i === active}
                aria-controls="hs-panel"
                tabIndex={i === active ? 0 : -1}
                className="hs-tab"
                data-state={state}
                onClick={() => {
                  go(i);
                  if (live) setUserPaused(true);
                }}
              >
                <span className="hs-tab-label">{x.tab}</span>
                <span className="hs-track" aria-hidden>
                  {i === active && live && !userPaused ? (
                    <i
                      key={`${active}-${run}`}
                      className="hs-fill"
                      style={{ "--dur": `${x.ms}ms` }}
                      onAnimationEnd={(e) => {
                        if (e.animationName === "hs-fill") go(active + 1);
                      }}
                    />
                  ) : (
                    <i />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hs-stage" id="hs-panel" role="tabpanel" aria-labelledby={`hs-tab-${m.id}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${m.id}-${run}`}
              className="hs-scene-shell"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Scene anim={live} playing={playing} onListen={onListen} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hs-foot">
          <span className="hs-meta">
            {/* break only between segments, never inside «الطقس المتطرف» */}
            {m.meta.split(" · ").map((seg, i) => (
              <span key={i}>
                {i > 0 && (
                  <span className="hs-sep" aria-hidden>
                    {" · "}
                  </span>
                )}
                <span className="hs-seg">
                  <Iso text={seg} />
                </span>
              </span>
            ))}
          </span>
          <a
            className="hs-room"
            href={`/tour/${m.room}`}
            data-cta={`hero_showcase_${m.room}`}
            aria-label={`جرّبها في الجولة: ${room}`}
          >
            جرّبها في الجولة
            <span aria-hidden>←</span>
          </a>
        </div>
      </div>
    </div>
  );
}
