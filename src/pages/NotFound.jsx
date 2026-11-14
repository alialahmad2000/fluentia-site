import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container } from "../components/landing";
import SiteHeader from "../components/SiteHeader";

/**
 * NotFound — the catch-all route.
 *
 * Before this, an unknown URL rendered NOTHING under a 200 with the homepage's
 * title and canonical: a blank page for a person, and a soft-404 that looked
 * like a duplicate homepage to Google. Vercel's SPA rewrite still answers 200
 * (a real 404 status needs a per-route rewrite list), so the page says
 * noindex and gives the visitor the three places they most likely wanted.
 */
export default function NotFound() {
  return (
    <div className="lp-scope" style={{ minHeight: "100vh" }}>
      <Helmet>
        <title>الصفحة غير موجودة | أكاديمية طلاقة</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <SiteHeader src="404" />
      <Container style={{ paddingBlock: "var(--lp-space-3xl)", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--lp-h1)", color: "var(--lp-text-strong)", margin: 0 }}>
          ما لقينا هذي الصفحة
        </h1>
        <p style={{ color: "var(--lp-text-muted)", marginTop: "var(--lp-space-md)", lineHeight: 1.9 }}>
          ربما تغيّر الرابط أو انكتب بشكل مختلف. لكن الطريق للبداية مفتوح:
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--lp-space-sm)", marginTop: "var(--lp-space-xl)" }}>
          <a
            href="/start?src=404"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 52, padding: "0 32px", borderRadius: 999, background: "#38bdf8", color: "#03101e", fontWeight: 700, textDecoration: "none" }}
          >
            احجز لقاءك المبدئي
          </a>
          <Link to="/level-test" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "var(--lp-amber-bright)", textDecoration: "none", fontWeight: 600 }}>
            أو اختبر مستواك مجاناً
          </Link>
        </div>
        <p style={{ marginTop: "var(--lp-space-md)", display: "flex", gap: "var(--lp-space-lg)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "var(--lp-text-muted)" }}>الصفحة الرئيسية</Link>
          <Link to="/articles" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "var(--lp-text-muted)" }}>المقالات</Link>
        </p>
      </Container>
    </div>
  );
}
