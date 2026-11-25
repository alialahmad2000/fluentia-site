/**
 * /careers/invite/:token (+ /en/careers/invite/:token) — Ali's interview invitation (2026-11-25, «لا حجز ذاتي»).
 * Nobody books an interview from the careers page any more. Ali sets ONE time in HR (hr_invite_send refuses more) and the
 * applicant gets an email whose buttons open this page with ?t=<epoch> preselected; ?none=1 opens «ما يناسبني».
 * A GET never books: the applicant presses «تأكيد الموعد». The token is single-use, expires, and only accepts the
 * offered times (edge hiring-interview: invite_view / invite_confirm / invite_none → _hr_invite_* in the DB). noindex.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BrandMark from "../../components/BrandMark";
import css from "./careers.css?inline";
import { call, setApiLang } from "./careersApi";

const ACADEMY_WA = "966558669974";
const g = (gender, m, f) => (gender === "f" ? f : m);
const localTimeOf = (iso) => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === "Asia/Riyadh") return "";
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", weekday: "short" }).format(new Date(iso)).replace(/ /g, " ");
  } catch { return ""; }
};

export default function CareersInvitePage({ lang = "ar" }) {
  const en = lang === "en";
  const { token = "" } = useParams();
  const [state, setState] = useState("loading"); // loading | ready | missing | failed
  const [inv, setInv] = useState(null);
  const [sel, setSel] = useState(null);
  const [none, setNone] = useState(false); // the «ما يناسبني» form is open
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentNone, setSentNone] = useState(false);
  const [tzOk, setTzOk] = useState(false);

  useEffect(() => {
    setApiLang(en ? "en" : "ar"); setTzOk(true);
    let live = true;
    (async () => {
      try {
        const r = await call("invite_view", { token });
        if (!live) return;
        setInv(r.invite); setState("ready");
        const q = new URLSearchParams(window.location.search);
        const t = Number(q.get("t"));
        if (t) { const hit = (r.invite.options || []).find((o) => Math.floor(new Date(o.start).getTime() / 1000) === t && o.available); if (hit) setSel(hit.start); }
        else if ((r.invite.options || []).length === 1 && r.invite.options[0].available) setSel(r.invite.options[0].start);
        if (q.get("none") === "1" && r.invite.status === "pending") setNone(true);
      } catch (x) {
        if (!live) return;
        setState(x.code === "INVITE_INVALID" ? "missing" : "failed"); setError(x.messageAr || "");
      }
    })();
    return () => { live = false; };
  }, [token, en]);

  const gd = inv?.gender;
  const confirm = async () => {
    if (!sel) return;
    setBusy(true); setError("");
    try { const r = await call("invite_confirm", { token, start: sel }); setInv(r.invite); window.scrollTo?.(0, 0); }
    catch (x) {
      setError(x.messageAr || (en ? "We couldn't confirm the time. Please try again." : "ما قدرنا نأكّد الموعد. نرجو المحاولة مرة ثانية."));
      try { const r = await call("invite_view", { token }); setInv(r.invite); if (x.code === "SLOT_TAKEN") setSel(null); } catch { /* keep */ }
    } finally { setBusy(false); }
  };
  const sendNone = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { const r = await call("invite_none", { token, note: note.trim() }); setInv(r.invite); setSentNone(true); setNone(false); window.scrollTo?.(0, 0); }
    catch (x) { setError(x.messageAr || ""); } finally { setBusy(false); }
  };

  const status = inv?.status;
  const open = status === "pending" || status === "declined";
  const direct = inv?.kind === "direct";
  const roleL = inv ? (en ? (inv.role === "sales" ? "Admissions Advisor" : "English Trainer")
    : inv.role === "sales" ? g(gd, "مستشار قبول", "مستشارة قبول") : g(gd, "مدرّب لغة إنجليزية", "مدرّبة لغة إنجليزية")) : "";
  const wa = `https://wa.me/${ACADEMY_WA}?text=${encodeURIComponent(en
    ? `Hello, this is ${inv?.first_name || ""} — about my interview invitation with Fluentia Academy.`
    : `السلام عليكم، معك ${inv?.first_name || ""} — بخصوص دعوة المقابلة مع أكاديمية طلاقة.`)}`;

  return (
    <div className="cr-root pl-page" dir={en ? "ltr" : "rtl"} lang={en ? "en" : "ar"} style={{ "--rise": 0.6 }}>
      <style>{css}</style>
      <Helmet htmlAttributes={{ lang: en ? "en" : "ar", dir: en ? "ltr" : "rtl" }}>
        <title>{en ? "Interview invitation — Fluentia Academy" : "دعوة لمقابلة — أكاديمية طلاقة"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="cr-top">
        <a href={en ? "/en/careers" : "/careers"} className="cr-brand" aria-label={en ? "Fluentia Academy" : "أكاديمية طلاقة"}>
          <BrandMark size={26} /><span>{en ? "Fluentia" : "طلاقة"}</span>
        </a>
      </header>
      <main className="cr-flow pl-wrap">
        {state === "loading" ? (
          <div className="cr-card cr-wait" role="status" aria-live="polite"><div className="cr-spinner" aria-hidden="true" /><h2>{en ? "Opening your invitation…" : "نفتح الدعوة…"}</h2></div>
        ) : state !== "ready" ? (
          <div className="cr-card cr-done" role="alert">
            <h2>{state === "missing" ? (en ? "This link doesn't work" : "الرابط ما يشتغل") : (en ? "Something went wrong" : "صار خلل")}</h2>
            <p className="cr-lead">{error || (en ? "Please try again in a moment." : "نرجو المحاولة بعد لحظات.")}</p>
          </div>
        ) : status === "confirmed" && inv.booking ? (
          <div className="cr-card cr-done" role="status">
            <h2>{en ? "Your interview is confirmed" : "تم تأكيد موعد مقابلتك"}</h2>
            <p className="cr-lead">{en ? `Thank you, ${inv.first_name}. We've sent the details to your email.` : `${g(gd, "شكرًا لك", "شكرًا لكِ")} يا ${inv.first_name}. ${g(gd, "أرسلنا لك التفاصيل على الإيميل.", "أرسلنا لكِ التفاصيل على الإيميل.")}`}</p>
            <p className="cr-when"><small>{en ? "Interview time" : "موعد المقابلة"}</small><b>{inv.booking.when}{en ? " (Riyadh time)" : " بتوقيت الرياض"}</b>
              {tzOk && localTimeOf(inv.booking.start) ? <small dir="ltr">{localTimeOf(inv.booking.start)} {en ? "your time" : "بتوقيتك"}</small> : null}
              <small>{en ? `${inv.booking.minutes} minutes` : `${inv.booking.minutes} دقيقة`}</small></p>
            <div className="cr-actions">
              {inv.booking.meet_link ? <a className="cr-btn cr-btn-primary" href={inv.booking.meet_link} target="_blank" rel="noopener noreferrer">{en ? "Meeting link (Google Meet)" : "رابط المقابلة (Google Meet)"}</a> : null}
              {inv.booking.gcal ? <a className="cr-btn cr-btn-ghost" href={inv.booking.gcal} target="_blank" rel="noopener noreferrer">{en ? "Add to Google Calendar" : g(gd, "أضف الموعد للتقويم", "أضيفي الموعد للتقويم")}</a> : null}
              <a className="cr-btn cr-btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">{en ? "Need to change it? WhatsApp us" : g(gd, "تحتاج تغيّر الموعد؟ راسلنا واتساب", "تحتاجين تغيّرين الموعد؟ راسلينا واتساب")}</a>
            </div>
          </div>
        ) : !open ? (
          <div className="cr-card cr-done" role="status">
            <h2>{status === "expired" ? (en ? "This invitation has expired" : "انتهت صلاحية الدعوة") : (en ? "This invitation is no longer valid" : "هذه الدعوة ما عادت صالحة")}</h2>
            <p className="cr-lead">{status === "expired"
              ? (en ? "Your application is still with us. If a new time is arranged, you'll receive a new invitation by email." : `طلبك ما زال عندنا. إذا تحدّد موعد جديد ${g(gd, "بيوصلك", "بيوصلكِ")} إيميل فيه دعوة جديدة.`)
              : (en ? "A newer invitation may have been sent to your email — please use the latest one." : `يمكن وصلتك دعوة أحدث على الإيميل — ${g(gd, "استخدم", "استخدمي")} آخر دعوة.`)}</p>
          </div>
        ) : (
          <div className="cr-card cr-done">
            <h2>{en ? `Hi ${inv.first_name}, you're invited to an interview` : `أهلًا ${inv.first_name}، ${g(gd, "ندعوك", "ندعوكِ")} لمقابلة`}</h2>
            <p className="cr-lead">{en ? `For the ${roleL} role — ${inv.minutes} minutes online (Google Meet).` : `على وظيفة ${roleL} — ${inv.minutes} دقيقة أونلاين (Google Meet).`}</p>
            {sentNone || status === "declined" ? (
              <p className="cr-notice" role="status">{en ? "Thank you — we've let the team know none of these times work. If a new time is arranged, you'll receive a new invitation by email." : `${g(gd, "شكرًا لك", "شكرًا لكِ")} — بلّغنا الفريق إن المواعيد ما تناسب. إذا تحدّد موعد جديد ${g(gd, "بيوصلك", "بيوصلكِ")} إيميل فيه دعوة جديدة.`}</p>
            ) : null}
            {inv.note ? <p className="cr-when"><small>{en ? "A note from the team" : "ملاحظة من الفريق"}</small><span>{inv.note}</span></p> : null}
            <div className="cr-slots" role="group" aria-label={en ? "Interview times" : "مواعيد المقابلة"}>
              <h3>{direct ? (en ? "Your interview time — please confirm" : g(gd, "حدّدنا لك هذا الموعد — أكّد حضورك", "حدّدنا لكِ هذا الموعد — أكّدي حضوركِ"))
                : (en ? "Choose the time that suits you (Riyadh time)" : g(gd, "اختر الموعد اللي يناسبك (بتوقيت الرياض)", "اختاري الموعد اللي يناسبك (بتوقيت الرياض)"))}</h3>
              <div className="cr-chips cr-inv-opts">
                {inv.options.map((o) => (
                  <button key={o.start} type="button" className={`cr-chip cr-inv-opt${sel === o.start ? " on" : ""}`} aria-pressed={sel === o.start} disabled={!o.available || busy} onClick={() => setSel(o.start)}>
                    <span dir={en ? "ltr" : "rtl"}>{o.when}</span>
                    {!o.available ? <span className="cr-local">{en ? "no longer available" : "ما عاد متاح"}</span>
                      : tzOk && localTimeOf(o.start) ? <span className="cr-local" dir="ltr">{localTimeOf(o.start)} {en ? "your time" : "بتوقيتك"}</span> : null}
                  </button>
                ))}
              </div>
              {error ? <p className="cr-err cr-err-box" role="alert">{error}</p> : null}
              <button type="button" className="cr-btn cr-btn-primary" disabled={!sel || busy} onClick={confirm}>{busy ? (en ? "One moment…" : "لحظات…") : en ? "Confirm this time" : g(gd, "تأكيد الموعد", "تأكيد الموعد")}</button>
            </div>
            {none ? (
              <form className="cr-email-ask" onSubmit={sendNone}>
                <label htmlFor="cr-inv-note">{en ? "Which days or times usually suit you? (optional)" : g(gd, "وش الأيام أو الأوقات اللي تناسبك عادة؟ (اختياري)", "وش الأيام أو الأوقات اللي تناسبكِ عادة؟ (اختياري)")}</label>
                <input id="cr-inv-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} dir={en ? "ltr" : "rtl"} />
                <button type="submit" className="cr-btn cr-btn-ghost" disabled={busy}>{en ? "Send to the team" : "إرسال للفريق"}</button>
              </form>
            ) : !sentNone && status !== "declined" ? (
              <button type="button" className="cr-btn cr-btn-ghost" onClick={() => setNone(true)}>{direct ? (en ? "This time doesn't work for me" : "هذا الموعد ما يناسبني") : (en ? "None of these times work for me" : "ما يناسبني أي موعد من هذي")}</button>
            ) : null}
            {inv.expires_at ? <p className="cr-hint">{en ? `This invitation is personal and works once. Valid until ${inv.expires_when || ""} (Riyadh time).` : "الدعوة خاصة فيك، وتُستخدم مرة واحدة."}</p> : null}
          </div>
        )}
      </main>
    </div>
  );
}
