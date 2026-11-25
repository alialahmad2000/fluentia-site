/**
 * fluentia.academy/m/:token — confirm the ONE time Dr. Ali proposed (2026-11-25, «لا حجز ذاتي»).
 * Nobody picks a time here: the page shows the proposed time only, with «أكد الموعد» / «ما يناسبني».
 * A GET never confirms anything; the person presses a button. The token is single-use and expires.
 * The Meet link appears only after confirming. Edge meeting-confirm → mr_public_view / mr_public_respond. noindex.
 * ?a=no opens «ما يناسبني» directly (the second link in the WhatsApp/email message).
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BrandMark from "../../components/BrandMark";
import css from "../careers/careers.css?inline";
import { SUPABASE_URL, SUPABASE_ANON } from "../../utils/tracking";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/meeting-confirm`;
const ACADEMY_WA = "966558669974";
const fem = (g) => g === "female" || g === "f";
const g = (gender, m, f) => (fem(gender) ? f : m);

async function call(action, payload) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    body: JSON.stringify({ action, ...payload }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok && !j.status && !j.error) throw new Error("network");
  return j;
}

const ERR = {
  USED: "هذا الرابط استُخدم من قبل.",
  CLOSED: "هذا الطلب ما عاد مفتوح.",
  EXPIRED: "انتهت صلاحية هذا الموعد. بنتواصل معك إن شاء الله.",
  SLOT_TAKEN: "هذا الوقت ما عاد متاح للأسف. بلّغنا الفريق، وبنتواصل معك بموعد ثاني إن شاء الله.",
  INVALID: "الرابط ما يشتغل.",
};

export default function MeetingConfirmPage() {
  const { token = "" } = useParams();
  const [state, setState] = useState("loading"); // loading | ready | failed
  const [v, setV] = useState(null);
  const [none, setNone] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await call("view", { token });
        if (!live) return;
        setV(r); setState("ready");
        if (new URLSearchParams(window.location.search).get("a") === "no" && r.status === "time_proposed") setNone(true);
      } catch { if (live) setState("failed"); }
    })();
    return () => { live = false; };
  }, [token]);

  const respond = async (answer) => {
    setBusy(true); setError("");
    try {
      const r = await call("respond", { token, answer, note: answer === "decline" ? note.trim() || null : null });
      if (r.ok) {
        const view = await call("view", { token }).catch(() => null);
        setV((old) => ({ ...(old || {}), ...(view || {}), ...r, status: r.status || view?.status }));
        setNone(false);
        window.scrollTo?.(0, 0);
      } else setError(ERR[r.error] || "ما قدرنا نحفظ ردّك. جرّب مرة ثانية.");
    } catch { setError("الاتصال ضعيف — جرّب مرة ثانية."); }
    finally { setBusy(false); }
  };

  const gd = v?.gender;
  const hi = v?.first_name ? `أهلًا ${v.first_name}` : "أهلًا";
  const wa = `https://wa.me/${ACADEMY_WA}?text=${encodeURIComponent(`السلام عليكم${v?.first_name ? `، معك ${v.first_name}` : ""} — بخصوص الموعد اللي وصلني من أكاديمية طلاقة.`)}`;

  return (
    <div className="cr-root pl-page" dir="rtl" lang="ar" style={{ "--rise": 0.6 }}>
      <style>{css}</style>
      <Helmet htmlAttributes={{ lang: "ar", dir: "rtl" }}>
        <title>تأكيد الموعد — أكاديمية طلاقة</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="cr-top">
        <a href="/" className="cr-brand" aria-label="أكاديمية طلاقة"><BrandMark size={26} /><span>طلاقة</span></a>
      </header>
      <main className="cr-flow pl-wrap">
        {state === "loading" ? (
          <div className="cr-card cr-wait" role="status" aria-live="polite"><div className="cr-spinner" aria-hidden="true" /><h2>لحظات…</h2></div>
        ) : state === "failed" ? (
          <div className="cr-card cr-done" role="alert"><h2>صار خلل</h2><p className="cr-lead">نرجو المحاولة بعد لحظات.</p></div>
        ) : v.status === "invalid" ? (
          <div className="cr-card cr-done" role="alert"><h2>الرابط ما يشتغل</h2><p className="cr-lead">تأكد إنك فتحت آخر رسالة وصلتك منا.</p></div>
        ) : v.status === "confirmed" ? (
          <div className="cr-card cr-done" role="status">
            <h2>تم تأكيد الموعد ✓</h2>
            <p className="cr-lead">{g(gd, "شكرًا لك", "شكرًا لكِ")}{v.first_name ? ` يا ${v.first_name}` : ""}. {g(gd, "ننتظرك", "ننتظركِ")} إن شاء الله.</p>
            {v.when_ar ? <p className="cr-when"><small>الموعد</small><b>{v.when_ar} بتوقيت الرياض</b>{v.minutes ? <small>{v.minutes} دقيقة</small> : null}</p> : null}
            <div className="cr-actions">
              {v.meet_link ? <a className="cr-btn cr-btn-primary" href={v.meet_link} target="_blank" rel="noopener noreferrer">رابط اللقاء (Google Meet)</a> : null}
              {v.gcal ? <a className="cr-btn cr-btn-ghost" href={v.gcal} target="_blank" rel="noopener noreferrer">{g(gd, "أضف الموعد للتقويم", "أضيفي الموعد للتقويم")}</a> : null}
              <a className="cr-btn cr-btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">{g(gd, "تحتاج تغيّر الموعد؟ راسلنا واتساب", "تحتاجين تغيّرين الموعد؟ راسلينا واتساب")}</a>
            </div>
          </div>
        ) : v.status === "declined" ? (
          <div className="cr-card cr-done" role="status">
            <h2>{g(gd, "شكرًا لك", "شكرًا لكِ")} 🌷</h2>
            <p className="cr-lead">بلّغنا الفريق إن الموعد ما يناسب، ونتواصل معك قريب إن شاء الله.</p>
          </div>
        ) : v.status !== "time_proposed" ? (
          <div className="cr-card cr-done" role="status">
            <h2>{v.status === "expired" || v.status === "no_response" ? "انتهت صلاحية هذا الموعد" : "هذا الرابط ما عاد صالح"}</h2>
            <p className="cr-lead">بياناتك عندنا، ونتواصل معك قريب إن شاء الله.</p>
          </div>
        ) : (
          <div className="cr-card cr-done">
            <h2>{hi}، هذا الموعد المقترح لك</h2>
            <p className="cr-when"><small>الموعد (بتوقيت الرياض)</small><b>{v.when_ar}</b>{v.minutes ? <small>{v.minutes} دقيقة أونلاين (Google Meet)</small> : null}</p>
            {v.note ? <p className="cr-when"><small>ملاحظة</small><span>{v.note}</span></p> : null}
            {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
            {!none ? (
              <div className="cr-actions">
                <button type="button" className="cr-btn cr-btn-primary" disabled={busy} onClick={() => respond("confirm")}>{busy ? "لحظات…" : "أكد الموعد"}</button>
                <button type="button" className="cr-btn cr-btn-ghost" disabled={busy} onClick={() => setNone(true)}>ما يناسبني</button>
              </div>
            ) : (
              <form className="cr-email-ask" onSubmit={(e) => { e.preventDefault(); respond("decline"); }}>
                <label htmlFor="mr-note">{g(gd, "وش الأيام أو الأوقات اللي تناسبك عادة؟ (اختياري)", "وش الأيام أو الأوقات اللي تناسبكِ عادة؟ (اختياري)")}</label>
                <input id="mr-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
                <button type="submit" className="cr-btn cr-btn-ghost" disabled={busy}>{busy ? "لحظات…" : "إرسال"}</button>
                <button type="button" className="cr-btn cr-btn-ghost" disabled={busy} onClick={() => setNone(false)}>رجوع</button>
              </form>
            )}
            <p className="cr-hint">الرابط خاص فيك، ويُستخدم مرة واحدة. رابط اللقاء يظهر بعد التأكيد.</p>
          </div>
        )}
      </main>
    </div>
  );
}
