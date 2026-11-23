/**
 * «/preview» — the cinematic homepage candidate. Every word on the page lives here.
 *
 * Rules this copy keeps (docs/higgsfield-rebuild/AUDIT.md + the rebuild prompt):
 *  - Saudi spoken Arabic, plural address (يخاطب الرجال والنساء معاً), no abstract metaphors.
 *  - No prices, no refunds, no guarantees, no Telegram, no invented numbers or quotes.
 *  - Feature claims are taken from the live platform copy (next/showcase.js,
 *    landing-v2/content.js); nothing here describes a feature that does not exist.
 *  - The one action is the free initial meeting. WhatsApp is the quiet alternative.
 */

export const CTA = "احجز لقاءك المبدئي المجاني";
export const CTA_SHORT = "احجز لقاءك المجاني";
export const WA_LABEL = "أو كلّمونا واتساب";

export const HERO = {
  eyebrow: "أكاديمية طلاقة · أونلاين من السعودية",
  lines: ["تكلّموا إنجليزي", "بدون ما تحضّرون", "الجملة في راسكم."],
  sub: "حصص مباشرة مع مدرّب حقيقي، ومنصّة تتدرّبون عليها كل يوم، ومرشد أكاديمي يتابعكم أول بأول.",
  note: "لقاء مبدئي · مجاني · بدون أي التزام",
};

export const BEFORE_AFTER = {
  kicker: "01",
  title: "الفرق اللي تبونه",
  before: { tag: "قبل", line: "تعرفون الجواب… وتسكتون." },
  after: { tag: "بعد", line: "تقولونه. بهدوء، وبجملة كاملة." },
  body: "أغلب طلابنا ما ينقصهم كلمات. ينقصهم تمرين يومي، وأحد يسمعهم ويصحّح لهم، لين يصير الكلام عادة.",
};

export const HOW = {
  kicker: "02",
  title: "ثلاثة أشياء تشتغل مع بعض",
  items: [
    {
      key: "class",
      n: "1",
      title: "حصص مباشرة مع مدرّب",
      body: "مجموعة صغيرة، أو حصص فردية لكم وحدكم، أو تدريب مكثّف. مدرّب حقيقي يسمعكم ويصحّح لكم وأنتم تتكلّمون.",
    },
    {
      key: "daily",
      n: "2",
      title: "تمرين يومي على المنصّة",
      body: "خطة يومية بدقائق محدّدة لكل مهارة: قراءة، استماع، مفردات، ومحادثة. والحصة نفسها مسجّلة ترجعون لها متى ما بغيتم.",
    },
    {
      key: "coach",
      n: "3",
      title: "مرشد أكاديمي يتابعكم",
      body: "يعرف وين وصلتوا، ويشتغل معكم على نقاط ضعفكم، ويرتّب خطتكم إذا تغيّر جدولكم.",
    },
  ],
};

/** The platform, once. Lines are the live platform's own descriptions, shortened. */
export const PLATFORM = {
  kicker: "03",
  title: "المنصّة اللي تتدرّبون عليها كل يوم",
  sub: "كل شي بمستواكم، وكل جملة لها ترجمة تحتها.",
  items: [
    { key: "novel", name: "مكتبة طلاقة", line: "روايات أصلية بإنجليزية متدرّجة على مستواكم. اضغطوا أي جملة تطلع ترجمتها، أو اسمعوا الفصل بصوت الراوي." },
    { key: "podcast", name: "بودكاست طلاقة", line: "حلقات من إنتاج طلاقة، والنص يمشي مع الصوت كلمة كلمة، وترجمة كل جملة تحتها." },
    { key: "scenes", name: "مشاهد", line: "مقاطع قصيرة من أفلام ومسلسلات حقيقية، بترجمة عربية متزامنة سطر بسطر." },
    { key: "speak", name: "المحادثة مع ليلى", line: "محادثة صوتية بالإنجليزي مع ليلى، مدرّبة ذكاء اصطناعي. وبالنهاية درجة، وتصحيحات مشروحة بالعربي." },
    { key: "plan", name: "خطة اليوم", line: "دقائق محدّدة لكل مهارة كل يوم، وعدّاد يحسب وقت مذاكرتكم." },
    { key: "recordings", name: "تسجيل الحصة", line: "حصتكم المباشرة مسجّلة داخل الوحدة، وتكمّلون من وين وقفتوا." },
  ],
};

export const WHO = {
  kicker: "04",
  title: "لمين طلاقة؟",
  items: [
    { key: "employee", title: "موظفين", line: "تبون تتكلّمون في الاجتماع والمقابلة والإيميل بدون توتر." },
    { key: "owner", title: "أصحاب أعمال", line: "تتعاملون مع عملاء وموردين برا، وتبون تفاوضون بنفسكم." },
    { key: "student", title: "طلاب", line: "تستعدّون للجامعة أو الابتعاث، وتبون أساس قوي من البداية." },
  ],
};

export const PROOF = {
  kicker: "05",
  title: "من طلابنا",
  logosLead: "طلابنا من كبرى الجهات والجامعات",
  storyCta: "شاهدوا القصة كاملة",
  statsNote: "أرقام حقيقية من منصّة طلاقة — تُحدَّث دورياً",
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
  title: "كيف تبدأون",
  items: [
    { n: "1", title: "احجزوا اللقاء", body: "محادثة قصيرة مع «مستشار طلاقة» يرتّب لكم فيها موعد يناسبكم." },
    { n: "2", title: "اللقاء المبدئي", body: "لقاء مجاني نسمعكم فيه، ونعرف مستواكم وهدفكم." },
    { n: "3", title: "قرّروا براحتكم", body: "بدون أي التزام. وإذا ناسبتكم طلاقة، تبدأون بخطة على مقاسكم." },
  ],
};

export const FINAL = {
  title: ["أول خطوة لقاء واحد.", "مجاني."],
  sub: "نسمعكم فيه، ونقول لكم بصراحة وين يوقف إنجليزيكم.",
};

export const NAV = [
  { href: "#how", label: "كيف نشتغل" },
  { href: "#platform", label: "المنصّة" },
  { href: "#stories", label: "من طلابنا" },
];

export const FOOTER = {
  line: "أكاديمية طلاقة — تعليم الإنجليزي أونلاين للبالغين، من السعودية.",
  links: [
    { href: "/stories", label: "قصص طلابنا" },
    { href: "/journal", label: "مجلة طلاقة" },
    { href: "/privacy", label: "الخصوصية" },
    { href: "/terms", label: "الشروط" },
  ],
};
