-- Protect Past Puzzles
-- Prevents unscheduling or deleting puzzles for today or past dates

-- Trigger function to prevent unscheduling past/current puzzles
CREATE OR REPLACE FUNCTION prevent_unschedule_past_puzzles()
RETURNS TRIGGER AS $$
BEGIN
  -- If puzzle_date is being set to NULL (unscheduling)
  -- and the old date is today or in the past, block it
  IF OLD.puzzle_date IS NOT NULL
     AND NEW.puzzle_date IS NULL
     AND OLD.puzzle_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot unschedule a puzzle for today or a past date (%)' , OLD.puzzle_date;
  END IF;

  -- If puzzle_date is being changed to a different date
  -- and the old date is today or in the past, block it
  IF OLD.puzzle_date IS NOT NULL
     AND NEW.puzzle_date IS NOT NULL
     AND OLD.puzzle_date != NEW.puzzle_date
     AND OLD.puzzle_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot reschedule a puzzle that was scheduled for today or a past date (%)' , OLD.puzzle_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to prevent deleting past/current puzzles
CREATE OR REPLACE FUNCTION prevent_delete_past_puzzles()
RETURNS TRIGGER AS $$
BEGIN
  -- If the puzzle has a date that is today or in the past, block deletion
  IF OLD.puzzle_date IS NOT NULL AND OLD.puzzle_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot delete a puzzle scheduled for today or a past date (%)' , OLD.puzzle_date;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER protect_past_puzzles_update
  BEFORE UPDATE ON puzzles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unschedule_past_puzzles();

CREATE TRIGGER protect_past_puzzles_delete
  BEFORE DELETE ON puzzles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_past_puzzles();

COMMENT ON FUNCTION prevent_unschedule_past_puzzles() IS 'Prevents unscheduling or rescheduling puzzles for today or past dates';
COMMENT ON FUNCTION prevent_delete_past_puzzles() IS 'Prevents deleting puzzles scheduled for today or past dates';
