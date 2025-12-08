-- Migration: Add source column to puzzles table
-- Tracks whether a puzzle was created by system (admin/pipeline) or user submission

-- Add source column with default 'system' for existing puzzles
ALTER TABLE puzzles
ADD COLUMN source TEXT NOT NULL DEFAULT 'system'
CHECK (source IN ('system', 'user'));

-- Add comment for documentation
COMMENT ON COLUMN puzzles.source IS 'Origin of the puzzle: system (admin/pipeline created) or user (public submission)';

-- Update RLS policy to allow anonymous users to insert user-submitted puzzles
CREATE POLICY "Allow anonymous puzzle submissions"
ON puzzles
FOR INSERT
TO anon
WITH CHECK (source = 'user' AND status = 'pending');
