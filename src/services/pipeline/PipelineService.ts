/**
 * Pipeline Service
 *
 * Core service for automated puzzle generation and scheduling.
 * Fills a rolling 30-day window with puzzles, using approved groups
 * and triggering AI generation when the pool is low.
 */

import type { Genre } from '../../types';
import type { IPuzzleStorage, StoredPuzzle, PuzzleInput } from '../../lib/supabase/storage/IPuzzleStorage';
import type { IGroupStorage, FreshestGroupSet, DifficultyColor } from '../../lib/supabase/storage/IGroupStorage';
import type {
  PipelineConfig,
  PipelineFillResult,
  GroupAvailability,
  PipelineErrorCode,
  PipelineStageCallback,
} from './types';
import { DEFAULT_PIPELINE_CONFIG } from './types';
import type { PipelineGenerator } from './PipelineGenerator';

/**
 * PipelineService handles automated puzzle generation and scheduling.
 */
export class PipelineService {
  private generator: PipelineGenerator | null = null;
  private apiKey: string | null = null;

  constructor(
    private puzzleStorage: IPuzzleStorage,
    private groupStorage: IGroupStorage
  ) {}

  /**
   * Set the generator for AI group generation
   */
  setGenerator(generator: PipelineGenerator, apiKey: string): void {
    this.generator = generator;
    this.apiKey = apiKey;
  }

  /**
   * Get default configuration for a genre
   */
  getDefaultConfig(genre: Genre): PipelineConfig {
    return {
      ...DEFAULT_PIPELINE_CONFIG,
      genre,
    };
  }

  /**
   * Check pool health - count of approved groups per color
   */
  async checkPoolHealth(genre: Genre): Promise<GroupAvailability> {
    const counts = await this.groupStorage.getGroupCountsByColor(genre);
    const total = counts.yellow + counts.green + counts.blue + counts.purple;
    const minPerColor = Math.min(counts.yellow, counts.green, counts.blue, counts.purple);

    return {
      ...counts,
      total,
      sufficient: minPerColor >= 1, // At least one group per color
    };
  }

  /**
   * Get count of unused groups per color (not in any puzzle)
   */
  async getUnusedGroupCounts(genre: Genre): Promise<Record<DifficultyColor, number>> {
    const usedGroupIds = await this.puzzleStorage.getUsedGroupIds(genre);
    const allGroups = await this.groupStorage.listGroups({
      genre,
      status: 'approved',
      limit: 10000,
    });

    const counts: Record<DifficultyColor, number> = {
      yellow: 0,
      green: 0,
      blue: 0,
      purple: 0,
    };

    for (const group of allGroups.groups) {
      if (!usedGroupIds.has(group.id) && group.color) {
        counts[group.color]++;
      }
    }

    return counts;
  }

  /**
   * Determine which colors need more groups to fill the window
   */
  getColorsNeeded(
    unusedCounts: Record<DifficultyColor, number>,
    puzzlesNeeded: number
  ): DifficultyColor[] {
    const colors: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];
    return colors.filter((color) => unusedCounts[color] < puzzlesNeeded);
  }

  /**
   * Get empty dates in the rolling window
   */
  async getEmptyDates(genre: Genre, windowDays: number = 30): Promise<string[]> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + windowDays - 1);

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return this.puzzleStorage.getEmptyDays(startDateStr, endDateStr, genre);
  }

  /**
   * Get count of scheduled days in the rolling window
   */
  async getScheduledCount(genre: Genre, windowDays: number = 30): Promise<number> {
    const emptyDays = await this.getEmptyDates(genre, windowDays);
    return windowDays - emptyDays.length;
  }

  /**
   * Fill the rolling window with puzzles
   */
  async fillRollingWindow(
    config: PipelineConfig,
    onStageChange?: PipelineStageCallback
  ): Promise<PipelineFillResult> {
    const reportStage = onStageChange ?? (() => {});

    const result: PipelineFillResult = {
      puzzlesCreated: 0,
      emptyDaysRemaining: 0,
      aiGenerationTriggered: false,
      groupsGenerated: 0,
      errors: [],
    };

    try {
      reportStage('checking-pool');

      // Get empty dates
      const emptyDates = await this.getEmptyDates(config.genre, config.rollingWindowDays);

      if (emptyDates.length === 0) {
        reportStage('complete');
        return result; // Nothing to fill
      }

      // Check unused group counts per color
      const unusedCounts = await this.getUnusedGroupCounts(config.genre);
      const puzzlesNeeded = emptyDates.length;

      // Determine which colors need more groups
      const colorsNeeded = this.getColorsNeeded(unusedCounts, puzzlesNeeded);

      // If any colors need more groups, trigger AI generation
      if (colorsNeeded.length > 0 && this.generator && this.apiKey) {
        result.aiGenerationTriggered = true;

        // Calculate how many groups to generate per color (max 30 per API limit)
        const groupsPerColor = Math.min(
          30,
          Math.max(
            config.aiGenerationBatchSize,
            puzzlesNeeded - Math.min(...Object.values(unusedCounts)) + 5 // Add buffer
          )
        );

        const genResult = await this.generator.generateForPipeline({
          genre: config.genre,
          groupsPerColor,
          colorsNeeded,
          apiKey: this.apiKey,
          onStageChange: reportStage,
        });

        result.groupsGenerated = genResult.groupsSaved;

        if (genResult.errors.length > 0) {
          result.errors.push(
            ...genResult.errors.map((msg) => ({
              date: '',
              message: msg,
              code: 'GENERATION_FAILED' as const,
            }))
          );
        }
      } else if (colorsNeeded.length > 0) {
        // No generator configured, just report the shortage
        result.errors.push({
          date: '',
          message: `Insufficient groups for colors: ${colorsNeeded.join(', ')}. AI generation not configured.`,
          code: 'INSUFFICIENT_GROUPS',
        });
      }

      // Get all group IDs already used in existing puzzles
      const usedGroupIds = await this.puzzleStorage.getUsedGroupIds(config.genre);

      reportStage('creating-puzzles');

      // Fill each empty date
      for (const date of emptyDates) {
        try {
          const puzzle = await this.createPuzzleForDate(date, config.genre, usedGroupIds);

          if (puzzle) {
            result.puzzlesCreated++;
            // Add the puzzle's group IDs to the used set
            puzzle.groupIds.forEach((id) => usedGroupIds.add(id));
          } else {
            result.emptyDaysRemaining++;
            result.errors.push({
              date,
              message: 'Insufficient groups available',
              code: 'INSUFFICIENT_GROUPS',
            });
          }
        } catch (error) {
          result.emptyDaysRemaining++;
          result.errors.push({
            date,
            message: error instanceof Error ? error.message : 'Unknown error',
            code: this.getErrorCode(error),
          });
        }
      }

      reportStage('complete');
    } catch (error) {
      reportStage('error');
      throw error;
    }

    return result;
  }

  /**
   * Create a puzzle for a specific date
   */
  async createPuzzleForDate(
    date: string,
    genre: Genre,
    usedGroupIds: Set<string>
  ): Promise<StoredPuzzle | null> {
    const MAX_ATTEMPTS = 10;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Get freshest groups, excluding already-used ones
      const groupSet = await this.groupStorage.getFreshestGroupSet(
        [...usedGroupIds],
        genre
      );

      // Check all colors have groups
      if (!this.hasAllColors(groupSet)) {
        return null; // Not enough groups
      }

      const groupIds = [
        groupSet.yellow!.id,
        groupSet.green!.id,
        groupSet.blue!.id,
        groupSet.purple!.id,
      ];

      // Check uniqueness
      const exists = await this.puzzleStorage.checkPuzzleExists(groupIds, genre);

      if (!exists) {
        // Create the puzzle
        const puzzleInput: PuzzleInput = {
          groupIds,
          genre,
        };

        const puzzle = await this.puzzleStorage.savePuzzle(puzzleInput);

        // Schedule and publish
        const updatedPuzzle = await this.puzzleStorage.updatePuzzle(puzzle.id, {
          puzzleDate: date,
          status: 'published',
        });

        // Increment usage counts
        await this.groupStorage.incrementUsage(groupIds);

        return updatedPuzzle;
      }

      // Add these groups to exclusion set for next attempt
      groupIds.forEach((id) => usedGroupIds.add(id));
    }

    return null; // Failed to create unique puzzle after MAX_ATTEMPTS
  }

  /**
   * Check if a group set has all four colors
   */
  private hasAllColors(groupSet: FreshestGroupSet): boolean {
    return (
      groupSet.yellow !== null &&
      groupSet.green !== null &&
      groupSet.blue !== null &&
      groupSet.purple !== null
    );
  }

  /**
   * Get error code from an error
   */
  private getErrorCode(error: unknown): PipelineErrorCode {
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        return 'DUPLICATE_PUZZLE';
      }
      if (error.message.includes('generation')) {
        return 'GENERATION_FAILED';
      }
    }
    return 'STORAGE_ERROR';
  }
}
