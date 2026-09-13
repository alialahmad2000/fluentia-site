import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container, PrimaryCTA } from "../components/landing";
import BrandMark from "../components/BrandMark";

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
    <div className="lp-scope" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Helmet>
        <title>الصفحة غير موجودة | أكاديمية طلاقة</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Container style={{ paddingBlock: "var(--lp-space-4xl)", textAlign: "center" }}>
        <Link to="/" aria-label="أكاديمية طلاقة — الرئيسية" style={{ display: "inline-block", marginBottom: "var(--lp-space-xl)" }}>
          <BrandMark size={44} />
        </Link>
        <h1 style={{ fontSize: "var(--lp-h1)", color: "var(--lp-text-strong)", margin: 0 }}>
          ما لقينا هذي الصفحة
        </h1>
        <p style={{ color: "var(--lp-text-muted)", marginTop: "var(--lp-space-md)", lineHeight: 1.9 }}>
          ربما تغيّر الرابط أو انكتب بشكل مختلف. هذي أكثر الصفحات طلباً:
        </p>
        <div style={{ display: "flex", gap: "var(--lp-space-md)", justifyContent: "center", flexWrap: "wrap", marginTop: "var(--lp-space-xl)" }}>
          <PrimaryCTA href="/">الصفحة الرئيسية</PrimaryCTA>
        </div>
        <p style={{ marginTop: "var(--lp-space-lg)", display: "flex", gap: "var(--lp-space-lg)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/level-test" style={{ color: "var(--lp-amber-bright)" }}>اختبار تحديد المستوى المجاني</Link>
          <Link to="/articles" style={{ color: "var(--lp-amber-bright)" }}>المقالات</Link>
        </p>
      </Container>
    </div>
  );
}
