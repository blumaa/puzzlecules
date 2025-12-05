/**
 * Group Generator Module
 *
 * AI-first film connection group generation system.
 * Exports all classes and types for the generation pipeline.
 */

// Types
export type {
  AIItem,
  VerifiedItem,
  ConnectionCategory,
  ConnectionType,
  Difficulty,
  GeneratedGroup,
  ApprovedGroup,
  FeedbackRecord,
  GenerationFilters,
  IConnectionTypeStore,
  IFeedbackStore,
  IItemVerifier,
  GenerateGroupsRequest,
  GenerateGroupsResponse,
  AIGroupResponse,
} from './types'

// Implementations
export { ConnectionTypeStore } from './ConnectionTypeStore'
export { FeedbackStore } from './FeedbackStore'
export { TMDBVerifier } from './TMDBVerifier'

// Domain config
export { getDomainConfig, DOMAIN_CONFIGS, type DomainConfig } from './domainConfig'

// Verifiers
export { createVerifier } from './verifiers'
