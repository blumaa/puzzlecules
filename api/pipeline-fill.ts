/**
 * Vercel API Route: Pipeline Fill
 *
 * Cron job endpoint that auto-fills the puzzle queue for a rolling 30-day window.
 * This is a simplified version that directly queries Supabase and calls the
 * generate-groups-v2 endpoint for AI generation.
 *
 * Called by Vercel Cron (configured in vercel.json).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// Types
type Genre = 'films' | 'music';
type DifficultyColor = 'yellow' | 'green' | 'blue' | 'purple';
type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'hardest';

interface PipelineConfig {
  enabled: boolean;
  rollingWindowDays: number;
  genre: Genre;
  minGroupsPerColor: number;
  aiGenerationBatchSize: number;
}

interface Item {
  id: number;
  title: string;
  year: number;
}

interface StoredGroup {
  id: string;
  items: Item[];
  connection: string;
  connectionType: string;
  color: DifficultyColor | null;
  difficulty: DifficultyLevel | null;
  difficultyScore: number;
  status: string;
}

interface ConnectionType {
  id: string;
  name: string;
  category: string;
  description: string;
  examples?: string[];
  genre: Genre;
}

// Constants
const GENRES: Genre[] = ['films', 'music'];
const COLORS: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];

const DEFAULT_CONFIG: Omit<PipelineConfig, 'genre'> = {
  enabled: false,
  rollingWindowDays: 30,
  minGroupsPerColor: 10,
  aiGenerationBatchSize: 20,
};

const COLOR_TO_DIFFICULTY: Record<DifficultyColor, { level: DifficultyLevel; score: number }> = {
  yellow: { level: 'easy', score: 1 },
  green: { level: 'medium', score: 2 },
  blue: { level: 'hard', score: 3 },
  purple: { level: 'hardest', score: 4 },
};

// Helper functions
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(windowDays: number): { start: string; end: string } {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + windowDays - 1);
  return {
    start: getDateString(today),
    end: getDateString(end),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET (for cron) or POST (for manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  if (!anthropicApiKey) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  const results: Record<Genre, { success: boolean; result?: unknown; error?: string }> = {
    films: { success: false },
    music: { success: false },
  };

  for (const genre of GENRES) {
    try {
      // Get pipeline config
      const { data: configData } = await supabase
        .from('pipeline_config')
        .select('*')
        .eq('genre', genre)
        .maybeSingle();

      const config: PipelineConfig = configData
        ? {
            enabled: configData.enabled,
            rollingWindowDays: configData.rolling_window_days,
            genre: configData.genre as Genre,
            minGroupsPerColor: configData.min_groups_per_color,
            aiGenerationBatchSize: configData.ai_generation_batch_size,
          }
        : { ...DEFAULT_CONFIG, genre };

      if (!config.enabled) {
        results[genre] = { success: true, result: { skipped: true, reason: 'Auto-fill disabled' } };
        continue;
      }

      // Get empty dates
      const { start, end } = getDateRange(config.rollingWindowDays);
      const { data: scheduledPuzzles } = await supabase
        .from('puzzles')
        .select('puzzle_date')
        .eq('genre', genre)
        .gte('puzzle_date', start)
        .lte('puzzle_date', end)
        .not('puzzle_date', 'is', null);

      const scheduledDates = new Set((scheduledPuzzles || []).map((p) => p.puzzle_date));
      const emptyDates: string[] = [];

      for (let i = 0; i < config.rollingWindowDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = getDateString(date);
        if (!scheduledDates.has(dateStr)) {
          emptyDates.push(dateStr);
        }
      }

      if (emptyDates.length === 0) {
        results[genre] = { success: true, result: { puzzlesCreated: 0, message: 'All days scheduled' } };
        continue;
      }

      // Get used group IDs
      const { data: allPuzzles } = await supabase
        .from('puzzles')
        .select('group_ids')
        .eq('genre', genre);

      const usedGroupIds = new Set<string>();
      (allPuzzles || []).forEach((p) => {
        (p.group_ids || []).forEach((id: string) => usedGroupIds.add(id));
      });

      // Get unused group counts per color
      const unusedCounts: Record<DifficultyColor, number> = { yellow: 0, green: 0, blue: 0, purple: 0 };

      for (const color of COLORS) {
        const { count } = await supabase
          .from('connection_groups')
          .select('id', { count: 'exact', head: true })
          .eq('genre', genre)
          .eq('status', 'approved')
          .eq('color', color);

        // Get groups and filter out used ones
        const { data: groups } = await supabase
          .from('connection_groups')
          .select('id')
          .eq('genre', genre)
          .eq('status', 'approved')
          .eq('color', color);

        const unused = (groups || []).filter((g) => !usedGroupIds.has(g.id));
        unusedCounts[color] = unused.length;
      }

      // Check which colors need generation
      const colorsNeeded = COLORS.filter((c) => unusedCounts[c] < emptyDates.length);
      let groupsGenerated = 0;

      if (colorsNeeded.length > 0) {
        // Get connection types for this genre
        const { data: connectionTypes } = await supabase
          .from('connection_types')
          .select('*')
          .eq('genre', genre)
          .eq('active', true);

        if (connectionTypes && connectionTypes.length > 0) {
          // Get existing connections to avoid duplicates
          const { data: existingGroups } = await supabase
            .from('connection_groups')
            .select('connection')
            .eq('genre', genre);

          const existingConnections = (existingGroups || []).map((g) => g.connection);

          // Generate groups for each color needed
          for (const color of colorsNeeded) {
            const difficultyInfo = COLOR_TO_DIFFICULTY[color];
            const count = Math.min(30, config.aiGenerationBatchSize);

            try {
              // Call Claude to generate groups
              const prompt = buildGenerationPrompt(
                genre,
                connectionTypes as ConnectionType[],
                existingConnections,
                difficultyInfo.level,
                count
              );

              const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
              });

              const content = response.content[0];
              if (content.type === 'text') {
                const groups = parseGeneratedGroups(content.text);

                // Save groups
                for (const group of groups) {
                  try {
                    // Verify items exist (simplified - just save without verification for now)
                    const groupInput = {
                      items: group.items,
                      connection: group.connection,
                      connection_type: group.connectionType,
                      difficulty_score: difficultyInfo.score,
                      color,
                      difficulty: difficultyInfo.level,
                      status: 'approved',
                      genre,
                    };

                    await supabase.from('connection_groups').insert(groupInput);
                    groupsGenerated++;
                    existingConnections.push(group.connection);
                  } catch {
                    // Skip duplicates
                  }
                }
              }
            } catch (err) {
              console.error(`Error generating ${color} groups:`, err);
            }
          }
        }
      }

      // Create puzzles for empty dates
      let puzzlesCreated = 0;

      for (const date of emptyDates) {
        // Get freshest group per color
        const groupSet: Record<DifficultyColor, StoredGroup | null> = {
          yellow: null,
          green: null,
          blue: null,
          purple: null,
        };

        for (const color of COLORS) {
          const { data } = await supabase
            .from('connection_groups')
            .select('*')
            .eq('genre', genre)
            .eq('status', 'approved')
            .eq('color', color)
            .order('usage_count', { ascending: true })
            .order('last_used_at', { ascending: true, nullsFirst: true })
            .limit(1);

          if (data && data.length > 0) {
            const row = data[0];
            if (!usedGroupIds.has(row.id)) {
              groupSet[color] = {
                id: row.id,
                items: row.items as Item[],
                connection: row.connection,
                connectionType: row.connection_type,
                color: row.color as DifficultyColor,
                difficulty: row.difficulty as DifficultyLevel,
                difficultyScore: row.difficulty_score,
                status: row.status,
              };
            }
          }
        }

        // Check if we have all colors
        if (!groupSet.yellow || !groupSet.green || !groupSet.blue || !groupSet.purple) {
          continue;
        }

        const groupIds = [groupSet.yellow.id, groupSet.green.id, groupSet.blue.id, groupSet.purple.id];

        // Check uniqueness
        const { data: existing } = await supabase
          .from('puzzles')
          .select('id')
          .eq('genre', genre)
          .contains('group_ids', groupIds);

        if (existing && existing.length > 0) {
          groupIds.forEach((id) => usedGroupIds.add(id));
          continue;
        }

        // Create puzzle
        const { error: insertError } = await supabase.from('puzzles').insert({
          group_ids: groupIds,
          genre,
          puzzle_date: date,
          status: 'published',
        });

        if (!insertError) {
          puzzlesCreated++;
          groupIds.forEach((id) => usedGroupIds.add(id));

          // Increment usage counts
          await supabase.rpc('increment_group_usage', { group_ids: groupIds });
        }
      }

      results[genre] = {
        success: true,
        result: {
          puzzlesCreated,
          emptyDaysRemaining: emptyDates.length - puzzlesCreated,
          groupsGenerated,
        },
      };
    } catch (error) {
      console.error(`Pipeline error for ${genre}:`, error);
      results[genre] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  const allSuccess = Object.values(results).every((r) => r.success);
  return res.status(allSuccess ? 200 : 207).json({
    timestamp: new Date().toISOString(),
    results,
  });
}

function buildGenerationPrompt(
  genre: Genre,
  connectionTypes: ConnectionType[],
  existingConnections: string[],
  difficulty: string,
  count: number
): string {
  const typesList = connectionTypes
    .map((t) => `- ${t.name}: ${t.description}`)
    .join('\n');

  const excludeList = existingConnections.slice(-100).join(', ');

  return `Generate ${count} ${genre} connection groups for a puzzle game.

Each group should have:
- 4 ${genre === 'films' ? 'films' : 'songs'} that share a connection
- A concise connection phrase (the answer players guess)
- The connection type category

Difficulty: ${difficulty}

Available connection types:
${typesList}

Avoid these existing connections: ${excludeList}

Return as JSON array:
[
  {
    "items": [
      {"title": "Title 1", "year": 1999},
      {"title": "Title 2", "year": 2001},
      {"title": "Title 3", "year": 2005},
      {"title": "Title 4", "year": 2010}
    ],
    "connection": "The connection phrase",
    "connectionType": "Type name"
  }
]

Return ONLY the JSON array, no other text.`;
}

function parseGeneratedGroups(text: string): Array<{
  items: Item[];
  connection: string;
  connectionType: string;
}> {
  try {
    // Find JSON array in response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]);
    return parsed.map((g: { items: Array<{ title: string; year: number }>; connection: string; connectionType: string }, i: number) => ({
      items: g.items.map((item: { title: string; year: number }, j: number) => ({
        id: Date.now() + i * 10 + j,
        title: item.title,
        year: item.year,
      })),
      connection: g.connection,
      connectionType: g.connectionType,
    }));
  } catch {
    return [];
  }
}
