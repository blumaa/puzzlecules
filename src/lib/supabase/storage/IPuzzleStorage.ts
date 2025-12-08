/**
 * Puzzle Storage Interface
 *
 * Defines core CRUD operations for puzzle persistence.
 * Following Interface Segregation and Dependency Inversion principles.
 */

import type { SavedPuzzle, Group, Genre } from '../../../types';
import type { Database } from '../types';

/**
 * Puzzle status in the admin workflow
 */
export type PuzzleStatus = Database['public']['Tables']['puzzles']['Row']['status'];

/**
 * Puzzle source - indicates origin of the puzzle
 */
export type PuzzleSource = Database['public']['Tables']['puzzles']['Row']['source'];

/**
 * Input for creating a new puzzle (references group_ids)
 */
export interface PuzzleInput {
  groupIds: string[];
  title?: string | null;
  metadata?: Record<string, unknown>;
  /** Genre/domain for the puzzle */
  genre?: Genre;
}

/**
 * Stored puzzle with database fields.
 * Uses group_ids references instead of inline data.
 */
export interface StoredPuzzle {
  id: string;
  createdAt: number;
  puzzleDate: string | null;
  title: string | null;
  groupIds: string[];
  status: PuzzleStatus;
  metadata?: Record<string, unknown>;
  /** Genre/domain of the puzzle */
  genre: Genre;
  /** Source of the puzzle (system-created or user-submitted) */
  source: PuzzleSource;
  // Populated when fetched with groups
  groups?: Group[];
}

/**
 * Filters for listing puzzles
 */
export interface PuzzleListFilters {
  status?: PuzzleStatus | PuzzleStatus[];
  dateFrom?: string;
  dateTo?: string;
  /** Filter for puzzles with no scheduled date (puzzleDate IS NULL) */
  unscheduled?: boolean;
  /** Filter by genre/domain */
  genre?: Genre;
  /** Filter by puzzle source (system-created or user-submitted) */
  source?: PuzzleSource;
  limit?: number;
  offset?: number;
}

/**
 * Puzzle update payload (partial fields)
 */
export interface PuzzleUpdate {
  status?: PuzzleStatus;
  puzzleDate?: string | null;
  metadata?: Record<string, unknown>;
  /** Update the groups in a puzzle (for swapping) */
  groupIds?: string[];
  /** Update the puzzle title */
  title?: string | null;
}

/**
 * Result from listPuzzles query
 */
export interface PuzzleListResult {
  puzzles: StoredPuzzle[];
  total: number;
}

/**
 * Core puzzle storage interface.
 *
 * Handles CRUD operations for puzzles in Supabase.
 * Designed for use with TanStack Query for caching and optimistic updates.
 */
export interface IPuzzleStorage {
  /**
   * Save a new puzzle to storage.
   * The puzzle references group_ids from connection_groups table.
   *
   * @param puzzle - Puzzle input with group_ids
   * @returns Promise resolving to the saved puzzle with database fields
   */
  savePuzzle(puzzle: PuzzleInput): Promise<StoredPuzzle>;

  /**
   * Get a puzzle by its unique ID.
   * Returns puzzle with groups populated.
   *
   * @param id - Puzzle identifier
   * @returns Promise resolving to puzzle or null if not found
   */
  getPuzzle(id: string): Promise<StoredPuzzle | null>;

  /**
   * Get the published puzzle for a specific date and genre.
   * This is the primary method for loading daily puzzles (public access).
   * Returns assembled SavedPuzzle with groups data fetched from connection_groups.
   *
   * @param date - Date string (YYYY-MM-DD format)
   * @param genre - Genre/domain to filter by (defaults to 'films')
   * @returns Promise resolving to puzzle or null if no puzzle assigned to date
   */
  getDailyPuzzle(date: string, genre?: Genre): Promise<SavedPuzzle | null>;

  /**
   * List puzzles with optional filtering and pagination.
   * Used for admin puzzle queue and management.
   * Returns puzzles with groups populated for display.
   *
   * @param filters - Optional filters and pagination
   * @returns Promise resolving to paginated puzzle list
   */
  listPuzzles(filters?: PuzzleListFilters): Promise<PuzzleListResult>;

  /**
   * Update an existing puzzle.
   * Used for admin approval workflow and date assignment.
   *
   * @param id - Puzzle identifier
   * @param updates - Fields to update
   * @returns Promise resolving to updated puzzle
   */
  updatePuzzle(id: string, updates: PuzzleUpdate): Promise<StoredPuzzle>;

  /**
   * Delete a puzzle by ID.
   * Used for admin cleanup of rejected puzzles.
   *
   * @param id - Puzzle identifier
   * @returns Promise that resolves when deletion is complete
   */
  deletePuzzle(id: string): Promise<void>;

  /**
   * Get dates without scheduled puzzles within a date range.
   * Used by pipeline to find days that need puzzles.
   *
   * @param startDate - Start date (YYYY-MM-DD format)
   * @param endDate - End date (YYYY-MM-DD format)
   * @param genre - Genre/domain to filter by
   * @returns Promise resolving to array of date strings without puzzles
   */
  getEmptyDays(startDate: string, endDate: string, genre?: Genre): Promise<string[]>;

  /**
   * Check if a puzzle with the exact same group combination exists.
   * Used to ensure puzzle uniqueness (order-independent).
   *
   * @param groupIds - Array of 4 group IDs to check
   * @param genre - Genre/domain to filter by
   * @returns Promise resolving to true if combination exists
   */
  checkPuzzleExists(groupIds: string[], genre?: Genre): Promise<boolean>;

  /**
   * Batch update multiple puzzles at once.
   * Used for bulk operations like clearing selected dates.
   *
   * @param updates - Array of puzzle updates with IDs
   * @returns Promise that resolves when all updates complete
   */
  batchUpdatePuzzles(updates: Array<{ id: string; updates: PuzzleUpdate }>): Promise<void>;

  /**
   * Batch delete multiple puzzles at once.
   * Used for bulk delete operations.
   *
   * @param ids - Array of puzzle IDs to delete
   * @returns Promise that resolves when all deletes complete
   */
  batchDeletePuzzles(ids: string[]): Promise<void>;

  /**
   * Get all group IDs that are used in existing puzzles.
   * Used by pipeline to avoid reusing groups.
   *
   * @param genre - Genre/domain to filter by
   * @returns Promise resolving to Set of group IDs that are already used
   */
  getUsedGroupIds(genre?: Genre): Promise<Set<string>>;
}
