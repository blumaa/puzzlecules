/**
 * Pipeline Config Store
 *
 * Manages pipeline configuration in Supabase database.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/supabase/types';
import type { Genre } from '../../types';
import type { PipelineConfig } from './types';
import { DEFAULT_PIPELINE_CONFIG } from './types';

/**
 * Database row type for pipeline_config table
 */
interface DbPipelineConfigRow {
  id: string;
  created_at: string;
  updated_at: string;
  genre: string;
  enabled: boolean;
  rolling_window_days: number;
  min_groups_per_color: number;
  ai_generation_batch_size: number;
}

/**
 * PipelineConfigStore handles CRUD operations for pipeline configuration.
 */
export class PipelineConfigStore {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Convert database row to PipelineConfig
   */
  private rowToConfig(row: DbPipelineConfigRow): PipelineConfig {
    return {
      enabled: row.enabled,
      rollingWindowDays: row.rolling_window_days,
      genre: row.genre as Genre,
      minGroupsPerColor: row.min_groups_per_color,
      aiGenerationBatchSize: row.ai_generation_batch_size,
    };
  }

  /**
   * Get pipeline configuration for a genre.
   * Returns default config if none exists.
   */
  async getConfig(genre: Genre): Promise<PipelineConfig> {
    const { data, error } = await this.supabase
      .from('pipeline_config')
      .select('*')
      .eq('genre', genre)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get pipeline config: ${error.message}`);
    }

    if (!data) {
      // Return default config if none exists
      return {
        ...DEFAULT_PIPELINE_CONFIG,
        genre,
      };
    }

    return this.rowToConfig(data as unknown as DbPipelineConfigRow);
  }

  /**
   * Update pipeline configuration for a genre.
   * Creates the config if it doesn't exist.
   */
  async updateConfig(
    genre: Genre,
    updates: Partial<Omit<PipelineConfig, 'genre'>>
  ): Promise<PipelineConfig> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.enabled !== undefined) {
      dbUpdates.enabled = updates.enabled;
    }
    if (updates.rollingWindowDays !== undefined) {
      dbUpdates.rolling_window_days = updates.rollingWindowDays;
    }
    if (updates.minGroupsPerColor !== undefined) {
      dbUpdates.min_groups_per_color = updates.minGroupsPerColor;
    }
    if (updates.aiGenerationBatchSize !== undefined) {
      dbUpdates.ai_generation_batch_size = updates.aiGenerationBatchSize;
    }

    // Use upsert to create or update
    const { data, error } = await this.supabase
      .from('pipeline_config')
      .upsert(
        {
          genre,
          ...dbUpdates,
        } as never,
        {
          onConflict: 'genre',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pipeline config: ${error.message}`);
    }

    return this.rowToConfig(data as unknown as DbPipelineConfigRow);
  }

  /**
   * Reset pipeline configuration to defaults for a genre.
   */
  async resetToDefaults(genre: Genre): Promise<PipelineConfig> {
    return this.updateConfig(genre, DEFAULT_PIPELINE_CONFIG);
  }

  /**
   * Toggle the enabled state for a genre.
   */
  async toggleEnabled(genre: Genre): Promise<PipelineConfig> {
    const current = await this.getConfig(genre);
    return this.updateConfig(genre, { enabled: !current.enabled });
  }
}
