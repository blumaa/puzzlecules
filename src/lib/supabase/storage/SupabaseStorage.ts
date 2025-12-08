/**
 * Supabase Storage Implementation
 *
 * Implements IPuzzleStorage interface using Supabase as the backend.
 * Handles conversion between application types and database schema.
 *
 * Puzzles now reference connection_groups via group_ids array.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { SavedPuzzle, Group, Item, Genre } from '../../../types';
import type {
  IPuzzleStorage,
  StoredPuzzle,
  PuzzleInput,
  PuzzleListFilters,
  PuzzleListResult,
  PuzzleUpdate,
} from './IPuzzleStorage';
import type { DifficultyColor, DifficultyLevel } from './IGroupStorage';

type DbPuzzleRow = Database['public']['Tables']['puzzles']['Row'] & {
  groups?: unknown; // JSONB column for group snapshot
};
type DbPuzzleInsert = Database['public']['Tables']['puzzles']['Insert'];
type DbGroupRow = Database['public']['Tables']['connection_groups']['Row'];

/**
 * SupabaseStorage implementation.
 *
 * Provides CRUD operations for puzzles using Supabase PostgreSQL backend.
 * Uses Row Level Security for access control.
 */
export class SupabaseStorage implements IPuzzleStorage {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Convert database row to StoredPuzzle
   * Includes inline groups from JSON column if present (used by user submissions)
   */
  private rowToStoredPuzzle(row: DbPuzzleRow): StoredPuzzle {
    return {
      id: row.id,
      createdAt: new Date(row.created_at).getTime(),
      puzzleDate: row.puzzle_date,
      title: row.title,
      groupIds: row.group_ids,
      groups: row.groups ? (row.groups as unknown as Group[]) : undefined,
      status: row.status,
      metadata: row.metadata as Record<string, unknown> | undefined,
      genre: ((row as { genre?: string }).genre || 'films') as Genre,
      source: ((row as { source?: string }).source || 'system') as 'system' | 'user',
    };
  }

  /**
   * Convert database group row to Group type for game use
   */
  private dbGroupToGroup(row: DbGroupRow): Group {
    return {
      id: row.id,
      items: row.items as unknown as Item[],
      connection: row.connection,
      difficulty: (row.difficulty || 'medium') as DifficultyLevel,
      color: (row.color || 'green') as DifficultyColor,
    };
  }

  /**
   * Fetch groups by IDs and return them in order
   */
  private async fetchGroupsByIds(groupIds: string[]): Promise<Group[]> {
    if (groupIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('connection_groups')
      .select()
      .in('id', groupIds);

    if (error) {
      throw new Error(`Failed to fetch groups: ${error.message}`);
    }

    // Reorder results to match input order
    const groupMap = new Map(data.map((row: DbGroupRow) => [row.id, row]));
    return groupIds
      .map((id) => groupMap.get(id))
      .filter((row): row is DbGroupRow => row !== undefined)
      .map((row: DbGroupRow) => this.dbGroupToGroup(row));
  }

  async savePuzzle(puzzle: PuzzleInput): Promise<StoredPuzzle> {
    const insert: DbPuzzleInsert & { genre?: string } = {
      group_ids: puzzle.groupIds,
      title: puzzle.title ?? null,
      status: 'pending',
      metadata: puzzle.metadata as DbPuzzleInsert['metadata'],
      genre: puzzle.genre || 'films',
    };

    const { data, error } = await this.supabase
      .from('puzzles')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save puzzle: ${error.message}`);
    }

    return this.rowToStoredPuzzle(data);
  }

  async getPuzzle(id: string): Promise<StoredPuzzle | null> {
    const { data, error } = await this.supabase
      .from('puzzles')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get puzzle: ${error.message}`);
    }

    const puzzle = this.rowToStoredPuzzle(data);

    // Fetch and populate groups
    puzzle.groups = await this.fetchGroupsByIds(puzzle.groupIds);

    return puzzle;
  }

  async getDailyPuzzle(date: string, genre: Genre = 'films'): Promise<SavedPuzzle | null> {
    let query = this.supabase
      .from('puzzles')
      .select()
      .eq('puzzle_date', date)
      .eq('status', 'published')
      .eq('genre', genre);

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to get daily puzzle: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Cast to DbPuzzleRow for type safety
    const row = data as DbPuzzleRow;

    // Use snapshot if available (published puzzles), otherwise fetch from connection_groups
    // The snapshot makes the puzzle self-contained for anonymous users
    const groups: Group[] = row.groups
      ? (row.groups as unknown as Group[])
      : await this.fetchGroupsByIds(row.group_ids);

    // Extract all items from groups
    const items = groups.flatMap((group) => group.items);

    // Return assembled SavedPuzzle
    return {
      id: row.id,
      groups,
      items,
      createdAt: new Date(row.created_at).getTime(),
      metadata: row.metadata as Record<string, unknown> | undefined,
    };
  }

  async listPuzzles(filters?: PuzzleListFilters): Promise<PuzzleListResult> {
    let query = this.supabase.from('puzzles').select('*', { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.dateFrom) {
      query = query.gte('puzzle_date', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('puzzle_date', filters.dateTo);
    }

    if (filters?.unscheduled) {
      query = query.is('puzzle_date', null);
    }

    if (filters?.genre) {
      query = query.eq('genre', filters.genre);
    }

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list puzzles: ${error.message}`);
    }

    // Convert rows to StoredPuzzle
    const puzzles = data.map((row) => this.rowToStoredPuzzle(row));

    // Fetch groups for puzzles that don't have inline groups (i.e., system puzzles with groupIds)
    const puzzlesNeedingGroups = puzzles.filter((p) => !p.groups && p.groupIds.length > 0);
    const allGroupIds = [...new Set(puzzlesNeedingGroups.flatMap((p) => p.groupIds))];

    if (allGroupIds.length > 0) {
      const allGroups = await this.fetchGroupsByIds(allGroupIds);
      const groupMap = new Map(allGroups.map((g) => [g.id, g]));

      // Populate groups for puzzles that need them
      for (const puzzle of puzzlesNeedingGroups) {
        puzzle.groups = puzzle.groupIds
          .map((id) => groupMap.get(id))
          .filter((g): g is Group => g !== undefined);
      }
    }

    return {
      puzzles,
      total: count ?? 0,
    };
  }

  async updatePuzzle(id: string, updates: PuzzleUpdate): Promise<StoredPuzzle> {
    const dbUpdate: Record<string, unknown> = {};

    if (updates.status !== undefined) {
      dbUpdate.status = updates.status;
    }

    if (updates.puzzleDate !== undefined) {
      dbUpdate.puzzle_date = updates.puzzleDate ?? null;
    }

    if (updates.metadata !== undefined) {
      dbUpdate.metadata = updates.metadata;
    }

    if (updates.groupIds !== undefined) {
      dbUpdate.group_ids = updates.groupIds;
    }

    if (updates.title !== undefined) {
      dbUpdate.title = updates.title;
    }

    // Determine the group_ids to use for snapshot
    let groupIdsForSnapshot: string[] | null = null;

    // If publishing, snapshot the group data for self-contained gameplay
    if (updates.status === 'published') {
      if (updates.groupIds) {
        // Use the new group IDs if provided
        groupIdsForSnapshot = updates.groupIds;
      } else {
        // Fetch current puzzle to get group_ids
        const { data: currentPuzzle } = await this.supabase
          .from('puzzles')
          .select('group_ids')
          .eq('id', id)
          .single();

        if (currentPuzzle) {
          const puzzleRow = currentPuzzle as DbPuzzleRow;
          groupIdsForSnapshot = puzzleRow.group_ids;
        }
      }

      if (groupIdsForSnapshot) {
        const groups = await this.fetchGroupsByIds(groupIdsForSnapshot);
        dbUpdate.groups = groups;
      }
    }

    const { data, error } = await this.supabase
      .from('puzzles')
      .update(dbUpdate as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update puzzle: ${error.message}`);
    }

    const puzzle = this.rowToStoredPuzzle(data as DbPuzzleRow);

    // Fetch and populate groups
    puzzle.groups = await this.fetchGroupsByIds(puzzle.groupIds);

    return puzzle;
  }

  async deletePuzzle(id: string): Promise<void> {
    const { error } = await this.supabase.from('puzzles').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete puzzle: ${error.message}`);
    }
  }

  async getEmptyDays(startDate: string, endDate: string, genre: Genre = 'films'): Promise<string[]> {
    // Get all scheduled puzzle dates in the range
    const { data, error } = await this.supabase
      .from('puzzles')
      .select('puzzle_date')
      .eq('genre', genre as string)
      .gte('puzzle_date', startDate)
      .lte('puzzle_date', endDate)
      .not('puzzle_date', 'is', null);

    if (error) {
      throw new Error(`Failed to get scheduled dates: ${error.message}`);
    }

    // Create a set of scheduled dates
    const rows = data as Array<{ puzzle_date: string | null }>;
    const scheduledDates = new Set(
      rows.filter((row) => row.puzzle_date !== null).map((row) => row.puzzle_date as string)
    );

    // Generate all dates in range and filter out scheduled ones
    const emptyDays: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (!scheduledDates.has(dateStr)) {
        emptyDays.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }

    return emptyDays;
  }

  async checkPuzzleExists(groupIds: string[], genre: Genre = 'films'): Promise<boolean> {
    // Sort group IDs for consistent comparison
    const sortedIds = [...groupIds].sort();

    // Query all puzzles with the same genre
    const { data, error } = await this.supabase
      .from('puzzles')
      .select('group_ids')
      .eq('genre', genre as string);

    if (error) {
      throw new Error(`Failed to check puzzle existence: ${error.message}`);
    }

    // Check if any existing puzzle has the same sorted group IDs
    const rows = data as Array<{ group_ids: string[] }>;
    return rows.some((puzzle) => {
      const existingSorted = [...puzzle.group_ids].sort();
      return (
        existingSorted.length === sortedIds.length &&
        existingSorted.every((id, i) => id === sortedIds[i])
      );
    });
  }

  async batchUpdatePuzzles(
    updates: Array<{ id: string; updates: PuzzleUpdate }>
  ): Promise<void> {
    // Process updates sequentially to maintain consistency
    // Could be optimized with Promise.all for independent updates
    for (const { id, updates: puzzleUpdates } of updates) {
      await this.updatePuzzle(id, puzzleUpdates);
    }
  }

  async batchDeletePuzzles(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const { error } = await this.supabase.from('puzzles').delete().in('id', ids);

    if (error) {
      throw new Error(`Failed to batch delete puzzles: ${error.message}`);
    }
  }

  async getUsedGroupIds(genre: Genre = 'films'): Promise<Set<string>> {
    const { data, error } = await this.supabase
      .from('puzzles')
      .select('group_ids')
      .eq('genre', genre as string);

    if (error) {
      throw new Error(`Failed to get used group IDs: ${error.message}`);
    }

    const usedIds = new Set<string>();
    const rows = data as Array<{ group_ids: string[] }>;

    for (const row of rows) {
      if (row.group_ids) {
        for (const id of row.group_ids) {
          usedIds.add(id);
        }
      }
    }

    return usedIds;
  }
}
