-- Migration: Rename films to items for genre-agnostic database
-- This allows the database to support films, songs, words, etc.

-- Rename films column to items in connection_groups
ALTER TABLE connection_groups RENAME COLUMN films TO items;

-- Rename films column to items in group_feedback
ALTER TABLE group_feedback RENAME COLUMN films TO items;

-- Update existing puzzles.groups JSONB to use 'items' key instead of 'films'
-- This transforms each group object in the array to rename the 'films' key to 'items'
UPDATE puzzles
SET groups = (
  SELECT jsonb_agg(
    CASE
      WHEN elem ? 'films' THEN
        (elem - 'films') || jsonb_build_object('items', elem->'films')
      ELSE
        elem
    END
  )
  FROM jsonb_array_elements(groups) elem
)
WHERE groups IS NOT NULL AND groups != 'null'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN connection_groups.items IS 'Generic items array - contains films, songs, words, etc. based on genre';
COMMENT ON COLUMN group_feedback.items IS 'Generic items array for feedback - contains films, songs, words, etc.';
