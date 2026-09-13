-- Library tour snapshot — READ-ONLY. Run through the Supabase MCP (execute_sql,
-- project nmjexpuycmqcxuxljier) and save the `snapshot` column as
-- scripts/tour/library/raw-snapshot.json, then run:
--   node scripts/tour/library/build-snapshot.mjs
-- which rewrites media URLs to /tour/library/..., regenders the feminine copy,
-- and writes src/tour/rooms/library/data/snapshot.json.
--
-- Specimen: The Wolf Winter (B1), chapter 1 "The White Silence", paragraphs 0–4
-- (12 sentences; timing ends t1 = 78 370 ms; the clip is 0–80.5 s).
-- Set max_p to NULL for the whole chapter.
with spec as (select 'f09d7e29-7c64-47a3-82b0-9cd98c98a82e'::uuid book_id,
                     'f01b4166-adf2-4c80-9a64-f5b44dc7a909'::uuid chapter_id,
                     4 max_p),
shelf as (
  select json_agg(json_build_object('id',b.id,'title_en',b.title_en,'title_ar',b.title_ar,
    'theme',b.theme,'cefr',b.cefr,'level_number',b.level_number,'cover_data',b.cover_data,
    'author_label',b.author_label,'total_chapters',b.total_chapters,'sort_order',b.sort_order) order by b.sort_order) j
  from library_books b where b.deleted_at is null and b.status='published'),
chapters as (
  select json_agg(json_build_object('id',c.id,'chapter_number',c.chapter_number,'title_en',c.title_en,
    'title_ar',c.title_ar,'word_count',c.word_count) order by c.chapter_number) j
  from library_chapters c, spec where c.book_id=spec.book_id and c.deleted_at is null),
ch as (
  select c.*, (select coalesce(json_agg(t order by (t->>'t0')::int),'[]') from jsonb_array_elements(c.audio_timing) t
               where spec.max_p is null or (t->>'p')::int <= spec.max_p) timing
  from library_chapters c, spec where c.id=spec.chapter_id),
paras as (
  select json_agg(json_build_object('id',p.id,'index',p.paragraph_index,'sentences',
    (select json_agg(json_build_object('id',sp.id,'sentence_index',sp.sentence_index,'text_en',sp.text_en,
       'text_ar',sp.text_ar,'is_dialogue',sp.is_dialogue,'speaker',sp.speaker) order by sp.sentence_index)
     from library_sentence_pairs sp where sp.paragraph_id=p.id)) order by p.paragraph_index) j
  from library_paragraphs p, spec
  where p.chapter_id=spec.chapter_id and (spec.max_p is null or p.paragraph_index <= spec.max_p)),
qs as (
  select json_agg(json_build_object('id',q.id,'q_index',q.q_index,'type',q.type,'question_en',q.question_en,
    'question_ar',q.question_ar,'options',q.options,'correct_id',q.correct_id,'explanation_ar',q.explanation_ar,
    'jump_p',q.jump_p,'jump_s',q.jump_s) order by q.q_index) j
  from library_chapter_questions q, spec
  where q.chapter_id=spec.chapter_id and (spec.max_p is null or q.jump_p <= spec.max_p))
select json_build_object(
  'snapshot_at', now(),
  'books',      (select j from shelf),
  'book',       (select json_build_object('id',b.id,'title_en',b.title_en,'title_ar',b.title_ar,'synopsis_ar',b.synopsis_ar,
                   'synopsis_en',b.synopsis_en,'theme',b.theme,'cefr',b.cefr,'level_number',b.level_number,
                   'cover_data',b.cover_data,'author_label',b.author_label,'total_chapters',b.total_chapters)
                 from library_books b, spec where b.id=spec.book_id),
  'chapters',   (select j from chapters),
  'chapter',    (select json_build_object('id',id,'chapter_number',chapter_number,'title_en',title_en,'title_ar',title_ar,
                   'word_count',word_count,'audio_url',audio_url,'audio_timing',timing,'illustrations',illustrations) from ch),
  'paragraphs', (select j from paras),
  'questions',  (select j from qs)
) as snapshot;
