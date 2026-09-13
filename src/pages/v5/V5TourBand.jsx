import { ROOMS } from "../../tour/rooms";
import { Reveal } from "../v1/motion";

/**
 * V5TourBand — the homepage's door into /tour.
 *
 * The «المنصة» chapter above describes the product with in-code mockups; this
 * band hands the visitor the real thing instead: five rooms of the actual
 * student platform, each shown by its own portrait art (public/tour/<slug>/door-tall.webp),
 * no sign-up. Room titles and order come from the tour's own registry, so the
 * band can never list a room the tour doesn't have.
 *
 * /tour is a separate page entry, so these are plain <a> links (a full page
 * load), not router links.
 */
export default function V5TourBand() {
  return (
    <section className="v5-tour" id="tour" aria-labelledby="v5-tour-title">
      <div className="v1-container">
        <Reveal>
          <div className="v5-tour-head">
            <span className="v1-eyebrow">جولة المنصة</span>
            <h2 id="v5-tour-title" className="v1-headline" style={{ fontSize: "var(--v1-d2)" }}>
              لا تكتفِ بالوصف. ادخل المنصة وجرّبها بنفسك.
            </h2>
            <p className="v1-intro">
              وحدة دراسية حقيقية، ودرس قواعد بتمارينه، وأمثال وتعابير، وسُلّم الأفعال، ورواية بصوت سينمائي. كلها من داخل
              المنصة كما يراها طلابنا، وبدون تسجيل.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} y={20}>
          <ol className="v5-tour-rooms">
            {ROOMS.map((room, i) => (
              <li key={room.slug}>
                <a className="v5-tour-room" href={`/tour/${room.slug}`}>
                  <span className="v5-tour-art" style={{ backgroundImage: `url(/tour/${room.slug}/door-tall.webp)` }} aria-hidden />
                  <span className="v5-tour-scrim" aria-hidden />
                  <span className="v5-tour-num v1-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="v5-tour-title">{room.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.16} y={14}>
          <div className="v5-tour-cta">
            <a className="v5-tour-btn" href="/tour">
              ابدأ الجولة
              <span aria-hidden>←</span>
            </a>
            <span className="v5-tour-note">حوالي 15 دقيقة، ويمكنك الدخول إلى أي غرفة مباشرة</span>
          </div>
        </Reveal>
      </div>

      <style>{`
        .v1-scope .v5-tour { position: relative; padding-block: clamp(56px, 8vw, 110px); }
        .v1-scope .v5-tour-head { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .v1-scope .v5-tour-head .v1-intro { max-width: 62ch; margin-inline: auto; }

        .v1-scope .v5-tour-rooms {
          list-style: none;
          margin: clamp(36px, 5vw, 56px) 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }
        .v1-scope .v5-tour-room {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 4px;
          aspect-ratio: 3 / 4;
          padding: 16px;
          border-radius: 20px;
          overflow: hidden;
          isolation: isolate;
          text-decoration: none;
          background: var(--v1-ink-3);
          box-shadow: inset 0 0 0 1px var(--v1-line-strong), 0 24px 44px -26px #000;
          transition: transform 450ms var(--v1-ease), box-shadow 450ms var(--v1-ease);
        }
        .v1-scope .v5-tour-art {
          position: absolute; inset: 0; z-index: -2;
          background-size: cover; background-position: center;
          transition: transform 900ms var(--v1-ease);
        }
        .v1-scope .v5-tour-scrim {
          position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(180deg, rgba(4,7,14,0) 35%, rgba(4,7,14,0.6) 65%, rgba(4,7,14,0.95) 100%);
        }
        .v1-scope .v5-tour-num { font-size: 0.72rem; letter-spacing: 0.14em; color: rgba(214,228,243,0.6); }
        .v1-scope .v5-tour-title { font-family: var(--v1-display); font-weight: 700; font-size: 1.02rem; line-height: 1.45; color: #fff; }
        @media (hover: hover) {
          .v1-scope .v5-tour-room:hover { transform: translateY(-4px); box-shadow: inset 0 0 0 1px var(--v1-line-azure), 0 30px 50px -26px #000; }
          .v1-scope .v5-tour-room:hover .v5-tour-art { transform: scale(1.06); }
        }
        .v1-scope .v5-tour-room:focus-visible { outline: 2px solid var(--v1-azure); outline-offset: 3px; }

        .v1-scope .v5-tour-cta { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: clamp(28px, 4vw, 40px); }
        .v1-scope .v5-tour-btn {
          display: inline-flex; align-items: center; gap: 10px;
          min-height: 50px; padding: 0 28px; border-radius: 999px;
          font-family: var(--v1-display); font-weight: 700; font-size: 1rem;
          color: #03121f; text-decoration: none;
          background: linear-gradient(180deg, #5cc9fa, #1ea7ea);
          box-shadow: 0 1px 0 rgba(255,255,255,0.45) inset, 0 12px 30px -12px rgba(56,189,248,0.7);
          transition: transform 200ms var(--v1-ease);
        }
        @media (hover: hover) { .v1-scope .v5-tour-btn:hover { transform: translateY(-1px); } }
        .v1-scope .v5-tour-note { font-size: 0.85rem; color: var(--v1-t-faint); }

        @media (max-width: 900px) {
          .v1-scope .v5-tour-rooms {
            grid-template-columns: none;
            grid-auto-flow: column;
            grid-auto-columns: min(46vw, 220px);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            margin-inline: calc(var(--v1-gutter) * -1);
            padding-inline: var(--v1-gutter);
            scroll-padding-inline: var(--v1-gutter);
          }
          .v1-scope .v5-tour-rooms::-webkit-scrollbar { display: none; }
          .v1-scope .v5-tour-rooms > li { scroll-snap-align: start; }
        }
        @media (prefers-reduced-motion: reduce) {
          .v1-scope .v5-tour-room, .v1-scope .v5-tour-art { transition: none; }
        }
      `}</style>
    </section>
  );
}
