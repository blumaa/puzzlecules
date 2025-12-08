/**
 * Vercel API Route: Pipeline Fill
 *
 * Cron job endpoint that auto-fills the puzzle queue for a rolling 30-day window.
 * Uses the shared PipelineService to ensure consistent behavior with the UI.
 *
 * Called by Vercel Cron (configured in vercel.json).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types';
import { SupabaseStorage } from '../src/lib/supabase/storage/SupabaseStorage';
import { SupabaseGroupStorage } from '../src/lib/supabase/storage/SupabaseGroupStorage';
import { PipelineService } from '../src/services/pipeline/PipelineService';
import { PipelineConfigStore } from '../src/services/pipeline/PipelineConfigStore';
import { PipelineGenerator } from '../src/services/pipeline/PipelineGenerator';
import { ConnectionTypeStore } from '../src/services/group-generator/ConnectionTypeStore';
import { FeedbackStore } from '../src/services/group-generator/FeedbackStore';
import { createVerifier } from '../src/services/group-generator/verifiers/VerifierFactory';
import { generateGroupsV2 } from '../src/services/group-generator/generateGroupsV2';
import type { Genre } from '../src/types';

const GENRES: Genre[] = ['films', 'music'];

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

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  // Create storage instances
  const puzzleStorage = new SupabaseStorage(supabase);
  const groupStorage = new SupabaseGroupStorage(supabase);

  // Create config store
  const configStore = new PipelineConfigStore(supabase);

  // Create pipeline service
  const pipelineService = new PipelineService(puzzleStorage, groupStorage);

  const results: Record<Genre, { success: boolean; result?: unknown; error?: string }> = {
    films: { success: false },
    music: { success: false },
  };

  for (const genre of GENRES) {
    try {
      // Get pipeline config
      const config = await configStore.getConfig(genre);

      if (!config.enabled) {
        results[genre] = { success: true, result: { skipped: true, reason: 'Auto-fill disabled' } };
        continue;
      }

      // Create pipeline generator with genre-specific verifier
      const connectionTypeStore = new ConnectionTypeStore(supabase);
      const feedbackStore = new FeedbackStore(supabase);
      const itemVerifier = createVerifier(genre);

      const pipelineGenerator = new PipelineGenerator(
        groupStorage,
        connectionTypeStore,
        feedbackStore,
        itemVerifier,
        generateGroupsV2
      );

      // Set the generator on the service
      pipelineService.setGenerator(pipelineGenerator, anthropicApiKey);

      // Run the pipeline fill
      const fillResult = await pipelineService.fillRollingWindow(config);

      results[genre] = {
        success: true,
        result: fillResult,
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
