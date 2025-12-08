/**
 * Feedback Store
 *
 * Records accept/reject decisions for AI-generated groups.
 * Provides examples for prompt injection to improve future generations.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase as globalSupabase } from '../../lib/supabase/client'
import type {
  IFeedbackStore,
  GeneratedGroup,
  FeedbackRecord,
  AIItem,
  Genre,
} from './types'

/** Database row type from Supabase */
interface FeedbackRow {
  id: string
  created_at: string
  items: Array<{ title: string; year: number }>
  connection: string
  connection_type_id: string | null
  explanation: string | null
  accepted: boolean
  rejection_reason: string | null
  generation_filters: unknown | null
  genre: string
}

export class FeedbackStore implements IFeedbackStore {
  private supabase: SupabaseClient

  /**
   * Create a FeedbackStore
   * @param supabaseClient - Optional Supabase client. If not provided, uses the global client.
   */
  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || globalSupabase
  }
  /**
   * Record feedback for a generated group
   */
  async recordFeedback(
    group: GeneratedGroup,
    accepted: boolean,
    reason?: string
  ): Promise<void> {
    const items: AIItem[] = group.items.map((item) => ({
      title: item.title,
      year: item.year,
    }))

    const insertData = {
      items,
      connection: group.connection,
      explanation: group.explanation,
      accepted,
      rejection_reason: reason || null,
    }
    const { error } = await this.supabase
      .from('group_feedback')
      .insert(insertData as never)
      .select()

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Get accepted examples for prompt injection, optionally filtered by genre
   */
  async getAcceptedExamples(limit: number, genre?: Genre): Promise<FeedbackRecord[]> {
    let query = this.supabase
      .from('group_feedback')
      .select('*')
      .eq('accepted', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (genre) {
      query = query.eq('genre', genre)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapRowToFeedbackRecord)
  }

  /**
   * Get rejected examples for prompt injection, optionally filtered by genre
   */
  async getRejectedExamples(limit: number, genre?: Genre): Promise<FeedbackRecord[]> {
    let query = this.supabase
      .from('group_feedback')
      .select('*')
      .eq('accepted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (genre) {
      query = query.eq('genre', genre)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapRowToFeedbackRecord)
  }

  /**
   * Map database row to FeedbackRecord
   */
  private mapRowToFeedbackRecord(row: FeedbackRow): FeedbackRecord {
    return {
      id: row.id,
      items: row.items.map((item) => ({
        title: item.title,
        year: item.year,
      })),
      connection: row.connection,
      connectionType: '', // Not stored in database, use connection itself
      accepted: row.accepted,
      rejectionReason: row.rejection_reason || undefined,
      createdAt: new Date(row.created_at),
    }
  }
}
