/**
 * Group Generator Service
 *
 * Orchestrates the generation pipeline:
 * 1. Fetch active connection types
 * 2. Fetch feedback examples (good/bad)
 * 3. Call AI to generate groups
 * 4. Verify films with TMDB
 * 5. Return verified groups for admin review
 */

import type {
  IGroupGeneratorService,
  IConnectionTypeStore,
  IFeedbackStore,
  IAIGroupGenerator,
  ITMDBVerifier,
  GenerationFilters,
  GeneratedGroup,
  ApprovedGroup,
  Difficulty,
} from './types'

const DEFAULT_GROUP_COUNT = 20
const DEFAULT_EXAMPLE_LIMIT = 10

export class GroupGeneratorService implements IGroupGeneratorService {
  constructor(
    private connectionTypeStore: IConnectionTypeStore,
    private feedbackStore: IFeedbackStore,
    private aiGenerator: IAIGroupGenerator,
    private tmdbVerifier: ITMDBVerifier
  ) {}

  /**
   * Generate groups using the full pipeline
   */
  async generateGroups(filters: GenerationFilters): Promise<GeneratedGroup[]> {
    // 1. Fetch active connection types
    const connectionTypes = await this.connectionTypeStore.getActive()

    // 2. Fetch feedback examples for prompt injection
    const [goodExamples, badExamples] = await Promise.all([
      this.feedbackStore.getAcceptedExamples(DEFAULT_EXAMPLE_LIMIT),
      this.feedbackStore.getRejectedExamples(DEFAULT_EXAMPLE_LIMIT),
    ])

    // 3. Generate groups with AI
    const rawGroups = await this.aiGenerator.generate(
      filters,
      connectionTypes,
      DEFAULT_GROUP_COUNT,
      goodExamples,
      badExamples
    )

    // 4. Verify films with TMDB
    const verifiedGroups = await this.verifyGroupFilms(rawGroups)

    return verifiedGroups
  }

  /**
   * Approve a generated group and assign difficulty
   */
  async approveGroup(
    group: GeneratedGroup,
    difficulty: Difficulty
  ): Promise<ApprovedGroup> {
    // Record positive feedback for learning
    await this.feedbackStore.recordFeedback(group, true)

    // Create approved group
    return {
      id: group.id,
      films: group.films,
      connection: group.connection,
      connectionType: group.connectionType,
      difficulty,
    }
  }

  /**
   * Reject a generated group with optional reason
   */
  async rejectGroup(group: GeneratedGroup, reason?: string): Promise<void> {
    // Record negative feedback for learning
    await this.feedbackStore.recordFeedback(group, false, reason)
  }

  /**
   * Verify all films in all groups with TMDB
   */
  private async verifyGroupFilms(
    groups: GeneratedGroup[]
  ): Promise<GeneratedGroup[]> {
    return Promise.all(
      groups.map(async (group) => {
        // Extract AIFilm format for verification
        const aiFilms = group.films.map((f) => ({
          title: f.title,
          year: f.year,
        }))

        // Verify with TMDB
        const verifiedFilms = await this.tmdbVerifier.verifyFilms(aiFilms)

        // Check if all films verified
        const allVerified = verifiedFilms.every((f) => f.verified)

        return {
          ...group,
          films: verifiedFilms,
          allFilmsVerified: allVerified,
        }
      })
    )
  }
}
