import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ConnectionCategory } from '../types'

// Use vi.hoisted to create mocks that are available during module hoisting
const { mockFrom, mockSelect, mockInsert, mockUpdate, mockDelete, mockEq, mockOrder, mockSingle } = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()
  const mockOrder = vi.fn()
  const mockFrom = vi.fn()

  return {
    mockFrom,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockOrder,
    mockSingle,
  }
})

vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// Import after mock setup
import { ConnectionTypeStore } from '../ConnectionTypeStore'

describe('ConnectionTypeStore', () => {
  let store: ConnectionTypeStore

  const mockConnectionTypeRow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    created_at: '2024-01-01T00:00:00Z',
    name: 'Titles that are verbs',
    category: 'word-game',
    description: 'Films with titles that are action words (Run, Drive, Crash)',
    examples: ['Run', 'Drive', 'Crash', 'Taken'],
    active: true,
  }

  beforeEach(() => {
    store = new ConnectionTypeStore()
    vi.clearAllMocks()

    // Setup default mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    })

    mockEq.mockReturnValue({
      order: mockOrder,
      select: vi.fn().mockReturnValue({ single: mockSingle }),
      single: mockSingle,
    })

    mockOrder.mockResolvedValue({ data: [], error: null })
  })

  describe('getAll', () => {
    it('should return all connection types', async () => {
      mockOrder.mockResolvedValue({
        data: [mockConnectionTypeRow],
        error: null,
      })

      const result = await store.getAll()

      expect(mockFrom).toHaveBeenCalledWith('connection_types')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Titles that are verbs')
      expect(result[0].category).toBe('word-game')
    })

    it('should throw error when database query fails', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(store.getAll()).rejects.toThrow('Database error')
    })

    it('should return empty array when no data', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await store.getAll()
      expect(result).toEqual([])
    })
  })

  describe('getActive', () => {
    it('should return only active connection types', async () => {
      mockOrder.mockResolvedValue({
        data: [{ ...mockConnectionTypeRow, active: true }],
        error: null,
      })

      const result = await store.getActive()

      expect(mockEq).toHaveBeenCalledWith('active', true)
      expect(result).toHaveLength(1)
      expect(result[0].active).toBe(true)
    })
  })

  describe('getByCategory', () => {
    it('should return connection types filtered by category', async () => {
      mockOrder.mockResolvedValue({
        data: [mockConnectionTypeRow],
        error: null,
      })

      const result = await store.getByCategory('word-game')

      expect(mockEq).toHaveBeenCalledWith('category', 'word-game')
      expect(result).toHaveLength(1)
    })
  })

  describe('create', () => {
    it('should create a new connection type', async () => {
      const mockInsertChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockConnectionTypeRow,
            error: null,
          }),
        }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      const input = {
        name: 'Titles that are verbs',
        category: 'word-game' as ConnectionCategory,
        description: 'Films with titles that are action words',
        examples: ['Run', 'Drive'],
        active: true,
      }

      const result = await store.create(input)

      expect(mockFrom).toHaveBeenCalledWith('connection_types')
      expect(mockInsert).toHaveBeenCalled()
      expect(result.name).toBe('Titles that are verbs')
    })

    it('should throw error when insert fails', async () => {
      const mockInsertChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Insert failed' },
          }),
        }),
      }
      mockInsert.mockReturnValue(mockInsertChain)

      await expect(
        store.create({
          name: 'Test',
          category: 'word-game' as ConnectionCategory,
          description: 'Test description',
          active: true,
        })
      ).rejects.toThrow('Insert failed')
    })
  })

  describe('update', () => {
    it('should update an existing connection type', async () => {
      const mockUpdateChain = {
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockConnectionTypeRow, name: 'Updated Name' },
              error: null,
            }),
          }),
        }),
      }
      mockUpdate.mockReturnValue(mockUpdateChain)

      const result = await store.update(mockConnectionTypeRow.id, {
        name: 'Updated Name',
      })

      expect(mockUpdate).toHaveBeenCalled()
      expect(result.name).toBe('Updated Name')
    })
  })

  describe('delete', () => {
    it('should delete a connection type', async () => {
      const mockDeleteChain = {
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockDelete.mockReturnValue(mockDeleteChain)

      await store.delete(mockConnectionTypeRow.id)

      expect(mockDelete).toHaveBeenCalled()
    })

    it('should throw error when delete fails', async () => {
      const mockDeleteChain = {
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete failed' },
        }),
      }
      mockDelete.mockReturnValue(mockDeleteChain)

      await expect(store.delete(mockConnectionTypeRow.id)).rejects.toThrow(
        'Delete failed'
      )
    })
  })

  describe('toggleActive', () => {
    it('should toggle active status from true to false', async () => {
      // First call: get current state
      const mockSelectForGet = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockConnectionTypeRow, active: true },
            error: null,
          }),
        }),
      })

      // Second call: update
      const mockUpdateForToggle = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockConnectionTypeRow, active: false },
              error: null,
            }),
          }),
        }),
      })

      mockFrom
        .mockReturnValueOnce({
          select: mockSelectForGet,
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        })
        .mockReturnValueOnce({
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdateForToggle,
          delete: mockDelete,
        })

      const result = await store.toggleActive(mockConnectionTypeRow.id)

      expect(result.active).toBe(false)
    })
  })
})
