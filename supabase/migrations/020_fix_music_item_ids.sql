-- Migration: Fix music items with id = 0
--
-- Music items were being saved with id: 0 because externalId was null
-- (MusicBrainz IDs are strings, not stored). This breaks game selection
-- which relies on unique numeric IDs.
--
-- This migration generates unique IDs for any items with id = 0 or null.

-- Fix connection_groups table (source of truth for groups)
UPDATE connection_groups
SET items = (
  SELECT jsonb_agg(
    CASE
      WHEN (item->>'id')::int = 0 OR item->>'id' IS NULL THEN
        jsonb_set(
          item,
          '{id}',
          to_jsonb((extract(epoch from now()) * 1000)::bigint + ordinality)
        )
      ELSE item
    END
    ORDER BY ordinality
  )
  FROM jsonb_array_elements(items) WITH ORDINALITY AS t(item, ordinality)
)
WHERE genre = 'music'
AND EXISTS (
  SELECT 1
  FROM jsonb_array_elements(items) AS item
  WHERE (item->>'id')::int = 0 OR item->>'id' IS NULL
);

-- Fix puzzles.groups snapshot (published puzzles have a frozen copy)
UPDATE puzzles
SET groups = (
  SELECT jsonb_agg(
    jsonb_set(
      grp,
      '{items}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN (item->>'id')::int = 0 OR item->>'id' IS NULL THEN
              jsonb_set(
                item,
                '{id}',
                to_jsonb((extract(epoch from now()) * 1000)::bigint + (grp_idx * 100) + item_idx)
              )
            ELSE item
          END
          ORDER BY item_idx
        )
        FROM jsonb_array_elements(grp->'items') WITH ORDINALITY AS t(item, item_idx)
      )
    )
    ORDER BY grp_idx
  )
  FROM jsonb_array_elements(groups) WITH ORDINALITY AS g(grp, grp_idx)
)
WHERE genre = 'music'
AND groups IS NOT NULL
AND EXISTS (
  SELECT 1
  FROM jsonb_array_elements(groups) AS grp,
       jsonb_array_elements(grp->'items') AS item
  WHERE (item->>'id')::int = 0 OR item->>'id' IS NULL
);
