import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { GeneratedGroup, VerifiedFilm } from '../types'

// Use vi.hoisted to create mocks that are available during module hoisting
const { mockFrom, mockSelect, mockInsert, mockEq, mockOrder, mockLimit } =
  vi.hoisted(() => {
    const mockSelect = vi.fn()
    const mockInsert = vi.fn()
    const mockEq = vi.fn()
    const mockOrder = vi.fn()
    const mockLimit = vi.fn()
    const mockFrom = vi.fn()

    return {
      mockFrom,
      mockSelect,
      mockInsert,
      mockEq,
      mockOrder,
      mockLimit,
    }
  })

vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// Import after mock setup
import { FeedbackStore } from '../FeedbackStore'

describe('FeedbackStore', () => {
  let store: FeedbackStore

  const mockVerifiedFilms: VerifiedFilm[] = [
    { title: 'Run', year: 2020, tmdbId: 12345, verified: true },
    { title: 'Drive', year: 2011, tmdbId: 67890, verified: true },
    { title: 'Crash', year: 2004, tmdbId: 11111, verified: true },
    { title: 'Taken', year: 2008, tmdbId: 22222, verified: true },
  ]

  const mockGeneratedGroup: GeneratedGroup = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    films: mockVerifiedFilms,
    connection: 'Titles that are verbs',
    connectionType: 'word-game',
    explanation: 'Each film has a one-word title that is an action verb.',
    allFilmsVerified: true,
  }

  const mockFeedbackRow = {
    id: 'feedback-123',
    created_at: '2024-01-01T00:00:00Z',
    films: [
      { title: 'Run', year: 2020 },
      { title: 'Drive', year: 2011 },
      { title: 'Crash', year: 2004 },
      { title: 'Taken', year: 2008 },
    ],
    connection: 'Titles that are verbs',
    connection_type_id: null,
    explanation: 'Each film has a one-word title that is an action verb.',
    accepted: true,
    rejection_reason: null,
    generation_filters: null,
  }

  beforeEach(() => {
    store = new FeedbackStore()
    vi.clearAllMocks()

    // Setup default mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    })

    mockEq.mockReturnValue({
      order: mockOrder,
    })

    mockOrder.mockReturnValue({
      limit: mockLimit,
    })
  })

  describe('recordFeedback', () => {
    it('should record accepted feedback', async () => {
      const mockInsertChain = {
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      await store.recordFeedback(mockGeneratedGroup, true)

      expect(mockFrom).toHaveBeenCalledWith('group_feedback')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          accepted: true,
          connection: 'Titles that are verbs',
        })
      )
    })

    it('should record rejected feedback with reason', async () => {
      const mockInsertChain = {
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      await store.recordFeedback(
        mockGeneratedGroup,
        false,
        'Connection is too obvious'
      )

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          accepted: false,
          rejection_reason: 'Connection is too obvious',
        })
      )
    })

    it('should store films as JSON', async () => {
      const mockInsertChain = {
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      await store.recordFeedback(mockGeneratedGroup, true)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          films: expect.arrayContaining([
            expect.objectContaining({ title: 'Run', year: 2020 }),
          ]),
        })
      )
    })

    it('should throw error when insert fails', async () => {
      const mockInsertChain = {
        select: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      await expect(
        store.recordFeedback(mockGeneratedGroup, true)
      ).rejects.toThrow('Insert failed')
    })
  })

  describe('getAcceptedExamples', () => {
    it('should return accepted feedback records', async () => {
      mockLimit.mockResolvedValue({
        data: [mockFeedbackRow],
        error: null,
      })

      const result = await store.getAcceptedExamples(10)

      expect(mockFrom).toHaveBeenCalledWith('group_feedback')
      expect(mockEq).toHaveBeenCalledWith('accepted', true)
      expect(result).toHaveLength(1)
      expect(result[0].accepted).toBe(true)
    })

    it('should respect the limit parameter', async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      })

      await store.getAcceptedExamples(5)

      expect(mockLimit).toHaveBeenCalledWith(5)
    })

    it('should order by created_at descending', async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      })

      await store.getAcceptedExamples(10)

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should throw error when query fails', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
      })

      await expect(store.getAcceptedExamples(10)).rejects.toThrow('Query failed')
    })

    it('should map database rows to FeedbackRecord', async () => {
      mockLimit.mockResolvedValue({
        data: [mockFeedbackRow],
        error: null,
      })

      const result = await store.getAcceptedExamples(10)

      expect(result[0]).toMatchObject({
        id: 'feedback-123',
        connection: 'Titles that are verbs',
        accepted: true,
        films: expect.arrayContaining([
          expect.objectContaining({ title: 'Run', year: 2020 }),
        ]),
      })
    })
  })

  describe('getRejectedExamples', () => {
    it('should return rejected feedback records', async () => {
      const rejectedRow = {
        ...mockFeedbackRow,
        accepted: false,
        rejection_reason: 'Too obvious',
      }

      mockLimit.mockResolvedValue({
        data: [rejectedRow],
        error: null,
      })

      const result = await store.getRejectedExamples(10)

      expect(mockEq).toHaveBeenCalledWith('accepted', false)
      expect(result).toHaveLength(1)
      expect(result[0].accepted).toBe(false)
      expect(result[0].rejectionReason).toBe('Too obvious')
    })

    it('should respect the limit parameter', async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      })

      await store.getRejectedExamples(3)

      expect(mockLimit).toHaveBeenCalledWith(3)
    })

    it('should throw error when query fails', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(store.getRejectedExamples(10)).rejects.toThrow(
        'Database error'
      )
    })
  })

  describe('edge cases', () => {
    it('should return empty array when no feedback exists', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await store.getAcceptedExamples(10)
      expect(result).toEqual([])
    })

    it('should handle feedback without rejection reason', async () => {
      const rowWithoutReason = {
        ...mockFeedbackRow,
        accepted: false,
        rejection_reason: null,
      }

      mockLimit.mockResolvedValue({
        data: [rowWithoutReason],
        error: null,
      })

      const result = await store.getRejectedExamples(10)
      expect(result[0].rejectionReason).toBeUndefined()
    })
  })
})
