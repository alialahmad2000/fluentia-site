import { useCallback, useEffect, useRef, useState } from "react";
import { LISTEN_CLIP, TAP_SENTENCE } from "./showcase";

/** Fetch a small JSON once `load` turns true (the stage item is near). */
export function useLazyJson(url, load) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!load || data) return undefined;
    let alive = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url, load, data]);
  return data;
}

/* ── Novel: the real opening of a published Chapter 1. Tap a sentence and its
   Arabic unfolds beneath it — the platform's «انسياب» (reveal) mode. ── */
export function NovelDemo({ load }) {
  const data = useLazyJson("/next/novel-excerpt.json", load);
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  if (!data) return <div className="fx-demo fx-demo--novel is-empty" aria-hidden="true" />;
  return (
    <div className="fx-demo fx-demo--novel">
      <p className="fx-demo-meta">
        <b>{data.book_ar}</b> · <span dir="ltr">{data.book_en}</span> · <span dir="ltr">{data.cefr}</span>
      </p>
      <div className="fx-novel" dir="ltr" lang="en">
        {data.sentences.map((s, i) => (
          <span key={i} className="fx-novel-s">
            <button
              type="button"
              className="fx-novel-en"
              aria-expanded={open.has(i)}
              onClick={() => toggle(i)}
            >
              {s.en}
            </button>
            <span className="fx-novel-ar" dir="rtl" lang="ar" data-open={open.has(i) ? "" : undefined}>
              <span>{s.ar}</span>
            </span>{" "}
          </span>
        ))}
      </div>
      <p className="fx-demo-hint">{TAP_SENTENCE}</p>
    </div>
  );
}

/* ── Podcast: 24 seconds of a real Fluentia Original, lit word by word from the
   episode's own timestamps. The audio loads on the first tap, never autoplays. ── */
function flatten(sentences) {
  const words = [];
  sentences.forEach((s, si) => s.w.forEach((w, wi) => words.push({ a: w[0], b: w[1], si, wi })));
  return words;
}
function findWord(words, ms) {
  let lo = 0;
  let hi = words.length - 1;
  let hit = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid].a <= ms) {
      hit = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return hit;
}

export function PodcastDemo({ load, active }) {
  const data = useLazyJson("/next/podcast-preview.json", load);
  const audioRef = useRef(null);
  const rafRef = useRef(0);
  const wordsRef = useRef([]);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ si: 0, wi: -1, p: 0 });

  useEffect(() => {
    if (data) wordsRef.current = flatten(data.sentences);
  }, [data]);

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };
  const loop = useCallback(() => {
    const a = audioRef.current;
    if (!a || !data) return;
    const ms = a.currentTime * 1000;
    const k = findWord(wordsRef.current, ms);
    const w = wordsRef.current[k];
    setPos((cur) => {
      const next = w ? { si: w.si, wi: ms <= w.b + 120 ? w.wi : -1, p: ms / data.duration_ms } : { si: 0, wi: -1, p: ms / data.duration_ms };
      return next.si === cur.si && next.wi === cur.wi && Math.abs(next.p - cur.p) < 0.004 ? cur : next;
    });
    rafRef.current = requestAnimationFrame(loop);
  }, [data]);

  const toggle = () => {
    let a = audioRef.current;
    if (!a) {
      a = new Audio("/next/podcast-preview.mp3");
      a.preload = "auto";
      a.onended = () => {
        setPlaying(false);
        stopLoop();
        setPos({ si: 0, wi: -1, p: 0 });
      };
      audioRef.current = a;
    }
    if (a.paused) {
      const pr = a.play();
      if (pr && pr.catch) pr.catch(() => setPlaying(false));
      setPlaying(true);
      stopLoop();
      rafRef.current = requestAnimationFrame(loop);
    } else {
      a.pause();
      setPlaying(false);
      stopLoop();
    }
  };

  // Leaving the item (or the page) stops the audio.
  useEffect(() => {
    if (active) return undefined;
    const a = audioRef.current;
    if (a && !a.paused) {
      a.pause();
      setPlaying(false);
      stopLoop();
    }
    return undefined;
  }, [active]);
  useEffect(
    () => () => {
      stopLoop();
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = "";
      }
    },
    []
  );

  if (!data) return <div className="fx-demo fx-demo--pod is-empty" aria-hidden="true" />;
  const s = data.sentences[pos.si];
  return (
    <div className="fx-demo fx-demo--pod">
      <div className="fx-pod-head">
        <button
          type="button"
          className="fx-pod-play"
          onClick={toggle}
          aria-label={playing ? "إيقاف مؤقت" : LISTEN_CLIP}
          aria-pressed={playing}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.4" fill="currentColor" /><rect x="14" y="4" width="5" height="16" rx="1.4" fill="currentColor" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" /></svg>
          )}
        </button>
        <div className="fx-pod-meta">
          <b dir="ltr">{data.episode_title}</b>
          <span dir="ltr">{data.show} · {data.level}</span>
        </div>
      </div>
      <div className="fx-pod-bar" aria-hidden="true">
        <i style={{ transform: `scaleX(${Math.min(1, pos.p)})` }} />
      </div>
      <div className="fx-pod-line" aria-live="off">
        <p className="fx-pod-sp" dir="ltr">{data.speakers[s.sp] || ""}</p>
        <p className="fx-pod-en" dir="ltr" lang="en">
          {s.w.map((w, i) => (
            <span key={i} data-now={playing && i === pos.wi ? "" : undefined} data-done={playing && i < pos.wi ? "" : undefined}>
              {w[2]}{" "}
            </span>
          ))}
        </p>
        <p className="fx-pod-ar" dir="rtl" lang="ar">{s.ar}</p>
      </div>
      {!playing && pos.p === 0 ? <p className="fx-demo-hint">{LISTEN_CLIP}</p> : null}
    </div>
  );
}
