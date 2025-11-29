-- Clear puzzle_date for non-published puzzles to make them available for scheduling
-- Published puzzles keep their dates (they are live)
-- Pending/approved puzzles get their dates cleared so they can be scheduled via calendar

UPDATE puzzles
SET puzzle_date = NULL
WHERE status != 'published';
