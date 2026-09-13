/**
 * The free-use step («استخدمه أنت») sends the student's sentence to the
 * `grade-expression-use` edge function, which the tour must never call.
 *
 * So each sheet shows ONE static example of what comes back, rendered through
 * the platform's unchanged `.expr-fb` markup and labelled as an example. The
 * sentences were written for the tour: they are not any student's attempt.
 * Shape = the grader's own response: { verdict, feedback_ar, corrected_en }.
 * The feedback follows the grader's rubric: situation first, then form; name
 * what is right before any correction; 1 to 3 short sentences; masculine
 * second person (the visitor default).
 */
export const SAMPLES = {
  'dont-count-your-chickens': {
    text: "My brother is already choosing a new car, but the job offer isn't signed yet. I told him not to count his chickens before they hatch.",
    verdict: 'correct',
    feedback_ar: 'أحسنت! الموقف مناسب تماماً: فرحٌ بعرض وظيفة لم يُوقَّع بعد. وصرّفت المثل بذكاء حين قلت «his chickens» لأنك تتحدث عن أخيك.',
    corrected_en: null,
  },
  'the-early-bird': {
    text: 'I booked my flight three months early and got the cheapest seat. The early bird catch the worm!',
    verdict: 'partly',
    feedback_ar: 'الموقف في مكانه تماماً: حجزت مبكّراً ففزت بأرخص مقعد. انتبه فقط لصيغة المثل الثابتة: «catches» لا «catch».',
    corrected_en: 'The early bird catches the worm!',
  },
  'cost-an-arm-and-a-leg': {
    text: "Our new sofa costed an arm and a leg, but it's worth it.",
    verdict: 'partly',
    feedback_ar: 'استعملت التعبير في موقفه الصحيح: التعجّب من سعر مرتفع. لكن «cost» لا يتغيّر في الماضي، فالصواب:',
    corrected_en: "Our new sofa cost an arm and a leg, but it's worth it.",
  },
  'spill-the-beans': {
    text: 'I spilled the beans on the kitchen floor while I was cooking.',
    verdict: 'wrong',
    feedback_ar: 'صيغة التعبير سليمة، لكنك استعملته بمعناه الحرفي: حبوب انسكبت على الأرض. «spill the beans» تعني أن تُفشي سرّاً، كأن تكشف مفاجأة قبل وقتها.',
    corrected_en: null,
  },
}
