/**
 * Copy for /verbs. Counts are read from the data, never typed — a reference
 * that says «190» above a list of 191 has already lost the reader.
 *
 * Address stays gender-neutral (a public, mixed audience): first person
 * («أعرفه»), nouns («التالي»), or forms that are spelled the same for both
 * («عليك»، «يهمك»). Never معهد / دورة / مذهل / مميز / استثنائية / الأفضل.
 */
import { IRREGULAR_VERBS, VERB_COUNT } from "../../content/irregularVerbs";

const count = (fn) => IRREGULAR_VERBS.filter(fn).length;
export const SAME_23 = count((v) => v.group === "ABB" || v.group === "AAA");
export const TIER1 = count((v) => v.tier === 1);
export const TIER2 = count((v) => v.tier === 2);

/** «191 فعلاً» — the noun after 11-99 (and 111-199…) is singular accusative. */
export function verbsWord(n) {
  const last2 = n % 100;
  if (n === 1) return "فعل واحد";
  if (n === 2) return "فعلان";
  if (last2 >= 3 && last2 <= 10) return `${n} أفعال`;
  if (last2 >= 11 && last2 <= 99) return `${n} فعلاً`;
  return `${n} فعل`;
}

export const HERO = {
  eyebrow: "أداة مجانية من أكاديمية طلاقة",
  h1: "الأفعال الشاذة في اللغة الإنجليزية",
  lead: "مرجع كامل ومجاني: التصريفات الثلاثة لكل فعل، معناه بالعربي، نطقه بصوت واضح، وتدريب يثبّتها في الذاكرة — بدون تسجيل.",
  facts: [
    { n: String(VERB_COUNT), label: "فعلاً شاذاً" },
    { n: "4", label: "أنماط تختصر الحفظ" },
    { n: String(VERB_COUNT), label: "مقطعاً صوتياً" },
    { n: "مجاناً", label: "بلا تسجيل ولا إعلانات" },
  ],
};

export const FORM_LABELS = {
  base: { ar: "التصريف الأول", short: "الأول", en: "Base" },
  past: { ar: "الماضي", short: "الماضي", en: "Past Simple" },
  participle: { ar: "التصريف الثالث", short: "الثالث", en: "Past Participle" },
};

export const QUIZ_PRAISE = ["صح! بالضبط.", "إجابة صحيحة.", "تمام، كذا بالضبط.", "ممتاز!", "صحيحة 100%."];
export const QUIZ_MISS = ["قريبة! الصحيح:", "ولا يهمك، الصحيح:", "مو هذي، الصحيح:"];

export function scoreLine(score, total) {
  const r = total ? score / total : 0;
  if (r === 1) return "الدرجة كاملة! هذي الأفعال صارت في جيبك.";
  if (r >= 0.7) return "نتيجة قوية. كم فعل بس وتصير كاملة.";
  if (r >= 0.4) return "بداية حلوة. البطاقات تثبّت الباقي بسرعة.";
  return "كل من أتقنها بدأ من هنا. البطاقات أسرع طريق للحفظ.";
}

export const CTA = {
  href: "/#fx-pricing",
  label: "تعرّف على طلاقة",
  bar: "الأفعال خطوة أولى. مع طلاقة نعرف مستواك الحقيقي ونوصلك للكلام بثقة.",
  quiz: "حفظ الأفعال بداية. الكلام بها بثقة هو اللي نشتغل عليه في طلاقة.",
};

export const FAQ = [
  {
    q: "ما هي الأفعال الشاذة؟",
    a: [
      "الأفعال الشاذة (Irregular Verbs) أفعال إنجليزية لا تتبع القاعدة المعتادة في الماضي. الفعل المنتظم يأخذ ed في آخره: work يصير worked.",
      "أما الفعل الشاذ فيتغيّر شكله: go ثم went ثم gone، أو يبقى كما هو في الثلاثة: put / put / put. ولأنها لا تتبع قاعدة، تُحفظ — والحفظ أسهل بكثير مما يبدو حين تُجمع في أنماط وعائلات.",
    ],
  },
  {
    q: "كم عدد الأفعال الشاذة في اللغة الإنجليزية؟",
    a: [
      "القواميس تذكر أكثر من 200 فعل شاذ، لكن عدداً منها نادر أو قديم لا يُستخدم اليوم.",
      `في هذه الصفحة ${verbsWord(VERB_COUNT)} هي التي تحتاجها فعلاً في العمل والحياة اليومية، مرتبة حسب كثرة الاستخدام: أول ${TIER1} هي الأساس، والـ ${TIER2} التالية تكمّل أغلب ما يُقرأ ويُسمع.`,
    ],
  },
  {
    q: "ما الفرق بين التصريف الثاني والتصريف الثالث؟",
    a: [
      "التصريف الثاني (Past Simple) للماضي البسيط وحده: I went to work early.",
      "التصريف الثالث (Past Participle) لا يأتي وحده أبداً: يحتاج have / has / had في الأزمنة التامة (I have gone)، أو فعل be في المبني للمجهول (It was written).",
      `وفي ${verbsWord(SAME_23)} من القائمة يتطابق الثاني والثالث (bought / bought)، فيكفي حفظ شكل واحد. البقية يُحفظ ثالثها وحده — وفلتر «الثالث شكل جديد» في الجدول يعرضها مجتمعة.`,
    ],
  },
  {
    q: "كيف أحفظ الأفعال الشاذة بسرعة؟",
    a: [
      "ليس بقراءة القائمة من أولها لآخرها. ثلاث خطوات تختصر الطريق:",
      `أولاً، البداية بالمستوى الأساسي: أول ${TIER1} فعلاً تغطي أغلب الكلام اليومي.`,
      "ثانياً، الحفظ بالعائلات لا فعلاً فعلاً: sing / sang / sung تفتح معها ring و drink و swim و begin دفعة واحدة. كل فعل في الجدول مكتوب بجانبه اسم عائلته.",
      "ثالثاً، الاسترجاع بدل إعادة القراءة: محاولة تذكّر الجواب قبل رؤيته هي التي تثبّته. البطاقات والاختبار السريع في هذه الصفحة مبنية على هذا المبدأ.",
    ],
  },
  {
    q: "هل أحتاج أحفظ الأفعال الشاذة كلها؟",
    a: [
      `لا. أول ${TIER1} فعلاً (المستوى الأساسي) تتكرر في كل محادثة تقريباً، والـ ${TIER2} بعدها تكفي لأغلب ما يمر في العمل. البقية تأتي مع القراءة والاستماع.`,
      "والأهم من الحفظ استخدامها في الكلام: أن يخرج went من غير تفكير وسط جملة. هذا ما يصنعه التدريب الحقيقي على المحادثة.",
    ],
  },
];
