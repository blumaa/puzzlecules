-- Pipeline Configuration Table
-- Stores pipeline settings per genre for auto-generating puzzles

CREATE TABLE IF NOT EXISTS pipeline_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Genre this config applies to
  genre TEXT NOT NULL UNIQUE,

  -- Whether auto-generation is enabled
  enabled BOOLEAN NOT NULL DEFAULT false,

  -- Number of days to maintain scheduled puzzles (default: 30)
  rolling_window_days INTEGER NOT NULL DEFAULT 30,

  -- Minimum approved groups per color before triggering AI generation
  min_groups_per_color INTEGER NOT NULL DEFAULT 10,

  -- Number of groups to generate when pool is low
  ai_generation_batch_size INTEGER NOT NULL DEFAULT 20
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_pipeline_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pipeline_config_updated_at
  BEFORE UPDATE ON pipeline_config
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_config_updated_at();

-- Create index on genre for quick lookups
CREATE INDEX idx_pipeline_config_genre ON pipeline_config(genre);

-- Insert default configs for existing genres
INSERT INTO pipeline_config (genre, enabled, rolling_window_days, min_groups_per_color, ai_generation_batch_size)
VALUES
  ('films', false, 30, 10, 20),
  ('music', false, 30, 10, 20)
ON CONFLICT (genre) DO NOTHING;

-- RLS policies
ALTER TABLE pipeline_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read config
CREATE POLICY "Allow authenticated users to read pipeline config"
  ON pipeline_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update config
CREATE POLICY "Allow authenticated users to update pipeline config"
  ON pipeline_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert config (for new genres)
CREATE POLICY "Allow authenticated users to insert pipeline config"
  ON pipeline_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE pipeline_config IS 'Stores pipeline configuration per genre for auto-generating puzzles';
COMMENT ON COLUMN pipeline_config.enabled IS 'Whether auto-generation is enabled for this genre';
COMMENT ON COLUMN pipeline_config.rolling_window_days IS 'Number of days to maintain scheduled puzzles';
COMMENT ON COLUMN pipeline_config.min_groups_per_color IS 'Minimum approved groups per color before triggering AI generation';
COMMENT ON COLUMN pipeline_config.ai_generation_batch_size IS 'Number of groups to generate when pool is low';
