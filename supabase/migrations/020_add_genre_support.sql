-- Genre Support Migration
-- Adds genre column to connection_groups, puzzles, and connection_types
-- to support multiple domains (films, music, books, sports)

-- =============================================================================
-- ADD GENRE COLUMN TO CONNECTION_GROUPS
-- =============================================================================

ALTER TABLE connection_groups ADD COLUMN genre TEXT NOT NULL DEFAULT 'films';

CREATE INDEX idx_connection_groups_genre ON connection_groups(genre);

COMMENT ON COLUMN connection_groups.genre IS 'Genre/domain of the group (films, music, books, sports)';

-- =============================================================================
-- ADD GENRE COLUMN TO PUZZLES
-- =============================================================================

ALTER TABLE puzzles ADD COLUMN genre TEXT NOT NULL DEFAULT 'films';

CREATE INDEX idx_puzzles_genre ON puzzles(genre);

COMMENT ON COLUMN puzzles.genre IS 'Genre/domain of the puzzle (films, music, books, sports)';

-- =============================================================================
-- ADD GENRE COLUMN TO CONNECTION_TYPES
-- =============================================================================

ALTER TABLE connection_types ADD COLUMN genre TEXT NOT NULL DEFAULT 'films';

CREATE INDEX idx_connection_types_genre ON connection_types(genre);

COMMENT ON COLUMN connection_types.genre IS 'Genre/domain this connection type applies to (films, music, books, sports)';

-- =============================================================================
-- UPDATE GET_DAILY_PUZZLE FUNCTION TO ACCEPT GENRE
-- =============================================================================

-- Drop existing function first
DROP FUNCTION IF EXISTS get_daily_puzzle(DATE);

-- Create updated function with genre parameter
CREATE OR REPLACE FUNCTION get_daily_puzzle(
  puzzle_date_param DATE DEFAULT CURRENT_DATE,
  genre_param TEXT DEFAULT 'films'
)
RETURNS SETOF puzzles AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM puzzles
  WHERE puzzle_date = puzzle_date_param
    AND status = 'published'
    AND genre = genre_param
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_daily_puzzle(DATE, TEXT) IS 'Get the published puzzle for a specific date and genre';

-- =============================================================================
-- UPDATE GET_NEXT_AVAILABLE_DATE FUNCTION TO ACCEPT GENRE
-- =============================================================================

-- Drop existing function first
DROP FUNCTION IF EXISTS get_next_available_date();

-- Create updated function with genre parameter
CREATE OR REPLACE FUNCTION get_next_available_date(genre_param TEXT DEFAULT 'films')
RETURNS DATE AS $$
DECLARE
  next_date DATE;
BEGIN
  SELECT MAX(puzzle_date) + INTERVAL '1 day' INTO next_date
  FROM puzzles
  WHERE genre = genre_param;

  IF next_date IS NULL OR next_date < CURRENT_DATE THEN
    RETURN CURRENT_DATE;
  ELSE
    RETURN next_date;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_available_date(TEXT) IS 'Get the next available puzzle date for a specific genre';

-- =============================================================================
-- ADD GENRE TO GROUP_FEEDBACK TABLE
-- =============================================================================

ALTER TABLE group_feedback ADD COLUMN genre TEXT NOT NULL DEFAULT 'films';

CREATE INDEX idx_group_feedback_genre ON group_feedback(genre);

COMMENT ON COLUMN group_feedback.genre IS 'Genre/domain of the feedback (films, music, books, sports)';
