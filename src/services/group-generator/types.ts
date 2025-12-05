/**
 * Group Generator Types
 *
 * Core types and interfaces for the AI-first group generation system.
 * Following SOLID principles with clean interfaces for dependency injection.
 */

import type { Genre } from '../../types';

// Re-export Genre for convenience
export type { Genre } from '../../types';

// =============================================================================
// Item Types (genre-agnostic)
// =============================================================================

/** Item as returned by AI (before verification) */
export interface AIItem {
  title: string
  year?: number
}

/** Item after verification (TMDB for films, MusicBrainz for music, etc.) */
export interface VerifiedItem {
  title: string
  year?: number
  externalId: number | null // null if not found in external service
  verified: boolean
}

// =============================================================================
// Connection Types
// =============================================================================

/** Connection type category */
export type ConnectionCategory =
  | 'word-game'
  | 'people'
  | 'thematic'
  | 'setting'
  | 'cultural'
  | 'narrative'
  | 'character'
  | 'production'
  | 'elements'

/** Connection type (stored in database, editable by admin) */
export interface ConnectionType {
  id: string
  name: string // e.g., "Titles that are verbs"
  category: ConnectionCategory
  description: string // Explanation for AI prompt
  examples?: string[] // Example connections
  active: boolean // Can be toggled on/off
  createdAt: Date
  /** Genre/domain this connection type applies to */
  genre: Genre
}

// =============================================================================
// Group Types
// =============================================================================

/** Difficulty levels for groups */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

/** Generated group from AI (before admin approval) */
export interface GeneratedGroup {
  id: string
  items: VerifiedItem[]
  connection: string
  connectionType: string
  explanation: string
  allItemsVerified: boolean
}

/** Approved group (after admin sets difficulty) */
export interface ApprovedGroup {
  id: string
  items: VerifiedItem[]
  connection: string
  connectionType: string
  difficulty: Difficulty
}

// =============================================================================
// Feedback Types
// =============================================================================

/** Feedback record for learning */
export interface FeedbackRecord {
  id: string
  items: AIItem[]
  connection: string
  connectionType: string
  accepted: boolean
  rejectionReason?: string
  createdAt: Date
}

// =============================================================================
// Filter Types
// =============================================================================

/** Generation filters (control panel) */
export interface GenerationFilters {
  yearRange?: [number, number]
  connectionTypes?: string[] // Filter by specific connection type IDs
  excludeConnections?: string[] // Connections already used
  /** Genre/domain for generation */
  genre?: Genre
  /** Target difficulty level for generated groups */
  targetDifficulty?: Difficulty
}

// =============================================================================
// Interfaces (Dependency Inversion)
// =============================================================================

/** Connection Type Store - CRUD operations for connection types */
export interface IConnectionTypeStore {
  getAll(genre?: Genre): Promise<ConnectionType[]>
  getActive(genre?: Genre): Promise<ConnectionType[]>
  getByCategory(category: ConnectionCategory, genre?: Genre): Promise<ConnectionType[]>
  create(
    type: Omit<ConnectionType, 'id' | 'createdAt'>
  ): Promise<ConnectionType>
  update(
    id: string,
    updates: Partial<Omit<ConnectionType, 'id' | 'createdAt'>>
  ): Promise<ConnectionType>
  delete(id: string): Promise<void>
  toggleActive(id: string): Promise<ConnectionType>
}

/** Feedback Store - Records accept/reject decisions for learning */
export interface IFeedbackStore {
  recordFeedback(
    group: GeneratedGroup,
    accepted: boolean,
    reason?: string
  ): Promise<void>
  getAcceptedExamples(limit: number, genre?: Genre): Promise<FeedbackRecord[]>
  getRejectedExamples(limit: number, genre?: Genre): Promise<FeedbackRecord[]>
}

/** Item Verifier - Validates items exist in external service (TMDB, MusicBrainz, etc.) */
export interface IItemVerifier {
  verifyItem(title: string, year?: number): Promise<VerifiedItem>
  verifyItems(items: AIItem[]): Promise<VerifiedItem[]>
}


// =============================================================================
// API Types
// =============================================================================

/** Request body for generate-groups API route */
export interface GenerateGroupsRequest {
  filters: GenerationFilters
  connectionTypes: ConnectionType[]
  count: number
  goodExamples: FeedbackRecord[]
  badExamples: FeedbackRecord[]
  /** Genre/domain for generation */
  genre?: Genre
}

/** Response from generate-groups API route */
export interface GenerateGroupsResponse {
  groups: GeneratedGroup[]
  tokensUsed?: number
  /** Genre used for generation */
  genre?: Genre
}

/** AI response format (what Claude returns) */
export interface AIGroupResponse {
  groups: Array<{
    items: AIItem[]
    connection: string
    connectionType: string
    explanation: string
  }>
}
