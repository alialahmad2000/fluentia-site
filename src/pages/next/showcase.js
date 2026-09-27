/**
 * «بين الحصص» — what the platform shows between classes.
 *
 * Every line here is traceable to the LMS code (documented feature by feature
 * before this was written): names are the platform's own labels, and nothing
 * claims more than the code does. Library narration is highlighted by sentence
 * (not word), the podcast karaoke IS word-level, Layla grades grammar /
 * vocabulary / fluency (no pronunciation score), and the only voice-scored
 * pronunciation practice is «الترديد بصوتك».
 *
 * Media under /next/ was captured from the real platform, locally, for a
 * fictional student «سارة» — no real student appears anywhere.
 */

export const STAGE = [
  {
    key: "library",
    title: "مكتبة طلاقة",
    tone: "ice",
    rgb: "125,211,252",
    video: "/next/novel.mp4",
    poster: "/next/novel.webp",
    lines: [
      "روايات أصلية بإنجليزية متدرّجة على مستواك.",
      "اضغط أي جملة لتظهر ترجمتها تحتها، أو استمع للفصل بصوت الراوي.",
    ],
    demo: "novel",
  },
  {
    key: "podcast",
    title: "بودكاست طلاقة",
    tone: "sky",
    rgb: "56,189,248",
    video: "/next/podcast.mp4",
    poster: "/next/podcast.webp",
    lines: [
      "حلقات «من إنتاج طلاقة» بنصٍّ يتحرّك مع الصوت كلمةً كلمة، وترجمة كل جملة تحتها.",
      "اضغط أي كلمة لمعناها، وكرّر الجملة أو أبطئها، والمشغّل يبقى معك وأنت تتنقّل.",
    ],
    demo: "podcast",
  },
  {
    key: "scenes",
    title: "مشاهد",
    tone: "gold",
    rgb: "251,191,36",
    lines: [
      "مقاطع قصيرة من أفلام ومسلسلات حقيقية، بترجمة عربية متزامنة سطراً بسطر.",
      "اضغط العبارة الملوّنة لمعناها في المشهد، وأعد السطر أو أبطئه.",
    ],
    demo: "scenes",
  },
  {
    key: "speak",
    title: "المحادثة مع ليلى",
    tone: "cream",
    rgb: "243,237,226",
    video: "/next/speak.mp4",
    poster: "/next/speak.webp",
    lines: [
      "محادثة صوتية بالإنجليزي مع ليلى، مدرّبة ذكاء اصطناعي، في موضوع تختاره.",
      "في النهاية: درجة من 10، والجمل التي قلتها، وتصحيحات مجمّعة مع شرحها بالعربي.",
    ],
  },
];

/** Shows in the platform's podcast library besides the Originals (public feeds). */
export const PODCAST_SHOWS = [
  "VOA Learning English",
  "6 Minute English",
  "Learning English Conversations",
  "Learning English from the News",
  "Global News Podcast",
  "All Ears English",
  "Luke's English Podcast",
];
export const PODCAST_ALSO = "وفي مكتبة البودكاست أيضاً:";

export const RAIL_TITLE = [
  { text: "وأكثر", tone: "cream" },
];
export const RAIL = [
  { key: "plan", name: "خطة اليوم", line: "دقائق مستهدفة لكل مهارة كل يوم، وحلقة تعدّ وقت مذاكرتك وأنت على الصفحة.", src: "/next/shot-plan.webp" },
  { key: "vocab", name: "المفردات", line: "كلمات مستواك واحدة واحدة، بمعنى ومثال ونطق، وتضيفها إلى مراجعتك اليومية.", src: "/next/shot-vocab.webp" },
  { key: "shadow", name: "الترديد بصوتك", line: "ردّد جملة الراوي، واعرف نسبة التطابق والكلمات التي فاتتك.", src: "/next/shot-shadow.webp" },
  { key: "recordings", name: "تسجيل الحصة", line: "تسجيل حصتك المباشرة داخل كل وحدة، يتذكّر أين توقفت.", src: "/next/shot-recordings.webp" },
  { key: "curriculum", name: "المنهج", line: "مستواك، ووحدتك التالية، وتقدّمك في المستوى — في صفحة واحدة.", src: "/next/shot-curriculum.webp" },
];

export const TAP_SENTENCE = "اضغط على الجملة";
export const SCENES_FROM = "مشاهد من";
export const SOUND_ON = "شغّل الصوت";
export const SOUND_OFF = "اكتم الصوت";
export const LOAD_SCENE = "شغّل المشهد";
export const LISTEN_CLIP = "استمع للمقطع";
