/**
 * «/preview» — the cinematic homepage candidate. Every word on the page lives here.
 *
 * Rules this copy keeps (docs/higgsfield-rebuild/AUDIT.md + the rebuild prompt):
 *  - Saudi spoken Arabic, SINGULAR address (Ali, 2026-11-24): the reader is «أنت», masculine as the
 *    generic Saudi form, gender-neutral where it reads naturally, never «احجز/ي». «نحن» = طلاقة.
 *    Every line passes «would a Saudi say this out loud?». Line-by-line log: docs/higgsfield-rebuild/COPY-REVIEW.md
 *  - One term per thing: «نتواصل معك» (no meetings, 2026-11-25), «المدرّب», «المرشد الأكاديمي», «المنصّة»,
 *    «مكتبة طلاقة», «بودكاست طلاقة», «مشاهد», «المحادثة مع ليلى». One CTA string per action.
 *  - Multi-line headings are arrays rendered as block spans; CinemaPreview.jsx puts a real space
 *    between them so extracted text never glues words. «\u00A0» glues a last word to its neighbour (no orphans).
 *  - No prices, no refunds, no guarantees, no Telegram, no invented numbers or quotes.
 *  - Feature claims are taken from the live platform copy (next/showcase.js,
 *    landing-v2/content.js); nothing here describes a feature that does not exist.
 *  - The one action is «ابدأ الآن» (send your details; the team replies on WhatsApp). WhatsApp is the quiet alternative.
 */

export const CTA = "ابدأ الآن";
export const CTA_SHORT = "ابدأ الآن";
export const WA_LABEL = "أو كلّمنا على واتساب";

export const HERO = {
  eyebrow: "أكاديمية طلاقة · أونلاين من السعودية",
  lines: ["تكلّم إنجليزي", "بدون ما تركّب", "الجملة في راسك."],
  sub: "حصص مباشرة مع مدرّب يسمعك ويصحّح لك، وتمرين يومي على المنصّة، ومرشد أكاديمي يتابعك أول بأول.",
  note: "بدون أي التزام.",
};

export const BEFORE_AFTER = {
  kicker: "01",
  title: "الفرق اللي تبيه",
  /** Mirrored on purpose: same words, one verb changes. The «…» is the hesitation; «،» is none. */
  before: { tag: "قبل", line: "تعرف الجواب… وتسكت." },
  after: { tag: "بعد", line: "تعرف الجواب، وتقوله." },
  body: "غالباً ما تنقصك الكلمات. ينقصك تمرين كل يوم، وأحد يسمعك ويصحّح لك، لين يصير الكلام عندك عادة.",
};

export const HOW = {
  kicker: "02",
  title: "ثلاثة أشياء تشتغل مع\u00A0بعض",
  items: [
    {
      key: "class",
      n: "1",
      title: "حصص مباشرة مع مدرّب",
      body: "في مجموعة صغيرة، أو حصص فردية لك وحدك، أو تدريب مكثّف. والمدرّب يسمعك ويصحّح لك وأنت تتكلّم.",
    },
    {
      key: "daily",
      n: "2",
      title: "تمرين يومي على المنصّة",
      body: "خطة يومية بدقائق محدّدة لكل مهارة: قراءة، واستماع، ومفردات، ومحادثة. والحصة نفسها مسجّلة، ترجع لها متى\u00A0ما\u00A0بغيت.",
    },
    {
      key: "coach",
      n: "3",
      title: "مرشد أكاديمي يتابعك",
      body: "يعرف وين وصلت، ويشتغل معك على نقاط ضعفك، ويعدّل خطتك إذا تغيّر جدولك.",
    },
  ],
};

/** The platform, once. Lines are the live platform's own descriptions, shortened. */
export const PLATFORM = {
  kicker: "03",
  title: "المنصّة اللي تتدرّب عليها كل\u00A0يوم",
  sub: "كل شي على مستواك، وتحت كل جملة ترجمتها.",
  items: [
    { key: "novel", name: "مكتبة طلاقة", line: "روايات أصلية بإنجليزي متدرّج على مستواك. اضغط أي جملة تطلع لك ترجمتها، أو اسمع الفصل بصوت الراوي." },
    { key: "podcast", name: "بودكاست طلاقة", line: "حلقات من إنتاج طلاقة. النص يمشي مع الصوت كلمة كلمة، وتحت كل جملة ترجمتها." },
    { key: "scenes", name: "مشاهد", line: "مقاطع قصيرة من أفلام ومسلسلات حقيقية، وترجمة عربية تمشي معها سطر بسطر." },
    { key: "speak", name: "المحادثة مع ليلى", line: "تكلّم بالإنجليزي مع ليلى، مدرّبة ذكاء اصطناعي، بصوتك. وفي الآخر تعطيك درجة، وتصحّح أخطاءك وتشرحها لك بالعربي." },
    { key: "plan", name: "خطة اليوم", line: "دقائق محدّدة لكل مهارة كل يوم، وعدّاد يحسب وقت مذاكرتك." },
    { key: "recordings", name: "تسجيل الحصة", line: "حصتك المباشرة مسجّلة داخل الوحدة، وتكمّل من المكان اللي وقفت عنده." },
  ],
};

export const WHO = {
  kicker: "04",
  title: "لمين طلاقة؟",
  items: [
    { key: "employee", title: "موظفين", line: "تبي تتكلّم في الاجتماعات والمقابلات، وتكتب إيميلاتك بدون\u00A0توتر." },
    { key: "owner", title: "أصحاب أعمال", line: "تتعامل مع عملاء وموردين برّا، وتبي تفاوض بنفسك." },
    { key: "student", title: "طلاب", line: "تستعدّ للجامعة أو للابتعاث، وتبي أساس قوي من البداية." },
  ],
};

export const PROOF = {
  kicker: "05",
  title: "من طلابنا",
  logosLead: "طلابنا من كبرى الجهات والجامعات",
  storyCta: "شاهد القصة كاملة",
  statsNote: "أرقام حقيقية من منصّة طلاقة، ونحدّثها كل فترة.",
  /** Shown only while a slot has no approved story. Never fill with invented quotes. */
  slotLabel: "مكان قصة طالب حقيقية",
  slotHint: "تُضاف بعد موافقة الطالب، بكلامه هو.",
};

/** The live homepage's platform counters (IMPACT_STATS in src/pages/next/Acts.jsx) — real, rounded down. Keep in step. */
export const STATS = [
  { value: 12000, label: "دقيقة مذاكرة على المنصّة" },
  { value: 8700, label: "سؤال أجاب عليه طلابنا" },
  { value: 7900, label: "كلمة تعلّمها طلابنا" },
  { value: 500, label: "تسجيل صوتي من طلابنا" },
];

export const STEPS = {
  kicker: "06",
  title: "كيف تبدأ؟",
  items: [
    { n: "1", title: "ابدأ الآن", body: "محادثة قصيرة مع «مستشار طلاقة»، تعطينا فيها هدفك وبياناتك." },
    { n: "2", title: "نتواصل معك", body: "فريقنا يتواصل معك على واتساب، يعرف هدفك ومستواك ووقتك، ويرشّح لك المسار والباقة المناسبة." },
    { n: "3", title: "قرّر براحتك", body: "بدون أي التزام. وإذا ناسبتك طلاقة، تبدأ بخطة على مقاسك." },
  ],
};

export const FINAL = {
  title: ["أول خطوة؟", "ابدأ\u00A0الآن."],
  sub: "نسمعك، ونقول لك بصراحة وين واقف إنجليزيك وإيش\u00A0يحتاج.",
};

export const NAV = [
  { href: "#how", label: "كيف نشتغل" },
  { href: "#platform", label: "المنصّة" },
  { href: "#stories", label: "من طلابنا" },
];

export const FOOTER = {
  line: "أكاديمية طلاقة: تعليم الإنجليزي أونلاين للكبار، من السعودية.",
  links: [
    { href: "/stories", label: "قصص طلابنا" },
    { href: "/journal", label: "مجلة طلاقة" },
    { href: "/privacy", label: "الخصوصية" },
    { href: "/terms", label: "الشروط" },
  ],
};
