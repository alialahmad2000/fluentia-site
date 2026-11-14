# Fluentia Level Test — item bank v2 spec

Audience: Saudi adults (mostly employees, 20–45), Arabic L1, taking a free online English
placement test on a phone, coming from TikTok. Result decides which of six levels they are
placed in: Pre-A1 (lvl 0), A1 (1), A2 (2), B1 (3), B2 (4), C1 (5).

## Non-negotiables
1. **Exactly one defensible correct answer.** A careful native-speaker teacher must agree with the key,
   and must not be able to argue for a second option. If a distractor is "also fine in some dialect /
   register", rewrite it. Avoid "which is NOT…" items.
2. **Plausible distractors from typical Arabic-speaker errors**: missing/extra articles, be-verb drop
   ("He working"), present perfect vs past simple, wrong prepositions (in/on/at, "married with"),
   word order in questions ("What you want?"), make/do, say/tell, false friends, "since/for", subject-verb
   agreement, "the" with general nouns, -ing vs to-infinitive, countable/uncountable ("informations"),
   relative clause pronoun repetition ("the man who I saw him"), conditional tense mixing, etc.
   Distractors are grammatical-looking enough to tempt, similar length to the key, no joke options.
3. **Adult, real contexts**: work email, meetings, the bank, the clinic, travel/airport, hotel,
   customer service, online shopping, government services, family life, Riyadh/Jeddah/Dammam city life.
   Nothing childish ("my cat is blue"), nothing about alcohol, pork, dating, religion, politics.
   Use a mix of Saudi/Gulf names (Faisal, Noura, Abdullah, Reem, Sultan, Hessa, Majed, Lama) and
   international ones (Daniel, Maria, Mr Chen). Prices/amounts in items are fine (e.g. "SR 45").
4. **No translation items.** Never "What does X mean in Arabic?". No Arabic anywhere in stems/options.
5. **Not guessable by test-wiseness**: the key is not systematically the longest option, does not
   repeat stem words that distractors lack, no "all of the above", no options that are grammatically
   impossible after the stem's article ("an ___" with only one vowel-initial option).
6. **Four options**, all distinct, same part of speech/form family. Spread the key's position evenly
   across 0–3 (the engine reshuffles, but the reviewer sees your order).
7. Stems are short (phone screen). Grammar/vocab stems ≤ 28 words. Use `___` (three underscores) for the gap,
   exactly once, when the item is a gap fill.
8. Level honesty: tag each item with the CEFR level at which a learner would get it right ~65% of the time.
   Use English Profile / CEFR descriptors as your anchor (e.g. present perfect = A2/B1, third conditional = B1+/B2,
   inversion "Not only had…" = C1, wish + past perfect = B2).

## Item types (`skill`)
- `grammar` — structure in a single sentence or a 2-line mini-dialogue.
- `vocab` — vocabulary IN CONTEXT: collocation (make a decision / do research), word choice,
  phrasal verbs, word formation, register. Never a bare definition question at B1+.
- `reading` — a short text (`passage_id`) + 1–3 questions: SMS / WhatsApp message, email, notice,
  instructions, an ad, a short article. Questions test gist, detail, inference (B2+), writer's purpose,
  reference ("What does 'it' refer to?").
- `use` — functional language: what you would say in a situation. The situation is described in English
  in the stem (e.g. "Your manager asks if the report is ready. It isn't. You say:").
- `listening` — a short audio clip (`clip_id`) + 1–2 questions. The learner hears the clip (max 2 plays),
  sees the question and options as text.

## Listening clips
- Scripts are voiced with ElevenLabs. **The character budget is hard.** Count every character of every
  `text` line. Budget per clip by level: Pre-A1 ≤ 90 · A1 ≤ 120 · A2 ≤ 190 · B1 ≤ 270 · B2 ≤ 350 · C1 ≤ 430.
- 4 clips per level (24 total across both writers). Mix: monologue (announcement, voicemail, instructions)
  and 2-speaker dialogue (phone call, clinic reception, hotel desk, meeting). Max 2 speakers per clip.
- Speakers: `{ "id": "A", "voice": "<one of: us_male | us_female | uk_male | uk_female | au_male | in_female>" }`.
  Pre-A1–A2: US voices only, slow and clear. B1: US + UK. B2: UK + AU or Indian-English. C1: any, natural pace.
- Each clip has a `situation_ar`: one short Arabic line shown BEFORE playing, e.g. «رسالة صوتية من عيادة الأسنان».
- Question must be answerable ONLY from the audio (not from world knowledge or the situation line).
- At Pre-A1/A1 the clip answers a concrete detail (time, place, number, name). B1+: purpose, attitude, inference.

## Rationale
`rationale_ar`: ONE short Arabic line (≤ 18 words) a learner sees in a review, explaining why the key is right,
e.g. «نستخدم since مع نقطة بداية في الزمن، وfor مع مدة». Saudi-friendly simple Arabic, no MSA bombast.
Forbidden words anywhere: معهد، دورة، دورات، مذهل، مميز، استثنائية، الأفضل، حبيبتي، كلاس تجريبي.

## JSON format (write ONE file, valid JSON)
```json
{
  "part": "A",
  "passages": [
    { "id": "p-a1-01", "cefr": "A1", "lvl": 1, "genre": "sms", "title": "Message from Faisal",
      "text": "Hi Noura, the meeting is at 10, not 9. Room 4. See you there. Faisal" }
  ],
  "clips": [
    { "id": "c-a2-01", "cefr": "A2", "lvl": 2, "kind": "dialogue", "situation_ar": "مكالمة لحجز موعد في عيادة",
      "speakers": [ { "id": "A", "voice": "us_female" }, { "id": "B", "voice": "us_male" } ],
      "script": [ { "speaker": "A", "text": "Good morning, City Clinic." }, { "speaker": "B", "text": "Hi, ..." } ] }
  ],
  "items": [
    { "id": "g-b1-01", "cefr": "B1", "lvl": 3, "skill": "grammar", "subskill": "present_perfect_vs_past",
      "difficulty": 0.52, "stem": "I ___ in this company since 2019.",
      "options": ["work", "have worked", "worked", "am working"], "answer": 1,
      "rationale_ar": "مع since نستخدم المضارع التام لأن العمل بدأ في الماضي وما زال مستمراً",
      "tags": ["work", "l1_tense_transfer"] },
    { "id": "r-a1-01a", "cefr": "A1", "lvl": 1, "skill": "reading", "subskill": "detail", "passage_id": "p-a1-01",
      "difficulty": 0.22, "stem": "What time is the meeting now?", "options": ["9:00", "10:00", "4:00", "9:30"],
      "answer": 1, "rationale_ar": "...", "tags": ["work"] },
    { "id": "l-a2-01a", "cefr": "A2", "lvl": 2, "skill": "listening", "subskill": "detail", "clip_id": "c-a2-01",
      "difficulty": 0.36, "stem": "When is the appointment?", "options": ["...","...","...","..."], "answer": 2,
      "rationale_ar": "...", "tags": ["clinic"] }
  ]
}
```
- `answer` = index into `options` (0–3).
- `difficulty` = a GLOBAL 0–1 estimate, inside its level's band:
  Pre-A1 0.00–0.16 · A1 0.17–0.33 · A2 0.34–0.50 · B1 0.51–0.66 · B2 0.67–0.83 · C1 0.84–1.00.
  Spread items across the band (easy, mid, hard).
- ids: `<g|v|r|u|l>-<pa1|a1|a2|b1|b2|c1>-<nn>[a|b|c]`; passages `p-…`, clips `c-…`. Unique.
- `subskill`: snake_case, specific (e.g. `articles`, `prepositions_time`, `collocation_make_do`, `gist`, `inference`,
  `request_polite`, `complaint`, `phrasal_verbs`, `relative_clauses`, `conditionals_2`, `word_formation`).

## Validate
`node /private/tmp/claude-501/-Users-dr-ali/7a4b567d-4f5a-4a04-96ad-ceded725ca87/scratchpad/bank/validate.mjs <your-file.json>`
must print `OK` with zero errors before you finish. It also prints counts and the listening character total.
