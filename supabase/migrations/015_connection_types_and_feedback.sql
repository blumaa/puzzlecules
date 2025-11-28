-- Connection Types and Feedback Tables Migration
-- For AI-first group generation system with learning capabilities

-- =============================================================================
-- CONNECTION TYPES TABLE
-- Stores admin-configurable connection types for AI prompt generation
-- =============================================================================

CREATE TABLE connection_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Connection type definition
  name TEXT NOT NULL,                    -- e.g., "Titles that are verbs"
  category TEXT NOT NULL,                -- e.g., "word-game", "thematic", "people"
  description TEXT NOT NULL,             -- Explanation for AI prompt
  examples TEXT[],                       -- Example connections

  -- Status
  active BOOLEAN NOT NULL DEFAULT true,  -- Can be toggled on/off

  -- Ensure unique names
  CONSTRAINT unique_connection_type_name UNIQUE (name)
);

-- Indexes
CREATE INDEX idx_connection_types_category ON connection_types(category);
CREATE INDEX idx_connection_types_active ON connection_types(active);

-- Enable Row Level Security
ALTER TABLE connection_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connection_types
CREATE POLICY "Anyone can read active connection types"
  ON connection_types FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Authenticated users can read all connection types"
  ON connection_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert connection types"
  ON connection_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update connection types"
  ON connection_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete connection types"
  ON connection_types FOR DELETE
  TO authenticated
  USING (true);

-- Comments
COMMENT ON TABLE connection_types IS 'Stores admin-configurable connection types for AI generation';
COMMENT ON COLUMN connection_types.name IS 'Human-readable name of the connection type';
COMMENT ON COLUMN connection_types.category IS 'Category for grouping (word-game, thematic, people, etc.)';
COMMENT ON COLUMN connection_types.description IS 'Description used in AI prompt to explain the connection type';
COMMENT ON COLUMN connection_types.examples IS 'Array of example connections of this type';
COMMENT ON COLUMN connection_types.active IS 'Whether this type is active and used in generation';

-- =============================================================================
-- GROUP FEEDBACK TABLE
-- Stores accept/reject decisions for AI learning
-- =============================================================================

CREATE TABLE group_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Group data snapshot (stored as JSON for learning purposes)
  films JSONB NOT NULL,                   -- [{title, year, tmdbId}]
  connection TEXT NOT NULL,
  connection_type_id UUID REFERENCES connection_types(id) ON DELETE SET NULL,
  explanation TEXT,

  -- Feedback
  accepted BOOLEAN NOT NULL,
  rejection_reason TEXT,

  -- Context (what filters were used when this was generated)
  generation_filters JSONB
);

-- Indexes
CREATE INDEX idx_feedback_accepted ON group_feedback(accepted);
CREATE INDEX idx_feedback_connection_type ON group_feedback(connection_type_id);
CREATE INDEX idx_feedback_created_at ON group_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE group_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_feedback
CREATE POLICY "Authenticated users can read feedback"
  ON group_feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert feedback"
  ON group_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update feedback"
  ON group_feedback FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete feedback"
  ON group_feedback FOR DELETE
  TO authenticated
  USING (true);

-- Comments
COMMENT ON TABLE group_feedback IS 'Stores accept/reject decisions for AI learning';
COMMENT ON COLUMN group_feedback.films IS 'Array of films in the group (snapshot at feedback time)';
COMMENT ON COLUMN group_feedback.connection IS 'The connection text';
COMMENT ON COLUMN group_feedback.connection_type_id IS 'Reference to the connection type used';
COMMENT ON COLUMN group_feedback.accepted IS 'Whether the group was accepted (true) or rejected (false)';
COMMENT ON COLUMN group_feedback.rejection_reason IS 'Optional reason for rejection (for learning)';
COMMENT ON COLUMN group_feedback.generation_filters IS 'Filters used when this group was generated';
