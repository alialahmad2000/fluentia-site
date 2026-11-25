import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SUPABASE_URL, SUPABASE_ANON } from "../../utils/tracking";
import { rememberInviteRef } from "../../utils/affiliateTracking";
import { fireLeadTracking, stripPhone, toLocalPhone, toAsciiDigits } from "../../lib/leads/submitLead";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import "./invite.css";

/**
 * v1.4 P8 — fluentia.academy/i/<code>, a personal invite link.
 *
 * With the iPhone app installed, iOS opens the app instead (universal link: public/.well-known/
 * apple-app-site-association, path /i/*). Everyone else lands here: who invited them (first name only,
 * never the admin's), a short form that becomes a CRM lead tagged source=referral with the inviter
 * (ref_code → leads → invite_attribute_lead trigger), and the App Store link.
 * No prices, no packages, no payment links. Arabic first; ?lang=en for English.
 */

const APP_STORE = "https://apps.apple.com/app/id6830312311";

async function landing(code, count) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/invite_landing`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    body: JSON.stringify({ p_code: code, p_count: count }),
  });
  if (!res.ok) throw new Error(`invite_landing ${res.status}`);
  return res.json();
}

/** Count an open once per browser session per code, not on every reload. */
function firstOpen(code) {
  const key = `flu_inv_${code}`;
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch { /* storage blocked: count it */ }
  return true;
}

function copyFor(en, info) {
  const name = info?.ok ? (en ? info.first_name_en || info.first_name : info.first_name) : null;
  const female = info?.gender === "female";
  if (en) {
    return {
      title: name ? <><bdi>{name}</bdi> invited you to Fluentia</> : "You're invited to Fluentia",
      sub: "Fluentia is an online English academy for adults: live classes with trainers, and a platform that keeps track of your progress. Leave your name and number and our team will message you on WhatsApp.",
      formTitle: "Send your details",
      name: "Your name", phone: "Mobile number", send: "Send", sending: "Sending…",
      nameErr: "Write your name.", phoneErr: "A Saudi mobile number, starting with 5.",
      consent: "By sending, you agree that the Fluentia team contacts you on WhatsApp.",
      offline: "No connection. Check the internet and try again.",
      error: "Could not send. Try again.",
      doneTitle: (n) => `Thanks, ${n}`,
      doneSub: "The Fluentia team will message you on WhatsApp soon. Want to start the chat now?",
      wa: "Open WhatsApp",
      waMsg: (n, p) => `Hello, I came through an invite link and would like to know the subscription details\nName: ${n}\nMobile: ${p}`,
      appTitle: "The Fluentia app",
      appSub: "Classes, homework and your progress, on your iPhone.",
      app: "Download on the App Store",
      bad: "This invite link is not valid. You can still leave your details below.",
      home: "About Fluentia",
      lang: "العربية",
    };
  }
  return {
    title: name ? <><bdi>{name}</bdi> {female ? "تدعوك" : "يدعوك"} إلى طلاقة</> : "دعوة خاصة إلى طلاقة",
    sub: "أكاديمية طلاقة لتعلّم الإنجليزية أونلاين للكبار: حصص مباشرة مع مدرّبين، ومنصّة تتابع تقدّمك. اترك اسمك ورقمك ونتواصل معك على واتساب.",
    formTitle: "سجّل بياناتك",
    name: "الاسم", phone: "رقم الجوال", send: "إرسال", sending: "يُرسَل…",
    nameErr: "اكتب اسمك.", phoneErr: "رقم جوال سعودي يبدأ بـ 5.",
    consent: "بالإرسال توافق على تواصل فريق طلاقة معك على واتساب.",
    offline: "ما فيه اتصال. تأكد من الإنترنت وأعد المحاولة.",
    error: "تعذّر الإرسال. أعد المحاولة.",
    doneTitle: (n) => `وصلنا طلبك يا ${n}`,
    doneSub: "فريق طلاقة يتواصل معك على واتساب قريبًا. تبي تبدأ المحادثة الحين؟",
    wa: "افتح واتساب",
    waMsg: (n, p) => `السلام عليكم، جيت عن طريق رابط دعوة وأبي أعرف تفاصيل الاشتراك\nالاسم: ${n}\nالجوال: ${p}`,
    appTitle: "تطبيق طلاقة",
    appSub: "حصصك وواجباتك وتقدّمك، على جوالك.",
    app: "حمّل التطبيق من App Store",
    bad: "رابط الدعوة غير صحيح. تقدر تترك بياناتك هنا مع ذلك.",
    home: "تعرّف على طلاقة",
    lang: "English",
  };
}

export default function InvitePage() {
  const { code: raw = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const en = params.get("lang") === "en";
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const [info, setInfo] = useState(null); // null = loading
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error | offline
  const [done, setDone] = useState(null);
  const busy = useRef(false);
  const phoneRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    let alive = true;
    if (!code) { setInfo({ ok: false }); return undefined; }
    landing(code, firstOpen(code))
      .then((d) => {
        if (!alive) return;
        setInfo(d || { ok: false });
        if (d?.ok) rememberInviteRef(d.code || code);
      })
      .catch(() => { if (alive) setInfo({ ok: false, failed: true }); });
    return () => { alive = false; };
  }, [code]);

  const t = copyFor(en, info);
  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.length === 9 && phone.startsWith("5");

  async function onSubmit(e) {
    e.preventDefault();
    if (busy.current) return;
    setTouched(true);
    if (!nameOk) { nameRef.current?.focus(); return; }
    if (!phoneOk) { phoneRef.current?.focus(); return; }
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setStatus("offline"); return; }
    busy.current = true;
    setStatus("sending");
    const cleanName = name.trim().slice(0, 80);
    const phoneLocal = toLocalPhone(phone);
    const p = new URLSearchParams(window.location.search);
    try {
      await fireLeadTracking({
        name: cleanName,
        phone: phoneLocal,
        path: "",
        pkg: "",
        pkgPrice: 0,
        goal: info?.ok ? `دعوة من ${info.first_name || "صديق"}` : "",
        utm: { source: p.get("utm_source") || "", medium: p.get("utm_medium") || "", campaign: p.get("utm_campaign") || "" },
        consent: true, // the line under the button states it
        hp,
        defaultSource: "referral",
      });
      setDone({ first: cleanName.split(/\s+/)[0], wa: buildWhatsAppUrl(t.waMsg(cleanName, phoneLocal)) });
      setStatus("done");
    } catch {
      busy.current = false;
      setStatus("error");
    }
  }

  const toggleLang = () => {
    const next = new URLSearchParams(params);
    if (en) next.delete("lang"); else next.set("lang", "en");
    setParams(next, { replace: true });
  };

  return (
    <main className="inv" dir={en ? "ltr" : "rtl"} lang={en ? "en" : "ar"}>
      <Helmet htmlAttributes={{ lang: en ? "en" : "ar", dir: en ? "ltr" : "rtl" }}>
        <title>{en ? "An invite to Fluentia" : "دعوة إلى طلاقة"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="inv-wrap">
        <header className="inv-top">
          <a className="inv-brand" href="/">{en ? "Fluentia" : "طلاقة"}</a>
          <button type="button" className="inv-lang" onClick={toggleLang}>{t.lang}</button>
        </header>

        <section className="inv-hero" aria-busy={info === null}>
          {info === null
            ? <div className="inv-skel" aria-hidden="true" />
            : <>
              <h1 className="inv-title">{t.title}</h1>
              <p className="inv-sub">{t.sub}</p>
              {!info.ok && code && !info.failed && <p className="inv-note">{t.bad}</p>}
            </>}
        </section>

        <section className="inv-card" aria-live="polite">
          {status === "done" && done ? (
            <div className="inv-done">
              <h2 className="inv-h2">{t.doneTitle(done.first)}</h2>
              <p className="inv-muted">{t.doneSub}</p>
              <a className="inv-btn inv-btn--primary" href={done.wa} target="_blank" rel="noopener noreferrer">{t.wa}</a>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <h2 className="inv-h2">{t.formTitle}</h2>
              <label className="inv-field">
                <span>{t.name}</span>
                <input ref={nameRef} className="inv-input" value={name} autoComplete="name" maxLength={80}
                  onChange={(e) => setName(e.target.value)} aria-invalid={touched && !nameOk} />
                {touched && !nameOk && <span className="inv-err">{t.nameErr}</span>}
              </label>
              <label className="inv-field">
                <span>{t.phone}</span>
                <span className="inv-phone" dir="ltr">
                  <span className="inv-cc">+966</span>
                  <input ref={phoneRef} className="inv-input" inputMode="numeric" autoComplete="tel-national" placeholder="5XXXXXXXX"
                    value={phone} onChange={(e) => setPhone(stripPhone(toAsciiDigits(e.target.value)))} aria-invalid={touched && !phoneOk} />
                </span>
                {touched && !phoneOk && <span className="inv-err">{t.phoneErr}</span>}
              </label>
              <input className="inv-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
              <button type="submit" className="inv-btn inv-btn--primary" disabled={status === "sending"}>
                {status === "sending" ? t.sending : t.send}
              </button>
              <p className="inv-muted inv-small">{t.consent}</p>
              {status === "error" && <p className="inv-err">{t.error}</p>}
              {status === "offline" && <p className="inv-err">{t.offline}</p>}
            </form>
          )}
        </section>

        <section className="inv-card inv-app">
          <div>
            <h2 className="inv-h2">{t.appTitle}</h2>
            <p className="inv-muted">{t.appSub}</p>
          </div>
          <a className="inv-btn" href={APP_STORE} target="_blank" rel="noopener noreferrer">{t.app}</a>
        </section>

        <footer className="inv-foot"><a href={en ? "/en" : "/"}>{t.home}</a></footer>
      </div>
    </main>
  );
}
