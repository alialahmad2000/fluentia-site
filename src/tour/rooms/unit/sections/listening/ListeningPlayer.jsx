/**
 * fluentia-lms components/players/listening/ListeningPlayer.jsx — the premium
 * player bar: speaker pill, scrubber, ±10s, play, time, speed, «إظهار النص».
 *
 * Same visuals and the same iOS rules (play() synchronously inside the tap, a
 * DOM-attached <audio>, playsInline, no eager load()). Tour
 * changes:
 *   • Not position:fixed to the viewport (it would cover the TourBar's page and
 *     float past the room); the caller docks it sticky at the bottom of the
 *     listening section instead.
 *   • The speaker pill follows the clip. Production's speaker_segments have no
 *     start_ms, so its pill resolves to the LAST speaker («Noor») for all 2
 *     minutes; the snapshot carries turn times measured from the clip's pauses.
 *   • No play counter, telemetry, debug overlay or blob-source workaround (the
 *     file is a same-origin static mp3; see loadSource).
 */
import { useCallback, useEffect, useRef, useState } from "react";

const SPEEDS = [0.75, 1, 1.25, 1.5];

function formatTime(ms) {
  if (!ms || !isFinite(ms) || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ListeningPlayer({ audioUrl, durationMs, speakerSegments = [], transcriptShown, onTranscriptToggle, onPlayingChange, onEnded: onEndedProp, onePlay = false, spent = false, audioRef: externalRef }) {
  const innerRef = useRef(null);
  const audioRef = externalRef || innerRef;
  const isStartingRef = useRef(false);
  const onEndedRef = useRef(onEndedProp);
  onEndedRef.current = onEndedProp;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [actualDurationMs, setActualDurationMs] = useState(durationMs || 0);
  const [speed, setSpeed] = useState(1);
  const [loadError, setLoadError] = useState(null);

  // The platform resolves the clip to a blob: URL to dodge a stale service worker
  // and Supabase's no-cache headers. Neither exists here — the mp3 is a static,
  // same-origin file with Range support — so the element streams it directly and
  // only the metadata loads until the visitor presses play.
  const loadSource = useCallback(
    (audio) => {
      if (!audio || !audioUrl) return;
      if (audio.getAttribute("src") !== audioUrl) audio.src = audioUrl;
    },
    [audioUrl]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return undefined;
    setLoadError(null);
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentMs(0);
    isStartingRef.current = false;

    const onError = () => {
      const code = audio.error?.code;
      if (code === 1) return;
      setLoadError({ 2: "خطأ في الشبكة", 3: "خطأ في فك الترميز", 4: "الملف غير مدعوم" }[code] || "تعذّر تحميل الصوت");
      setIsPlaying(false);
      setIsBuffering(false);
    };
    const onLoadedMetadata = () => {
      setLoadError(null);
      if (isFinite(audio.duration) && audio.duration > 0) setActualDurationMs(Math.round(audio.duration * 1000));
    };
    const onTime = () => {
      setCurrentMs(Math.round(audio.currentTime * 1000));
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setCurrentMs(0);
      onEndedRef.current?.();
    };
    audio.addEventListener("error", onError);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    loadSource(audio);
    return () => {
      audio.removeEventListener("error", onError);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      try { audio.pause(); } catch { /* noop */ }
    };
  }, [audioUrl, loadSource, audioRef]);

  useEffect(() => { onPlayingChange?.(isPlaying); }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, audioRef]);
  useEffect(() => {
    if (onePlay) setSpeed(1);
  }, [onePlay]);

  const startPlayback = useCallback(async (audio) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    try {
      await audio.play();
    } catch (err) {
      const name = err?.name;
      setIsPlaying(false);
      setIsBuffering(false);
      if (name !== "AbortError" && name !== "NotAllowedError") setLoadError("فشل التشغيل — حاول النقر مرة أخرى");
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isStartingRef.current) return;
    if (!audio.paused) {
      // «محاكاة IELTS»: one uninterrupted play, like the exam.
      if (onePlay) return;
      audio.pause();
      return;
    }
    if (onePlay && spent) return;
    if (!audio.getAttribute("src")) audio.src = audioUrl;
    if (audio.readyState < 2) setIsBuffering(true);
    startPlayback(audio);
  }, [startPlayback, audioUrl, audioRef, onePlay, spent]);

  const total = actualDurationMs || durationMs || 0;

  const seekTo = useCallback(
    (ms) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.max(0, Math.min(ms, total));
      audio.currentTime = clamped / 1000;
      setCurrentMs(clamped);
    },
    [total, audioRef]
  );
  const seekBy = useCallback((deltaMs) => seekTo(currentMs + deltaMs), [currentMs, seekTo]);
  const retry = useCallback(() => {
    setLoadError(null);
    loadSource(audioRef.current);
  }, [loadSource, audioRef]);

  const progressPct = total > 0 ? Math.max(0, Math.min(100, (currentMs / total) * 100)) : 0;

  const currentSpeaker = (() => {
    if (!Array.isArray(speakerSegments) || !speakerSegments.length) return null;
    for (let i = speakerSegments.length - 1; i >= 0; i--) {
      const s = speakerSegments[i];
      if (currentMs >= (s.start_ms || 0)) return s;
    }
    return null;
  })();
  const speakerName = currentSpeaker?.speaker || null;

  if (!audioUrl) return null;

  return (
    <div dir="rtl" className="tu-player">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      <div
        className="bg-slate-950/85 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] px-4 sm:px-6 py-3 sm:py-4 rounded-b-[20px]"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {speakerName && (
          <div className="flex items-center justify-start mb-2 transition-opacity duration-200">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-xs text-white/80 font-medium font-['Tajawal']" data-speaker={speakerName}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              <bdi dir="ltr">{speakerName}</bdi>
            </span>
          </div>
        )}

        <div className="relative h-1.5 mb-3 group">
          <div className="absolute inset-y-0 left-0 right-0 bg-white/[0.06] rounded-full" />
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.4)]" style={{ width: `${progressPct}%` }} />
          <input
            type="range"
            min={0}
            max={total || 1}
            value={currentMs}
            onChange={(e) => seekTo(Number(e.target.value))}
            disabled={onePlay}
            className={`absolute inset-0 w-full h-full opacity-0 ${onePlay ? "cursor-not-allowed" : "cursor-pointer"}`}
            style={{ fontSize: 16 }}
            aria-label="موضع التشغيل"
          />
        </div>

        <div className="flex items-center justify-between gap-4" dir="ltr">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => seekBy(-10000)} disabled={onePlay} className="disabled:opacity-30 disabled:pointer-events-none w-10 h-10 rounded-lg hover:bg-white/[0.05] text-white/70 hover:text-white text-xs font-medium transition flex items-center justify-center tabular-nums" aria-label="رجوع 10 ثواني">
              -10s
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={onePlay && spent}
              className="disabled:opacity-40 disabled:pointer-events-none w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-bold text-lg shadow-[0_4px_16px_-4px_rgba(251,191,36,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-95 transition-transform flex items-center justify-center tu-play"
              aria-label={isBuffering ? "جارٍ التحميل" : isPlaying ? "إيقاف" : "تشغيل"}
              aria-busy={isBuffering}
            >
              {isBuffering && !isPlaying ? (
                <span className="block w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" aria-hidden="true" />
              ) : isPlaying ? (
                "❚❚"
              ) : (
                <span className="ms-0.5">▶</span>
              )}
            </button>
            <button type="button" onClick={() => seekBy(10000)} disabled={onePlay} className="disabled:opacity-30 disabled:pointer-events-none w-10 h-10 rounded-lg hover:bg-white/[0.05] text-white/70 hover:text-white text-xs font-medium transition flex items-center justify-center tabular-nums" aria-label="تقدم 10 ثواني">
              +10s
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
            <span className="font-mono text-xs tabular-nums text-white/55">
              {formatTime(currentMs)} <span className="text-white/30">/</span> {formatTime(total)}
            </span>
            <div className={`hidden ${onePlay ? "" : "sm:flex"} items-center gap-1 bg-white/[0.04] rounded-full p-1`}>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono tabular-nums transition ${s === speed ? "bg-amber-400 text-slate-950 font-semibold" : "text-white/55 hover:text-white/85"}`}
                  aria-label={`السرعة ${s}×`}
                  aria-pressed={s === speed}
                >
                  {s}×
                </button>
              ))}
            </div>
            {onTranscriptToggle && (
              <button type="button" onClick={onTranscriptToggle} className="px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs text-white/65 hover:text-white hover:bg-white/[0.04] transition font-['Tajawal'] tu-transcript-toggle">
                {transcriptShown ? "إخفاء النص" : "إظهار النص"}
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center" dir="rtl">
            <div className="text-red-200 text-sm mb-2 font-['Tajawal']">⚠️ {loadError}</div>
            <button type="button" onClick={retry} className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-100 text-xs font-['Tajawal']">
              إعادة المحاولة
            </button>
          </div>
        )}

        <audio ref={audioRef} preload="metadata" playsInline aria-hidden="true" data-listening-player="" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
      </div>
    </div>
  );
}
