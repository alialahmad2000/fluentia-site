-- «سُلّم الأفعال» tour room — the 20 verb families, for the atlas.
--
-- verb_families is readable by `authenticated` only (policy vf_read), so this
-- cannot come from the anon REST API. Run it read-only through the Supabase MCP
-- (project nmjexpuycmqcxuxljier) and save the `families` array, as-is, to
-- src/tour/rooms/verbs/data/families.json. `n` is the active verb count and
-- `pattern` is the pattern_group of the family's first verb in ladder order,
-- which is what VerbAtlas prints next to the family name.
--
-- The verbs themselves come from scripts/tour/verbs/snapshot.mjs (anon REST).
select jsonb_build_object(
  'snapshot_at', now(),
  'catalogue_total', (select count(*) from irregular_verbs where is_active),
  'families', (select jsonb_agg(jsonb_build_object(
      'key', key, 'name_ar', name_ar, 'rule_ar', rule_ar,
      'n', (select count(*) from irregular_verbs i where i.is_active and i.rhyme_family = f.key),
      'pattern', (select i.pattern_group from irregular_verbs i
                   where i.is_active and i.rhyme_family = f.key
                   order by i.frequency_rank limit 1))
    order by key) from verb_families f)
) as snap;
