import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Volume2, VolumeX, X, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { lockScroll, unlockScroll, popOverlayEntry, triggerOpenForm } from "../../lib/scrollLock";
import { track } from "../../lib/track";

/**
 * StoriesProvider — owns the ONE full-screen viewer for a page and the one
 * <video> element it plays in.
 *
 * Why one persistent element: iOS Safari only plays a video WITH sound when
 * play() is called inside the tap itself. The element is in the DOM from
 * hydration (preload="none", no src — zero bytes), and the card's click handler
 * sets the src and calls play() synchronously, before React re-renders.
 * If the browser still refuses sound, it plays muted and a «شغّل الصوت» pill
 * offers it back. A deep link (/stories?s=id) has no tap behind it, so it
 * always starts muted with the pill — sound never autoplays.
 *
 * History: opening pushes one entry (?s=<id>) so the phone's back gesture
 * closes the viewer; closing any other way pops it (lib/scrollLock.js).
 */

const Ctx = createContext(null);
export const useStories = () => useContext(Ctx);
const KEY = "stv";

export default function StoriesProvider({ stories, children }) {
  const videoRef = useRef(null);
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocus = useRef(null);
  const openIdRef = useRef(null);
  const soundPref = useRef(true); // the visitor's own mute choice, kept across stories
  const [mounted, setMounted] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => setMounted(true), []);

  const index = stories.findIndex((s) => s.id === openId);
  const story = index >= 0 ? stories[index] : null;

  /** Point the element at a story and play — synchronous, so a tap's activation still counts. */
  const play = useCallback((s, withSound) => {
    const v = videoRef.current;
    if (!v) return;
    if (v.getAttribute("src") !== s.video) {
      v.setAttribute("src", s.video);
      v.load();
    } else {
      try { v.currentTime = 0; } catch { /* not seekable yet */ }
    }
    const wantSound = withSound && soundPref.current;
    v.muted = !wantSound;
    setMuted(!wantSound);
    setNeedsSound(withSound ? false : true);
    setPaused(false);
    setEnded(false);
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => {
        // Sound refused (no activation): fall back to muted, offer sound back.
        v.muted = true;
        setMuted(true);
        setNeedsSound(true);
        v.play().catch(() => setPaused(true));
      });
    }
  }, []);

  const setUrl = (id, mode) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("s", id);
    else url.searchParams.delete("s");
    const state = { ...(window.history.state || {}) };
    if (id) state[KEY] = id;
    else delete state[KEY];
    window.history[mode === "push" ? "pushState" : "replaceState"](state, "", url);
  };

  const open = useCallback(
    (id, { gesture = true } = {}) => {
      const s = stories.find((x) => x.id === id);
      if (!s || openIdRef.current) return;
      returnFocus.current = document.activeElement;
      play(s, gesture);
      openIdRef.current = id;
      setOpenId(id);
      lockScroll();
      if (gesture) setUrl(id, "push");
      else {
        // Deep link: the landing entry becomes the page without ?s, and the
        // viewer gets its own entry above it — back closes it, not the site.
        setUrl(null, "replace");
        setUrl(id, "push");
      }
      track("story_open", { story_id: id, page_path: window.location.pathname, source: gesture ? "tap" : "link" });
    },
    [stories, play],
  );

  const finishClose = useCallback(() => {
    const v = videoRef.current;
    if (v) v.pause();
    openIdRef.current = null;
    setOpenId(null);
    setNeedsSound(false);
    unlockScroll();
    const back = returnFocus.current;
    returnFocus.current = null;
    if (back && back.focus && document.contains(back)) back.focus({ preventScroll: true });
    // Stop the download once the fade is over.
    window.setTimeout(() => {
      if (openIdRef.current || !v) return;
      v.removeAttribute("src");
      v.load();
    }, 260);
  }, []);

  const close = useCallback(
    (then) => {
      if (!openIdRef.current) return;
      finishClose();
      popOverlayEntry(KEY, typeof then === "function" ? then : undefined);
    },
    [finishClose],
  );

  const go = useCallback(
    (dir) => {
      const i = stories.findIndex((s) => s.id === openIdRef.current);
      const n = stories[i + dir];
      if (!n) return false;
      play(n, true);
      openIdRef.current = n.id;
      setOpenId(n.id);
      setUrl(n.id, "replace");
      track("story_open", { story_id: n.id, page_path: window.location.pathname, source: "swipe" });
      return true;
    },
    [stories, play],
  );

  // Back gesture / browser back.
  useEffect(() => {
    const onPop = () => {
      if (openIdRef.current && !(window.history.state && window.history.state[KEY])) finishClose();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [finishClose]);

  // Deep link: ?s=<id> opens that story (muted until the visitor asks for sound).
  // Waits for the portal'd <video> (it mounts one render after the page).
  const deepLinked = useRef(false);
  useEffect(() => {
    if (!mounted || deepLinked.current || !videoRef.current) return;
    deepLinked.current = true;
    const id = new URLSearchParams(window.location.search).get("s");
    if (id && stories.some((s) => s.id === id)) open(id, { gesture: false });
    // once, on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Keys + focus trap while open.
  useEffect(() => {
    if (!openId) return undefined;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        if (go(1)) e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        if (go(-1)) e.preventDefault();
      } else if (e.key === "Tab") {
        const f = [...(rootRef.current?.querySelectorAll("button:not([disabled])") || [])].filter((b) => b.offsetParent !== null);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!rootRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId, close, go]);

  // Progress: written straight to the bar, no re-render per frame.
  useEffect(() => {
    if (!openId) return undefined;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      const bar = barRef.current;
      if (v && bar && v.duration) bar.style.setProperty("--p", String(Math.min(1, v.currentTime / v.duration)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [openId]);

  const onEnded = () => {
    if (!go(1)) {
      setEnded(true);
      setPaused(true);
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (ended) {
        try { v.currentTime = 0; } catch { /* ignore */ }
        setEnded(false);
      }
      v.play().then(() => setPaused(false)).catch(() => {});
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    soundPref.current = !v.muted;
    setMuted(v.muted);
    setNeedsSound(false);
    if (v.paused && !ended) v.play().then(() => setPaused(false)).catch(() => {});
  };

  // Swipe up = next, down = previous; down with nothing before = close.
  const touch = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, at: Date.now() };
  };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dy = t.clientY - s.y;
    const dx = t.clientX - s.x;
    if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
    if (dy < 0) go(1);
    else if (!go(-1) && dy > 110) close();
  };

  const onCta = () => {
    track("story_cta_click", { story_id: openIdRef.current, page_path: window.location.pathname });
    // The page's own [data-open-form] flow (lead modal / form scroll), once
    // the viewer and its history entry are gone.
    close(triggerOpenForm);
  };

  const ctx = useMemo(() => ({ open, stories }), [open, stories]);
  const isOpen = Boolean(story);
  const many = stories.length > 1;

  const viewer = (
    <div
      ref={rootRef}
      className="st-viewer"
      data-open={isOpen ? "" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={story ? `قصة ${story.name}` : "قصص طلابنا"}
      aria-hidden={isOpen ? undefined : "true"}
      {...(isOpen ? {} : { inert: "" })}
      dir="rtl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {story ? <div className="st-viewer-bg" style={{ backgroundImage: `url(${story.poster})` }} aria-hidden="true" /> : null}
      <div className="st-viewer-stage">
        <div className="st-viewer-frame">
          <video
            ref={videoRef}
            playsInline
            preload="none"
            poster={story ? story.poster : undefined}
            onEnded={onEnded}
            onPause={() => setPaused(true)}
            onPlay={() => setPaused(false)}
            aria-label={story ? `فيديو: ${story.name} — «${story.headline}»` : undefined}
          />
          <button type="button" className="st-tap" onClick={togglePlay} aria-label={paused ? "تشغيل" : "إيقاف مؤقت"} tabIndex={-1} />
          {paused ? (
            <span className="st-paused" aria-hidden="true">
              {ended ? <RotateCcw size={30} color="#fff" /> : <Play size={32} fill="#fff" color="#fff" />}
            </span>
          ) : null}
          {needsSound && isOpen ? (
            <button type="button" className="st-sound" onClick={toggleMute}>
              <Volume2 size={18} aria-hidden="true" />
              شغّل الصوت
            </button>
          ) : null}
        </div>
        <div className="st-viewer-top">
          <div className="st-bars" aria-hidden="true">
            {stories.map((s, i) => (
              <span key={s.id} className="st-bar">
                <i ref={i === index ? barRef : undefined} style={i < index ? { "--p": 1 } : i > index ? { "--p": 0 } : undefined} />
              </span>
            ))}
          </div>
          {story ? (
            <div className="st-viewer-row">
              <span className="st-who">
                <span className="st-avatar" aria-hidden="true">{story.name.slice(0, 1)}</span>
                <span className="st-who-text">
                  <span className="st-who-name">{story.name}</span>
                  <span className="st-who-role">{story.role}</span>
                </span>
              </span>
              <span className="st-viewer-btns">
                <button type="button" className="st-icon-btn" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}>
                  {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
                </button>
                <button ref={closeRef} type="button" className="st-icon-btn" onClick={close} aria-label="إغلاق">
                  <X size={22} aria-hidden="true" />
                </button>
              </span>
            </div>
          ) : null}
        </div>
        <div className="st-viewer-nav" data-many={many ? "" : undefined}>
          <button type="button" className="st-icon-btn" onClick={() => go(-1)} disabled={index <= 0} aria-label="القصة السابقة">
            <ChevronUp size={22} aria-hidden="true" />
          </button>
          <button type="button" className="st-icon-btn" onClick={() => go(1)} disabled={index >= stories.length - 1} aria-label="القصة التالية">
            <ChevronDown size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="st-viewer-bottom">
        <button type="button" className="st-viewer-cta" onClick={onCta}>
          احجز لقاء مبدئي مجاني
        </button>
        <span className="st-viewer-note">مجاني وبدون التزام</span>
      </div>
    </div>
  );

  return (
    <Ctx.Provider value={ctx}>
      {children}
      {mounted ? createPortal(viewer, document.body) : null}
    </Ctx.Provider>
  );
}
