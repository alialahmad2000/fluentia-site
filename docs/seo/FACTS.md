# FACTS — the single source of truth for every SEO / AI-visibility page

Extracted 2026-10-27 from what fluentia.academy **already publishes** (live HTML +
the source files below). Every number, price, and claim in `content/guide/**`,
`llms.txt`, `llms-full.txt`, and JSON-LD must appear here first.

Not here = not publishable. Questions only Ali can answer are in `NEEDS-ALI.md`.

Abbreviations: `content.js` = `src/pages/landing-v2/content.js` (the pricing
source of truth the homepage renders through `V1Pricing.jsx`);
`private` = `src/pages/private/privateContent.js`; `terms` =
`src/pages/TermsOfService.jsx`; `showcase` = `src/pages/next/showcase.js`.

---

## 1. Identity

| Fact | Value | Source |
|---|---|---|
| Arabic name | أكاديمية طلاقة | every page title, `src/content/seo.js` |
| English name | Fluentia Academy | index.html JSON-LD, footer «© 2026 Fluentia Academy · طلاقة» |
| Website | https://fluentia.academy | — |
| Student platform (separate app) | https://app.fluentia.academy («دخول الطلاب» in the homepage header) | `src/pages/next/Header.jsx` |
| What it is | أكاديمية سعودية لتعليم الإنجليزي أونلاين للراشدين | homepage hero «أكاديمية سعودية بمنهج علمي ومنصة تعلّم بمعايير عالمية» (`src/pages/next/copy.js` HERO.lead); footer «أكاديمية إنجليزي للراشدين السعوديين، مبنية على منهج علمي ومنصة تعلّم متكاملة» (`src/pages/next/Closing.jsx`) |
| Country | Saudi Arabia (area served: SA) | index.html JSON-LD `areaServed`, `geo.region=SA`; terms §10 (Saudi law, Riyadh courts) |
| Delivery | 100% online; live classes via **Google Meet** | terms §2 (line 78), `src/pages/AboutPage.jsx:345` |
| Founder | د. علي الأحمد (Dr. Ali Alahmad) | `/about`, index.html JSON-LD `founder` |
| Audience | adults («للكبار»، «للراشدين») — employees and professionals are the main 1:1 audience («للمهنيين ومن يريد منهجاً على مقاسه») | seo.js `/` description; content.js `vipTier.audienceLabel` |
| Minimum age in the terms | 13+, or with a guardian's consent below that | terms §3 (line 87) |
| Not affiliated with | any other organisation named "Fluentia" (e.g. fluentia.us) — **disambiguation statement, ours to make** | mission brief |

## 2. Contact & profiles

| Channel | Value | Source |
|---|---|---|
| WhatsApp / phone | +966 55 866 9974 (`https://wa.me/966558669974`) | content.js:520, `src/lib/whatsapp.js` WA_NUMBER, terms §11 |
| Email (site footer) | hi@fluentia.academy | content.js:522, homepage footer |
| Email (terms, about) | fluentia.sa@gmail.com | terms §11, `/about` |
| TikTok | https://www.tiktok.com/@fluentia_ | content.js:525, `src/utils/tracking.js` TT_URL |
| Instagram | https://www.instagram.com/fluentia__ | content.js:526, tracking.js IG_URL |

No other social profile URL is linked anywhere on the site (X handle `@fluentia_`
appears only in `twitter:site` meta — not confirmed as a real profile, see NEEDS-ALI).

## 3. How to start (booking flow)

| Fact | Source |
|---|---|
| Everything starts with a **free initial meeting** («لقاء مبدئي مجاني») with the trainer, **before any payment, no commitment** | `src/pages/next/copy.js` STEPS_LEDE «لقاء مبدئي مجاني قبل أي دفع، وبدون التزام.»; content.js PRICING.intro |
| Steps: 01 register name + number (30 s) → 02 free initial meeting: «نعرف مستواك وهدفك ووقتك، ونرشّح لك المسار والباقة المناسبة» → 03 start: «في مجموعة صغيرة بمستواك أو حصص فردية مع مدرّبك، وتدخل المنصّة من أول يوم» | copy.js `STEPS` |
| After the form, the academy contacts the person **on WhatsApp within hours** («نتواصل معك على واتساب خلال ساعات») | /join + /private forms |
| The 1:1 programmes start with a «استشارة» booked on /private | `private` |
| Free placement test at /level-test (see §7) — optional, can be sent to us on WhatsApp to get a plan | `/level-test` page |
| Trust line: «لقاء مبدئي مجاني · إلغاء بأي وقت · لا التزام طويل» | content.js PRICING.trust |

## 4. Packages and prices (monthly, SAR) — exactly what the homepage sells today

Five packages are on sale on the homepage. «طلاقة» (1,200) was **taken off sale by Ali
on 2026-10-04** (content.js `hiddenTiers`) — never list it.

| Package | Price / month | What is included (verbatim facts) | Source |
|---|---|---|---|
| **التعلم الذاتي** (self-study) | **500 ر.س** | the full smart platform, at the learner's own pace, **no live classes, no trainer follow-up**; instant access; 6 levels Pre-A1 → C1 · 72 units · 12,000+ words; grammar + vocabulary + reading + listening exercises; AI assistant for conversation and pronunciation practice; points & rewards | content.js:249-270 `entryTier` |
| **أساس** | **750 ر.س** | **8 group classes / month**; max **7 students** per class; everything in self-study (full platform); monthly assessment + trainer follow-up (follow-up cadence: monthly); supportive Telegram community | content.js:276-294 |
| **تميّز** (recommended — «ننصح بها») | **1,500 ر.س** | everything in أساس; **8 group classes + 4 private classes / month (one a week)**; intensive daily follow-up; weekly assessment + personal development plan; exclusive question bank + full lesson library; recorded content to go back to anytime | content.js:296-315 |
| **التدريب الفردي** (1:1, «VIP · مرن») | **from 2,000 ر.س** | private classes only (learner + trainer); number of weekly classes agreed in the free initial meeting, and the price follows from it; custom curriculum that adapts to the learner's goal; direct daily follow-up + unlimited written and pronunciation correction; training for job interviews, presentations and public speaking; priority replies + direct contact with the trainer | content.js:338-372 `vipTier` |
| **التدريب الفردي المكثّف** (intensive 1:1, «VIP · مكثّف») | **3,000 ر.س** | **12 private classes / month (3 a week) with a dedicated teacher + 8 practice sessions / month (2 a week) with an academic mentor** → 5 meetings a week; practice sessions usually with a native English speaker; each practice session targets the learner's weak points; the mentor is a different person from the teacher; curriculum designed for the learner's field, starting with an extended diagnostic session; full platform access for the whole subscription; everything in التدريب الفردي | content.js:375-398 `intensiveTier`; `private` |

Also published on /private (`private`), usable verbatim:
- The diagnostic session establishes where the learner needs English, where they stumble today, and the result they want; the curriculum is then built on their field and real situations.
- The academic mentor follows progress and adjusts the plan to the weak points as the learner goes.
- Suits: needs a fast result in a specific field; can commit to 5 meetings a week; wants full personal follow-up. Not for: learning at one's own pace without a schedule; looking for the cheapest option (→ group packages).
- The /private form goals: work, study/scholarship, IELTS, travel & life, company.

Pricing rules:
- **Private packages never show a per-day price** (Ali, 2026-09-27). Monthly only. Do not
  add per-day/per-week framing to group tiers either (removed 2026-09-27, pending Ali).
- No strikethrough / «before» prices (content.js comment, 2026-09-14).
- The 2,000 plan has **no** academic mentor and **no** practice sessions (`private` line 121, comparison table «غير مشمول»).
- Days in the sample intensive week (Sun–Thu) are illustrative; times are agreed with the learner («الأيام توضيحية، والمواعيد نتفق عليها معك»).

## 5. Payment, cancellation, refund (terms §4, homepage FAQ)

| Fact | Source |
|---|---|
| Payment is **monthly, in advance, at the start of each Gregorian month** | terms:93 |
| Prices in SAR and include everything in the chosen package | terms §4 |
| **No long-term commitment** — stop at the end of any month | terms §4 |
| Cancel any time: next month is not charged; the current month counts («لأن المدرّب فعلياً خصّص وقته لك») | content.js:657 (homepage FAQ) |
| **Refund:** full refund within **7 days** from the start of the month, **only if no class was attended**; after any class, no refund | terms:100 |
| Package change: upgrade or downgrade at the **start of the next month**; no mid-month price change | terms §4 |
| Card data is not stored by the academy; processed by payment providers | privacy §2 |
| Courses start at the beginning of each Gregorian month; a learner can join any time and the trainer compensates | `src/pages/StartPage.jsx:188` (FAQ) |
| **No guarantee** of a specific level or IELTS band — results depend on the learner's commitment and practice | terms §8, content.js:653 |
| The apps contain no payment; subscriptions are handled with the academy team | terms §12 |

## 6. Classes, trainers, follow-up

| Fact | Source |
|---|---|
| Group classes: max **7 students** per class | content.js, terms §2, /about |
| Learners are placed in a small group **at their level** | copy.js STEPS[2] |
| Daily follow-up happens **outside class too — daily via Telegram** | `src/pages/StartPage.jsx` («مو فقط في الكلاس — يومياً عبر تيليجرام») |
| Trainer selection: tested on teaching ability, understanding adult learners, patience, building confidence — not English alone; trained on the Fluentia curriculum before the first class | homepage «كيف نُزيله» 01 (content.js, rendered on /) |
| Approach: start from the learner (where they are, where they stumbled), build a personal path, adjust it on the way; treat the inner barrier («الإنجليزي مو لي», fear of mistakes) as part of the curriculum; content + practice + community + daily follow-up | homepage «كيف نُزيله» 02–04 |
| Class recording is available inside each unit on the platform («تسجيل حصتك المباشرة داخل كل وحدة، يتذكّر أين توقفت») | showcase:86 |
| Recorded content to go back to anytime — listed in تميّز | content.js |
| Expected learner time: **3–5 hours a week** (in + outside classes); commit **at least 3 months** to see a real difference | homepage «هل طلاقة مناسبة لك؟» (content.js, rendered on /) |
| The academy says of itself: «لهذا لسنا الأرخص — ولا نسعى أن نكون.» | homepage (content.js:235, rendered on /) |
| Not a fit: wants a shortcut without daily commitment; tight budget (free alternatives Duolingo + YouTube + ChatGPT are good); likes big classes (20+); expects to learn without regular practice; wants a quick certificate rather than real fluency | same section |
| Students must not record or share class content; class is not repeated for lateness | terms §5 |

## 7. Curriculum & platform

| Fact | Source |
|---|---|
| **6 levels (Pre-A1 → C1)**, **72 units**, **144 reading texts**, **12,000+ words** | homepage «الأرقام كما هي», content.js:56-58 |
| AI instant assessment of pronunciation and writing | homepage platform band |
| Spaced-repetition system for vocabulary | homepage, content.js:134 |
| مكتبة طلاقة: original graded novels at the learner's level; tap any sentence for its translation, or listen to the chapter | showcase:18 |
| بودكاست طلاقة: Fluentia-produced episodes with word-by-word synced text and a translation under each sentence; the podcast library also carries VOA Learning English, 6 Minute English, and others | showcase:31, :68 |
| مشاهد: short clips from real films/series with line-by-line synced Arabic subtitles | showcase:44 |
| خطة اليوم (daily target minutes per skill); المفردات (words of the level, meaning, example, pronunciation, added to daily review); الترديد بصوتك (shadowing with a match score); تسجيل الحصة; المنهج (level, next unit, progress) | showcase:83-87 |
| Tap any word in a reading for its meaning and pronunciation | homepage stage |
| Native apps: **Mac app** downloadable at https://fluentia.academy/mac/ | `public/mac/index.html` (commit d39ad7e) |

## 8. Tracks / goals the site offers

| Track / goal | Source |
|---|---|
| تأسيس (من الصفر) | /start «المسار» (📗 تأسيس), /join goal «تأسيس من الصفر» |
| تطوير / تطوير المحادثة | /start «📘 تطوير», /join «تطوير المحادثة» |
| IELTS | /start «📙 IELTS», /join goal «IELTS», /private goal «IELTS» |
| Work («شغلي»), study / scholarship («الدراسة أو الابتعاث»), travel & life | /private goal options |
| Field-specific English in the 1:1 programmes (nursing, accounting, engineering, IT, marketing, teaching shown as examples) | /private «اختر مجالاً» |

## 9. Free tools & content already on the site

| Tool | URL | Facts |
|---|---|---|
| Placement test | /level-test | free, no account; ~10 min; **26 adaptive questions**; 6 CEFR levels; grammar, vocabulary, reading comprehension, real-situation communication, listening + a short writing paragraph; instant result with a strengths/needs breakdown; levels reported «CEFR من Pre-A1 إلى C1» (`src/content/seo.js` /level-test description) |
| Irregular verbs | /verbs | `VERB_COUNT` (191) verbs, 3 forms, Arabic meaning, pronunciation audio, flashcards + quiz, free, no sign-up |
| Work English | /work-english | 11 field glossaries (medical, nursing, pharmacy, medical lab, accounting, banking, engineering, IT, marketing, HR, legal) |
| Articles | /articles | incl. English from zero for adults, the STEP test, English levels A1–C2 |
| Free trial lesson | https://app.fluentia.academy/try | listed in llms.txt; live (HTTP 200 on 2026-10-27) |

## 10. Claims we will NOT repeat (published somewhere, but unverified or contradicted)

- «4.9★ تقييم الأكاديمية», «+14 طالب نشط», «+100 شهادة نجاح» (/about) and «⭐ 4.9 · +50 طالب · معتمدون رسمياً» (/start) — no source for ratings, counts or accreditation. See AUDIT.md.
- Founding date: /about says «تأسست 23 مارس 2026», the JSON-LD says `foundingDate: 2021`, the hero trust line said «منذ 2021». Contradictory → not stated.
- «مدربون سعوديون» — on /start and in the homepage meta, but /private says the mentor is usually a native English speaker. Not repeated in new copy until Ali confirms the wording.
- «≈ 3 شهور من كورس تقليدي في شهر واحد» (/private) — a marketing estimate; may be quoted only as the academy's own description of the intensive rhythm, never as a measured result.
- Laila AI voice conversation («المحادثة مع ليلى») — still on the homepage, but hidden from students since 2026-10-06. Not mentioned.
- Number of trainers, trainer names, trainer credentials — not stated.
