import { Play } from "lucide-react";
import StoryCard from "./StoryCard";
import { useStories } from "./StoriesProvider";
import { formatDuration } from "../../data/stories";

/**
 * StoriesFeature — the stories block a page embeds under its own heading.
 *   one story  → a composed spread: the card, and beside it her words in large
 *                type (a stage for one, not a carousel with one slide in it)
 *   several    → a horizontal snap row of cards, «شوف كل القصص» under it
 * `allHref` — where «شوف كل القصص» goes (hidden while there is one story, or when null).
 */
export default function StoriesFeature({ stories, allHref = "/stories" }) {
  const { open } = useStories();
  if (!stories.length) return null;

  if (stories.length === 1) {
    const s = stories[0];
    return (
      <div className="st-feature">
        <div className="st-spread">
          <div className="st-card-wrap">
            <StoryCard story={s} />
          </div>
          <figure className="st-aside" style={{ margin: 0 }}>
            <span className="st-aside-mark" aria-hidden="true">«</span>
            <blockquote className="st-aside-quote" style={{ margin: 0 }}>
              {s.headline}، <span>{s.excerpt}</span>
            </blockquote>
            <figcaption className="st-aside-cite">
              <b>{s.name}</b> · {s.role}
            </figcaption>
            <button type="button" className="st-watch" onClick={() => open(s.id)} aria-haspopup="dialog">
              <Play size={16} fill="currentColor" aria-hidden="true" />
              شاهد القصة كاملة
              <span className="st-watch-num">{formatDuration(s.duration)}</span>
            </button>
          </figure>
        </div>
      </div>
    );
  }

  return (
    <div className="st-feature">
      <ul className="st-row" aria-label="قصص طلابنا">
        {stories.map((s) => (
          <li key={s.id}>
            <StoryCard story={s} />
          </li>
        ))}
      </ul>
      {allHref ? (
        <p className="st-all">
          <a href={allHref}>
            شوف كل القصص <span aria-hidden="true">←</span>
          </a>
        </p>
      ) : null}
    </div>
  );
}
