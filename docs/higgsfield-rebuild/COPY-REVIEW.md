# /preview: copy review (2026-11-24)

The source of every string is `src/pages/cinema-preview/copy.js`. The meta description is in `src/content/seo.js` → `"/preview"`.
Brief: `~/Downloads/FLUENTIA-PREVIEW-COPY-POLISH.md`. Ali's voice decision is to address the reader in the **singular** («أنت»), with **plural «نحن» for طلاقة**.

## Voice and terms (binding for anything added to /preview later, incl. the SEO/GEO run)

- **Reader:** second person singular. The masculine is the generic Saudi form («احجز»، «تبي»، «لقاءك»). Use a neutral noun phrase where it reads naturally, and never a slash form like «احجز/ي».
- **Fluentia:** «نحن» («نسمعك»، «نحدّثها»).
- **The test for every line:** would a Saudi say it out loud like this? The tone is white Saudi dialect in conversation, and clean simple Arabic for facts.
- **Fixed terms:**
  - «اللقاء المبدئي المجاني»
  - «المدرّب»
  - «المرشد الأكاديمي»
  - «المنصّة»
  - «مكتبة طلاقة»
  - «بودكاست طلاقة»
  - «مشاهد»
  - «المحادثة مع ليلى»
  - «مستشار طلاقة» (the /start chat)
- **One CTA string per action:**
  - Book: «احجز لقاءك المبدئي المجاني».
  - WhatsApp: «أو كلّمنا على واتساب».
  - The phone header uses the shortened «احجز لقاءك المجاني». The full string wraps onto two lines at 360–390 px and leaves «المجاني» alone (tested), and the live homepage header uses the same short form.
- **Line breaks:**
  - Multi-line headings are arrays. `CinemaPreview.jsx` puts a real space between their block spans. Before, the h1 extracted as «تكلّموا إنجليزيبدون ما تحضّرون…»; bots and copy-paste now get the spaces.
  - ` ` glues a final word to its neighbour, and `text-wrap: balance` is on the headings. Checked at 390 px: no orphan word in any heading or body line.
- **Numbers:** Western digits. Proof numbers and the logo strip are unchanged.
- **Never:** refunds, Telegram, guarantees, prices, invented facts or quotes.

## Hero: three options

| # | Option | Verdict |
|---|---|---|
| **A (shipped)** | **تكلّم إنجليزي بدون ما تركّب الجملة في راسك.** | «تركّب الجملة» is the exact phrase Saudis use for building a sentence in your head before you say it. It keeps the original idea, is one clear line, and breaks into three even slabs. |
| B | تكلّم إنجليزي على طول، بدون ما تترجم في راسك. | Clear, but «تترجم» is narrower (only translation), and «على طول» weakens the h1. |
| C | خلّ الإنجليزي يطلع منك بدون تفكير. | Catchy, but it is the "clever" line the brief forbids, and «بدون تفكير» promises too much. |

## Before / after

| | Current | New |
|---|---|---|
| قبل | تعرفون الجواب… وتسكتون. | **تعرف الجواب… وتسكت.** |
| بعد | تقولونه. بهدوء، وبجملة كاملة. | **تعرف الجواب، وتقوله.** |

Why: both lines now share the same words, and only the last verb changes (تسكت ← تقوله). The contrast lands in one read. «…» carries the hesitation and «،» carries none. The old «بعد» line needed «قبل» to make sense («تقولونه» what?) and added two promises.

## Line by line

| Section | Current | New | Why |
|---|---|---|---|
| CTA (WhatsApp) | أو كلّمونا واتساب | أو كلّمنا على واتساب | Singular; «على» is how it's said. |
| Hero h1 | تكلّموا إنجليزي / بدون ما تحضّرون / الجملة في راسكم. | تكلّم إنجليزي / بدون ما تركّب / الجملة في راسك. | Singular; «تركّب» is the natural verb (see options). |
| Hero sub | حصص مباشرة مع مدرّب حقيقي، ومنصّة تتدرّبون عليها كل يوم، ومرشد أكاديمي يتابعكم أول بأول. | حصص مباشرة مع مدرّب يسمعك ويصحّح لك، وتمرين يومي على المنصّة، ومرشد أكاديمي يتابعك أول بأول. | Says what the trainer does instead of «حقيقي». |
| Hero note | لقاء مبدئي · مجاني · بدون أي التزام | اللقاء المبدئي مجاني، وبدون أي التزام. | A sentence instead of tags; fixed term. |
| Before/after label | الفرق اللي تبونه | الفرق اللي تبيه | Singular. |
| Before/after body | أغلب طلابنا ما ينقصهم كلمات. ينقصهم تمرين يومي، وأحد يسمعهم ويصحّح لهم، لين يصير الكلام عادة. | غالباً ما تنقصك الكلمات. ينقصك تمرين كل يوم، وأحد يسمعك ويصحّح لك، لين يصير الكلام عندك عادة. | Talks to the reader, and drops the unmeasured «أغلب طلابنا» claim. |
| How h2 | ثلاثة أشياء تشتغل مع بعض | ثلاثة أشياء تشتغل مع بعض (glued) | «بعض» was alone on line 2 at 390 px. |
| How 1 | مجموعة صغيرة، أو حصص فردية لكم وحدكم، أو تدريب مكثّف. مدرّب حقيقي يسمعكم ويصحّح لكم وأنتم تتكلّمون. | في مجموعة صغيرة، أو حصص فردية لك وحدك، أو تدريب مكثّف. والمدرّب يسمعك ويصحّح لك وأنت تتكلّم. | Singular; fixed term «المدرّب». |
| How 2 | …قراءة، استماع، مفردات، ومحادثة. والحصة نفسها مسجّلة ترجعون لها متى ما بغيتم. | …قراءة، واستماع، ومفردات، ومحادثة. والحصة نفسها مسجّلة، ترجع لها متى ما بغيت. | Singular; Arabic list joins every item with «و». |
| How 3 title | مرشد أكاديمي يتابعكم | مرشد أكاديمي يتابعك | Singular. |
| How 3 body | يعرف وين وصلتوا، ويشتغل معكم على نقاط ضعفكم، ويرتّب خطتكم إذا تغيّر جدولكم. | يعرف وين وصلت، ويشتغل معك على نقاط ضعفك، ويعدّل خطتك إذا تغيّر جدولك. | «يعدّل» says exactly what happens. |
| Platform h2 | المنصّة اللي تتدرّبون عليها كل يوم | المنصّة اللي تتدرّب عليها كل يوم | Singular. |
| Platform sub | كل شي بمستواكم، وكل جملة لها ترجمة تحتها. | كل شي على مستواك، وتحت كل جملة ترجمتها. | Shorter, said order. |
| مكتبة طلاقة | روايات أصلية بإنجليزية متدرّجة على مستواكم. اضغطوا أي جملة تطلع ترجمتها، أو اسمعوا الفصل بصوت الراوي. | روايات أصلية بإنجليزي متدرّج على مستواك. اضغط أي جملة تطلع لك ترجمتها، أو اسمع الفصل بصوت الراوي. | Singular; «إنجليزي» is the spoken form used everywhere else. |
| بودكاست طلاقة | حلقات من إنتاج طلاقة، والنص يمشي مع الصوت كلمة كلمة، وترجمة كل جملة تحتها. | حلقات من إنتاج طلاقة. النص يمشي مع الصوت كلمة كلمة، وتحت كل جملة ترجمتها. | One idea per sentence. |
| مشاهد | …بترجمة عربية متزامنة سطر بسطر. | …وترجمة عربية تمشي معها سطر بسطر. | «متزامنة» is written-only. |
| المحادثة مع ليلى | محادثة صوتية بالإنجليزي مع ليلى، مدرّبة ذكاء اصطناعي. وبالنهاية درجة، وتصحيحات مشروحة بالعربي. | تكلّم بالإنجليزي مع ليلى، مدرّبة ذكاء اصطناعي، بصوتك. وفي الآخر تعطيك درجة، وتصحّح أخطاءك وتشرحها لك بالعربي. | The verb puts the reader in it; same facts. |
| خطة اليوم | …وقت مذاكرتكم. | …وقت مذاكرتك. | Singular. |
| تسجيل الحصة | حصتكم المباشرة مسجّلة داخل الوحدة، وتكمّلون من وين وقفتوا. | حصتك المباشرة مسجّلة داخل الوحدة، وتكمّل من المكان اللي وقفت عنده. | Singular; clearer. |
| Who: موظفين | تبون تتكلّمون في الاجتماع والمقابلة والإيميل بدون توتر. | تبي تتكلّم في الاجتماعات والمقابلات، وتكتب إيميلاتك بدون توتر. | You don't «talk» in an email. |
| Who: أصحاب أعمال | تتعاملون مع عملاء وموردين برا، وتبون تفاوضون بنفسكم. | تتعامل مع عملاء وموردين برّا، وتبي تفاوض بنفسك. | Singular. |
| Who: طلاب | تستعدّون للجامعة أو الابتعاث، وتبون أساس قوي من البداية. | تستعدّ للجامعة أو للابتعاث، وتبي أساس قوي من البداية. | Singular. |
| Proof link | شاهدوا القصة كاملة | شاهد القصة كاملة | Singular. |
| Stats note | أرقام حقيقية من منصّة طلاقة — تُحدَّث دورياً | أرقام حقيقية من منصّة طلاقة، ونحدّثها كل فترة. | Spoken, and «نحن» is the subject. |
| Steps h2 | كيف تبدأون | كيف تبدأ؟ | Singular; it's a question. |
| Step 1 | احجزوا اللقاء: محادثة قصيرة مع «مستشار طلاقة» يرتّب لكم فيها موعد يناسبكم. | احجز اللقاء المبدئي: محادثة قصيرة مع «مستشار طلاقة»، ويرتّب لك موعد يناسبك. | Fixed term; singular. |
| Step 2 | اللقاء المبدئي: لقاء مجاني نسمعكم فيه، ونعرف مستواكم وهدفكم. | اللقاء المبدئي المجاني: نسمعك فيه، ونعرف مستواك وهدفك. | «مجاني» moves into the fixed term, so «لقاء» isn't said twice. |
| Step 3 | قرّروا براحتكم: …وإذا ناسبتكم طلاقة، تبدأون بخطة على مقاسكم. | قرّر براحتك: …وإذا ناسبتك طلاقة، تبدأ بخطة على مقاسك. | Singular. |
| Final h2 | أول خطوة لقاء واحد. / مجاني. | أول خطوة؟ / لقاء مبدئي مجاني. | The old line needed a second read; the question-and-answer form is how it's said. |
| Final sub | نسمعكم فيه، ونقول لكم بصراحة وين يوقف إنجليزيكم. | نسمعك، ونقول لك بصراحة وين واقف إنجليزيك وإيش يحتاج. | «وين واقف» is the natural form; it adds what happens next. |
| Footer | …أونلاين للبالغين، من السعودية. | …أونلاين للكبار، من السعودية. | «للكبار» is the spoken word. |
| Meta / OG / Twitter description | …ومنصّة تتدرّبون عليها كل يوم، ومرشد أكاديمي يتابعكم. ابدأوا بلقاء مبدئي مجاني. | حصص مباشرة مع مدرّب يسمعك ويصحّح لك، وتمرين يومي على المنصّة، ومرشد أكاديمي يتابعك. ابدأ باللقاء المبدئي المجاني. | Mirrors the hero sub. |

**Unchanged on purpose:**
- Book CTA (already singular and identical everywhere).
- The eyebrow, nav, kickers, stat labels and logo lead (no address in them).
- Malak's story: her own words, verbatim from `src/data/stories.js`.
- The story-slot placeholders.
- The cookie banner, which is already singular («تحكّم في خياراتك»). It is shared with `/`, so it stays as it is.

**Nothing to change:**
- JSON-LD: /preview carries only the site-wide Organization/WebSite blocks, in third person. There is no FAQPage yet.
- `llms.txt`: third-person facts only.

## Second pass: three readers (390 px screenshots in `after-copy/`)

| Reader | Worked best | Weakest, and what changed |
|---|---|---|
| Employee, 30s, wants English for meetings, skeptical of ads | «تعرف الجواب… وتسكت.» It is exactly his meeting, with no promise attached. | «في الاجتماع والمقابلة والإيميل» made him "talk in an email". Now «تبي تتكلّم في الاجتماعات والمقابلات، وتكتب إيميلاتك بدون توتر.» |
| University student, 20s, budget-aware | «اللقاء المبدئي مجاني، وبدون أي التزام.» It answers the money question before she asks it, right under the CTA. | «أغلب طلابنا ما ينقصهم كلمات» read like an ad claim about other people. Now it speaks to her: «غالباً ما تنقصك الكلمات. ينقصك تمرين كل يوم…» |
| Business owner, 40s, little time | «تتعامل مع عملاء وموردين برّا، وتبي تفاوض بنفسك.» It is his situation in one line. | The closing «أول خطوة لقاء واحد. مجاني.» needed a second read. Now «أول خطوة؟ لقاء مبدئي مجاني.» plus what he gets: «ونقول لك بصراحة وين واقف إنجليزيك وإيش يحتاج.» |

## Note on sequencing

The brief says to run this after `FLUENTIA-PREVIEW-COMPLETE-SEO-GEO.md`. That prompt did not exist and had not run on 2026-11-24, so there are no FAQ, packages or FAQPage on /preview yet. When it runs, it must follow the voice and terms section above, and FAQPage text must equal the visible text.
