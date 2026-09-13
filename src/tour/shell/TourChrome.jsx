import { Link } from "react-router-dom";
import { ROOMS, neighbours, roomPath } from "../rooms";
import { buildWhatsAppUrl } from "../../lib/whatsapp";

/**
 * The tour's own chrome, shared by every room: a slim bar on top, an intro
 * that says what the visitor is looking at, and an end band that walks them
 * to the next room or to a conversation with us. Everything between those is
 * the platform's own UI, untouched.
 *
 * All of it lives under .tour-chrome so the ported LMS stylesheets (which set
 * html/body type and colour) never restyle it, and it never restyles them.
 */

const WA_TOUR = "مرحباً، شفت جولة منصة طلاقة وأبي أبدأ معكم 🌸\n(من صفحة جولة المنصة)";

export function whatsappHref() {
  return buildWhatsAppUrl(WA_TOUR);
}

function Mark({ size = 26 }) {
  return <img src="/brand/fluentia-mark.svg" alt="" width={size} height={size} style={{ display: "block" }} />;
}

export function TourBar({ slug }) {
  const { index, next } = neighbours(slug);
  return (
    <header className="tour-chrome tour-bar" dir="rtl">
      <div className="tour-bar-in">
        <Link to="/tour" className="tour-bar-home" aria-label="العودة إلى صفحة الجولة">
          <Mark />
          <span className="tour-bar-brand">طلاقة</span>
          <span className="tour-bar-sep" aria-hidden />
          <span className="tour-bar-crumb">جولة المنصة</span>
        </Link>

        <div className="tour-bar-mid" aria-label={`الغرفة ${index + 1} من ${ROOMS.length}`}>
          <span className="tour-bar-room">{ROOMS[index]?.title}</span>
          <span className="tour-bar-dots" aria-hidden>
            {ROOMS.map((r, i) => (
              <Link key={r.slug} to={roomPath(r.slug)} className={`tour-dot${i === index ? " is-on" : ""}${i < index ? " is-past" : ""}`} tabIndex={-1} />
            ))}
          </span>
        </div>

        <div className="tour-bar-end">
          {next ? (
            <Link to={roomPath(next.slug)} className="tour-bar-next" aria-label={`التالي: ${next.title}`}>
              <span className="tour-bar-next-label">التالي</span>
              <span className="tour-bar-next-title">{next.title}</span>
              <span aria-hidden>←</span>
            </Link>
          ) : (
            <Link to="/tour" className="tour-bar-next" aria-label="كل الغرف">
              <span className="tour-bar-next-title">كل الغرف</span>
              <span aria-hidden>←</span>
            </Link>
          )}
          <a className="tour-btn tour-btn-solid tour-bar-cta" data-cta={`tour_bar_${slug}`} href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            ابدأ بمحادثة
          </a>
        </div>
      </div>
    </header>
  );
}

export function RoomIntro({ slug, children }) {
  const room = ROOMS.find((r) => r.slug === slug);
  return (
    <section className="tour-chrome tour-intro" dir="rtl">
      <div className="tour-intro-in">
        <span className="tour-intro-badge">
          <span className="tour-live-dot" aria-hidden />
          من داخل المنصة، كما يراه طلابنا
        </span>
        <span className="tour-intro-kicker">{room?.kicker}</span>
        <h1 className="tour-intro-title">{room?.title}</h1>
        <p className="tour-intro-blurb">{children || room?.blurb}</p>
      </div>
    </section>
  );
}

export function TourEnd({ slug }) {
  const { next } = neighbours(slug);
  return (
    <section className="tour-chrome tour-end" dir="rtl">
      <div className="tour-end-in">
        <p className="tour-end-lead">ما جرّبته هنا جزء من المنهج. داخل المنصة تجد المنهج كاملاً، ومدرّباً يتابع كل ما تنجزه.</p>
        <div className="tour-end-actions">
          <a className="tour-btn tour-btn-solid" data-cta={`tour_end_${slug}`} href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            ابدأ بمحادثة
          </a>
          <a className="tour-btn tour-btn-ghost" data-cta={`tour_end_${slug}_level_test`} href="/level-test">
            اختبر مستواك مجاناً
          </a>
        </div>
        <p className="tour-end-note">محادثة أولى مجانية، بدون التزام.</p>

        {next ? (
          <Link to={roomPath(next.slug)} className="tour-end-next">
            <span className="tour-end-next-kicker">الغرفة التالية</span>
            <span className="tour-end-next-title">{next.title}</span>
            <span className="tour-end-next-blurb">{next.blurb}</span>
            <span className="tour-end-next-go" aria-hidden>←</span>
          </Link>
        ) : (
          <a href="/level-test" className="tour-end-next" data-cta={`tour_end_${slug}_last_level_test`}>
            <span className="tour-end-next-kicker">انتهت الجولة</span>
            <span className="tour-end-next-title">اختبر مستواك مجاناً</span>
            <span className="tour-end-next-blurb">اعرف من أي مستوى تبدأ قبل أن تتحدث معنا.</span>
            <span className="tour-end-next-go" aria-hidden>←</span>
          </a>
        )}
      </div>
    </section>
  );
}
