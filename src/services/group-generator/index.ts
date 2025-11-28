/**
 * Group Generator Module
 *
 * AI-first film connection group generation system.
 * Exports all classes and types for the generation pipeline.
 */

// Types
export type {
  AIFilm,
  VerifiedFilm,
  ConnectionCategory,
  ConnectionType,
  Difficulty,
  GeneratedGroup,
  ApprovedGroup,
  FeedbackRecord,
  GenerationFilters,
  IConnectionTypeStore,
  IFeedbackStore,
  ITMDBVerifier,
  IAIGroupGenerator,
  IGroupGeneratorService,
  GenerateGroupsRequest,
  GenerateGroupsResponse,
  AIGroupResponse,
} from './types'

// Implementations
export { ConnectionTypeStore } from './ConnectionTypeStore'
export { FeedbackStore } from './FeedbackStore'
export { TMDBVerifier } from './TMDBVerifier'
export { AIGroupGenerator } from './AIGroupGenerator'
export { GroupGeneratorService } from './GroupGeneratorService'
