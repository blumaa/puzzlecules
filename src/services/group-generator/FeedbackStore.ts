/**
 * Feedback Store
 *
 * Records accept/reject decisions for AI-generated groups.
 * Provides examples for prompt injection to improve future generations.
 */

import { supabase } from '../../lib/supabase/client'
import type {
  IFeedbackStore,
  GeneratedGroup,
  FeedbackRecord,
  AIFilm,
} from './types'

/** Database row type from Supabase */
interface FeedbackRow {
  id: string
  created_at: string
  films: Array<{ title: string; year: number }>
  connection: string
  connection_type_id: string | null
  explanation: string | null
  accepted: boolean
  rejection_reason: string | null
  generation_filters: unknown | null
}

export class FeedbackStore implements IFeedbackStore {
  /**
   * Record feedback for a generated group
   */
  async recordFeedback(
    group: GeneratedGroup,
    accepted: boolean,
    reason?: string
  ): Promise<void> {
    const films: AIFilm[] = group.films.map((f) => ({
      title: f.title,
      year: f.year,
    }))

    const insertData = {
      films,
      connection: group.connection,
      explanation: group.explanation,
      accepted,
      rejection_reason: reason || null,
    }
    const { error } = await supabase
      .from('group_feedback')
      .insert(insertData as never)
      .select()

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Get accepted examples for prompt injection
   */
  async getAcceptedExamples(limit: number): Promise<FeedbackRecord[]> {
    const { data, error } = await supabase
      .from('group_feedback')
      .select('*')
      .eq('accepted', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapRowToFeedbackRecord)
  }

  /**
   * Get rejected examples for prompt injection
   */
  async getRejectedExamples(limit: number): Promise<FeedbackRecord[]> {
    const { data, error } = await supabase
      .from('group_feedback')
      .select('*')
      .eq('accepted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

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
      films: row.films.map((f) => ({
        title: f.title,
        year: f.year,
      })),
      connection: row.connection,
      connectionType: '', // Not stored in database, use connection itself
      accepted: row.accepted,
      rejectionReason: row.rejection_reason || undefined,
      createdAt: new Date(row.created_at),
    }
  }
}
