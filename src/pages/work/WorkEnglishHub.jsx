import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Seo from "../../components/Seo";
import { PrimaryCTA } from "../../components/landing";
import { WorkBar } from "./WorkEnglishPage";
import { WORK_PAGES, WORK_HUB_PATH, WORK_ARTICLE_SLUGS, termCount, workPath } from "../../content/workEnglish";
import { ARTICLES } from "../../content/articles";
import { SITE } from "../../content/seo";
import { useTrialHref } from "../../lib/trialLink";
import { track } from "../../lib/track";
import "./work.css";

/* /work-english — the hub of the work-English cluster: every field glossary and
 * the work guides (interview, formal email, CV, work phrases). Internal links
 * from here are what tie the cluster together for search engines. */
export default function WorkEnglishHub() {
  const guides = WORK_ARTICLE_SLUGS.map((s) => ARTICLES.find((a) => a.slug === s)).filter(Boolean);
  const trialHref = useTrialHref({ source: "work_english_hub" });
  const url = `${SITE}${WORK_HUB_PATH}`;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "الإنجليزي للعمل — مصطلحات كل مجال بالإنجليزي",
    url,
    inLanguage: "ar-SA",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: WORK_PAGES.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}${workPath(p.slug)}`,
        name: p.h1,
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "الإنجليزي للعمل", item: url },
    ],
  };

  return (
    <div className="lp-scope we">
      <Seo path={WORK_HUB_PATH} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <WorkBar />

      <main className="we-wrap">
        <header className="we-head">
          <nav className="we-crumbs" aria-label="مسار الصفحة">
            <Link to="/">الرئيسية</Link><span aria-hidden>/</span><span>الإنجليزي للعمل</span>
          </nav>
          <h1 className="we-h1">الإنجليزي للعمل: مصطلحات كل مجال بالإنجليزي مع الترجمة</h1>
          <div className="we-intro">
            <p>
              في بيئات عمل كثيرة في المملكة تكون الإنجليزية لغة الملفات والاجتماعات والأنظمة، ولكل مجال
              مفرداته التي لا توجد في أي كتاب عام. هنا قوائم مصطلحات مرتبة حسب مواقف العمل الحقيقية،
              مع الترجمة ومثال لكل مصطلح، وجمل جاهزة، وأخطاء شائعة، وحوار قصير من يوم العمل.
            </p>
            <p>
              كل قائمة قابلة للطباعة أو الحفظ PDF، وفي كل صفحة درس مجاني من المجال نفسه لمن أراد أن يرى
              المصطلحات مستخدمة في نص حقيقي.
            </p>
          </div>
        </header>

        <section className="we-sec">
          <h2 className="we-h2">اختيار المجال</h2>
          <ul className="we-grid">
            {WORK_PAGES.map((p) => (
              <li key={p.slug}>
                <Link to={workPath(p.slug)} className="we-card">
                  <b>{p.field}</b>
                  <span>{p.description}</span>
                  <em>{termCount(p)} مصطلحاً ←</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {guides.length ? (
          <section className="we-sec">
            <h2 className="we-h2">أدلة الإنجليزي في العمل</h2>
            <ul className="we-list">
              {guides.map((a) => (
                <li key={a.slug}>
                  <Link to={`/articles/${a.slug}`}>
                    {a.title}
                    <small>{a.description}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <aside className="we-cta">
          <h2>مصطلحات المجال في درس حقيقي</h2>
          <p>
            «درسك الأول» نصّ إنجليزي من يوم العمل في المجال المختار، مع أسئلة عليه وتصحيح فوري بالعربية —
            مجاناً ومن غير حساب.
          </p>
          <div className="links">
            <PrimaryCTA href={trialHref} data-cta="work_hub_cta" onClick={() => track("trial_click", { source: "work_english_hub" })}>
              ادخل على درس من مجالك ←
            </PrimaryCTA>
            <a className="we-ghost" href="/level-test">اختبار تحديد المستوى</a>
          </div>
        </aside>

        <footer className="we-foot">أكاديمية طلاقة</footer>
      </main>
    </div>
  );
}
