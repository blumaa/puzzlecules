/**
 * Pipeline Generator
 *
 * Handles AI group generation for the pipeline.
 * Generates groups for specific colors when pool is low.
 */

import type { Genre } from '../../types';
import type { DifficultyColor } from '../../lib/supabase/storage/IGroupStorage';
import type { IGroupStorage, GroupInput } from '../../lib/supabase/storage/IGroupStorage';
import type {
  ConnectionType,
  GeneratedGroup,
  FeedbackRecord,
  GenerationFilters,
} from '../group-generator/types';
import type { IConnectionTypeStore, IFeedbackStore, IItemVerifier } from '../group-generator/types';

import type { Difficulty } from '../group-generator/types';
import type { DifficultyLevel } from '../../lib/supabase/storage/IGroupStorage';
import type { PipelineStageCallback } from './types';

/**
 * Difficulty mapping for colors
 * Note: AI uses 'expert' but storage uses 'hardest' for purple
 */
const COLOR_TO_AI_DIFFICULTY: Record<DifficultyColor, Difficulty> = {
  yellow: 'easy',
  green: 'medium',
  blue: 'hard',
  purple: 'expert',
};

const COLOR_TO_STORAGE_DIFFICULTY: Record<DifficultyColor, { level: DifficultyLevel; score: number }> = {
  yellow: { level: 'easy', score: 1 },
  green: { level: 'medium', score: 2 },
  blue: { level: 'hard', score: 3 },
  purple: { level: 'hardest', score: 4 },
};

/**
 * Result from generating groups for pipeline
 */
export interface PipelineGenerationResult {
  groupsGenerated: number;
  groupsSaved: number;
  errors: string[];
  byColor: Record<DifficultyColor, number>;
}

/**
 * Configuration for pipeline generation
 */
export interface PipelineGenerationConfig {
  genre: Genre;
  /** How many groups to generate per color that's low */
  groupsPerColor: number;
  /** Colors that need more groups */
  colorsNeeded: DifficultyColor[];
  /** API key for AI generation */
  apiKey: string;
  /** Optional callback for stage updates */
  onStageChange?: PipelineStageCallback;
}

/**
 * PipelineGenerator handles AI group generation for the pipeline.
 */
export class PipelineGenerator {
  constructor(
    private groupStorage: IGroupStorage,
    private connectionTypeStore: IConnectionTypeStore,
    private feedbackStore: IFeedbackStore,
    private itemVerifier: IItemVerifier,
    private generateGroupsFn: (
      apiKey: string,
      filters: GenerationFilters,
      connectionTypes: ConnectionType[],
      count: number,
      goodExamples: FeedbackRecord[],
      badExamples: FeedbackRecord[]
    ) => Promise<{ groups: GeneratedGroup[]; tokensUsed: { input: number | undefined; output: number | undefined } }>
  ) {}

  /**
   * Generate groups for colors that need them
   */
  async generateForPipeline(config: PipelineGenerationConfig): Promise<PipelineGenerationResult> {
    const result: PipelineGenerationResult = {
      groupsGenerated: 0,
      groupsSaved: 0,
      errors: [],
      byColor: { yellow: 0, green: 0, blue: 0, purple: 0 },
    };

    if (config.colorsNeeded.length === 0) {
      return result;
    }

    const reportStage = config.onStageChange ?? (() => {});

    try {
      // Get connection types for this genre
      const connectionTypes = await this.connectionTypeStore.getActive(config.genre);

      if (connectionTypes.length === 0) {
        result.errors.push('No active connection types found for genre');
        return result;
      }

      // Get feedback examples
      const [goodExamples, badExamples] = await Promise.all([
        this.feedbackStore.getAcceptedExamples(5, config.genre),
        this.feedbackStore.getRejectedExamples(5, config.genre),
      ]);

      // Get existing connections to exclude
      const existingGroups = await this.groupStorage.listGroups({
        genre: config.genre,
        limit: 1000,
      });
      const excludeConnections = existingGroups.groups.map((g) => g.connection);

      // Generate groups for each color needed
      for (const color of config.colorsNeeded) {
        // Report stage for this color
        reportStage(`generating-${color}` as const);

        try {
          const colorResult = await this.generateForColor(
            color,
            config,
            connectionTypes,
            goodExamples,
            badExamples,
            excludeConnections
          );

          result.groupsGenerated += colorResult.generated;
          result.groupsSaved += colorResult.saved;
          result.byColor[color] = colorResult.saved;

          if (colorResult.errors.length > 0) {
            result.errors.push(...colorResult.errors.map((e) => `[${color}] ${e}`));
          }

          // Add newly generated connections to exclude list
          excludeConnections.push(...colorResult.connections);
        } catch (error) {
          result.errors.push(
            `[${color}] ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Generate groups for a specific color
   */
  private async generateForColor(
    color: DifficultyColor,
    config: PipelineGenerationConfig,
    connectionTypes: ConnectionType[],
    goodExamples: FeedbackRecord[],
    badExamples: FeedbackRecord[],
    excludeConnections: string[]
  ): Promise<{ generated: number; saved: number; errors: string[]; connections: string[] }> {
    const errors: string[] = [];
    const savedConnections: string[] = [];

    // Build filters with target difficulty for this color
    const aiDifficulty = COLOR_TO_AI_DIFFICULTY[color];
    const storageDifficulty = COLOR_TO_STORAGE_DIFFICULTY[color];
    const filters: GenerationFilters = {
      genre: config.genre,
      excludeConnections,
      targetDifficulty: aiDifficulty,
    };

    // Generate groups via AI
    const { groups } = await this.generateGroupsFn(
      config.apiKey,
      filters,
      connectionTypes,
      config.groupsPerColor,
      goodExamples,
      badExamples
    );

    let saved = 0;

    // Process each generated group
    for (const group of groups) {
      try {
        // Verify items
        const verifiedItems = await this.itemVerifier.verifyItems(
          group.items.map((i) => ({ title: i.title, year: i.year }))
        );

        // Check if all items are verified
        const allVerified = verifiedItems.every((item) => item.verified && item.externalId !== null);

        if (!allVerified) {
          errors.push(`Group "${group.connection}" has unverified items, skipping`);
          continue;
        }

        // Create group input with color assignment (storageDifficulty defined above)
        const groupInput: GroupInput = {
          items: verifiedItems.map((item, index) => ({
            id: item.externalId ?? Date.now() + index,
            title: item.title,
            year: item.year,
          })),
          connection: group.connection,
          connectionType: group.connectionType,
          difficultyScore: storageDifficulty.score,
          color,
          difficulty: storageDifficulty.level,
          status: 'approved', // Auto-approve for pipeline
          genre: config.genre,
        };

        // Save to storage
        await this.groupStorage.saveGroup(groupInput);
        saved++;
        savedConnections.push(group.connection);
      } catch (error) {
        errors.push(
          `Failed to save group "${group.connection}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    return {
      generated: groups.length,
      saved,
      errors,
      connections: savedConnections,
    };
  }
}
