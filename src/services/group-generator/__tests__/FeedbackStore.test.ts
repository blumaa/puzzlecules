import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { GeneratedGroup, VerifiedItem } from '../types'
import { FeedbackStore } from '../FeedbackStore'

// Create mock functions
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockFrom = vi.fn()

// Create mock Supabase client
const mockSupabase = {
  from: mockFrom,
} as unknown as SupabaseClient

describe('FeedbackStore', () => {
  let store: FeedbackStore

  const mockVerifiedItems: VerifiedItem[] = [
    { title: 'Run', year: 2020, externalId: 12345, verified: true },
    { title: 'Drive', year: 2011, externalId: 67890, verified: true },
    { title: 'Crash', year: 2004, externalId: 11111, verified: true },
    { title: 'Taken', year: 2008, externalId: 22222, verified: true },
  ]

  const mockGeneratedGroup: GeneratedGroup = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    items: mockVerifiedItems,
    connection: 'Titles that are verbs',
    connectionType: 'word-game',
    explanation: 'Each film has a one-word title that is an action verb.',
    allItemsVerified: true,
  }

  const mockFeedbackRow = {
    id: 'feedback-123',
    created_at: '2024-01-01T00:00:00Z',
    items: [
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
    genre: 'films',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    store = new FeedbackStore(mockSupabase)

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

    it('should store items as JSON', async () => {
      const mockInsertChain = {
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      await store.recordFeedback(mockGeneratedGroup, true)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
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
        items: expect.arrayContaining([
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
