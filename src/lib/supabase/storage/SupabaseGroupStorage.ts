/**
 * Supabase Group Storage Implementation
 *
 * Implements IGroupStorage interface using Supabase as the backend.
 * Handles conversion between application types and database schema.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Item, Genre } from '../../../types';
import type {
  IGroupStorage,
  StoredGroup,
  GroupInput,
  GroupListFilters,
  GroupListResult,
  GroupUpdate,
  DifficultyColor,
  DifficultyLevel,
  GroupCountsByColor,
  FreshestGroupSet,
} from './IGroupStorage';

type DbGroupRow = Database['public']['Tables']['connection_groups']['Row'];
type DbGroupInsert = Database['public']['Tables']['connection_groups']['Insert'];
type DbGroupUpdate = Database['public']['Tables']['connection_groups']['Update'];

/**
 * SupabaseGroupStorage implementation.
 *
 * Provides CRUD operations for connection groups using Supabase PostgreSQL backend.
 * Uses Row Level Security for access control.
 */
export class SupabaseGroupStorage implements IGroupStorage {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Convert database row to StoredGroup
   */
  private rowToStoredGroup(row: DbGroupRow): StoredGroup {
    return {
      id: row.id,
      createdAt: new Date(row.created_at).getTime(),
      items: row.items as unknown as Item[],
      connection: row.connection,
      connectionType: row.connection_type,
      difficultyScore: row.difficulty_score,
      color: row.color as DifficultyColor | null,
      difficulty: row.difficulty as DifficultyLevel | null,
      status: row.status,
      usageCount: row.usage_count,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at).getTime() : null,
      metadata: row.metadata as Record<string, unknown> | undefined,
      genre: ((row as { genre?: string }).genre || 'films') as Genre,
    };
  }

  /**
   * Convert GroupInput to database insert format
   */
  private groupToInsert(group: GroupInput): DbGroupInsert & { genre: string } {
    return {
      items: group.items as unknown as DbGroupInsert['items'],
      connection: group.connection,
      connection_type: group.connectionType,
      difficulty_score: group.difficultyScore,
      color: group.color,
      difficulty: group.difficulty,
      status: group.status,
      metadata: group.metadata as unknown as DbGroupInsert['metadata'],
      genre: group.genre,
    };
  }

  async saveGroup(group: GroupInput): Promise<StoredGroup> {
    const insert = this.groupToInsert(group);

    const { data, error } = await this.supabase
      .from('connection_groups')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      // Handle duplicate connection error (unique constraint violation)
      if (error.code === '23505' || error.message.includes('duplicate')) {
        throw new Error(`Group with connection "${group.connection}" already exists`);
      }
      throw new Error(`Failed to save group: ${error.message}`);
    }

    return this.rowToStoredGroup(data);
  }

  async saveBatch(groups: GroupInput[]): Promise<StoredGroup[]> {
    const inserts = groups.map((g) => this.groupToInsert(g));

    // Use upsert with ignoreDuplicates to skip groups with duplicate connections
    const { data, error } = await this.supabase
      .from('connection_groups')
      .upsert(inserts as never[], {
        onConflict: 'connection',
        ignoreDuplicates: true
      })
      .select();

    if (error) {
      throw new Error(`Failed to save group batch: ${error.message}`);
    }

    return data.map((row) => this.rowToStoredGroup(row));
  }

  async getGroup(id: string): Promise<StoredGroup | null> {
    const { data, error } = await this.supabase
      .from('connection_groups')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get group: ${error.message}`);
    }

    return this.rowToStoredGroup(data);
  }

  async getGroupsByIds(ids: string[]): Promise<StoredGroup[]> {
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('connection_groups')
      .select()
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to get groups by IDs: ${error.message}`);
    }

    // Reorder results to match input order
    const groupMap = new Map(data.map((row: DbGroupRow) => [row.id, row]));
    return ids
      .map((id) => groupMap.get(id))
      .filter((row): row is DbGroupRow => row !== undefined)
      .map((row: DbGroupRow) => this.rowToStoredGroup(row));
  }

  async listGroups(filters?: GroupListFilters): Promise<GroupListResult> {
    let query = this.supabase
      .from('connection_groups')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.color) {
      if (Array.isArray(filters.color)) {
        query = query.in('color', filters.color);
      } else {
        query = query.eq('color', filters.color);
      }
    }

    if (filters?.connectionType) {
      query = query.eq('connection_type', filters.connectionType);
    }

    if (filters?.genre) {
      query = query.eq('genre', filters.genre);
    }

    // Exclude specific IDs
    if (filters?.excludeIds && filters.excludeIds.length > 0) {
      // Use NOT IN filter - need to filter each ID individually
      for (const id of filters.excludeIds) {
        query = query.neq('id', id);
      }
    }

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    // Apply sorting
    if (filters?.sortByFreshness) {
      // Sort by usage_count ASC (least used first), then by last_used_at ASC NULLS FIRST
      query = query
        .order('usage_count', { ascending: true })
        .order('last_used_at', { ascending: true, nullsFirst: true });
    } else {
      // Default: order by created_at descending (newest first)
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list groups: ${error.message}`);
    }

    return {
      groups: data.map((row) => this.rowToStoredGroup(row)),
      total: count ?? 0,
    };
  }

  async updateGroup(id: string, updates: GroupUpdate): Promise<StoredGroup> {
    const dbUpdate: DbGroupUpdate = {};

    if (updates.connection !== undefined) {
      dbUpdate.connection = updates.connection;
    }

    if (updates.color !== undefined) {
      dbUpdate.color = updates.color;
    }

    if (updates.difficulty !== undefined) {
      dbUpdate.difficulty = updates.difficulty;
    }

    if (updates.status !== undefined) {
      dbUpdate.status = updates.status;
    }

    if (updates.metadata !== undefined) {
      dbUpdate.metadata = updates.metadata as unknown as DbGroupUpdate['metadata'];
    }

    if (updates.genre !== undefined) {
      (dbUpdate as { genre?: string }).genre = updates.genre;
    }

    const { data, error } = await this.supabase
      .from('connection_groups')
      .update(dbUpdate as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update group: ${error.message}`);
    }

    return this.rowToStoredGroup(data);
  }

  async deleteGroup(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('connection_groups')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }

  async incrementUsage(groupIds: string[]): Promise<void> {
    // Use type assertion for RPC call since the function signature is custom
    const { error } = await (
      this.supabase.rpc as unknown as (
        fn: string,
        args: { group_ids: string[] }
      ) => Promise<{ error: { message: string } | null }>
    )('increment_group_usage', {
      group_ids: groupIds,
    });

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  }

  async getGroupCountsByColor(genre: Genre = 'films'): Promise<GroupCountsByColor> {
    const colors: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];
    const counts: GroupCountsByColor = {
      yellow: 0,
      green: 0,
      blue: 0,
      purple: 0,
    };

    // Query count for each color
    for (const color of colors) {
      const { count, error } = await this.supabase
        .from('connection_groups')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('color', color)
        .eq('genre', genre);

      if (error) {
        throw new Error(`Failed to get group count for ${color}: ${error.message}`);
      }

      counts[color] = count ?? 0;
    }

    return counts;
  }

  async getFreshestGroupSet(
    excludeIds: string[],
    genre: Genre = 'films'
  ): Promise<FreshestGroupSet> {
    const colors: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];
    const result: FreshestGroupSet = {
      yellow: null,
      green: null,
      blue: null,
      purple: null,
    };

    // For each color, get the freshest approved group
    for (const color of colors) {
      let query = this.supabase
        .from('connection_groups')
        .select()
        .eq('status', 'approved')
        .eq('color', color)
        .eq('genre', genre)
        .order('usage_count', { ascending: true })
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .limit(1);

      // Exclude specific IDs
      if (excludeIds.length > 0) {
        for (const id of excludeIds) {
          query = query.neq('id', id);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get freshest group for ${color}: ${error.message}`);
      }

      if (data && data.length > 0) {
        result[color] = this.rowToStoredGroup(data[0]);
      }
    }

    return result;
  }
}
