/**
 * Group Generator Types
 *
 * Core types and interfaces for the AI-first group generation system.
 * Following SOLID principles with clean interfaces for dependency injection.
 */

// =============================================================================
// Film Types
// =============================================================================

/** Film as returned by AI (before verification) */
export interface AIFilm {
  title: string
  year: number
}

/** Film after TMDB verification */
export interface VerifiedFilm {
  title: string
  year: number
  tmdbId: number | null // null if not found in TMDB
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
}

// =============================================================================
// Group Types
// =============================================================================

/** Difficulty levels for groups */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

/** Generated group from AI (before admin approval) */
export interface GeneratedGroup {
  id: string
  films: VerifiedFilm[]
  connection: string
  connectionType: string
  explanation: string
  allFilmsVerified: boolean
}

/** Approved group (after admin sets difficulty) */
export interface ApprovedGroup {
  id: string
  films: VerifiedFilm[]
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
  films: AIFilm[]
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
}

// =============================================================================
// Interfaces (Dependency Inversion)
// =============================================================================

/** Connection Type Store - CRUD operations for connection types */
export interface IConnectionTypeStore {
  getAll(): Promise<ConnectionType[]>
  getActive(): Promise<ConnectionType[]>
  getByCategory(category: ConnectionCategory): Promise<ConnectionType[]>
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
  getAcceptedExamples(limit: number): Promise<FeedbackRecord[]>
  getRejectedExamples(limit: number): Promise<FeedbackRecord[]>
}

/** TMDB Verifier - Validates films exist in TMDB */
export interface ITMDBVerifier {
  verifyFilm(title: string, year: number): Promise<VerifiedFilm>
  verifyFilms(films: AIFilm[]): Promise<VerifiedFilm[]>
}

/** AI Group Generator - Generates groups using Claude */
export interface IAIGroupGenerator {
  generate(
    filters: GenerationFilters,
    connectionTypes: ConnectionType[],
    count: number,
    goodExamples: FeedbackRecord[],
    badExamples: FeedbackRecord[]
  ): Promise<GeneratedGroup[]>
}

/** Group Generator Service - Orchestrates the generation pipeline */
export interface IGroupGeneratorService {
  generateGroups(filters: GenerationFilters): Promise<GeneratedGroup[]>
  approveGroup(group: GeneratedGroup, difficulty: Difficulty): Promise<ApprovedGroup>
  rejectGroup(group: GeneratedGroup, reason?: string): Promise<void>
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
}

/** Response from generate-groups API route */
export interface GenerateGroupsResponse {
  groups: GeneratedGroup[]
  tokensUsed?: number
}

/** AI response format (what Claude returns) */
export interface AIGroupResponse {
  groups: Array<{
    films: AIFilm[]
    connection: string
    connectionType: string
    explanation: string
  }>
}
