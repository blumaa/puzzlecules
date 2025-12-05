/**
 * Vercel API Route: Pipeline Fill
 *
 * Cron job endpoint that auto-fills the puzzle queue for a rolling 30-day window.
 * Triggers AI group generation when the pool is low.
 *
 * Called by Vercel Cron (configured in vercel.json).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types';
import type { Genre } from '../src/types';
import { PipelineService } from '../src/services/pipeline/PipelineService';
import { PipelineGenerator } from '../src/services/pipeline/PipelineGenerator';
import { PipelineConfigStore } from '../src/services/pipeline/PipelineConfigStore';
import { SupabaseStorage } from '../src/lib/supabase/storage/SupabaseStorage';
import { SupabaseGroupStorage } from '../src/lib/supabase/storage/SupabaseGroupStorage';
import { ConnectionTypeStore } from '../src/services/group-generator/ConnectionTypeStore';
import { FeedbackStore } from '../src/services/group-generator/FeedbackStore';
import { createVerifier } from '../src/services/group-generator/verifiers/VerifierFactory';
import { generateGroupsV2 } from '../src/services/group-generator/generateGroupsV2';

// Supported genres to process
const GENRES: Genre[] = ['films', 'music'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET (for cron) or POST (for manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret for security (Vercel sends this header for cron jobs)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get required environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  if (!anthropicApiKey) {
    console.error('ANTHROPIC_API_KEY not configured');
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  // Create storage instances
  const puzzleStorage = new SupabaseStorage(supabase);
  const groupStorage = new SupabaseGroupStorage(supabase);
  const configStore = new PipelineConfigStore(supabase);
  const connectionTypeStore = new ConnectionTypeStore();
  const feedbackStore = new FeedbackStore();

  const results: Record<Genre, { success: boolean; result?: unknown; error?: string }> = {
    films: { success: false },
    music: { success: false },
  };

  // Process each genre
  for (const genre of GENRES) {
    try {
      // Get pipeline config for this genre
      const config = await configStore.getConfig(genre);

      // Skip if auto-fill is not enabled for this genre
      if (!config.enabled) {
        results[genre] = { success: true, result: { skipped: true, reason: 'Auto-fill disabled' } };
        continue;
      }

      // Create service and generator
      const service = new PipelineService(puzzleStorage, groupStorage);
      const itemVerifier = createVerifier(genre);
      const generator = new PipelineGenerator(
        groupStorage,
        connectionTypeStore,
        feedbackStore,
        itemVerifier,
        generateGroupsV2
      );
      service.setGenerator(generator, anthropicApiKey);

      // Run the pipeline fill
      const fillResult = await service.fillRollingWindow(config);

      results[genre] = {
        success: true,
        result: {
          puzzlesCreated: fillResult.puzzlesCreated,
          emptyDaysRemaining: fillResult.emptyDaysRemaining,
          aiGenerationTriggered: fillResult.aiGenerationTriggered,
          groupsGenerated: fillResult.groupsGenerated,
          errors: fillResult.errors.length > 0 ? fillResult.errors : undefined,
        },
      };

      console.log(`Pipeline fill for ${genre}:`, results[genre].result);
    } catch (error) {
      console.error(`Pipeline fill error for ${genre}:`, error);
      results[genre] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Return combined results
  const allSuccess = Object.values(results).every((r) => r.success);
  return res.status(allSuccess ? 200 : 207).json({
    timestamp: new Date().toISOString(),
    results,
  });
}
