-- Update puzzle_date unique constraint for multi-genre support
-- Changes from unique on puzzle_date to unique on (puzzle_date, genre)
-- This allows one puzzle per date PER GENRE

-- Drop the existing unique constraint on puzzle_date
-- The constraint name is auto-generated as "puzzles_puzzle_date_key"
ALTER TABLE puzzles DROP CONSTRAINT IF EXISTS puzzles_puzzle_date_key;

-- Create new composite unique constraint on (puzzle_date, genre)
-- This allows films puzzle on 2024-01-01 AND music puzzle on 2024-01-01
ALTER TABLE puzzles ADD CONSTRAINT puzzles_puzzle_date_genre_unique
  UNIQUE (puzzle_date, genre);

-- Update the index for better query performance
DROP INDEX IF EXISTS idx_puzzles_date;
CREATE INDEX idx_puzzles_date_genre ON puzzles(puzzle_date, genre);

COMMENT ON CONSTRAINT puzzles_puzzle_date_genre_unique ON puzzles IS
  'Ensures only one puzzle per date per genre';
