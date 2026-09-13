import { TRUSTED_LOGOS } from "../landing-v2/content";
import { Reveal } from "../v1/motion";

/**
 * V5LogoBand — the entities our students come from, as an endless
 * drifting row of logo tiles.
 *
 * Pure CSS marquee: the track holds the set twice and slides exactly
 * half its width, so the loop has no seam. In RTL the set runs leftward
 * from the right edge, so the track travels +50% (rightward) to bring
 * the next logo in. Each tile carries its own trailing margin instead
 * of a flex gap, which is what makes one set exactly half the track.
 *
 * One set is the five logos twice — wide enough to overfill a 2560px
 * screen, so no gap ever opens at the leading edge.
 *
 * The official logos are dark green / teal / blue and need a light
 * ground, but a row of white slabs outshines the hero on this ink page.
 * So each tile is a dark frame in the page's own tokens with a small
 * light inlay set inside it.
 */
export default function V5LogoBand() {
  const { lead, emphasis, items } = TRUSTED_LOGOS;
  const set = [...items, ...items];

  return (
    <section className="v5-logos" aria-label={`${lead} ${emphasis}`}>
      <Reveal>
        <div className="v5-logos-head">
          <span aria-hidden className="v5-logos-rule" />
          <h2 className="v5-logos-label">
            {lead} <b>{emphasis}</b>
          </h2>
          <span aria-hidden className="v5-logos-rule" />
        </div>
      </Reveal>

      <Reveal delay={0.12} y={18}>
        <div className="v5-logos-viewport">
          <ul className="v5-logos-track">
            {[0, 1].map((copy) =>
              set.map((it, i) => {
                // Screen readers hear each entity once; everything
                // after the first five is visual repetition.
                const repeat = copy > 0 || i >= items.length;
                return (
                  <li
                    key={`${copy}-${i}`}
                    className={`v5-logos-plate${repeat ? " is-repeat" : ""}`}
                    aria-hidden={repeat || undefined}
                  >
                    <span className="v5-logos-inlay">
                      <img
                        src={it.src}
                        alt={repeat ? "" : it.name}
                        decoding="async"
                        draggable="false"
                        style={{ "--h": `${it.h}px` }}
                      />
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </Reveal>

      <style>{`
        .v1-scope .v5-logos {
          position: relative;
          padding-block: 0 clamp(8px, 2vw, 20px);
        }
        .v1-scope .v5-logos-head {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding-inline: var(--v1-gutter);
          margin-bottom: 24px;
        }
        .v1-scope .v5-logos-label {
          margin: 0;
          font-family: var(--v1-display);
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.6;
          color: var(--v1-t-mute);
          text-align: center;
        }
        .v1-scope .v5-logos-label b {
          font-weight: 500;
          color: var(--v1-t);
        }
        .v1-scope .v5-logos-rule {
          flex: 0 1 88px;
          height: 1px;
          background: linear-gradient(to left, transparent, var(--v1-line-strong));
        }
        .v1-scope .v5-logos-rule:last-child {
          background: linear-gradient(to right, transparent, var(--v1-line-strong));
        }

        .v1-scope .v5-logos-viewport {
          overflow: hidden;
          padding-block: 6px 26px; /* room for the tiles' shadow */
          /* An eased fade in px: white fading over ink is always grey on the
             way out, so keep that stretch short. The left edge starts later —
             the fixed dot nav sits in its first 48px. */
          -webkit-mask-image: linear-gradient(90deg, transparent 0 48px, rgba(0,0,0,.25) 76px, rgba(0,0,0,.7) 112px, #000 152px,
            #000 calc(100% - 104px), rgba(0,0,0,.7) calc(100% - 64px), rgba(0,0,0,.25) calc(100% - 28px), transparent 100%);
                  mask-image: linear-gradient(90deg, transparent 0 48px, rgba(0,0,0,.25) 76px, rgba(0,0,0,.7) 112px, #000 152px,
            #000 calc(100% - 104px), rgba(0,0,0,.7) calc(100% - 64px), rgba(0,0,0,.25) calc(100% - 28px), transparent 100%);
        }
        .v1-scope .v5-logos-track {
          display: flex;
          width: max-content;
          margin: 0;
          padding: 0;
          list-style: none;
          animation: v5-logos-drift 60s linear infinite;
          will-change: transform;
        }
        @media (hover: hover) {
          .v1-scope .v5-logos-viewport:hover .v5-logos-track { animation-play-state: paused; }
        }
        @keyframes v5-logos-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(50%, 0, 0); }
        }

        .v1-scope .v5-logos-plate {
          flex: none;
          box-sizing: border-box;
          width: 224px;
          height: 124px;
          margin-inline-end: 18px;
          padding: 7px;
          border-radius: 24px;
          background: linear-gradient(180deg, var(--v1-ink-3), var(--v1-ink-2));
          box-shadow:
            inset 0 0 0 1px var(--v1-line-strong),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 24px 40px -24px #000;
        }
        .v1-scope .v5-logos-inlay {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          border-radius: 17px; /* 24 − 7: frame and inlay share a corner centre */
          background: linear-gradient(180deg, #eef2f7 0%, #dbe2eb 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 -1px 0 rgba(15, 40, 80, 0.1);
        }
        .v1-scope .v5-logos-plate img {
          display: block;
          height: var(--h);
          max-width: 164px;
          object-fit: contain;
          user-select: none;
        }

        @media (max-width: 640px) {
          .v1-scope .v5-logos-label { font-size: 0.94rem; }
          .v1-scope .v5-logos-rule { flex-basis: 28px; }
          .v1-scope .v5-logos-viewport {
            -webkit-mask-image: linear-gradient(90deg, transparent 0, rgba(0,0,0,.15) 16px, rgba(0,0,0,.55) 40px, #000 64px,
              #000 calc(100% - 64px), rgba(0,0,0,.55) calc(100% - 40px), rgba(0,0,0,.15) calc(100% - 16px), transparent 100%);
                    mask-image: linear-gradient(90deg, transparent 0, rgba(0,0,0,.15) 16px, rgba(0,0,0,.55) 40px, #000 64px,
              #000 calc(100% - 64px), rgba(0,0,0,.55) calc(100% - 40px), rgba(0,0,0,.15) calc(100% - 16px), transparent 100%);
          }
          .v1-scope .v5-logos-track { animation-duration: 46s; }
          .v1-scope .v5-logos-plate {
            width: 164px;
            height: 96px;
            margin-inline-end: 12px;
            padding: 6px;
            border-radius: 20px;
          }
          .v1-scope .v5-logos-inlay { border-radius: 14px; }
          .v1-scope .v5-logos-plate img {
            height: calc(var(--h) * 0.72);
            max-width: 124px;
          }
        }

        /* Reduced motion: no drift, no repeats — the five sit still in one
           centred row, and a narrow screen swipes through them instead. */
        @media (prefers-reduced-motion: reduce) {
          .v1-scope .v5-logos-viewport {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -webkit-mask-image: none;
                    mask-image: none;
          }
          .v1-scope .v5-logos-viewport::-webkit-scrollbar { display: none; }
          .v1-scope .v5-logos-track {
            animation: none;
            margin-inline: auto;
            padding-inline: var(--v1-gutter);
          }
          .v1-scope .v5-logos-plate { scroll-snap-align: center; }
          .v1-scope .v5-logos-plate.is-repeat { display: none; }
        }
      `}</style>
    </section>
  );
}
