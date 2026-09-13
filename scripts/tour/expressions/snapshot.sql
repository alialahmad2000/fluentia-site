-- Tour room «الأمثال والتعابير» — the four specimens, read-only.
-- Mirrors the select of useExpressions() in fluentia-lms
-- src/pages/student/expressions/useExpressions.js (origin/main 3396e97e).
--
-- Run through the Supabase MCP (project nmjexpuycmqcxuxljier), save the
-- `snapshot` array as scripts/tour/expressions/raw.json, then:
--   node scripts/tour/expressions/build-snapshot.mjs
--
-- RLS: every SELECT policy on these tables is TO authenticated, so the public
-- site cannot read them live. That is why the tour ships a static snapshot.

select jsonb_agg(to_jsonb(s) order by s.kind, s.sort_order) as snapshot from (
  select e.id, e.kind, e.slug, e.text_en, e.literal_ar, e.meaning_ar, e.when_to_use_ar,
         e.arabic_twin, e.twin_note_ar, e.frame_en, e.forms, e.fixed_part_en, e.common_error_ar, e.wrong_forms,
         e.register, e.register_warning_ar, e.frequency, e.cefr_level, e.theme, e.theme_label_ar,
         e.image_url, e.image_literal_url, e.audio_url, e.sort_order, e.unit_id,
         coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'idx',x.idx,'speaker',x.speaker,'text_en',x.text_en,
                     'text_ar',x.text_ar,'is_target',x.is_target,'audio_url',x.audio_url) order by x.idx)
                   from expression_examples x where x.expression_id=e.id),'[]'::jsonb) as expression_examples,
         coalesce((select jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'prompt_ar',q.prompt_ar,'prompt_en',q.prompt_en,
                     'options',q.options,'answer',q.answer,'hint_ar',q.hint_ar,'sort_order',q.sort_order) order by q.sort_order)
                   from expression_questions q where q.expression_id=e.id),'[]'::jsonb) as expression_questions
  from expressions e
  where e.is_published
    and e.slug in ('dont-count-your-chickens','the-early-bird','cost-an-arm-and-a-leg','spill-the-beans')
) s;

-- Library size shown on the hall and lab («مثلان من أصل 120 مثلاً»).
select kind, count(*) from expressions where is_published group by kind order by kind;
-- 2026-09-13: idiom 200, preposition 140, proverb 120
