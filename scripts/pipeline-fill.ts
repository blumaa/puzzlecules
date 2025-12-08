#!/usr/bin/env bun
/**
 * Pipeline Fill CLI Script
 *
 * Runs the puzzle auto-fill pipeline from the command line.
 * Used by GitHub Actions cron job to fill the calendar twice a month.
 *
 * Required environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ANTHROPIC_API_KEY
 * - TMDB_API_KEY (optional, for film verification)
 *
 * Usage:
 *   bun run scripts/pipeline-fill.ts
 */

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
import { GENRES, type Genre } from '../src/types';

async function main() {
  console.log('Starting pipeline fill...');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl) {
    console.error('Error: SUPABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!supabaseKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  if (!anthropicApiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
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

  // Initialize results for all genres
  const results = Object.fromEntries(
    GENRES.map((g) => [g, { success: false }])
  ) as Record<Genre, { success: boolean; result?: unknown; error?: string }>;

  for (const genre of GENRES) {
    console.log(`\nProcessing genre: ${genre}`);

    try {
      // Get pipeline config
      const config = await configStore.getConfig(genre);
      console.log(`  Config: enabled=${config.enabled}, rollingWindowDays=${config.rollingWindowDays}`);

      if (!config.enabled) {
        console.log(`  Skipping ${genre}: auto-fill is disabled`);
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
      console.log(`  Running pipeline fill for ${genre}...`);
      const fillResult = await pipelineService.fillRollingWindow(config);

      console.log(`  Result: ${fillResult.puzzlesCreated} puzzles created, ${fillResult.emptyDaysRemaining} empty days remaining`);
      if (fillResult.aiGenerationTriggered) {
        console.log(`  AI generation: ${fillResult.groupsGenerated} groups generated, ${fillResult.groupsSaved} saved`);
      }
      if (fillResult.errors.length > 0) {
        console.log(`  Errors: ${fillResult.errors.length}`);
        fillResult.errors.forEach((err) => console.log(`    - ${err.message}`));
      }

      results[genre] = {
        success: true,
        result: fillResult,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`  Error processing ${genre}: ${errorMessage}`);
      results[genre] = {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  const allSuccess = Object.values(results).every((r) => r.success);

  for (const [genre, result] of Object.entries(results)) {
    const status = result.success ? 'SUCCESS' : 'FAILED';
    console.log(`${genre}: ${status}`);
  }

  console.log(`\nOverall: ${allSuccess ? 'SUCCESS' : 'PARTIAL FAILURE'}`);

  // Exit with appropriate code
  process.exit(allSuccess ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
