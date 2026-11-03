import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
// Inlined, as on the homepage: the prerendered page paints styled at once.
import NEXT_CSS from "../next/next.css?inline";
import STORIES_CSS from "../../components/stories/stories.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { V1Footer } from "../v1/V1Closing";
import Header from "../next/Header";
import Giant from "../next/Giant";
import { TITLES, STORIES_SUB } from "../next/copy";
import StoriesProvider from "../../components/stories/StoriesProvider";
import StoryCard from "../../components/stories/StoryCard";
import { STORIES } from "../../data/stories";

/**
 * /stories — every student story, a grid of 9:16 cards. A card opens the
 * full-screen viewer; /stories?s=<id> opens it on arrival (StoriesProvider).
 * Every «احجز» here is the homepage's own [data-open-form] → V1LeadModal.
 * Content comes only from src/data/stories.js.
 */
export default function StoriesPage() {
  return (
    <StoriesProvider stories={STORIES}>
      <div className="v1-scope v5-scope fx-next st-scope" dir="rtl">
        <style dangerouslySetInnerHTML={{ __html: NEXT_CSS + STORIES_CSS }} />
        <Seo path="/stories" />
        <Header page="/stories" />
        <main>
          <section id="fx-top" className="st-page-hero" aria-labelledby="st-page-h">
            <Giant id="st-page-h" as="h1" reveal="none" lines={TITLES.stories} className="fx-center-title" />
            <p className="st-sub">{STORIES_SUB}</p>
          </section>
          <section className="st-page-grid" aria-label="القصص">
            <ul className={`st-grid${STORIES.length === 1 ? " is-one" : ""}`}>
              {STORIES.map((s, i) => (
                <li key={s.id} style={{ listStyle: "none" }}>
                  <StoryCard story={s} eager={i < 2} />
                </li>
              ))}
            </ul>
          </section>
          <section className="st-page-cta" aria-label="ابدأ">
            <button type="button" data-open-form className="fx-btn fx-btn--primary fx-btn--lg">
              احجز لقاء مبدئي مجاني
            </button>
            <p>مجاني وبدون التزام</p>
          </section>
        </main>
        <div className="fx-footer">
          <V1Footer />
        </div>
        <V1LeadModal />
      </div>
    </StoriesProvider>
  );
}
