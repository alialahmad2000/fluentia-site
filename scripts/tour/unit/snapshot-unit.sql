-- Read-only snapshot for the unit tour room. word_timestamps + paragraph_audio are dropped (read-along is not ported).
-- Fluentia platform tour — single-unit snapshot (READ-ONLY).
-- Specimen: A2 · Unit 3 · «الطقس المتطرف» / Extreme Weather
-- Run with a privileged role (MCP execute_sql / service role): anon CANNOT read
-- curriculum_* (policies require auth.role()='authenticated').
-- Output: ONE jsonb document shaped for props-fed components.
with
params as (select '6527e32e-b7f3-4196-9bae-a034712c9fa6'::uuid as unit_id),

unit as (
  select u.*, l.level_number, l.name_ar as level_name_ar, l.name_en as level_name_en,
         l.cefr, l.color as level_color, l.description_ar as level_description_ar
  from curriculum_units u join curriculum_levels l on l.id = u.level_id
  where u.id = (select unit_id from params)
),

-- Level page (unit cards from the outside): every ordinary unit of the same level.
level_units as (
  select jsonb_agg(jsonb_build_object(
           'id', u.id, 'unit_number', u.unit_number, 'theme_ar', u.theme_ar, 'theme_en', u.theme_en,
           'cover_image_url', u.cover_image_url, 'estimated_minutes', u.estimated_minutes)
         order by u.unit_number) as j
  from curriculum_units u
  where u.level_id = (select level_id from unit) and u.owner_student_id is null
),

readings as (
  select r.* from curriculum_readings r
  where r.unit_id = (select unit_id from params)
),

-- Token set per reading, normalised EXACTLY like ArticleBody.normWord /
-- useArticleVocabIndex: lowercase, ’→', strip leading/trailing non-letters, len>1.
reading_tokens as (
  select distinct r.id as reading_id,
         regexp_replace(regexp_replace(lower(replace(m[1], '’', '''')), '^[^[:alpha:]]+', ''), '[^[:alpha:]]+$', '') as w
  from readings r,
       jsonb_array_elements_text(r.passage_content->'paragraphs') p,
       regexp_matches(replace(p, '*', ''), '([[:alpha:]''’-]+)', 'g') m
),
listening as (
  select cl.* from curriculum_listening cl where cl.unit_id = (select unit_id from params)
),
listening_tokens as (
  select distinct cl.id as listening_id,
         regexp_replace(regexp_replace(lower(replace(m[1], '’', '''')), '^[^[:alpha:]]+', ''), '[^[:alpha:]]+$', '') as w
  from listening cl, regexp_matches(coalesce(cl.transcript, ''), '([[:alpha:]''’-]+)', 'g') m
),
all_tokens as (
  select reading_id as content_id, w from reading_tokens where length(w) > 1
  union
  select listening_id, w from listening_tokens where length(w) > 1
),

-- The word-tap index (replaces the 3-tier useArticleVocabIndex query at runtime).
-- Tier 1: THIS reading's own vocabulary → is_vocab=true (gold underline, first occurrence).
-- Tier 2: any curriculum_vocabulary row with that exact word → meaning only.
-- Tier 3: reading_glossary → meaning only.
-- (A listening id never matches tier 1, so the transcript shows no underlines — same as prod.)
word_index as (
  select t.content_id, t.w,
    coalesce(
      (select jsonb_build_object('id', v.id, 'word', v.word, 'definition_ar', v.definition_ar, 'audio_url', v.audio_url,
                                 'example_sentence', v.example_sentence, 'pronunciation_ipa', v.pronunciation_ipa, 'is_vocab', true)
         from curriculum_vocabulary v where v.reading_id = t.content_id and lower(v.word) = t.w
         order by v.sort_order limit 1),
      (select jsonb_build_object('id', v.id, 'word', v.word, 'definition_ar', v.definition_ar, 'audio_url', v.audio_url,
                                 'example_sentence', v.example_sentence, 'pronunciation_ipa', v.pronunciation_ipa, 'is_vocab', false)
         from curriculum_vocabulary v where v.word = t.w
         order by v.created_at limit 1),
      (select jsonb_build_object('word', g.word, 'definition_ar', g.meaning_ar, 'part_of_speech', g.part_of_speech, 'is_vocab', false)
         from reading_glossary g where g.word = t.w and g.meaning_ar is not null limit 1)
    ) as row
  from all_tokens t
),

-- Word pronunciation (replaces pronounceWord's runtime resolution):
-- curriculum_vocabulary.audio_url first, else the deterministic word-tts clip.
word_audio as (
  select distinct on (w) w,
    coalesce(
      (select v.audio_url from curriculum_vocabulary v where v.word = a.w and v.audio_url is not null order by v.created_at limit 1),
      case when exists (select 1 from storage.objects o where o.bucket_id = 'curriculum-audio' and o.name = 'word-tts/' || a.w || '.mp3')
           then 'https://nmjexpuycmqcxuxljier.supabase.co/storage/v1/object/public/curriculum-audio/word-tts/' || a.w || '.mp3' end
    ) as url
  from (select regexp_replace(regexp_replace(w, '[^a-z''-]', '', 'g'), '^[''-]+|[''-]+$', '', 'g') as w from all_tokens) a
  where length(a.w) > 1
)

select jsonb_build_object(
  'snapshot_at', now(),
  'level', (select jsonb_build_object('level_number', level_number, 'name_ar', level_name_ar, 'name_en', level_name_en,
                                      'cefr', cefr, 'color', level_color, 'description_ar', level_description_ar) from unit),
  'level_units', (select j from level_units),
  'unit', (select jsonb_build_object(
             'id', id, 'unit_number', unit_number, 'theme_ar', theme_ar, 'theme_en', theme_en,
             'description_ar', description_ar, 'cover_image_url', cover_image_url, 'estimated_minutes', estimated_minutes,
             'why_matters', why_matters, 'outcomes', to_jsonb(outcomes), 'activity_ribbons', activity_ribbons,
             'owner_student_id', owner_student_id, 'paragraph_letters', paragraph_letters) from unit),

  'readings', (select jsonb_agg(jsonb_build_object(
      'id', r.id, 'reading_label', r.reading_label, 'sort_order', r.sort_order,
      'title_en', r.title_en, 'title_ar', r.title_ar,
      'before_read_image_url', r.before_read_image_url, 'passage_image_urls', r.passage_image_urls,
      'infographic_image_url', r.infographic_image_url,
      'passage_content', r.passage_content, 'passage_word_count', r.passage_word_count,
      'before_read_exercise_a', r.before_read_exercise_a,
      'reading_skill_name_en', r.reading_skill_name_en, 'reading_skill_name_ar', r.reading_skill_name_ar,
      'reading_skill_explanation', r.reading_skill_explanation,
      'critical_thinking_prompt_en', r.critical_thinking_prompt_en, 'critical_thinking_prompt_ar', r.critical_thinking_prompt_ar,
      'study_sheet', r.study_sheet, 'experience_version', r.experience_version,
      'audio', (select jsonb_build_object('full_audio_url', a.full_audio_url, 'full_duration_ms', a.full_duration_ms)
                from reading_passage_audio a where a.passage_id = r.id),
      'vocabulary', (select jsonb_agg(jsonb_build_object(
            'id', v.id, 'word', v.word, 'part_of_speech', v.part_of_speech, 'pronunciation_ipa', v.pronunciation_ipa,
            'definition_en', v.definition_en, 'definition_ar', v.definition_ar, 'example_sentence', v.example_sentence,
            'audio_url', v.audio_url, 'tier', v.tier, 'sort_order', v.sort_order,
            'synonyms', v.synonyms, 'antonyms', v.antonyms, 'word_family', v.word_family) order by v.sort_order)
          from curriculum_vocabulary v where v.reading_id = r.id),
      'questions', (select jsonb_agg(jsonb_build_object(
            'id', q.id, 'reading_id', q.reading_id, 'question_type', q.question_type, 'question_en', q.question_en,
            'question_ar', q.question_ar, 'choices', q.choices, 'correct_answer', q.correct_answer,
            'explanation_en', q.explanation_en, 'explanation_ar', q.explanation_ar,
            'hint', q.hint, 'wrong_notes', q.wrong_notes, 'sort_order', q.sort_order) order by q.sort_order)
          from curriculum_comprehension_questions q where q.reading_id = r.id),
      'word_index', (select jsonb_object_agg(wi.w, wi.row) from word_index wi where wi.content_id = r.id and wi.row is not null)
    ) order by r.sort_order) from readings r),

  'listening', (select jsonb_agg(jsonb_build_object(
      'id', cl.id, 'title_en', cl.title_en, 'title_ar', cl.title_ar, 'audio_type', cl.audio_type,
      'audio_url', cl.audio_url, 'audio_duration_seconds', cl.audio_duration_seconds, 'image_url', cl.image_url,
      'transcript', cl.transcript, 'speaker_segments', cl.speaker_segments, 'exercises', cl.exercises,
      'word_index', (select jsonb_object_agg(wi.w, wi.row) from word_index wi where wi.content_id = cl.id and wi.row is not null)
    ) order by cl.sort_order) from listening cl),

  'word_audio', (select jsonb_object_agg(w, url) from word_audio where url is not null)
) as tour_unit;
