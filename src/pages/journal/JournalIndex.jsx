import { Helmet } from "react-helmet-async";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
// Inlined, as on the homepage: the prerendered page paints styled at once.
import NEXT_CSS from "../next/next.css?inline";
import JOURNAL_CSS from "./journal.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { V1Footer } from "../v1/V1Closing";
import Header from "../next/Header";
import { Cover } from "./parts";
import { SITE } from "../../content/seo";
import {
  JOURNAL,
  JOURNAL_DESCRIPTION,
  JOURNAL_MANIFESTO,
  JOURNAL_NAME,
  JOURNAL_PATH,
  journalPath,
} from "../../content/journal/index.js";

/**
 * /journal — «مجلة طلاقة»: a masthead, one line of manifesto, and the covers.
 * The first article is the cover story. Content: src/content/journal/.
 */
export default function JournalIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: JOURNAL_NAME,
    description: JOURNAL_DESCRIPTION,
    url: `${SITE}${JOURNAL_PATH}`,
    inLanguage: "ar-SA",
    publisher: {
      "@type": "Organization",
      name: "أكاديمية طلاقة",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: JOURNAL.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}${journalPath(a.slug)}`,
        name: a.title,
      })),
    },
  };
  const [lead, ...rest] = JOURNAL;

  return (
    <div className="v1-scope v5-scope fx-next jr" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: NEXT_CSS + JOURNAL_CSS }} />
      <Seo path={JOURNAL_PATH} />
      <Helmet>
        <link rel="preload" as="font" type="font/woff2" href="/fonts/kufam-800-arabic.woff2" crossOrigin="" />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>
      <Header page={JOURNAL_PATH} />

      <main>
        <header id="fx-top" className="jr-mast">
          <p className="jr-mast-k jr-rise">من أكاديمية طلاقة</p>
          <h1 className="jr-rise jr-rise-2">{JOURNAL_NAME}</h1>
          <p className="jr-mast-line jr-rise jr-rise-3">{JOURNAL_MANIFESTO}</p>
          <div className="jr-mast-rule" aria-hidden="true" />
        </header>

        <section className="jr-index" aria-label="المقالات">
          <div className="jr-covers">
            <Cover article={lead} index={0} lead level={2} />
            {rest.map((a, i) => <Cover key={a.slug} article={a} index={i + 1} level={2} />)}
          </div>
        </section>
      </main>

      <div className="fx-footer"><V1Footer /></div>
      <V1LeadModal />
    </div>
  );
}
