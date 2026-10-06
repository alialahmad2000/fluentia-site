import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import Starfield from "../next/Starfield";
import { GROUPS, IRREGULAR_VERBS, TIERS, VERB_COUNT } from "../../content/irregularVerbs";
import { SITE } from "../../content/seo";
import { track } from "../../lib/track";
import { CTA, FAQ, FORM_LABELS, HERO, verbsWord } from "./copy";
import { KEYS, normalize, onPlaying, playVerb, readJson, writeJson } from "./lib";
import { IconSprite, ListHead, Mixed, VerbRow } from "./VerbList";
import Practice from "./Practice";
import VERBS_CSS from "./verbs.css?inline";

/**
 * /verbs — «الأفعال الشاذة», Fluentia's first free public tool.
 *
 * A complete reference + trainer, no login. Prerendered (src/content/seo.js),
 * so all the verbs are in the HTML for crawlers; the browser hydrates it.
 * Ground, type and colour are /'s own (Kufam display, the void + starfield,
 * sky for actions). The three forms carry the LMS ladder's colour grammar —
 * ivory / amber / violet — so they read the same here and inside the platform.
 *
 * Conversion stays soft: the wordmark links home, one dismissible bar after
 * 30 s or a quarter of the page, one line at the end of the quiz.
 */

const LETTERS = [...new Set(IRREGULAR_VERBS.map((v) => v.base[0].toUpperCase()))].sort();
const HAY = Object.fromEntries(
  IRREGULAR_VERBS.map((v) => [
    v.id,
    {
      en: [v.base, v.past, v.participle, ...v.pastAlt, ...v.participleAlt].join(" ").toLowerCase(),
      ar: normalize(v.ar),
    },
  ]),
);
const HERO_VERB = IRREGULAR_VERBS.find((v) => v.id === "go");

/** Latin query → any form; Arabic query → the meaning. */
function matches(v, q) {
  if (!q) return true;
  const h = HAY[v.id];
  return /[a-z]/.test(q) ? h.en.includes(q) : h.ar.includes(q);
}

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a.join(" ") },
  })),
};

const appLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "الأفعال الشاذة في اللغة الإنجليزية — أكاديمية طلاقة",
  url: `${SITE}/verbs`,
  inLanguage: "ar",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  educationalUse: ["reference", "practice", "self-assessment"],
  learningResourceType: ["reference table", "flashcards", "quiz"],
  teaches: "English irregular verbs: base form, past simple, past participle",
  description: `جدول ${verbsWord(VERB_COUNT)} شاذاً في الإنجليزية بتصريفاتها الثلاثة ومعناها بالعربي ونطقها، مع بطاقات حفظ واختبار سريع.`,
  offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
  provider: { "@type": "EducationalOrganization", name: "أكاديمية طلاقة", url: SITE },
};

const crumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "أكاديمية طلاقة", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "الأفعال الشاذة", item: `${SITE}/verbs` },
  ],
};

function Chip({ on, onClick, children, title, className = "" }) {
  return (
    <button type="button" className={`vb-chip ${className}`} aria-pressed={on} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

/** The bar: after 30 s or 25% of the page, once per visitor. Never over the
 *  cookie banner, and never over the practice card — it would sit on «أعرفه». */
function StickyCta() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [cookieUp, setCookieUp] = useState(false);
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    if (readJson(KEYS.barDismissed, false)) return undefined;
    setDismissed(false);
    let raf = 0;
    const reveal = () => setShow(true);
    const t = setTimeout(reveal, 30000);
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0 && window.scrollY / max >= 0.25) reveal();
      });
    };
    const cookie = () => setCookieUp(Boolean(document.getElementById("fluentia-cookie-title")));
    cookie();
    const poll = setInterval(cookie, 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    let io = null;
    const practice = document.getElementById("vb-practice");
    if (practice && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => setPracticing(e.isIntersecting), { rootMargin: "0px 0px -15% 0px" });
      io.observe(practice);
    }
    return () => {
      io?.disconnect();
      clearTimeout(t);
      clearInterval(poll);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = useCallback(() => {
    setDismissed(true);
    writeJson(KEYS.barDismissed, true);
    track("verbs_bar_dismiss");
  }, []);

  const on = show && !dismissed && !cookieUp && !practicing;
  return (
    <aside className="vb-bar" data-on={on ? "" : undefined} aria-hidden={!on} aria-label="أكاديمية طلاقة">
      <p>{CTA.bar}</p>
      <div className="vb-bar-act">
        <a href={CTA.href} className="vb-btn vb-btn--primary vb-btn--sm" tabIndex={on ? 0 : -1} onClick={() => track("verbs_cta", { where: "bar" })}>
          {CTA.label}
        </a>
        <button type="button" className="vb-bar-x" onClick={close} tabIndex={on ? 0 : -1} aria-label="إغلاق">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </aside>
  );
}

export default function VerbsPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(null);
  const [tier, setTier] = useState(null);
  const [letter, setLetter] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const [playing, setPlaying] = useState(null);
  const [mastered, setMastered] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const [stars, setStars] = useState(0);
  const q = useDeferredValue(normalize(query));

  // After hydration only: storage, motion preference, the audio subscription.
  useEffect(() => {
    const saved = readJson(KEYS.mastered, []);
    if (Array.isArray(saved)) setMastered(new Set(saved.filter((id) => typeof id === "string")));
    setLoaded(true);
    let reduced = false;
    let coarse = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      coarse = window.matchMedia("(pointer: coarse)").matches;
    } catch { /* old engines: full motion */ }
    if (!reduced) setStars(coarse ? 0.3 : 0.5);
    return onPlaying(setPlaying);
  }, []);

  useEffect(() => {
    if (loaded) writeJson(KEYS.mastered, [...mastered]);
  }, [mastered, loaded]);

  const filtered = useMemo(
    () =>
      IRREGULAR_VERBS.filter(
        (v) =>
          (!group || v.group === group) &&
          (!tier || v.tier === tier) &&
          (!letter || v.base[0].toUpperCase() === letter) &&
          matches(v, q),
      ),
    [group, tier, letter, q],
  );
  const anyFilter = Boolean(group || tier || letter || q);
  const practiceFiltered = anyFilter && filtered.length > 0;
  const practicePool = practiceFiltered ? filtered : IRREGULAR_VERBS;

  const toggle = useCallback((id) => {
    setOpen((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setGroup(null);
    setTier(null);
    setLetter(null);
  }, []);

  const latinQuery = /^[a-z\s]+$/.test(q);

  return (
    <div className="vb" dir="rtl" lang="ar">
      <style dangerouslySetInnerHTML={{ __html: VERBS_CSS }} />
      <link rel="preload" as="font" type="font/woff2" href="/fonts/kufam-800-arabic.woff2" crossOrigin="" />
      <Seo path="/verbs" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(appLd)}</script>
        <script type="application/ld+json">{JSON.stringify(crumbLd)}</script>
      </Helmet>
      <Starfield density={stars} />
      <IconSprite />

      <header className="vb-top">
        <a href="/" className="vb-brand" aria-label="أكاديمية طلاقة — الصفحة الرئيسية">
          <BrandMark size={26} />
          <span className="vb-brand-ar">طلاقة</span>
        </a>
        <nav className="vb-nav" aria-label="أقسام الصفحة">
          <a href="#vb-table">الجدول</a>
          <a href="#vb-practice">التدريب</a>
          <a href="#vb-faq">أسئلة شائعة</a>
        </nav>
      </header>

      <main className="vb-main">
        <section className="vb-hero" aria-labelledby="vb-h1">
          <p className="vb-eyebrow">{HERO.eyebrow}</p>
          <h1 id="vb-h1" className="vb-h1">{HERO.h1}</h1>
          <p className="vb-lead">{HERO.lead}</p>

          <div className="vb-specimen">
            <button type="button" className="vb-specimen-forms" onClick={() => playVerb(HERO_VERB)} aria-label="استماع: go, went, gone">
              <span className="vb-sp vb-sp--v1"><small>{FORM_LABELS.base.ar}</small><b lang="en">go</b></span>
              <span className="vb-sp-dot" aria-hidden="true">·</span>
              <span className="vb-sp vb-sp--v2"><small>{FORM_LABELS.past.ar}</small><b lang="en">went</b></span>
              <span className="vb-sp-dot" aria-hidden="true">·</span>
              <span className="vb-sp vb-sp--v3"><small>{FORM_LABELS.participle.ar}</small><b lang="en">gone</b></span>
            </button>
            <p className="vb-specimen-note">
              لون ثابت لكل تصريف في الصفحة كلها: <b className="vb-t1">الأول</b> و<b className="vb-t2">الماضي</b> و<b className="vb-t3">الثالث</b>. الضغط على أي تصريف يُسمِع نطقه.
            </p>
          </div>

          <div className="vb-jump">
            <a href="#vb-table" className="vb-btn vb-btn--primary">الجدول الكامل</a>
            <a href="#vb-practice" className="vb-btn vb-btn--quiet">التدريب والاختبار</a>
          </div>

          <ul className="vb-facts-row">
            {HERO.facts.map((f) => (
              <li key={f.label}>
                <b className={/\d/.test(f.n) ? "vb-num" : undefined}>{f.n}</b>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="vb-table" className="vb-section" aria-labelledby="vb-table-h">
          <div className="vb-sec-head">
            <h2 id="vb-table-h" className="vb-h2">جدول الأفعال الشاذة</h2>
            <p className="vb-sec-sub">مرتّبة حسب كثرة الاستخدام: الأشيع أولاً. البحث بالإنجليزي أو بالعربي.</p>
          </div>

          <div className="vb-tools">
            <div className="vb-search">
              <svg className="vb-search-i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <label htmlFor="vb-q" className="vb-sr">بحث في الأفعال</label>
              <input
                id="vb-q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="go أو went أو يذهب…"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="search"
              />
              {query ? (
                <button type="button" className="vb-search-x" onClick={() => setQuery("")} aria-label="مسح البحث">
                  <span aria-hidden="true">×</span>
                </button>
              ) : null}
            </div>
            <p className="vb-count" role="status" aria-live="polite">
              {anyFilter ? (
                <>
                  <span><span className="vb-num">{filtered.length}</span> من <span className="vb-num">{VERB_COUNT}</span></span>
                  <button type="button" className="vb-clear" onClick={clearAll}>إلغاء</button>
                </>
              ) : (
                <span className="vb-badge"><span className="vb-num">{VERB_COUNT}</span> فعلاً</span>
              )}
            </p>
          </div>

          <div className="vb-filters">
            <div className="vb-frow" role="group" aria-labelledby="vb-fg">
              <span id="vb-fg" className="vb-flabel">المجموعات</span>
              <div className="vb-chips vb-chips--groups">
                {Object.entries(GROUPS).map(([k, g]) => (
                  <Chip key={k} className="vb-gchip" on={group === k} onClick={() => setGroup(group === k ? null : k)}>
                    <span className="vb-gchip-top">
                      <span className="vb-chip-k" lang="en" dir="ltr">{k}</span>
                      <span className="vb-chip-l">{g.label}</span>
                    </span>
                    <span className="vb-chip-ex" lang="en" dir="ltr">{g.example}</span>
                  </Chip>
                ))}
              </div>
            </div>
            <div className="vb-frow" role="group" aria-labelledby="vb-ft">
              <span id="vb-ft" className="vb-flabel">المستوى</span>
              <div className="vb-chips">
                {Object.entries(TIERS).map(([k, t]) => (
                  <Chip key={k} on={tier === Number(k)} onClick={() => setTier(tier === Number(k) ? null : Number(k))} title={t.hint}>
                    {t.label} <span className="vb-dim">· {t.hint}</span>
                  </Chip>
                ))}
              </div>
            </div>
            <div className="vb-frow" role="group" aria-labelledby="vb-fl">
              <span id="vb-fl" className="vb-flabel">حرف البداية</span>
              <div className="vb-chips vb-chips--letters" dir="ltr">
                {LETTERS.map((l) => (
                  <Chip key={l} on={letter === l} onClick={() => setLetter(letter === l ? null : l)}>{l}</Chip>
                ))}
              </div>
            </div>
          </div>

          <ListHead />
          <ol className="vb-list">
            {filtered.map((v) => (
              <VerbRow
                key={v.id}
                verb={v}
                open={open.has(v.id)}
                onToggle={toggle}
                playing={playing === v.id}
                mastered={mastered.has(v.id)}
              />
            ))}
          </ol>

          {filtered.length === 0 ? (
            <div className="vb-empty">
              <p>لا يوجد فعل شاذ يطابق «<bdi>{query.trim()}</bdi>» مع الفلاتر الحالية.</p>
              {latinQuery && q.length > 2 ? (
                <p className="vb-dim">
                  قد يكون فعلاً منتظماً: المنتظم يأخذ ed في الماضي والتصريف الثالث، مثل <bdi lang="en" dir="ltr">work · worked · worked</bdi>.
                </p>
              ) : null}
              <button type="button" className="vb-btn vb-btn--quiet" onClick={clearAll}>عرض كل الأفعال</button>
            </div>
          ) : null}
        </section>

        <section id="vb-practice" className="vb-section" aria-labelledby="vb-practice-h">
          <div className="vb-sec-head">
            <h2 id="vb-practice-h" className="vb-h2">وضع التدريب</h2>
            <p className="vb-sec-sub">
              بطاقات للحفظ واختبار من عشرة أسئلة.
              {practiceFiltered
                ? ` التدريب الآن على الفلتر الحالي: ${verbsWord(filtered.length)}.`
                : " اختيار فلتر من الجدول يحصر التدريب فيه."}
            </p>
          </div>
          <Practice pool={practicePool} filtered={practiceFiltered} mastered={mastered} setMastered={setMastered} />
        </section>

        <section id="vb-faq" className="vb-section" aria-labelledby="vb-faq-h">
          <div className="vb-sec-head">
            <h2 id="vb-faq-h" className="vb-h2">أسئلة شائعة عن الأفعال الشاذة</h2>
          </div>
          <div className="vb-faq">
            {FAQ.map((f, i) => (
              <details key={f.q} className="vb-qa" open={i === 0}>
                <summary><h3>{f.q}</h3></summary>
                {f.a.map((p) => <p key={p.slice(0, 32)}><Mixed text={p} /></p>)}
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="vb-foot">
        <a href="/" className="vb-brand">
          <BrandMark size={22} />
          <span className="vb-brand-ar">أكاديمية طلاقة</span>
        </a>
        <nav aria-label="روابط">
          <a href="/">الرئيسية</a>
          <a href="/level-test">اختبار تحديد المستوى</a>
          <a href="/work-english">الإنجليزي للعمل</a>
          <a href="/articles">مقالات</a>
        </nav>
        <p className="vb-foot-note">أداة مجانية من أكاديمية طلاقة. النطق مولّد آلياً بصوت أمريكي.</p>
      </footer>

      <StickyCta />
    </div>
  );
}
