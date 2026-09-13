-- Snapshot B — the generic unit grammar lesson shown in «القواعد داخل الوحدة».
-- Level 3 (B1) · Unit 4 «ثقافة القهوة حول العالم» · passive voice (present).
-- READ-ONLY. Run through the Supabase MCP (project nmjexpuycmqcxuxljier), save the
-- `snapshot` value to scripts/tour/grammar/raw/unit-lesson.json, then run
--   node scripts/tour/grammar/build-snapshots.mjs
--
-- These are SCORED items (student_curriculum_progress + XP). Only five of the lesson's
-- sixteen are published — one per question type: sort 0 choose · 2 transform ·
-- 4 error_correction · 6 reorder · 11 fill_blank. build-snapshots.mjs asserts the five.
select jsonb_build_object(
  'id', g.id, 'topic_name_en', g.topic_name_en, 'topic_name_ar', g.topic_name_ar,
  'unit', jsonb_build_object('id', u.id, 'unit_number', u.unit_number, 'theme_en', u.theme_en, 'theme_ar', u.theme_ar,
                             'level_number', l.level_number, 'cefr', l.cefr),
  'explanation_content', g.explanation_content,
  'deep_content', g.deep_content,
  'exceptions', g.exceptions,
  'exercises', (select jsonb_agg(jsonb_build_object('id', e.id, 'grammar_id', e.grammar_id,
                         'exercise_type', e.exercise_type, 'sort_order', e.sort_order, 'items', e.items)
                         order by e.sort_order)
                from curriculum_grammar_exercises e
                where e.grammar_id = g.id and e.sort_order in (0, 2, 4, 6, 11))
) as snapshot
from curriculum_grammar g
join curriculum_units u on u.id = g.unit_id
join curriculum_levels l on l.id = u.level_id
where g.id = '0179cf9e-17d9-4527-8f70-be91f2956974'
  and u.owner_student_id is null;   -- guard: never snapshot a named student's custom track

-- Transcription check used by build-snapshots.mjs (EXPECTED hashes):
-- select md5(g.explanation_content::text), md5(g.deep_content::text),
--        (select jsonb_object_agg(e.sort_order::text, md5(e.items::text)) from curriculum_grammar_exercises e
--          where e.grammar_id = g.id and e.sort_order in (0,2,4,6,11))
-- from curriculum_grammar g where g.id = '0179cf9e-17d9-4527-8f70-be91f2956974';
