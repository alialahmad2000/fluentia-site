import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { ARTICLES } from "../../content/articles";

const SITE = "https://fluentia.academy";

function ArticleBar() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid var(--lp-border-subtle)",
        background: "var(--lp-bg-overlay)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <Container
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBlock: "var(--lp-space-md)",
        }}
      >
        <Link
          to="/"
          dir="ltr"
          style={{
            textDecoration: "none",
            fontFamily: "var(--lp-font-display)",
            fontWeight: 800,
            fontSize: "var(--lp-body-l)",
            color: "var(--lp-text-strong)",
          }}
        >
          <span style={{ color: "var(--lp-amber)" }}>F</span>luentia
        </Link>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "var(--lp-text-muted)",
            fontSize: "var(--lp-body-s)",
            fontWeight: 500,
          }}
        >
          الرئيسية ←
        </Link>
      </Container>
    </div>
  );
}

export default function ArticlesIndex() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "مقالات طلاقة",
    description: "مقالات عن تعلّم الإنجليزي للكبار، كسر الحاجز، والطريقة العلمية للتعلّم.",
    url: `${SITE}/articles`,
    inLanguage: "ar-SA",
    isPartOf: { "@id": `${SITE}/#website` },
  };

  return (
    <div className="lp-scope" style={{ minHeight: "100vh" }}>
      <Helmet>
        <title>مقالات طلاقة — تعلّم الإنجليزي للكبار | أكاديمية طلاقة</title>
        <meta
          name="description"
          content="مقالات صريحة عن تعلّم الإنجليزي للكبار: لماذا تتعثّر المحاولات، كيف تكسر الحاجز، والطريقة العلمية للوصول إلى الطلاقة."
        />
        <link rel="canonical" href={`${SITE}/articles`} />
        <meta property="og:url" content={`${SITE}/articles`} />
        <meta property="og:title" content="مقالات طلاقة — تعلّم الإنجليزي للكبار" />
        <meta
          property="og:description"
          content="مقالات صريحة عن تعلّم الإنجليزي للكبار وكسر الحاجز والطريقة العلمية للوصول إلى الطلاقة."
        />
        <meta name="twitter:url" content={`${SITE}/articles`} />
        <meta name="twitter:title" content="مقالات طلاقة — تعلّم الإنجليزي للكبار" />
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
      </Helmet>

      <ArticleBar />

      <Container style={{ paddingBlock: "var(--lp-space-3xl)" }}>
        <Reveal>
          <div style={{ maxWidth: "var(--lp-max-w-text)", marginBottom: "var(--lp-space-2xl)" }}>
            <EyebrowLabel>المقالات</EyebrowLabel>
            <h1
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-display-2)",
                fontWeight: 800,
                color: "var(--lp-text-strong)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: 0,
                marginBottom: "var(--lp-space-md)",
              }}
            >
              مقالات طلاقة
            </h1>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                color: "var(--lp-text-muted)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              كتابات صريحة عن تعلّم الإنجليزي للكبار — لماذا تتعثّر المحاولات، وكيف تكسر الحاجز فعلاً.
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "var(--lp-space-lg)",
          }}
        >
          {ARTICLES.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.06}>
              <Link
                to={`/articles/${a.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  textDecoration: "none",
                  padding: "var(--lp-space-xl)",
                  background:
                    "linear-gradient(180deg, var(--lp-bg-raised), var(--lp-bg-elevated))",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-lg)",
                  transition:
                    "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "var(--lp-border-amber)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
                }}
              >
                <div
                  style={{
                    color: "var(--lp-amber)",
                    fontFamily: "var(--lp-font-display)",
                    fontSize: "var(--lp-caption)",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    marginBottom: "var(--lp-space-md)",
                  }}
                >
                  {a.eyebrow}
                </div>
                <h2
                  style={{
                    fontFamily: "var(--lp-font-display)",
                    fontSize: "var(--lp-h3)",
                    fontWeight: 800,
                    color: "var(--lp-text-strong)",
                    lineHeight: 1.35,
                    margin: 0,
                    marginBottom: "var(--lp-space-md)",
                  }}
                >
                  {a.title}
                </h2>
                <p
                  style={{
                    fontSize: "var(--lp-body-s)",
                    color: "var(--lp-text-muted)",
                    lineHeight: 1.7,
                    margin: 0,
                    marginBottom: "var(--lp-space-lg)",
                  }}
                >
                  {a.description}
                </p>
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--lp-space-sm)",
                    color: "var(--lp-amber-bright)",
                    fontSize: "var(--lp-body-s)",
                    fontWeight: 600,
                  }}
                >
                  اقرأ المقال
                  <span aria-hidden>←</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
