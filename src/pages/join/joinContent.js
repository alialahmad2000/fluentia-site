/**
 * /join copy + data. The page is composed from the homepage's own sections
 * (their copy lives in landing-v2/content.js); only the lead form and the
 * three steps are /join's own, and every fact they state is one the site
 * already publishes:
 *   - tiers, prices → PRICING in landing-v2/content.js (the homepage's source
 *     of truth), in the order the homepage pricing shows them.
 *   - goals → the `path` values /start already sends.
 */
import { PRICING } from "../landing-v2/content";

const self = PRICING.entryTier;
const vip = PRICING.vipTier;
const intensive = PRICING.intensiveTier;

/** Every tier a pricing card can preselect (its `data-tier` is the id). */
export const TIERS = [
  ...PRICING.tiers.map((t) => ({ id: t.id, name: t.name, price: t.price })),
  { id: vip.id, name: vip.name, price: vip.priceLow, priceFrom: true },
  { id: intensive.id, name: intensive.name, price: intensive.price },
  { id: self.id, name: self.name, price: self.price },
];

export const formatPrice = (n) => n.toLocaleString("en-US");

/** Goal chips → the `path` values /start already sends ('' = undecided). */
export const GOALS = [
  { id: "foundation", label: "تأسيس من الصفر", path: "تأسيس" },
  { id: "conversation", label: "تطوير المحادثة", path: "تطوير" },
  { id: "ielts", label: "IELTS", path: "IELTS" },
  { id: "unsure", label: "مو متأكد", path: "" },
];

export const DEMO = {
  h2: "شوف المنصّة من الداخل",
  line: "اضغط على أي كلمة، وشوف معناها ونطقها في سياقها.",
};

export const STEPS = {
  h2: "كيف تبدأ",
  items: [
    { title: "سجّل بياناتك", body: "اسمك ورقمك، 30 ثانية." },
    { title: "لقاء مبدئي مجاني", body: "نعرف مستواك وهدفك ووقتك، ونرشّح لك المسار والباقة المناسبة." },
    { title: "تبدأ مع مجموعتك", body: "تنضم لمجموعة صغيرة بمستواك، وتدخل المنصّة من أول يوم." },
  ],
};

export const STICKY = { title: "لقاء مبدئي مجاني", sub: "بدون التزام" };

export const CTA = "احجز لقاءك المبدئي";
