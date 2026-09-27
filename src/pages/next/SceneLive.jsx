import { useEffect, useRef, useState } from "react";
import { useLazyJson } from "./Demos";
import { LOAD_SCENE, SOUND_OFF, SOUND_ON } from "./showcase";

/**
 * A live scene, the licensed way: the rights holder's own YouTube embed
 * (youtube-nocookie, the same video id and start/end the platform uses),
 * with the academy's synced transcript, Arabic line and tap-a-term on top.
 * Nothing of the film is copied, recorded or re-hosted.
 *
 *   near    load the YouTube API + player (the item is one step away)
 *   active  play (muted, inline) while true, pause when it turns false
 *   still   low tier: a branded placeholder until the visitor taps
 */

let apiPromise = null;
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error("yt api"));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}

function LineText({ line, term, onTerm }) {
  if (!term || line.idx !== term.line_idx) return <>{line.en}</>;
  const at = line.en.toLowerCase().indexOf(term.term.toLowerCase());
  if (at < 0) return <>{line.en}</>;
  return (
    <>
      {line.en.slice(0, at)}
      <button type="button" className="fx-sc-term" onClick={onTerm}>
        {line.en.slice(at, at + term.term.length)}
      </button>
      {line.en.slice(at + term.term.length)}
    </>
  );
}

export default function SceneLive({ near, active, still }) {
  const data = useLazyJson("/next/scenes-showcase.json", near || still);
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const tickRef = useRef(0);
  const activeRef = useRef(active);
  const [which, setWhich] = useState(0);
  const [lineI, setLineI] = useState(0);
  const [muted, setMuted] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [armed, setArmed] = useState(false); // low tier: tapped to load
  const [failed, setFailed] = useState(false);
  activeRef.current = active;

  const scene = data ? data.scenes[which] : null;
  const wantPlayer = Boolean(data) && (still ? armed : near || active);

  // Build (or rebuild for another scene) the player.
  useEffect(() => {
    if (!wantPlayer || !scene || !hostRef.current) return undefined;
    let dead = false;
    readyRef.current = false;
    const mount = document.createElement("div");
    hostRef.current.replaceChildren(mount);
    loadYouTubeApi()
      .then((YT) => {
        if (dead) return;
        playerRef.current = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId: scene.youtube_video_id,
          width: "100%",
          height: "100%",
          playerVars: {
            start: Math.floor(scene.start),
            end: Math.ceil(scene.end),
            playsinline: 1,
            mute: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            disablekb: 1,
            fs: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              readyRef.current = true;
              e.target.mute();
              if (activeRef.current || still) e.target.playVideo();
            },
            onError: () => setFailed(true),
          },
        });
      })
      .catch(() => setFailed(true));
    return () => {
      dead = true;
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
    };
  }, [wantPlayer, scene, still]);

  // Play while active; pause when the stage moves on.
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    try {
      if (active) p.playVideo();
      else p.pauseVideo();
    } catch {
      /* player not ready */
    }
  }, [active]);

  // Sync the transcript to the player clock; loop the clip's lines.
  useEffect(() => {
    if (!scene) return undefined;
    setLineI(0);
    const tick = () => {
      const p = playerRef.current;
      if (!p || !readyRef.current || typeof p.getCurrentTime !== "function") return;
      const t = p.getCurrentTime();
      if (t >= scene.end - 0.15) {
        p.seekTo(scene.start, true);
        return;
      }
      let i = 0;
      for (let k = 0; k < scene.lines.length; k++) if (t + 0.05 >= scene.lines[k].start) i = k;
      setLineI((cur) => (cur === i ? cur : i));
    };
    tickRef.current = window.setInterval(tick, 200);
    return () => window.clearInterval(tickRef.current);
  }, [scene]);

  const toggleSound = () => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    if (muted) {
      p.unMute();
      p.playVideo();
    } else p.mute();
    setMuted(!muted);
  };
  const pick = (i) => {
    setSheet(false);
    setMuted(true);
    setFailed(false);
    setWhich(i);
  };

  if (!data) return <div className="fx-sc is-empty" aria-hidden="true" />;
  const line = scene.lines[lineI];
  return (
    <div className="fx-sc">
      <div className="fx-sc-video">
        <div ref={hostRef} className="fx-sc-host" />
        {!wantPlayer || failed ? (
          <button type="button" className="fx-sc-ph" onClick={() => setArmed(true)} disabled={!still || failed}>
            <img src="/brand/fluentia-mark.svg" alt="" width="28" height="35" />
            <span>{failed ? scene.show : LOAD_SCENE}</span>
          </button>
        ) : null}
      </div>
      <div className="fx-sc-head">
        <b>{scene.title_ar}</b>
        <span dir="ltr">{scene.show}</span>
      </div>
      <div className="fx-sc-line">
        <p className="fx-sc-en" dir="ltr" lang="en">
          <span className="fx-sc-who">{line.speaker}</span>
          <LineText line={line} term={scene.term} onTerm={() => setSheet(true)} />
        </p>
        <p className="fx-sc-ar" dir="rtl" lang="ar">{line.ar}</p>
      </div>
      <div className="fx-sc-bar">
        <button type="button" className="fx-sc-sound" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? SOUND_ON : SOUND_OFF} title={muted ? SOUND_ON : SOUND_OFF}>
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" /><path d="m17 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          )}
        </button>
        <div className="fx-sc-pick" role="group" aria-label="المشهد">
          {data.scenes.map((s, i) => (
            <button key={s.id} type="button" aria-pressed={i === which} onClick={() => pick(i)} dir="ltr">
              {s.show}
            </button>
          ))}
        </div>
      </div>
      <p className="fx-sc-credit">المقطع معروض من يوتيوب — قناة <span dir="ltr">{scene.channel}</span></p>
      {sheet ? (
        <div className="fx-sc-sheet" role="dialog" aria-label={scene.term.term}>
          <button type="button" className="fx-sc-x" onClick={() => setSheet(false)} aria-label="إغلاق">×</button>
          <p className="fx-sc-t" dir="ltr">{scene.term.term}</p>
          <p className="fx-sc-m"><small>المعنى بالعربي</small>{scene.term.meaning_ar}</p>
          <p className="fx-sc-m" dir="ltr"><small dir="rtl">المعنى العام</small>{scene.term.simple_en}</p>
          <p className="fx-sc-m"><small>معناها في المشهد</small>{scene.term.in_context}</p>
        </div>
      ) : null}
    </div>
  );
}
