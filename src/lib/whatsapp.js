const WA_NUMBER = "966558669974";
const REF_COOKIE_NAME = "flu_ref";
const COOKIE_DAYS = 30;

export function getRefCode() {
  if (typeof document === "undefined") return null;

  // 1. Cookie (set by captureRefFromUrl in affiliateTracking.js)
  const cookieMatch = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${REF_COOKIE_NAME}=`));
  if (cookieMatch) {
    const value = decodeURIComponent(cookieMatch.split("=")[1] || "").trim();
    if (value) return value;
  }

  // 2. localStorage fallback (same module stores JSON {code, at})
  try {
    const stored = localStorage.getItem(REF_COOKIE_NAME);
    if (stored) {
      const { code, at } = JSON.parse(stored);
      if (Date.now() - at <= COOKIE_DAYS * 24 * 60 * 60 * 1000) return code || null;
    }
  } catch {}

  // 3. URL param ?ref=CODE (for first-load attribution before cookie is written)
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl) {
      const clean = fromUrl.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
      if (clean) return clean;
    }
  } catch {}

  return null;
}

export function buildWhatsAppUrl(baseMessage) {
  const ref = getRefCode();
  const message = ref ? `${baseMessage}\n\n(رمز الإحالة: ${ref})` : baseMessage;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  general: "مرحباً، أبي أستفسر عن أكاديمية طلاقة 🌸",
  subscribe: "مرحباً، أبي أشترك في أكاديمية طلاقة 🌸",
  placement: "مرحباً، خلّصت اختبار تحديد المستوى وأبي أعرف خطوتي الجاية 🌸",
  packageAsas: "مرحباً، أبي أشترك في باقة الأساس (750 ريال) 🌸",
  packageTalaqa: "مرحباً، أبي أشترك في باقة الطلاقة (1100 ريال) 🌸",
  packageTamayuz: "مرحباً، أبي أشترك في باقة التميّز (1500 ريال) 🌸",
  packageVip: "مرحباً، أبي أشترك في باقة VIP الفردية (2000 ريال) 🌸",
  packageSelfLearn: "مرحباً، أبي أشترك في باقة التعلم الذاتي (500 ريال) 🌸",
};
