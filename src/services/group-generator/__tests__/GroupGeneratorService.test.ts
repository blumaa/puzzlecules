import { describe, it, expect, beforeEach, vi } from 'vitest'
import type {
  ConnectionType,
  GeneratedGroup,
  FeedbackRecord,
  VerifiedFilm,
  AIFilm,
} from '../types'

// Create mock implementations
const mockConnectionTypeStore = {
  getAll: vi.fn(),
  getActive: vi.fn(),
  getByCategory: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  toggleActive: vi.fn(),
}

const mockFeedbackStore = {
  recordFeedback: vi.fn(),
  getAcceptedExamples: vi.fn(),
  getRejectedExamples: vi.fn(),
}

const mockAIGenerator = {
  generate: vi.fn(),
}

const mockTMDBVerifier = {
  verifyFilm: vi.fn(),
  verifyFilms: vi.fn(),
}

// Import after mock setup
import { GroupGeneratorService } from '../GroupGeneratorService'

describe('GroupGeneratorService', () => {
  let service: GroupGeneratorService

  const mockConnectionTypes: ConnectionType[] = [
    {
      id: '1',
      name: 'Titles that are verbs',
      category: 'word-game',
      description: 'Films with single-word titles that are action verbs',
      examples: ['Run', 'Drive', 'Crash'],
      active: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Films about fatherhood',
      category: 'thematic',
      description: 'Films exploring father-child relationships',
      active: true,
      createdAt: new Date(),
    },
  ]

  const mockGoodExamples: FeedbackRecord[] = [
    {
      id: 'good-1',
      films: [
        { title: 'Run', year: 2020 },
        { title: 'Drive', year: 2011 },
        { title: 'Crash', year: 2004 },
        { title: 'Taken', year: 2008 },
      ],
      connection: 'Titles that are verbs',
      connectionType: 'word-game',
      accepted: true,
      createdAt: new Date(),
    },
  ]

  const mockBadExamples: FeedbackRecord[] = [
    {
      id: 'bad-1',
      films: [
        { title: 'The New World', year: 2005 },
        { title: 'New Moon', year: 2009 },
        { title: 'Brand New Day', year: 2010 },
        { title: 'A New Hope', year: 1977 },
      ],
      connection: 'Films with "new" in the title',
      connectionType: 'word-game',
      accepted: false,
      rejectionReason: 'Too obvious',
      createdAt: new Date(),
    },
  ]

  const mockAIFilms: AIFilm[] = [
    { title: 'Run', year: 2020 },
    { title: 'Drive', year: 2011 },
    { title: 'Crash', year: 2004 },
    { title: 'Taken', year: 2008 },
  ]

  const mockVerifiedFilms: VerifiedFilm[] = [
    { title: 'Run', year: 2020, tmdbId: 12345, verified: true },
    { title: 'Drive', year: 2011, tmdbId: 67890, verified: true },
    { title: 'Crash', year: 2004, tmdbId: 11111, verified: true },
    { title: 'Taken', year: 2008, tmdbId: 22222, verified: true },
  ]

  const mockGeneratedGroup: GeneratedGroup = {
    id: 'group-1',
    films: mockVerifiedFilms,
    connection: 'Titles that are verbs',
    connectionType: 'word-game',
    explanation: 'Each film has a one-word title that is an action verb.',
    allFilmsVerified: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    service = new GroupGeneratorService(
      mockConnectionTypeStore,
      mockFeedbackStore,
      mockAIGenerator,
      mockTMDBVerifier
    )

    // Default mock implementations
    mockConnectionTypeStore.getActive.mockResolvedValue(mockConnectionTypes)
    mockFeedbackStore.getAcceptedExamples.mockResolvedValue(mockGoodExamples)
    mockFeedbackStore.getRejectedExamples.mockResolvedValue(mockBadExamples)
    mockAIGenerator.generate.mockResolvedValue([
      {
        id: 'group-1',
        films: mockAIFilms.map((f) => ({
          ...f,
          tmdbId: null,
          verified: false,
        })),
        connection: 'Titles that are verbs',
        connectionType: 'word-game',
        explanation: 'Each film has a one-word title that is an action verb.',
        allFilmsVerified: false,
      },
    ])
    mockTMDBVerifier.verifyFilms.mockResolvedValue(mockVerifiedFilms)
  })

  describe('generateGroups', () => {
    it('should fetch active connection types', async () => {
      await service.generateGroups({})

      expect(mockConnectionTypeStore.getActive).toHaveBeenCalled()
    })

    it('should fetch feedback examples', async () => {
      await service.generateGroups({})

      expect(mockFeedbackStore.getAcceptedExamples).toHaveBeenCalledWith(10)
      expect(mockFeedbackStore.getRejectedExamples).toHaveBeenCalledWith(10)
    })

    it('should call AI generator with connection types and examples', async () => {
      await service.generateGroups({ yearRange: [1990, 2020] })

      expect(mockAIGenerator.generate).toHaveBeenCalledWith(
        { yearRange: [1990, 2020] },
        mockConnectionTypes,
        20, // default count
        mockGoodExamples,
        mockBadExamples
      )
    })

    it('should verify films with TMDB', async () => {
      await service.generateGroups({})

      expect(mockTMDBVerifier.verifyFilms).toHaveBeenCalled()
    })

    it('should return groups with verified films', async () => {
      const result = await service.generateGroups({})

      expect(result).toHaveLength(1)
      expect(result[0].allFilmsVerified).toBe(true)
      expect(result[0].films[0].verified).toBe(true)
      expect(result[0].films[0].tmdbId).toBe(12345)
    })

    it('should handle groups where some films fail verification', async () => {
      mockTMDBVerifier.verifyFilms.mockResolvedValue([
        { title: 'Run', year: 2020, tmdbId: 12345, verified: true },
        { title: 'Drive', year: 2011, tmdbId: 67890, verified: true },
        { title: 'Unknown Film', year: 2020, tmdbId: null, verified: false },
        { title: 'Taken', year: 2008, tmdbId: 22222, verified: true },
      ])

      const result = await service.generateGroups({})

      expect(result[0].allFilmsVerified).toBe(false)
    })

    it('should pass filters to AI generator', async () => {
      const filters = {
        yearRange: [2000, 2020] as [number, number],
        excludeConnections: ['Heist films'],
      }

      await service.generateGroups(filters)

      expect(mockAIGenerator.generate).toHaveBeenCalledWith(
        filters,
        expect.any(Array),
        expect.any(Number),
        expect.any(Array),
        expect.any(Array)
      )
    })

    it('should handle empty connection types gracefully', async () => {
      mockConnectionTypeStore.getActive.mockResolvedValue([])
      mockAIGenerator.generate.mockResolvedValue([])

      const result = await service.generateGroups({})

      expect(result).toHaveLength(0)
    })
  })

  describe('approveGroup', () => {
    it('should record positive feedback', async () => {
      await service.approveGroup(mockGeneratedGroup, 'medium')

      expect(mockFeedbackStore.recordFeedback).toHaveBeenCalledWith(
        mockGeneratedGroup,
        true
      )
    })

    it('should return approved group with difficulty', async () => {
      const result = await service.approveGroup(mockGeneratedGroup, 'hard')

      expect(result).toMatchObject({
        id: mockGeneratedGroup.id,
        films: mockGeneratedGroup.films,
        connection: mockGeneratedGroup.connection,
        difficulty: 'hard',
      })
    })

    it('should include connection type in approved group', async () => {
      const result = await service.approveGroup(mockGeneratedGroup, 'easy')

      expect(result.connectionType).toBe('word-game')
    })
  })

  describe('rejectGroup', () => {
    it('should record negative feedback without reason', async () => {
      await service.rejectGroup(mockGeneratedGroup)

      expect(mockFeedbackStore.recordFeedback).toHaveBeenCalledWith(
        mockGeneratedGroup,
        false,
        undefined
      )
    })

    it('should record negative feedback with reason', async () => {
      await service.rejectGroup(mockGeneratedGroup, 'Connection is too obvious')

      expect(mockFeedbackStore.recordFeedback).toHaveBeenCalledWith(
        mockGeneratedGroup,
        false,
        'Connection is too obvious'
      )
    })
  })

  describe('error handling', () => {
    it('should propagate connection type store errors', async () => {
      mockConnectionTypeStore.getActive.mockRejectedValue(
        new Error('Database error')
      )

      await expect(service.generateGroups({})).rejects.toThrow('Database error')
    })

    it('should propagate AI generator errors', async () => {
      mockAIGenerator.generate.mockRejectedValue(
        new Error('API rate limit exceeded')
      )

      await expect(service.generateGroups({})).rejects.toThrow(
        'API rate limit exceeded'
      )
    })

    it('should propagate feedback store errors on approve', async () => {
      mockFeedbackStore.recordFeedback.mockRejectedValue(
        new Error('Insert failed')
      )

      await expect(
        service.approveGroup(mockGeneratedGroup, 'medium')
      ).rejects.toThrow('Insert failed')
    })
  })
})
