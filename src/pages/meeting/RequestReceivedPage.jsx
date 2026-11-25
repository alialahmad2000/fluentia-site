/**
 * Old booking-style URLs (/book, /booking, /meeting, /interview, /schedule …) — 2026-11-25 (Ali, «لا حجز ذاتي»).
 * Nobody books a time with us by themselves any more, so these never show a slot list or a 404:
 * just the neutral note, and a way to leave info (the /start chat) or reach us on WhatsApp. noindex.
 */
import { Helmet } from "react-helmet-async";
import BrandMark from "../../components/BrandMark";
import css from "../careers/careers.css?inline";

export default function RequestReceivedPage() {
  return (
    <div className="cr-root pl-page" dir="rtl" lang="ar" style={{ "--rise": 0.6 }}>
      <style>{css}</style>
      <Helmet htmlAttributes={{ lang: "ar", dir: "rtl" }}>
        <title>أكاديمية طلاقة</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="cr-top">
        <a href="/" className="cr-brand" aria-label="أكاديمية طلاقة"><BrandMark size={26} /><span>طلاقة</span></a>
      </header>
      <main className="cr-flow pl-wrap">
        <div className="cr-card cr-done" role="status">
          <h2>شكرًا لاهتمامك 🌷</h2>
          <p className="cr-lead">إذا أرسلت بياناتك، فهي وصلتنا — بنراجعها ونتواصل معك قريب إن شاء الله.</p>
          <div className="cr-actions">
            <a className="cr-btn cr-btn-primary" href="/start">أرسل بياناتك</a>
            <a className="cr-btn cr-btn-ghost" href="/">الصفحة الرئيسية</a>
          </div>
        </div>
      </main>
    </div>
  );
}
