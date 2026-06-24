import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container, EyebrowLabel, Reveal, PrimaryCTA } from "../../components/landing";
import { getArticle } from "../../content/articles";

const SITE = "https://fluentia.academy";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

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
          to="/articles"
          style={{
            textDecoration: "none",
            color: "var(--lp-text-muted)",
            fontSize: "var(--lp-body-s)",
            fontWeight: 500,
          }}
        >
          المقالات ←
        </Link>
      </Container>
    </div>
  );
}

function Block({ block }) {
  if (block.type === "h2") {
    return (
      <h2
        style={{
          fontFamily: "var(--lp-font-display)",
          fontSize: "var(--lp-h2)",
          fontWeight: 800,
          color: "var(--lp-text-strong)",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          margin: 0,
          marginTop: "var(--lp-space-2xl)",
          marginBottom: "var(--lp-space-md)",
        }}
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote
        style={{
          margin: "var(--lp-space-xl) 0",
          padding: "var(--lp-space-lg) var(--lp-space-xl)",
          borderInlineStart: "4px solid var(--lp-amber)",
          background: "rgba(251,191,36,0.06)",
          borderRadius: "var(--lp-radius-card)",
          fontFamily: "var(--lp-font-display)",
          fontSize: "var(--lp-h3)",
          fontWeight: 600,
          color: "var(--lp-text-strong)",
          lineHeight: 1.6,
        }}
      >
        {block.text}
      </blockquote>
    );
  }
  if (block.type === "list") {
    return (
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "var(--lp-space-md) 0",
          display: "flex",
          flexDirection: "column",
          gap: "var(--lp-space-md)",
        }}
      >
        {block.items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--lp-space-md)",
              fontSize: "var(--lp-body-l)",
              color: "var(--lp-text)",
              lineHeight: 1.85,
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(251,191,36,0.12)",
                border: "1px solid var(--lp-border-amber)",
                color: "var(--lp-amber-bright)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--lp-font-num)",
                fontWeight: 800,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {i + 1}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p
      style={{
        fontSize: "var(--lp-body-l)",
        color: "var(--lp-text)",
        lineHeight: 1.9,
        margin: 0,
        marginBottom: "var(--lp-space-lg)",
      }}
    >
      {block.text}
    </p>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug);

  if (!article) {
    return (
      <div className="lp-scope" style={{ minHeight: "100vh" }}>
        <Helmet>
          <title>المقال غير موجود | أكاديمية طلاقة</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <ArticleBar />
        <Container style={{ paddingBlock: "var(--lp-space-4xl)", textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--lp-h1)", color: "var(--lp-text-strong)" }}>
            لم نجد هذا المقال
          </h1>
          <p style={{ color: "var(--lp-text-muted)", marginTop: "var(--lp-space-md)" }}>
            ربما تغيّر الرابط.{" "}
            <Link to="/articles" style={{ color: "var(--lp-amber-bright)" }}>
              تصفّح كل المقالات
            </Link>
            .
          </p>
        </Container>
      </div>
    );
  }

  const url = `${SITE}/articles/${article.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "ar-SA",
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: "د. علي الأحمد",
      url: `${SITE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "أكاديمية طلاقة",
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    image: `${SITE}/og-image.png`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: (article.keywords || []).join(", "),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "المقالات", item: `${SITE}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <div className="lp-scope" style={{ minHeight: "100vh" }}>
      <Helmet>
        <title>{`${article.title} | أكاديمية طلاقة`}</title>
        <meta name="description" content={article.description} />
        {article.keywords?.length ? (
          <meta name="keywords" content={article.keywords.join(", ")} />
        ) : null}
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <ArticleBar />

      <article style={{ paddingBlock: "var(--lp-space-3xl)" }}>
        <Container text>
          <Reveal>
            <EyebrowLabel>{article.eyebrow}</EyebrowLabel>
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
              {article.title}
            </h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--lp-space-sm)",
                alignItems: "center",
                color: "var(--lp-text-faint)",
                fontSize: "var(--lp-body-s)",
                marginBottom: "var(--lp-space-2xl)",
              }}
            >
              <span style={{ color: "var(--lp-amber-bright)", fontWeight: 600 }}>
                د. علي الأحمد
              </span>
              <span aria-hidden>·</span>
              <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
              <span aria-hidden>·</span>
              <span>{article.readingMinutes} دقائق قراءة</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              {article.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </Reveal>

          {/* End CTA */}
          <Reveal delay={0.1}>
            <div
              style={{
                marginTop: "var(--lp-space-3xl)",
                padding: "clamp(24px, 4vw, 44px)",
                background:
                  "linear-gradient(135deg, var(--lp-bg-elevated), var(--lp-bg-raised))",
                border: "1px solid var(--lp-border-amber)",
                borderRadius: "var(--lp-radius-lg)",
                boxShadow: "var(--lp-shadow-card)",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-h3)",
                  fontWeight: 800,
                  color: "var(--lp-text-strong)",
                  margin: 0,
                  marginBottom: "var(--lp-space-sm)",
                }}
              >
                جاهز تكسر الحاجز؟
              </h2>
              <p
                style={{
                  fontSize: "var(--lp-body)",
                  color: "var(--lp-text-muted)",
                  lineHeight: 1.8,
                  margin: 0,
                  marginBottom: "var(--lp-space-lg)",
                }}
              >
                ابدأ بمحادثةٍ أولى مجانية مع المدرّب — بدون التزام، وتقرّر بعدها إن كانت طلاقة تناسبك.
              </p>
              <PrimaryCTA href="/#pricing">
                شاهد باقات طلاقة
                <span aria-hidden style={{ fontSize: "1.1em" }}>
                  ←
                </span>
              </PrimaryCTA>
            </div>
          </Reveal>
        </Container>
      </article>
    </div>
  );
}
