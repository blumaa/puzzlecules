-- Insert test music puzzle for today
-- First create connection_groups, then create puzzle referencing them

-- Create test music groups
INSERT INTO connection_groups (id, films, connection, connection_type, difficulty, color, status, genre, difficulty_score)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '[{"id":1,"title":"Test Song 1 - Artist A","year":2020},{"id":2,"title":"Test Song 2 - Artist A","year":2020},{"id":3,"title":"Test Song 3 - Artist A","year":2020},{"id":4,"title":"Test Song 4 - Artist A","year":2020}]'::jsonb,
    'Songs by Artist A (Easy)',
    'Songs by a specific artist',
    'easy',
    'yellow',
    'approved',
    'music',
    25.0
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    '[{"id":5,"title":"Test Song 1 - Artist B","year":2021},{"id":6,"title":"Test Song 2 - Artist B","year":2021},{"id":7,"title":"Test Song 3 - Artist B","year":2021},{"id":8,"title":"Test Song 4 - Artist B","year":2021}]'::jsonb,
    'Songs by Artist B (Medium)',
    'Songs by a specific artist',
    'medium',
    'green',
    'approved',
    'music',
    50.0
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    '[{"id":9,"title":"Test Song 1 - Artist C","year":2022},{"id":10,"title":"Test Song 2 - Artist C","year":2022},{"id":11,"title":"Test Song 3 - Artist C","year":2022},{"id":12,"title":"Test Song 4 - Artist C","year":2022}]'::jsonb,
    'Songs by Artist C (Hard)',
    'Songs by a specific artist',
    'hard',
    'blue',
    'approved',
    'music',
    75.0
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    '[{"id":13,"title":"Test Song 1 - Artist D","year":2023},{"id":14,"title":"Test Song 2 - Artist D","year":2023},{"id":15,"title":"Test Song 3 - Artist D","year":2023},{"id":16,"title":"Test Song 4 - Artist D","year":2023}]'::jsonb,
    'Songs by Artist D (Hardest)',
    'Songs by a specific artist',
    'hardest',
    'purple',
    'approved',
    'music',
    100.0
  );

-- Create test music puzzle for today referencing those groups
INSERT INTO puzzles (
  id,
  puzzle_date,
  title,
  group_ids,
  groups,
  status,
  metadata,
  genre
)
VALUES (
  'e5555555-5555-5555-5555-555555555555',
  CURRENT_DATE,
  'Test Music Puzzle',
  ARRAY[
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'b2222222-2222-2222-2222-222222222222'::uuid,
    'c3333333-3333-3333-3333-333333333333'::uuid,
    'd4444444-4444-4444-4444-444444444444'::uuid
  ],
  '[
    {"id":"a1111111-1111-1111-1111-111111111111","films":[{"id":1,"title":"Test Song 1 - Artist A","year":2020},{"id":2,"title":"Test Song 2 - Artist A","year":2020},{"id":3,"title":"Test Song 3 - Artist A","year":2020},{"id":4,"title":"Test Song 4 - Artist A","year":2020}],"connection":"Songs by Artist A (Easy)","difficulty":"easy","color":"yellow"},
    {"id":"b2222222-2222-2222-2222-222222222222","films":[{"id":5,"title":"Test Song 1 - Artist B","year":2021},{"id":6,"title":"Test Song 2 - Artist B","year":2021},{"id":7,"title":"Test Song 3 - Artist B","year":2021},{"id":8,"title":"Test Song 4 - Artist B","year":2021}],"connection":"Songs by Artist B (Medium)","difficulty":"medium","color":"green"},
    {"id":"c3333333-3333-3333-3333-333333333333","films":[{"id":9,"title":"Test Song 1 - Artist C","year":2022},{"id":10,"title":"Test Song 2 - Artist C","year":2022},{"id":11,"title":"Test Song 3 - Artist C","year":2022},{"id":12,"title":"Test Song 4 - Artist C","year":2022}],"connection":"Songs by Artist C (Hard)","difficulty":"hard","color":"blue"},
    {"id":"d4444444-4444-4444-4444-444444444444","films":[{"id":13,"title":"Test Song 1 - Artist D","year":2023},{"id":14,"title":"Test Song 2 - Artist D","year":2023},{"id":15,"title":"Test Song 3 - Artist D","year":2023},{"id":16,"title":"Test Song 4 - Artist D","year":2023}],"connection":"Songs by Artist D (Hardest)","difficulty":"hardest","color":"purple"}
  ]'::jsonb,
  'published',
  '{"generatedBy": "test-script", "testPuzzle": true}'::jsonb,
  'music'
);
