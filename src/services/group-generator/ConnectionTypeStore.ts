/**
 * Connection Type Store
 *
 * CRUD operations for connection types stored in Supabase.
 * Connection types define the categories of film connections
 * that AI can generate (e.g., "Titles that are verbs", "Directed by ___").
 */

import { supabase } from '../../lib/supabase/client'
import type {
  ConnectionType,
  ConnectionCategory,
  IConnectionTypeStore,
} from './types'

/** Database row type from Supabase */
interface ConnectionTypeRow {
  id: string
  created_at: string
  name: string
  category: string
  description: string
  examples: string[] | null
  active: boolean
}

export class ConnectionTypeStore implements IConnectionTypeStore {
  /**
   * Get all connection types
   */
  async getAll(): Promise<ConnectionType[]> {
    const { data, error } = await supabase
      .from('connection_types')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapRowToConnectionType)
  }

  /**
   * Get only active connection types
   */
  async getActive(): Promise<ConnectionType[]> {
    const { data, error } = await supabase
      .from('connection_types')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapRowToConnectionType)
  }

  /**
   * Get connection types by category
   */
  async getByCategory(category: ConnectionCategory): Promise<ConnectionType[]> {
    const { data, error } = await supabase
      .from('connection_types')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapRowToConnectionType)
  }

  /**
   * Create a new connection type
   */
  async create(
    type: Omit<ConnectionType, 'id' | 'createdAt'>
  ): Promise<ConnectionType> {
    const insertData = {
      name: type.name,
      category: type.category,
      description: type.description,
      examples: type.examples || null,
      active: type.active,
    }
    const { data, error } = await supabase
      .from('connection_types')
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapRowToConnectionType(data)
  }

  /**
   * Update an existing connection type
   */
  async update(
    id: string,
    updates: Partial<Omit<ConnectionType, 'id' | 'createdAt'>>
  ): Promise<ConnectionType> {
    const updateData: Record<string, unknown> = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.description !== undefined)
      updateData.description = updates.description
    if (updates.examples !== undefined)
      updateData.examples = updates.examples || null
    if (updates.active !== undefined) updateData.active = updates.active

    const { data, error } = await supabase
      .from('connection_types')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapRowToConnectionType(data)
  }

  /**
   * Delete a connection type
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('connection_types')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Toggle the active status of a connection type
   */
  async toggleActive(id: string): Promise<ConnectionType> {
    // Get current state
    const { data: current, error: getError } = await supabase
      .from('connection_types')
      .select('*')
      .eq('id', id)
      .single()

    if (getError) {
      throw new Error(getError.message)
    }

    // Toggle active
    const { data, error } = await supabase
      .from('connection_types')
      .update({ active: !(current as { active: boolean }).active } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapRowToConnectionType(data)
  }

  /**
   * Map database row to ConnectionType
   */
  private mapRowToConnectionType(row: ConnectionTypeRow): ConnectionType {
    return {
      id: row.id,
      name: row.name,
      category: row.category as ConnectionCategory,
      description: row.description,
      examples: row.examples || undefined,
      active: row.active,
      createdAt: new Date(row.created_at),
    }
  }
}
