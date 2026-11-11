import { Link } from "react-router-dom";
import { PreviewMeta, Art } from "../shared";
import { previewPath } from "../../../content/journal/preview.js";
import { JOURNAL, JOURNAL_MANIFESTO, readLabel } from "../../../content/journal/index.js";
import Shell, { DIR, pad2, useReveal } from "./shell";

const to = (a) => previewPath(DIR, a.slug);
const plate = (a) => `plate-${a.slug}`;

function Card({ a, i, variant }) {
  return (
    <Link to={to(a)} className={`g-card g-card--${variant} g-rv`}>
      <div className="g-card-top">
        <span className="g-num" aria-hidden="true">{pad2(i + 1)}</span>
        <span className="g-label">{a.category} · {readLabel(a)}</span>
      </div>
      <div className="g-img g-duo"><Art dir={DIR} name={plate(a)} alt="" sizes="(min-width: 900px) 40vw, 100vw" /></div>
      <h3>{a.title}</h3>
      <p>{a.dek}</p>
      <span className="g-more">اقرؤوا المقال <i>←</i></span>
    </Link>
  );
}

export default function Home({ direction }) {
  useReveal();
  const [lead, two, three, ...rest] = JOURNAL;
  return (
    <Shell>
      <PreviewMeta title={`مجلة طلاقة · العدد 1 | ${direction.name}`} description={JOURNAL_MANIFESTO} image="/images/journal/gallery/cover-og.jpg" />
      <main>
        <header id="fx-top" className="g-cover g-paper">
          <div className="g-wrap">
            <div className="g-bar">
              <span>العدد 1</span>
              <span>نوفمبر 2026</span>
              <span>6 مقالات</span>
              <span>من أكاديمية طلاقة</span>
              <span className="g-tag">معرض</span>
            </div>
            <h1 className="g-mega" aria-label="مجلة طلاقة">
              <small aria-hidden="true">مجلة</small>
              <span aria-hidden="true">طلاقة<i className="g-dot" /></span>
            </h1>
            <div className="g-12 g-cover-grid">
              <figure className="g-cover-photo">
                <div className="g-duo"><Art dir={DIR} name="cover" eager alt="كرسي واحد أمام جدار أبيض، وظل ساعة على الحائط" /></div>
                <span className="g-block" aria-hidden="true" />
                <figcaption className="g-rot" aria-hidden="true">المعرض الأول · نوفمبر 2026</figcaption>
              </figure>
              <div className="g-cover-side">
                <div className="g-issue">
                  <span className="g-num" aria-hidden="true">01</span>
                  <span>العدد<br />الأول</span>
                </div>
                <p className="g-manifesto">{JOURNAL_MANIFESTO}</p>
                <ol className="g-toc" aria-label="محتويات العدد">
                  {JOURNAL.map((a, i) => (
                    <li key={a.slug}><Link to={to(a)}><b>{pad2(i + 1)}</b><span>{a.title}</span></Link></li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="g-cover-end" />
          </div>
        </header>

        <section className="g-ink g-hero" aria-label="قصة العدد">
          <div className="g-wrap">
            <div className="g-hero-head g-rv">
              <span className="g-tag">قصة العدد</span>
              <span className="g-label">{readLabel(lead)}</span>
            </div>
            <Link to={to(lead)} className="g-hero-link">
              <div className="g-hero-img g-duo g-rv">
                <Art dir={DIR} name={plate(lead)} alt="" sizes="(min-width: 900px) 58vw, 100vw" />
              </div>
              <div className="g-hero-txt g-rv" style={{ "--d": ".12s" }}>
                <span className="g-num g-hero-num" aria-hidden="true">01</span>
                <h2>{lead.title}</h2>
                <p>{lead.dek}</p>
                <span className="g-more">ابدؤوا القراءة <i>←</i></span>
              </div>
            </Link>
          </div>
        </section>

        <section className="g-paper g-duo-sec" aria-label="مقالان">
          <div className="g-wrap">
            <div className="g-12">
              <Card a={two} i={1} variant="a" />
              <Card a={three} i={2} variant="b" />
            </div>
          </div>
        </section>

        <section className="g-lime g-band" aria-label="عن المجلة">
          <div className="g-wrap">
            <span className="g-label g-rv">عن المجلة</span>
            <p className="g-rv">{JOURNAL_MANIFESTO}</p>
          </div>
        </section>

        <section className="g-paper g-index" aria-label="باقي المقالات">
          <div className="g-wrap">
            <div className="g-index-h g-rv">
              <h2>وباقي العدد</h2>
              <span className="g-label">04 — 06</span>
            </div>
            {rest.map((a, k) => (
              <Link key={a.slug} to={to(a)} className="g-row g-rv">
                <span className="g-num" aria-hidden="true">{pad2(k + 4)}</span>
                <div>
                  <h3>{a.title}</h3>
                  <span className="g-label">{readLabel(a)}</span>
                </div>
                <p>{a.quote}</p>
                <div className="g-img g-duo"><Art dir={DIR} name={plate(a)} alt="" sizes="160px" /></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="g-ink g-invite" aria-label="دعوة">
          <div className="g-wrap">
            <h2 className="g-rv">لقاء واحد، نسمع فيه وين يوقف إنجليزيكم.</h2>
            <p className="g-rv">بدون وعود كبيرة. نسمعكم، ونقول لكم بصراحة وش الخطوة الجاية. وبعدها القرار لكم.</p>
            <button type="button" data-open-form className="g-cta g-rv">احجز لقاءك المبدئي</button>
          </div>
        </section>
      </main>
    </Shell>
  );
}
