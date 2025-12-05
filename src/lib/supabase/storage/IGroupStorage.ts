/**
 * Group Storage Interface
 *
 * Defines core CRUD operations for connection group persistence.
 * Following Interface Segregation and Dependency Inversion principles.
 */

import type { Item, Genre } from '../../../types';
import type { Database } from '../types';

/**
 * Group status in the admin workflow
 */
export type GroupStatus = Database['public']['Tables']['connection_groups']['Row']['status'];

/**
 * Difficulty color (corresponds to difficulty level)
 */
export type DifficultyColor = 'yellow' | 'green' | 'blue' | 'purple';

/**
 * Difficulty level
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'hardest';

/**
 * Stored group with database fields.
 */
export interface StoredGroup {
  id: string;
  createdAt: number;
  items: Item[];
  connection: string;
  connectionType: string;
  difficultyScore: number;
  color: DifficultyColor | null;
  difficulty: DifficultyLevel | null;
  status: GroupStatus;
  usageCount: number;
  lastUsedAt: number | null;
  metadata?: Record<string, unknown>;
  /** Genre/domain this group belongs to */
  genre: Genre;
}

/**
 * Input for saving a new group (without auto-generated fields)
 */
export type GroupInput = Omit<StoredGroup, 'id' | 'createdAt' | 'usageCount' | 'lastUsedAt'>;

/**
 * Filters for listing groups
 */
export interface GroupListFilters {
  status?: GroupStatus | GroupStatus[];
  color?: DifficultyColor | DifficultyColor[];
  connectionType?: string;
  /** Filter by genre/domain */
  genre?: Genre;
  limit?: number;
  offset?: number;
  /** Exclude specific group IDs from results */
  excludeIds?: string[];
  /** Sort by freshness (usage_count ASC, last_used_at ASC NULLS FIRST) */
  sortByFreshness?: boolean;
}

/**
 * Group counts by difficulty color
 */
export type GroupCountsByColor = Record<DifficultyColor, number>;

/**
 * Result from getFreshestGroupSet - one group per color
 */
export interface FreshestGroupSet {
  yellow: StoredGroup | null;
  green: StoredGroup | null;
  blue: StoredGroup | null;
  purple: StoredGroup | null;
}

/**
 * Group update payload (partial fields)
 */
export interface GroupUpdate {
  connection?: string;
  color?: DifficultyColor;
  difficulty?: DifficultyLevel;
  status?: GroupStatus;
  metadata?: Record<string, unknown>;
  /** Update genre (rare, but possible) */
  genre?: Genre;
}

/**
 * Result from listGroups query
 */
export interface GroupListResult {
  groups: StoredGroup[];
  total: number;
}

/**
 * Core group storage interface.
 *
 * Handles CRUD operations for connection groups in Supabase.
 * Designed for use with TanStack Query for caching and optimistic updates.
 */
export interface IGroupStorage {
  /**
   * Save a single group to storage.
   *
   * @param group - Group to save
   * @returns Promise resolving to the saved group with database fields
   */
  saveGroup(group: GroupInput): Promise<StoredGroup>;

  /**
   * Save multiple groups in a single batch operation.
   *
   * @param groups - Array of groups to save
   * @returns Promise resolving to array of saved groups
   */
  saveBatch(groups: GroupInput[]): Promise<StoredGroup[]>;

  /**
   * Get a group by its unique ID.
   *
   * @param id - Group identifier
   * @returns Promise resolving to group or null if not found
   */
  getGroup(id: string): Promise<StoredGroup | null>;

  /**
   * Get multiple groups by their IDs.
   *
   * @param ids - Array of group identifiers
   * @returns Promise resolving to array of groups (in same order as input)
   */
  getGroupsByIds(ids: string[]): Promise<StoredGroup[]>;

  /**
   * List groups with optional filtering and pagination.
   *
   * @param filters - Optional filters and pagination
   * @returns Promise resolving to paginated group list
   */
  listGroups(filters?: GroupListFilters): Promise<GroupListResult>;

  /**
   * Update an existing group.
   *
   * @param id - Group identifier
   * @param updates - Fields to update
   * @returns Promise resolving to updated group
   */
  updateGroup(id: string, updates: GroupUpdate): Promise<StoredGroup>;

  /**
   * Delete a group by ID.
   *
   * @param id - Group identifier
   * @returns Promise that resolves when deletion is complete
   */
  deleteGroup(id: string): Promise<void>;

  /**
   * Increment usage count for groups when used in a puzzle.
   *
   * @param groupIds - Array of group IDs to increment
   * @returns Promise that resolves when update is complete
   */
  incrementUsage(groupIds: string[]): Promise<void>;

  /**
   * Get count of approved groups per difficulty color.
   * Used to check pool health before pipeline operations.
   *
   * @param genre - Genre/domain to filter by
   * @returns Promise resolving to counts per color
   */
  getGroupCountsByColor(genre?: Genre): Promise<GroupCountsByColor>;

  /**
   * Get the freshest (least used) approved group for each color.
   * Used by pipeline to select groups for new puzzles.
   *
   * @param excludeIds - Group IDs to exclude (already used in other puzzles)
   * @param genre - Genre/domain to filter by
   * @returns Promise resolving to one group per color (or null if none available)
   */
  getFreshestGroupSet(excludeIds: string[], genre?: Genre): Promise<FreshestGroupSet>;
}
