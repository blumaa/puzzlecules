-- Allow authenticated users (admins) to read all puzzles, not just published ones
-- This is needed for the calendar scheduling view to see unscheduled puzzles

CREATE POLICY "Authenticated users can read all puzzles"
  ON puzzles FOR SELECT
  TO authenticated
  USING (true);
