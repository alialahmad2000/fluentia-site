/**
 * The academy as structured data — ONE definition for every page.
 *
 * index.html carries the same Organization block statically (the SPA's pages
 * need it before any script runs); scripts/build-guide.mjs fails the build if
 * the two ever disagree, and the static guide pages embed this object directly.
 *
 * Facts only from docs/seo/FACTS.md. No foundingDate (the site contradicts
 * itself: /about says March 2026, the old schema said 2021 — see NEEDS-ALI.md),
 * no ratings, no student counts.
 */
import { PRICING } from "../../src/pages/landing-v2/content.js";

export const SITE = "https://fluentia.academy";
export const ORG_ID = `${SITE}/#organization`;
export const WA_NUMBER = "966558669974";
export const WA_DISPLAY = "+966 55 866 9974";
export const EMAIL = "hi@fluentia.academy";
export const PROFILES = [
  { label: "TikTok", handle: "@fluentia_", url: "https://www.tiktok.com/@fluentia_" },
  { label: "Instagram", handle: "@fluentia__", url: "https://www.instagram.com/fluentia__" },
];

export const DISAMBIGUATION_AR =
  "أكاديمية سعودية لتعليم اللغة الإنجليزية أونلاين للبالغين، موقعها fluentia.academy — ليست مرتبطة بأي جهة أخرى تحمل اسم Fluentia (مثل fluentia.us).";
export const DISAMBIGUATION_EN =
  "A Saudi online English academy for adults at fluentia.academy. Not affiliated with any other organisation named Fluentia (such as fluentia.us).";

export const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": ORG_ID,
  name: "أكاديمية طلاقة",
  alternateName: ["Fluentia Academy", "Fluentia", "طلاقة", "أكاديمية طلاقة للغة الإنجليزية"],
  url: `${SITE}/`,
  logo: { "@type": "ImageObject", url: `${SITE}/logo.png`, width: 512, height: 512 },
  image: `${SITE}/og-image.png`,
  description:
    "أكاديمية طلاقة (Fluentia Academy): أكاديمية سعودية لتعليم اللغة الإنجليزية أونلاين للبالغين — حصص مباشرة في مجموعات صغيرة (7 طلاب كحد أقصى) أو تدريب فردي، متابعة يومية، ومنصّة تعلّم من Pre-A1 إلى C1. الباقات من 500 ر.س شهرياً، والبداية بلقاء مبدئي مجاني.",
  disambiguatingDescription: DISAMBIGUATION_AR,
  email: EMAIL,
  telephone: `+${WA_NUMBER}`,
  founder: {
    "@type": "Person",
    "@id": `${SITE}/#founder`,
    name: "Dr. Ali Alahmad",
    alternateName: "د. علي الأحمد",
    jobTitle: "Founder",
  },
  address: { "@type": "PostalAddress", addressCountry: "SA" },
  areaServed: { "@type": "Country", name: "Saudi Arabia" },
  knowsLanguage: ["ar", "en"],
  sameAs: PROFILES.map((p) => p.url),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${WA_NUMBER}`,
    contactType: "customer service",
    url: `https://wa.me/${WA_NUMBER}`,
    email: EMAIL,
    availableLanguage: ["Arabic", "English"],
    areaServed: "SA",
  },
};

/** The five packages on sale, read from the homepage's own pricing source so
 *  the guide can never quote a price the homepage does not show. */
export function packages() {
  const e = PRICING.entryTier;
  const v = PRICING.vipTier;
  const i = PRICING.intensiveTier;
  const list = (xs) => xs.map((x) => (typeof x === "string" ? x : x.text)).join("، ");
  return [
    { id: e.id, name: e.name, en: "Self-study (platform only)", price: e.price, from: false, desc: `${e.tagline} يشمل: ${list(e.features)}.` },
    ...PRICING.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      en: t.id === "asas" ? "Asas — small-group classes" : "Tamayuz — small group + private classes",
      price: t.price,
      from: false,
      desc: `${t.tagline} يشمل: ${list(t.features)}.`,
    })),
    { id: v.id, name: v.name, en: "1-on-1 training", price: v.priceLow, from: true, desc: `${v.tagline} ${v.priceNote} يشمل: ${list(v.features)}.` },
    { id: i.id, name: i.name, en: "Intensive 1-on-1 (12 classes + 8 practice sessions / month)", price: i.price, from: false, desc: `${i.tagline} ${i.priceNote} يشمل: ${list(i.features)}.` },
  ];
}

/** Course + Offer per package, for the pricing page. */
export function coursesLd(pageUrl) {
  return packages().map((p) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${p.name} — أكاديمية طلاقة`,
    alternateName: `${p.en} — Fluentia Academy`,
    description: p.desc,
    provider: { "@id": ORG_ID },
    inLanguage: "ar",
    teaches: "English as a foreign language",
    educationalLevel: "CEFR Pre-A1 → C1",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
    offers: {
      "@type": "Offer",
      category: "Subscription",
      priceCurrency: "SAR",
      ...(p.from
        ? { priceSpecification: { "@type": "UnitPriceSpecification", minPrice: p.price, priceCurrency: "SAR", unitText: "MONTH" } }
        : { price: p.price }),
      availability: "https://schema.org/InStock",
      url: pageUrl,
    },
  }));
}
