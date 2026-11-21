/**
 * /careers?preview=1 — «وضع المعاينة». Answers every hiring-interview action
 * locally, with the same wording the edge function uses (fluentia-lms
 * supabase/functions/hiring-interview/index.ts), so the whole applicant journey
 * can be walked through without saving anything or calling the server.
 * The screening steps and the end-of-interview pay block are the real ones
 * (verbatim); the free chat questions are a fixed sample (the real assistant
 * writes them from the applicant's answers).
 */

const ACADEMY_WA = "966558669974";
const G = (g, m, f) => (g === "f" ? f : m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const VOICE_KEY_LINE = (g) => G(g,
  "ترى التسجيلات الصوتية هي أهم جزء في طلبك، وعليها نعتمد بشكل أساسي في الاختيار — خذ وقتك، اختار مكان هادي، وتكلم بطبيعتك كأنك في مكالمة حقيقية.",
  "ترى التسجيلات الصوتية هي أهم جزء في طلبك، وعليها نعتمد بشكل أساسي في الاختيار — خذي وقتك، اختاري مكان هادي، وتكلمي بطبيعتك كأنك في مكالمة حقيقية.");
// Sales screening since 2026-11-16 (flow 4): nothing about pay at the start, our hours are never named.
const OTHER = { id: "other", label: "غير ذلك / أكتب" };
const EMP_Q = "وش وضعك الحين؟";
const EMP_OPTS = (g) => [{ id: "full_time", label: G(g, "موظف دوام كامل", "موظفة دوام كامل") }, { id: "part_time", label: G(g, "موظف دوام جزئي", "موظفة دوام جزئي") },
  { id: "student", label: G(g, "طالب", "طالبة") }, { id: "not_working", label: "ما أشتغل حاليًا" }, OTHER];
const SLOTS_Q = (g) => G(g, "وش الأوقات اللي تقدر تتفرغ فيها للمكالمات؟ (تقدر تختار أكثر من وقت)", "وش الأوقات اللي تقدرين تتفرغين فيها للمكالمات؟ (تقدرين تختارين أكثر من وقت)");
const SLOT_OPTS = [{ id: "morning", label: "الصبح" }, { id: "noon", label: "الظهر" }, { id: "afternoon", label: "العصر" },
  { id: "evening", label: "المغرب والليل" }, { id: "flexible", label: "أوقاتي مرنة" }, OTHER];
const eveningFit = (ids) => ids.includes("flexible") || (ids.includes("afternoon") && ids.includes("evening"));
// The pay block: the LAST thing before the result, sent verbatim (gender adaptation only)
const PP_INTRO = "آخر شي، كم سؤال سريع عن الراتب عشان نعرف وش يناسبك.";
const PP_Q1 = (g) => G(g, 'آخر راتب استلمته كم كان تقريبًا؟ وكم تتوقع راتبك معنا؟ (لو ما اشتغلت قبل، اكتب "أول وظيفة")',
  'آخر راتب استلمتيه كم كان تقريبًا؟ وكم تتوقعين راتبك معنا؟ (لو ما اشتغلتي قبل، اكتبي "أول وظيفة")');
const PP_Q2 = "خلنا نفترض إن الوظيفة هذي نظامها عمولة فقط على كل تسجيل، بدون أي راتب ثابت. تناسبك؟";
const PP_Q2_OPTS = [{ id: "yes", label: "إيه، تناسبني" }, { id: "conditional", label: "تناسبني لو العمولة مجزية" }, { id: "no", label: "لا، لازم يكون فيه راتب ثابت" }, OTHER];
const PP_Q3A = (g) => G(g, "حلو. لو دخلك كله عمولة، كم تسجيل تتوقع تجيب في الشهر؟", "حلو. لو دخلك كله عمولة، كم تسجيل تتوقعين تجيبين في الشهر؟");
const PP_Q3B = "طيب لو كان فيه ثابت بسيط + عمولة على كل تسجيل، تناسبك؟";
const PP_Q3B_OPTS = [{ id: "yes", label: "إيه تناسبني" }, { id: "no", label: "لا، أبي راتب ثابت كامل" }, OTHER];
const PP_Q4 = "ليش؟ بكلمتين.";
const PP_SKIP = { id: "skip", label: "أتخطى" };
const PP_DONE = (g) => G(g, "شكرًا لك! خلصنا كل الأسئلة — لحظات ونطلع لك النتيجة.", "شكرًا لكِ! خلصنا كل الأسئلة — لحظات ونطلع لكِ النتيجة.");
const APPETITE_AR = { commission_only: "عمولة فقط ✅", commission_conditional: "عمولة فقط (بشرط)", hybrid: "هجين", fixed_only: "ثابت فقط" };
const appetiteOf = (q2, q3b) => (q2 === "yes" ? "commission_only" : q2 === "conditional" ? "commission_conditional"
  : q2 === "no" ? (q3b === "yes" ? "hybrid" : q3b === "no" ? "fixed_only" : null) : null);
const FIRST_SALES_Q = "أول سؤال عن خبرتك: وش خبرتك في المكالمات؟ سواء مبيعات بالهاتف، كول سنتر، قبول وتسجيل، أو خدمة عملاء.";

/** A sample of what the assistant asks after the screening (it adapts these to each answer). */
const SALES_CHAT = (g) => [
  G(g, "حلو. اعطني مثال واحد: آخر مرة أقنعت فيها شخص متردد — وش كان متردد فيه، ووش قلت له؟", "حلو. اعطيني مثال واحد: آخر مرة أقنعتي فيها شخص متردد — وش كان متردد فيه، ووش قلتي له؟"),
  G(g, "تمام. كيف ترتاح مع إنك تسوي مكالمات كثيرة في اليوم، وتدير لقاءات صوت وفيديو على Google Meet؟", "تمام. كيف ترتاحين مع إنك تسوين مكالمات كثيرة في اليوم، وتديرين لقاءات صوت وفيديو على Google Meet؟"),
  G(g, "متى تقدر تبدأ؟", "متى تقدرين تبدئين؟"),
  G(g, "ليش هالوظيفة بالذات؟ وليش مبيعات مع أكاديمية؟", "ليش هالوظيفة بالذات؟ وليش مبيعات مع أكاديمية؟"),
  G(g, "آخر مرة أحد رفضك أو قفّل المكالمة في وجهك، وش سويت بعدها؟", "آخر مرة أحد رفضك أو قفّل المكالمة في وجهك، وش سويتي بعدها؟"),
  G(g, "وش الشي اللي طلب منك مديرك أو زملاؤك تحسّنه؟", "وش الشي اللي طلب منك مديرك أو زملاؤك تحسّنينه؟"),
];
const TRAINER_CHAT = (g) => [
  G(g, "تمام. عندك شهادة CELTA أو TESOL أو TEFL، أو تخصص قريب؟", "تمام. عندك شهادة CELTA أو TESOL أو TEFL، أو تخصص قريب؟"),
  "الحين بالإنجليزي لو سمحت: A student understands English well but freezes when it's time to speak. What would you do in your first two classes with them?",
  "And one more in English: How do you keep a shy adult learner talking in a group class?",
  G(g, "كم ساعة في الأسبوع تقدر تدرّس؟ وتقدر تلتزم بساعات مسائية ثابتة؟", "كم ساعة في الأسبوع تقدرين تدرّسين؟ وتقدرين تلتزمين بساعات مسائية ثابتة؟"),
  G(g, "متى تقدر تبدأ؟", "متى تقدرين تبدئين؟"),
  G(g, "كيف بيوصفك طلابك أو آخر مدير لك في ثلاث كلمات؟ ووش الشي الوحيد اللي طلبوا منك تحسّنه؟", "كيف بيوصفك طلابك أو آخر مدير لك في ثلاث كلمات؟ ووش الشي الوحيد اللي طلبوا منك تحسّنينه؟"),
  G(g, "حدّثني عن حصة مشت بشكل سيئ أو متعلم صعب — وش صار، ووش سويت؟", "حدّثيني عن حصة مشت بشكل سيئ أو متعلمة صعبة — وش صار، ووش سويتي؟"),
  G(g, "سؤال تنظيمي بسيط: كم كان أجرك في التدريس قبل تقريبًا (بالساعة أو بالشهر، بالريال)؟ ولو هذي أول تجربة، قل «أول تجربة».", "سؤال تنظيمي بسيط: كم كان أجرك في التدريس قبل تقريبًا (بالساعة أو بالشهر، بالريال)؟ ولو هذي أول تجربة، قولي «أول تجربة»."),
  G(g, "وكم تتوقع أجر الساعة عندنا؟", "وكم تتوقعين أجر الساعة عندنا؟"),
];

const RP3 = [
  { kind: "voice_opening", title_ar: "مكالمة تمثيلية 1 من 2: افتتاح المكالمة",
    m: "تخيّل إنك تتصل الحين على شخص سجّل اهتمامه بتعلّم الإنجليزي في أكاديمية طلاقة. افتح المكالمة كأنها حقيقية.",
    f: "تخيّلي إنك تتصلين الحين على شخص سجّل اهتمامه بتعلّم الإنجليزي في أكاديمية طلاقة. افتحي المكالمة كأنها حقيقية." },
  { kind: "voice_objection", title_ar: "مكالمة تمثيلية 2 من 2: «السعر غالي»",
    m: "العميل قال لك: \"السعر غالي\" — رد عليه كأنك في المكالمة.",
    f: "العميل قال لك: \"السعر غالي\" — ردّي عليه كأنك في المكالمة." },
];

function voiceTasks(s) {
  const { role, g, done, attempts } = s;
  if (role === "sales") {
    return [
      { kind: "voice_ar", title_ar: "تعريف بنفسك (تسجيل صوتي)", min_s: 30, max_s: 60, done: !!done.voice_ar, key: true, note_ar: VOICE_KEY_LINE(g),
        prompt_ar: G(g, "عرّف بنفسك في 30 إلى 60 ثانية، وتكلّم كأنك في مكالمة مع شخص مهتم: ليش تشوف نفسك مناسب لهذا الدور؟",
          "عرّفي بنفسك في 30 إلى 60 ثانية، وتكلّمي كأنك في مكالمة مع شخص مهتم: ليش تشوفين نفسك مناسبة لهذا الدور؟") },
      ...RP3.map((r) => {
        const n = attempts[r.kind] || 0;
        return { kind: r.kind, title_ar: r.title_ar, min_s: 30, max_s: 45, done: !!done[r.kind], key: true, scenario: true,
          attempts: n, max_attempts: 2, can_retry: !done[r.kind] || n < 2,
          prompt_ar: G(g, "الموقف ما يظهر إلا لما تضغط «ابدأ التسجيل»: بعدها عدّ تنازلي 3 ثواني، ويظهر الموقف ويبدأ التسجيل. رد بصوتك كأنك في مكالمة حقيقية (30 إلى 45 ثانية). عندك محاولتين بالكثير.",
            "الموقف ما يظهر إلا لما تضغطين «ابدأ التسجيل»: بعدها عدّ تنازلي 3 ثواني، ويظهر الموقف ويبدأ التسجيل. ردّي بصوتك كأنك في مكالمة حقيقية (30 إلى 45 ثانية). عندك محاولتين بالكثير.") };
      }),
    ];
  }
  return [
    { kind: "voice_en", title_ar: "تسجيل صوتي بالإنجليزي", min_s: 45, max_s: 75, done: !!done.voice_en,
      prompt_ar: G(g, "عرّف بنفسك بالإنجليزي لمدة دقيقة تقريبًا: خبرتك في التدريس، وكيف تحب تدير الحصة.",
        "عرّفي بنفسك بالإنجليزي لمدة دقيقة تقريبًا: خبرتك في التدريس، وكيف تحبين تديرين الحصة.") },
    { kind: "voice_ar", title_ar: "شرح قاعدة بالعربي", min_s: 15, max_s: 35, done: !!done.voice_ar,
      prompt_ar: G(g, "اشرح بالعربي في 20 ثانية تقريبًا قاعدة بسيطة لطالب مبتدئ — مثلًا الفرق بين is و are.",
        "اشرحي بالعربي في 20 ثانية تقريبًا قاعدة بسيطة لطالبة مبتدئة — مثلًا الفرق بين is و are.") },
  ];
}

const handoff = (s) => (s.role === "sales"
  ? `باقي الخطوة الأهم: ثلاث تسجيلات صوتية قصيرة — تعريف بنفسك، ومكالمتين تمثيليتين.\n\n${VOICE_KEY_LINE(s.g)}`
  : G(s.g, "باقي خطوة أخيرة: تسجيلين صوتيين قصيرين — دقيقة بالإنجليزي، و20 ثانية بالعربي تشرح فيها قاعدة بسيطة.",
    "باقي خطوة أخيرة: تسجيلين صوتيين قصيرين — دقيقة بالإنجليزي، و20 ثانية بالعربي تشرحين فيها قاعدة بسيطة."));

const koLine = (g) => G(g, "شكرًا على وضوحك. حفظنا طلبك، وبنتواصل معك إذا فتحنا فرصة تناسبك.", "شكرًا على وضوحكِ. حفظنا طلبك، وبنتواصل معكِ إذا فتحنا فرصة تناسبك.");

/* ── slots + booking (shape of _hr_careers_slots / _hr_careers_book) ── */
function sampleSlots() {
  const dayFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { timeZone: "Asia/Riyadh", weekday: "long", day: "numeric", month: "long" });
  const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit", hour12: true });
  const now = new Date(Date.now() + 3 * 3600_000); // Riyadh wall clock
  const out = [];
  for (let i = 1, days = 0; days < 3 && i < 8; i += 1) {
    const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i);
    if (new Date(base).getUTCDay() === 5) continue; // no Friday slots
    days += 1;
    for (const [h, m] of [[16, 0], [16, 30], [17, 30], [19, 0], [20, 30]]) {
      const start = new Date(base + (h - 3) * 3600_000 + m * 60_000);
      out.push({ start: start.toISOString(), end: new Date(start.getTime() + 15 * 60_000).toISOString(), day_ar: dayFmt.format(start),
        time_ar: timeFmt.format(start).replace(/[\s ]*AM$/, " ص").replace(/[\s ]*PM$/, " م") });
    }
  }
  return out;
}
function whenAr(iso) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { timeZone: "Asia/Riyadh", weekday: "long" }).format(d);
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const t = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit", hour12: true }).format(d)
    .replace(/[\s ]*AM$/, " ص").replace(/[\s ]*PM$/, " م");
  return `${day} ${ymd} — ${t}`;
}
function sampleBooking(name, iso) {
  const start = iso || sampleSlots()[1].start;
  const when = whenAr(start);
  const end = new Date(new Date(start).getTime() + 15 * 60_000);
  const z = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  const wa = `السلام عليكم، معك ${first} — حجزت مقابلة توظيف مع أكاديمية طلاقة (${when}) وأحتاج أغيّر الموعد.`;
  return {
    when_ar: when, start, end: end.toISOString(), meet_link: "https://meet.google.com/",
    gcal: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("مقابلة توظيف — أكاديمية طلاقة")}&dates=${z(start)}/${z(end)}`,
    wa_link: `https://wa.me/${ACADEMY_WA}?text=${encodeURIComponent(wa)}`,
  };
}

/** Every outcome screen an applicant can land on. */
export function previewOutcome(kind, gender, name) {
  const g = gender === "f" ? "f" : "m";
  if (kind === "booked") {
    const booking = sampleBooking(name);
    return { kind: "booked", title_ar: "تم حجز موعدك", booking,
      body_ar: `موعد مكالمتك مع الفريق: ${booking.when_ar} بتوقيت الرياض (15 دقيقة). ${G(g, "بنرسل لك التفاصيل، وإذا احتجت تغيّر الموعد راسلنا على واتساب.", "بنرسل لك التفاصيل، وإذا احتجتي تغيّرين الموعد راسلينا على واتساب.")}` };
  }
  if (kind === "book") {
    return { kind: "book", title_ar: G(g, "ممتاز! اختر وقت مكالمة قصيرة مع الفريق", "ممتاز! اختاري وقت مكالمة قصيرة مع الفريق"),
      body_ar: G(g, "مكالمة 15 دقيقة نتعرّف فيها عليك أكثر. اختر الوقت اللي يناسبك:", "مكالمة 15 دقيقة نتعرّف فيها عليكِ أكثر. اختاري الوقت اللي يناسبك:") };
  }
  if (kind === "ko") return { kind: "thanks", title_ar: "شكرًا على وضوحك", body_ar: "حفظنا طلبك، وبنتواصل معك إذا فتحنا فرصة تناسبك." };
  if (kind === "under18") return { kind: "thanks", title_ar: "شكرًا لاهتمامك", body_ar: "حاليًا نستقبل طلبات من عمرهم 18 سنة وفوق. حفظنا طلبك، وبنتواصل معك إذا فتحنا فرصة تناسبك." };
  if (kind === "already") return { kind: "thanks", title_ar: "وصلنا طلبك، شكرًا لك", body_ar: "وصلنا طلبك، وبنتواصل معك إذا فتحنا فرصة تناسبك." };
  return { kind: "thanks", title_ar: "شكرًا لك", body_ar: "وصلنا طلبك، وبنتواصل معك إذا فتحنا فرصة تناسبك." };
}

/* ── the session (memory only; a reload starts over) ── */
let S = null;
const ageOf = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return null;
  const now = new Date();
  let a = now.getFullYear() - Number(m[1]);
  if (now.getMonth() + 1 < Number(m[2]) || (now.getMonth() + 1 === Number(m[2]) && now.getDate() < Number(m[3]))) a -= 1;
  return a;
};
const optionsFor = (s) => {
  if (s.role !== "sales") return null;
  if (s.step === "pay") return s.pending === "pp_q2" ? PP_Q2_OPTS : s.pending === "pp_q3b" ? PP_Q3B_OPTS : s.pending === "pp_q4" ? [PP_SKIP] : null;
  return s.pending === "emp" ? EMP_OPTS(s.g) : s.pending === "slots" ? SLOT_OPTS : null;
};
const multiFor = (s) => s.role === "sales" && s.step === "chat" && s.pending === "slots";
const toVoice = (s, line) => { s.step = "voice"; return { reply: line ? `${line}\n\n${handoff(s)}` : handoff(s), step: "voice", voice_tasks: voiceTasks(s), options: null }; };

function screening(s, choice, text) {
  const g = s.g;
  if (s.pending === "emp") {
    s.pending = "slots";
    return { reply: `تمام.\n\n${SLOTS_Q(g)}`, step: "chat", options: optionsFor(s), multi: true };
  }
  // slots: comma-joined ids from the chips
  const ids = String(choice || "").split(",").filter((x) => x && x !== "other");
  s.pending = null;
  if (!eveningFit(ids)) { s.step = "done"; return { reply: koLine(g), step: "done", options: null, outcome: previewOutcome("ko", g) }; }
  return { reply: `ممتاز.\n\n${FIRST_SALES_Q}`, step: "chat", options: null, multi: false };
}

/** The end-of-interview pay block (same order and wording as the edge function). */
function pulse(s, choice, text) {
  const g = s.g;
  const p = s.pulse;
  let reply = "";
  switch (s.pending) {
    case "pp_q1": s.pending = "pp_q2"; reply = PP_Q2; break;
    case "pp_q2": {
      p.q2 = PP_Q2_OPTS.find((o) => o.id === choice)?.id || "other";
      if (p.q2 === "yes" || p.q2 === "conditional") { s.pending = "pp_q3a"; reply = PP_Q3A(g); } else { s.pending = "pp_q3b"; reply = PP_Q3B; }
      break;
    }
    case "pp_q3a": s.pending = "pp_q4"; reply = PP_Q4; break;
    case "pp_q3b": p.q3b = PP_Q3B_OPTS.find((o) => o.id === choice)?.id || "other"; s.pending = "pp_q4"; reply = PP_Q4; break;
    default: // pp_q4
      s.pending = null; p.done = true; p.tag = appetiteOf(p.q2, p.q3b);
      return { reply: PP_DONE(g), step: "finish", options: null };
  }
  return { reply, step: "pay", options: optionsFor(s), multi: false };
}

/** «شهية العمولة» the preview walk produced (shown on the result screen, preview only). */
export function previewTag() {
  if (!S?.pulse?.done) return null;
  return S.pulse.tag ? APPETITE_AR[S.pulse.tag] : "غير محدد (إجابة مكتوبة)";
}

/** A believable answer for «تخطي هذا السؤال». */
export function previewSample() {
  if (!S) return { text: "تمام" };
  if (S.pending === "slots") return { text: "العصر، المغرب والليل", choice: "afternoon,evening" };
  const opts = optionsFor(S);
  if (opts && S.pending !== "pp_q4") return { text: opts[0].label, choice: opts[0].id };
  const byStep = { pp_q1: "آخر راتب 4000، وأتوقع 6000", pp_q3a: "تقريبًا 20 تسجيل", pp_q4: "لأن الدخل يزيد مع الجهد" };
  return { text: byStep[S.pending] || "إجابة نموذجية للمعاينة." };
}

export async function mockCall(action, p = {}) {
  await wait(action === "finish" ? (S?.role === "sales" && !S.pulse?.done ? 400 : 2500) : action === "message" ? 700 : 350);
  if (action === "start") {
    const role = p.role === "trainer" ? "trainer" : "sales";
    const g = p.basics?.gender === "f" ? "f" : "m";
    S = { role, g, name: p.basics?.name || "", step: "chat", pending: role === "sales" ? "emp" : null, turn: 0, done: {}, attempts: {}, pulse: {} };
    const base = { application_id: "preview", token: "preview", resumed: false, needs_cv: false, has_cv: false };
    const age = ageOf(p.birth_date);
    if (age !== null && age < 18) { S.step = "done"; return { ...base, step: "done", messages: [], voice_tasks: [], outcome: previewOutcome("under18", g) }; }
    const first = String(S.name).trim().split(/\s+/)[0] || "";
    const hi = `أهلًا ${first}! أنا مساعد التوظيف في أكاديمية طلاقة.`.replace("أهلًا !", "أهلًا!");
    const how = G(g, " بسألك كم سؤال قصير، جاوب براحتك وبأسلوبك.", " بسألك كم سؤال قصير، جاوبي براحتك وبأسلوبك.");
    const open = role === "sales"
      ? `${hi}${how}\n\n${VOICE_KEY_LINE(g)}\n\nنبدأ بسؤالين سريعين.\n\n${EMP_Q}`
      : `${hi}${how}\n\n${G(g, "أول سؤال: حدّثني عن خبرتك في تدريس الإنجليزي — درّست كبار؟ أونلاين؟ وكم سنة تقريبًا؟", "أول سؤال: حدّثيني عن خبرتك في تدريس الإنجليزي — درّستي كبار؟ أونلاين؟ وكم سنة تقريبًا؟")}`;
    return { ...base, step: "chat", messages: [{ role: "bot", content: open }], options: optionsFor(S), multi: multiFor(S), voice_tasks: voiceTasks(S) };
  }
  if (!S) throw Object.assign(new Error("preview"), { code: "AUTH", messageAr: "ابدأ المعاينة من جديد." });
  switch (action) {
    case "message": {
      if (S.role === "sales" && S.step === "pay") return pulse(S, p.choice, p.text);
      if (S.role === "sales" && S.pending) return screening(S, p.choice, p.text);
      const qs = (S.role === "sales" ? SALES_CHAT : TRAINER_CHAT)(S.g);
      const q = qs[S.turn];
      S.turn += 1;
      if (!q) return toVoice(S, G(S.g, "شكرًا لك على وقتك وإجاباتك.", "شكرًا لكِ على وقتك وإجاباتك."));
      return { reply: q, step: "chat", options: null };
    }
    case "preview_skip_chat": S.pending = null; return toVoice(S, "");
    case "preview_skip_voice": S.done[p.kind] = true; return { voice_tasks: voiceTasks(S) };
    case "voice_begin": {
      const r = RP3.find((x) => x.kind === p.kind);
      S.attempts[p.kind] = (S.attempts[p.kind] || 0) + 1;
      return { kind: p.kind, scenario_ar: r ? G(S.g, r.m, r.f) : "", attempts: S.attempts[p.kind], max_attempts: 2, countdown_s: 3, min_s: 30, max_s: 45 };
    }
    case "finish":
      // sales: the pay block comes after the recordings, right before the result
      if (S.role === "sales" && !S.pulse.done) {
        if (S.step !== "pay") { S.step = "pay"; S.pending = "pp_q1"; }
        return { step: "pay", reply: `${PP_INTRO}\n\n${PP_Q1(S.g)}`, options: null, multi: false };
      }
      S.step = "done"; return { outcome: previewOutcome("book", S.g, S.name) };
    case "slots": return { slots: sampleSlots() };
    case "book": return { booking: sampleBooking(S.name, p.start) };
    default: return {};
  }
}

/** upload_url → attach, without uploading. */
export async function mockAttach({ kind }) {
  await wait(600);
  if (kind === "cv") return { kind, has_cv: true, voice_tasks: S ? voiceTasks(S) : [] };
  if (S) S.done[kind] = true;
  return { kind, voice_tasks: S ? voiceTasks(S) : [] };
}
