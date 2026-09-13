/**
 * PAGE_SEO — one source of truth for per-route title/description/social tags.
 *
 * Read by TWO consumers, which is the whole point:
 *   1. <Seo path="/x" /> (src/components/Seo.jsx) → react-helmet-async, at runtime.
 *   2. scripts/prerender-meta.mjs → bakes the same tags into a static
 *      dist/<route>.html at build time.
 *
 * (2) exists because this is a client-rendered SPA: WhatsApp, X, Telegram,
 * LinkedIn and friends do NOT run JavaScript. Without the static copy they see
 * a head with no description at all and invent one from the page source —
 * which is how an HTML comment ended up as the WhatsApp link preview.
 *
 * To add a route: add an entry here, render <Seo path="..." /> in the page,
 * add the path to PRERENDER_ROUTES below, and list it in public/sitemap.xml.
 */

export const SITE = "https://fluentia.academy";

/** Absolute, always-present fallbacks (also hard-coded in index.html). */
export const OG_IMAGE = `${SITE}/og-image.png`;

export const PAGE_SEO = {
  "/": {
    title: "أكاديمية طلاقة | دورات إنجليزي أونلاين للكبار مع مدربين سعوديين",
    description:
      "دورات إنجليزي أونلاين للكبار في السعودية: مجموعات صغيرة (7 طلاب) أو حصص فردية مع مدربين سعوديين، متابعة يومية، واختبار تحديد مستوى مجاني. باقات تبدأ من 500 ريال.",
    ogTitle: "أكاديمية طلاقة | تعلّم إنجليزي تتكلّمه — لا تحفظه",
    ogDescription:
      "أكاديمية أونلاين للراشدين السعوديين — منهج علمي، مدرّبون أكاديميون، متابعة يومية، تقييم AI. باقات من 500 ريال.",
    twDescription: "أكاديمية أونلاين للراشدين السعوديين — منهج علمي ومتابعة شخصية حقيقية.",
  },

  "/level-test": {
    title: "اختبار تحديد مستوى اللغة الإنجليزية مجاناً | أكاديمية طلاقة",
    description:
      "اختبار تحديد مستوى اللغة الإنجليزية مجاناً: اختبار تكيّفي يحدد مستواك بدقة (CEFR من Pre-A1 إلى C1) في عشر دقائق — قواعد، مفردات، استيعاب، استماع، وكتابة — مع تقرير مفصّل لمهاراتك وخطوتك الجاية.",
    ogDescription:
      "عشر دقائق تعطيك مستواك الحقيقي في الإنجليزي، وتقرير يوضح وين قوتك ووين تحتاج شغل.",
  },

  "/start": {
    title: "ابدأ الإنجليزي مع طلاقة — باقات تبدأ من 500 ر.س | أكاديمية طلاقة",
    description:
      "ابدأ رحلتك مع أكاديمية طلاقة: مجموعات صغيرة (7 طلاب)، متابعة يومية مع مدربين سعوديين، ومنصة ذكية. باقات من 500 ر.س شهرياً. أول محادثة مجانية — بدون التزام.",
    ogTitle: "ابدأ الإنجليزي مع طلاقة — باقات تبدأ من 500 ر.س",
    ogDescription:
      "مجموعات صغيرة، متابعة يومية، ومنصة ذكية. أول محادثة مجانية مع المدرّب — بدون التزام.",
  },

  "/partners": {
    title: "برنامج شركاء طلاقة — اربح بترشيح طلاب الإنجليزي | Fluentia",
    description:
      "انضم لبرنامج شركاء أكاديمية طلاقة: رشّح طلاباً للإنجليزي واربح عمولة على كل اشتراك. رابط إحالة خاص، تتبّع شفّاف، ودفعات منتظمة.",
    ogTitle: "برنامج شركاء طلاقة — اربح بترشيح طلاب الإنجليزي",
    ogDescription: "رشّح طلاباً للإنجليزي واربح عمولة على كل اشتراك. رابط إحالة خاص وتتبّع شفّاف.",
  },

  "/partners/terms": {
    title: "شروط برنامج شركاء طلاقة | أكاديمية طلاقة",
    description:
      "شروط وأحكام برنامج شركاء أكاديمية طلاقة — كيف تُحتسب العمولة، متى تُصرف الدفعات، وما الذي يُلغي الإحالة.",
    ogTitle: "شروط برنامج شركاء طلاقة",
    ogDescription: "كيف تُحتسب العمولة، متى تُصرف الدفعات، وما الذي يُلغي الإحالة.",
  },

  "/about": {
    title: "من نحن | أكاديمية طلاقة — Fluentia Academy",
    description:
      "قصة أكاديمية طلاقة ومؤسسها د. علي الأحمد — لماذا نؤمن بالتعليم المخصص والمجموعات الصغيرة.",
    ogTitle: "من نحن | أكاديمية طلاقة",
    ogDescription: "قصة أكاديمية طلاقة ومؤسسها د. علي الأحمد.",
  },

  "/articles": {
    title: "مقالات طلاقة — تعلّم الإنجليزي للكبار | أكاديمية طلاقة",
    description:
      "مقالات صريحة عن تعلّم الإنجليزي للكبار: لماذا تتعثّر المحاولات، كيف تكسر الحاجز، والطريقة العلمية للوصول إلى الطلاقة.",
    ogTitle: "مقالات طلاقة — تعلّم الإنجليزي للكبار",
    ogDescription:
      "مقالات صريحة عن تعلّم الإنجليزي للكبار وكسر الحاجز والطريقة العلمية للوصول إلى الطلاقة.",
  },

  "/work-english": {
    title: "الإنجليزي للعمل: مصطلحات كل مجال بالإنجليزي مترجمة | أكاديمية طلاقة",
    description:
      "مصطلحات العمل بالإنجليزي مع الترجمة لكل مجال: الطب والتمريض والصيدلة والمحاسبة والبنوك والهندسة وتقنية المعلومات والتسويق والموارد البشرية — مع أمثلة وجمل جاهزة.",
    ogTitle: "الإنجليزي للعمل — مصطلحات كل مجال بالإنجليزي",
    ogDescription: "قوائم مصطلحات مترجمة لكل مجال عمل، مع أمثلة وجمل جاهزة وأخطاء شائعة. قابلة للطباعة.",
  },

  "/privacy": {
    title: "سياسة الخصوصية | أكاديمية طلاقة",
    description:
      "سياسة الخصوصية لأكاديمية طلاقة — كيف نجمع بياناتك، نستخدمها، ونحميها. متوافقة مع نظام حماية البيانات الشخصية السعودي (PDPL).",
    ogTitle: "سياسة الخصوصية | أكاديمية طلاقة",
  },

  "/terms": {
    title: "شروط الاستخدام | أكاديمية طلاقة",
    description:
      "شروط وأحكام الاشتراك في أكاديمية طلاقة — الدفع، الاسترداد، الملكية الفكرية، إنهاء الخدمة.",
    ogTitle: "شروط الاستخدام | أكاديمية طلاقة",
  },
};

/**
 * Routes that get their own static HTML file at build time.
 * Anything not listed still works — it falls through to dist/index.html, which
 * carries the homepage block (a correct brand preview, never a stray comment).
 * Article routes are appended automatically by the prerender script.
 */
export const PRERENDER_ROUTES = Object.keys(PAGE_SEO);

/** Fill the optional fields so both consumers emit an identical tag set. */
export function resolveSeo(path) {
  const raw = PAGE_SEO[path];
  if (!raw) return null;
  return normalizeSeo({ ...raw, path });
}

export function normalizeSeo(entry) {
  const ogTitle = entry.ogTitle || entry.title;
  const ogDescription = entry.ogDescription || entry.description;
  return {
    path: entry.path,
    url: `${SITE}${entry.path === "/" ? "/" : entry.path}`,
    title: entry.title,
    description: entry.description,
    ogType: entry.ogType || "website",
    ogTitle,
    ogDescription,
    twTitle: entry.twTitle || ogTitle,
    twDescription: entry.twDescription || ogDescription,
    keywords: entry.keywords || null,
  };
}

/** A work-English glossary page (data lives in content/work-english/<slug>.js). */
export function workPageSeo(page) {
  return normalizeSeo({
    path: `/work-english/${page.slug}`,
    title: `${page.title} | أكاديمية طلاقة`,
    description: page.description,
    ogType: "article",
    ogTitle: page.h1,
    ogDescription: page.description,
    keywords: page.keywords?.length ? page.keywords.join(", ") : null,
  });
}

/** Build a normalized entry for an article (data lives in content/articles.js). */
export function articleSeo(article) {
  return normalizeSeo({
    path: `/articles/${article.slug}`,
    title: `${article.title} | أكاديمية طلاقة`,
    description: article.description,
    ogType: "article",
    ogTitle: article.title,
    ogDescription: article.description,
    keywords: article.keywords?.length ? article.keywords.join(", ") : null,
  });
}
