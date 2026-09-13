-- Snapshot A — «المرجع النحوي» entry `present-perfect-vs-past`, for the /tour grammar room.
-- READ-ONLY. Run through the Supabase MCP (project nmjexpuycmqcxuxljier) and save the
-- `snapshot` value to scripts/tour/grammar/raw/reference.json, then:
--   node scripts/tour/grammar/build-snapshots.mjs
--
-- The trainer layer (`teach`) is removed HERE, in the JSON itself, not just hidden in
-- the UI: the LMS hides check_question_ar / misdiagnosis_ar only by role, and a static
-- file on the marketing site is public. build-snapshots.mjs asserts it is gone.
-- `teach` is the last section, so removing it shifts no section index (anchors stable).
select jsonb_build_object(
  'id', r.id, 'slug', r.slug, 'title_en', r.title_en, 'title_ar', r.title_ar, 'summary_ar', r.summary_ar,
  'category', r.category, 'category_title_ar', c.title_ar, 'cefr', r.cefr,
  'content', jsonb_build_object('sections',
     coalesce((select jsonb_agg(s order by ord)
               from jsonb_array_elements(r.content->'sections') with ordinality as t(s, ord)
               where s->>'type' <> 'teach'), '[]'::jsonb)),
  'drills', r.drills,
  'diagram_overrides', r.diagram_overrides,
  'related', coalesce((select jsonb_agg(jsonb_build_object('slug', x.slug, 'title_en', x.title_en, 'title_ar', x.title_ar)
                                        order by array_position(r.related_slugs, x.slug))
               from grammar_reference x where x.slug = any(r.related_slugs) and x.is_published), '[]'::jsonb),
  -- the entry's neighbours in its category (GrammarEntry's «السابق / التالي» pair; the
  -- LMS index orders by category, sort_order)
  'prev', (select jsonb_build_object('slug', x.slug, 'title_en', x.title_en) from grammar_reference x
           where x.category = r.category and x.is_published and x.sort_order < r.sort_order
           order by x.sort_order desc limit 1),
  'next', (select jsonb_build_object('slug', x.slug, 'title_en', x.title_en) from grammar_reference x
           where x.category = r.category and x.is_published and x.sort_order > r.sort_order
           order by x.sort_order asc limit 1),
  'library_count', (select count(*) from grammar_reference where is_published),
  'updated_at', r.updated_at
) as snapshot
from grammar_reference r
join grammar_reference_categories c on c.slug = r.category
where r.slug = 'present-perfect-vs-past' and r.is_published;
