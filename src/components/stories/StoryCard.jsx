import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useStories } from "./StoriesProvider";
import { durationLabel, formatDuration } from "../../data/stories";

/**
 * StoryCard — 9:16, poster first. Once the card is near the screen the muted
 * 4 s preview loop takes over (fetched only then, ~190 KB); off screen it
 * pauses. Reduced motion or Save-Data keeps the poster. A tap opens the viewer.
 */
function motionAllowed() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (navigator.connection?.saveData) return false;
  return true;
}

export default function StoryCard({ story, eager = false }) {
  const { open } = useStories();
  const ref = useRef(null);
  const vidRef = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const v = vidRef.current;
    if (!el || !v || !motionAllowed() || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute("src")) v.setAttribute("src", story.preview);
          v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [story.preview]);

  const words = story.headline.split(" ");
  return (
    <button
      ref={ref}
      type="button"
      className="st-card"
      onClick={() => open(story.id)}
      aria-label={`شاهد قصة ${story.name}، ${story.role}: «${story.headline}» — ${durationLabel(story.duration)}`}
      aria-haspopup="dialog"
    >
      <span className="st-card-media" aria-hidden="true">
        <img
          src={story.poster}
          alt=""
          width="720"
          height="1280"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
        <video
          ref={vidRef}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          data-on={live ? "" : undefined}
          onPlaying={() => setLive(true)}
        />
      </span>
      <span className="st-card-top" aria-hidden="true">
        <span className="st-chip">
          <span className="st-live" />
          قصة حقيقية
        </span>
        <span className="st-chip">
          <span className="st-chip-num">{formatDuration(story.duration)}</span>
        </span>
      </span>
      <span className="st-play" aria-hidden="true">
        <Play size={26} fill="currentColor" />
      </span>
      <span className="st-card-copy" aria-hidden="true">
        <span className="st-card-quote">
          «{words.slice(0, -1).join(" ")} <span className="st-q">{words[words.length - 1]}</span>»
        </span>
        <span className="st-who">
          <span className="st-avatar">{story.name.slice(0, 1)}</span>
          <span className="st-who-text">
            <span className="st-who-name">{story.name}</span>
            <span className="st-who-role">{story.role}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
