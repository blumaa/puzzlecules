-- Remove quality_score from puzzles table
-- This column is no longer used in the application

-- Drop the index first
DROP INDEX IF EXISTS idx_puzzles_quality_score;

-- Remove the column (this also removes the check constraint)
ALTER TABLE puzzles DROP COLUMN IF EXISTS quality_score;

-- Update the comment on the table
COMMENT ON TABLE puzzles IS 'Stores all generated/approved puzzles with date assignment';
