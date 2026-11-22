/**
 * /careers/pledge/:token (+ /en/careers/pledge/:token) — the trial-commitment pledge behind a link (2026-11-22).
 *  • pending / declined → the signing screen (people invited to a trial before the pledge existed: the trial
 *    starts only after they sign; the admin copies this link from HR).
 *  • signed / fulfilled / excused / broken → the applicant's read-only copy (printable).
 * The token is the only credential; noindex (public/_headers + the meta below). Edge: hiring-interview
 * actions pledge_get / pledge_sign / pledge_decline with { pledge_token }.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BrandMark from "../../components/BrandMark";
import css from "./careers.css?inline";
import { call, setApiLang } from "./careersApi";
import PledgeCard from "./PledgeCard";

export default function CareersPledgePage({ lang = "ar" }) {
  const en = lang === "en";
  const { token = "" } = useParams();
  const [state, setState] = useState("loading"); // loading | ready | missing | failed
  const [pledge, setPledge] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [declined, setDeclined] = useState("");
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => {
    setApiLang(en ? "en" : "ar");
    let live = true;
    (async () => {
      try {
        const r = await call("pledge_get", { pledge_token: token });
        if (!live) return;
        setPledge(r.pledge); setState("ready");
      } catch (x) {
        if (!live) return;
        setState(x.code === "NOT_FOUND" || x.code === "BAD_INPUT" ? "missing" : "failed");
        setError(x.messageAr || "");
      }
    })();
    return () => { live = false; };
  }, [token, en]);

  const sign = async (name) => {
    setBusy(true); setError(""); setFieldError("");
    try {
      const r = await call("pledge_sign", { pledge_token: token, agree: true, name });
      setPledge(r.pledge); setJustSigned(true); window.scrollTo?.(0, 0);
    } catch (x) {
      setError(x.messageAr || (en ? "We couldn't record your signature. Please try again." : "ما قدرنا نسجّل توقيعك. نرجو المحاولة مرة ثانية."));
      if (x.field) setFieldError(x.field);
    } finally { setBusy(false); }
  };
  const decline = async () => {
    setBusy(true); setError("");
    try {
      const r = await call("pledge_decline", { pledge_token: token });
      setDeclined(r.message || (en ? "We appreciate your honesty. Committing to the trial is a basic requirement for applying with us." : "نقدّر صراحتك، الالتزام بالتجربة شرط أساسي للتقديم عندنا."));
    } catch (x) { setError(x.messageAr || ""); } finally { setBusy(false); }
  };

  const signedNow = pledge?.signed;
  return (
    <div className="cr-root pl-page" dir={en ? "ltr" : "rtl"} lang={en ? "en" : "ar"} style={{ "--rise": 0.6 }}>
      <style>{css}</style>
      <Helmet htmlAttributes={{ lang: en ? "en" : "ar", dir: en ? "ltr" : "rtl" }}>
        <title>{en ? "Trial commitment pledge — Fluentia Academy" : "تعهّد الالتزام بالفترة التجريبية — أكاديمية طلاقة"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="cr-top">
        <a href={en ? "/en/careers" : "/careers"} className="cr-brand" aria-label={en ? "Fluentia Academy" : "أكاديمية طلاقة"}>
          <BrandMark size={26} /><span>{en ? "Fluentia" : "طلاقة"}</span>
        </a>
      </header>
      <main className="cr-flow pl-wrap">
        {state === "loading" ? (
          <div className="cr-card cr-wait" role="status" aria-live="polite"><div className="cr-spinner" aria-hidden="true" /><h2>{en ? "Opening your pledge…" : "نفتح التعهّد…"}</h2></div>
        ) : state !== "ready" ? (
          <div className="cr-card cr-done" role="alert">
            <h2>{state === "missing" ? (en ? "This link doesn't work" : "الرابط ما يشتغل") : (en ? "Something went wrong" : "صار خلل")}</h2>
            <p className="cr-lead">{error || (en ? "Please check the link you received, or message us on WhatsApp." : "تأكّد من الرابط اللي وصلك، أو راسلنا على واتساب.")}</p>
          </div>
        ) : (
          <>
            {justSigned ? (
              <p className="cr-notice" role="status">{en ? "Thank you — your pledge is signed. The hiring team will contact you about the start of your trial." : "شكرًا لك — تم توقيع التعهّد. فريق التوظيف بيتواصل معك بخصوص بداية التجربة."}</p>
            ) : !signedNow && !declined ? (
              <p className="cr-hint">{en
                ? "Your trial period starts only after you sign this pledge. Please read it carefully and sign with your full name."
                : "الفترة التجريبية تبدأ بعد توقيع هذا التعهّد فقط. نرجو قراءته بتمعّن والتوقيع باسمك الكامل."}</p>
            ) : null}
            <PledgeCard pledge={pledge} en={en} mode="link" busy={busy} error={error} fieldError={fieldError}
              onSign={sign} onDecline={decline} declinedMsg={declined} onBack={() => { setDeclined(""); setError(""); }} />
          </>
        )}
      </main>
    </div>
  );
}
