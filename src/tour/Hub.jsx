import { Link } from "react-router-dom";
import { ROOMS, roomPath } from "./rooms";
import { whatsappHref } from "./shell/TourChrome";
import "./hub.css";

/**
 * /tour — the entrance. Five doors, each opening onto a real part of the
 * student platform. Every room provides its own door art at
 * public/tour/<slug>/door.webp, cut from that room's real content.
 */
export default function Hub() {
  return (
    <div className="tour-chrome tour-hub" dir="rtl">
      <header className="tour-hub-top">
        <a href="/" className="tour-hub-brand" aria-label="الصفحة الرئيسية لطلاقة">
          <img src="/brand/fluentia-mark.svg" alt="" width="28" height="28" />
          <span>طلاقة</span>
        </a>
        <a className="tour-btn tour-btn-ghost tour-hub-top-cta" href={whatsappHref()} target="_blank" rel="noopener noreferrer">
          ابدأ مع طلاقة
        </a>
      </header>

      <section className="tour-hub-hero">
        <span className="tour-intro-badge">
          <span className="tour-live-dot" aria-hidden />
          محتوى حقيقي من المنصة، لا صور ترويجية
        </span>
        <h1 className="tour-hub-title">
          ادخل طلاقة <em>من الداخل</em>
        </h1>
        <p className="tour-hub-lead">
          قبل أن تشترك، جرّب ما يجرّبه طلابنا كل يوم: افتح وحدة دراسية، حلّ تمارين القواعد، واسمع فصلاً من رواية.
          كل ما تراه هنا مأخوذ من المنصة نفسها.
        </p>
      </section>

      <ol className="tour-doors">
        {ROOMS.map((room, i) => (
          <li key={room.slug} className={`tour-door tour-door--${room.slug}`}>
            <Link to={roomPath(room.slug)} className="tour-door-link">
              <span className="tour-door-art" style={{ backgroundImage: `url(/tour/${room.slug}/door.webp)` }} aria-hidden />
              <span className="tour-door-scrim" aria-hidden />
              <span className="tour-door-body">
                <span className="tour-door-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="tour-door-kicker">{room.kicker}</span>
                <span className="tour-door-title">{room.title}</span>
                <span className="tour-door-blurb">{room.blurb}</span>
                <span className="tour-door-foot">
                  <span>{room.minutes === 2 ? "دقيقتان" : `${room.minutes} دقائق`} تقريباً</span>
                  <span className="tour-door-go">ادخل ←</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="tour-hub-close">
        <p>أعجبك ما رأيت؟ هذا جزء صغير مما ينتظرك داخل المنصة.</p>
        <div className="tour-end-actions">
          <a className="tour-btn tour-btn-solid" href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            ابدأ مع طلاقة
          </a>
          <a className="tour-btn tour-btn-ghost" href="/level-test">
            اختبر مستواك مجاناً
          </a>
        </div>
      </section>
    </div>
  );
}
