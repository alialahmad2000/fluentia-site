import BrandMark from "./BrandMark";

/**
 * SiteHeader — the compact brand header for the secondary pages (/about,
 * /articles, 404, legal). Same pattern as the homepage header: the blue
 * feather-F mark beside the Arabic wordmark «طلاقة» (never a Latin wordmark —
 * it also tripped the bidi algorithm: "luentia F"), and the booking CTA.
 * Plain <a> links on purpose: the booking flow lives on /start.
 */
const CSS = `
.sh-bar{position:sticky;top:0;z-index:30;border-bottom:1px solid rgba(125,211,252,.12);background:rgba(5,11,22,.88);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);padding-top:env(safe-area-inset-top)}
.sh-in{max-width:1100px;margin-inline:auto;padding:8px 20px;min-height:60px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.sh-brand{display:inline-flex;align-items:center;gap:10px;min-height:48px;text-decoration:none}
.sh-brand span{font-family:'Alexandria','Tajawal',system-ui,sans-serif;font-weight:800;font-size:21px;color:#f3ede2;line-height:1}
.sh-cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:999px;background:#38bdf8;color:#03101e;font-weight:700;font-size:14px;text-decoration:none;white-space:nowrap;font-family:'Tajawal',system-ui,sans-serif}
.sh-cta:active{transform:scale(.97)}
@media (hover:hover){.sh-cta:hover{background:#7dd3fc}}
`;

export default function SiteHeader({ src = "site" }) {
  return (
    <header className="sh-bar" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sh-in">
        <a href="/" className="sh-brand" aria-label="طلاقة — الصفحة الرئيسية">
          <BrandMark size={28} />
          <span>طلاقة</span>
        </a>
        <a href={`/start?src=${src}`} className="sh-cta">
          احجز لقاءك المبدئي
        </a>
      </div>
    </header>
  );
}
