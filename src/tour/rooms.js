/**
 * The tour's rooms, in walking order. One source for the hub's doors, the
 * top bar's «التالي», and the router. A room's module lives in
 * rooms/<slug>/index.jsx and its media in public/tour/<slug>/.
 */
export const ROOMS = [
  {
    slug: "unit",
    title: "الوحدة الدراسية",
    kicker: "من الغلاف إلى آخر محطة",
    blurb: "وحدة كاملة من منهج طلاقة: غلافها وصفحتها، ثم قراءة تضغط فيها على أي كلمة، واستماع، ومفردات بصوتها.",
    minutes: 4,
  },
  {
    slug: "grammar",
    title: "القواعد",
    kicker: "المرجع النحوي",
    blurb: "درس قواعد بالرسم والمقارنة، وتمارين تشرح لك لماذا كل خيار صحيح أو خاطئ.",
    minutes: 3,
  },
  {
    slug: "expressions",
    title: "الأمثال والتعابير",
    kicker: "إنجليزي يتكلمه أهله",
    blurb: "مثل إنجليزي بجانب توأمه العربي، وتعبير يقول شيئاً ويعني شيئاً آخر.",
    minutes: 3,
  },
  {
    slug: "verbs",
    title: "سُلّم الأفعال الشاذة",
    kicker: "تمرين حيّ",
    blurb: "جلسة قصيرة من سُلّم الأفعال: تكتب التصريفات الثلاثة ويصحّحك فوراً.",
    minutes: 2,
  },
  {
    slug: "library",
    title: "مكتبة طلاقة",
    kicker: "رواية بصوت سينمائي",
    blurb: "روايات مصوّرة كُتبت لطلاقة. افتح فصلاً واسمعه بأصوات شخصياته وأجوائه.",
    minutes: 3,
  },
];

export const roomPath = (slug) => `/tour/${slug}`;

export function neighbours(slug) {
  const i = ROOMS.findIndex((r) => r.slug === slug);
  return { index: i, prev: ROOMS[i - 1] || null, next: ROOMS[i + 1] || null };
}
