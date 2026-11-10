import { PreviewMeta, Art } from "../shared";
import { JOURNAL, JOURNAL_MANIFESTO, JOURNAL_NAME } from "../../../content/journal/index.js";
import { PREVIEW_PATH } from "../../../content/journal/preview.js";
import { Link } from "react-router-dom";
import { Shell, Card, Rise, Par, DIR } from "./ui";

/** /journal/preview/ink — the issue: a cover, one hero story, then a varied spread. */
export default function Home({ direction }) {
  const [a0, a1, a2, a3, a4, a5] = JOURNAL;
  return (
    <Shell>
      <PreviewMeta title={`${JOURNAL_NAME} · العدد 1 | ${direction.name}`} description={JOURNAL_MANIFESTO} />

      <header id="fx-top" className="ink-cover">
        <div className="ink-cover-art" aria-hidden="true">
          <Art dir={DIR} name="cover" eager alt="" />
        </div>
        <div className="ink-cover-in">
          <p className="ink-issue ink-rise is-in">
            <b>العدد <span className="ink-num">1</span></b><i /><span>نوفمبر <span className="ink-num">2026</span></span><i /><span>ست مقالات</span>
          </p>
          <h1 className="ink-mast ink-bleed" aria-label={JOURNAL_NAME}>
            <span>مجلة</span><span>طلاقة</span>
          </h1>
          <p className="ink-manifesto ink-rise is-in" style={{ "--d": "250ms" }}>{JOURNAL_MANIFESTO}</p>
          <a className="ink-scroll" href="#ink-issue"><i />في هذا العدد</a>
        </div>
      </header>

      <main id="ink-issue">
        <section className="ink-sec" aria-labelledby="ink-h-lead">
          <div className="ink-sec-h"><h2 id="ink-h-lead">قصة العدد</h2><span /></div>
          <div className="ink-g1"><Card article={a0} index={0} variant="hero" /></div>

          <div className="ink-g2">
            <Card article={a1} index={1} variant="tall" />
            <Card article={a2} index={2} variant="wide" />
          </div>
        </section>

        <section className="ink-break" aria-label="اقتباس العدد">
          <div className="ink-break-art" aria-hidden="true"><Par name="scene-table" wide factor={0.14} className="ink-break-par" /></div>
          <div className="ink-break-in">
            <Rise as="div">
              <q>الاجتماع ما يحتاج إنجليزي كامل. <em>يحتاج خمس حركات</em> تطلع في وقتها.</q>
              <small>من «{a0.title}»</small>
            </Rise>
          </div>
        </section>

        <section className="ink-sec" aria-labelledby="ink-h-more">
          <div className="ink-sec-h"><h2 id="ink-h-more">وباقي العدد</h2><span /></div>
          <div className="ink-g3">
            <Card article={a3} index={3} variant="big" />
            <Card article={a4} index={4} variant="sm" />
            <Card article={a5} index={5} variant="sm" />
          </div>
        </section>

        <section className="ink-colophon">
          <Rise as="p">نكتب بالعامية السعودية، ونمشي مع الموظف من أول اجتماع لين يقولها بلسانه. إذا حسّيتوا إن شي من العدد يخصّكم، لقاء مبدئي واحد كفاية نسمع فيه وين يوقف الإنجليزي عندكم.</Rise>
          <Rise><button type="button" data-open-form className="ink-btn">احجز لقاءك المبدئي</button></Rise>
        </section>
      </main>
    </Shell>
  );
}
