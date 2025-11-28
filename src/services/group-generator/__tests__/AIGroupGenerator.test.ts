import { describe, it, expect, beforeEach, vi } from 'vitest'
import type {
  ConnectionType,
  FeedbackRecord,
  GenerationFilters,
  AIGroupResponse,
} from '../types'

// Use vi.hoisted to create mocks that are available during module hoisting
const { mockCreate, MockAnthropic } = vi.hoisted(() => {
  const mockCreate = vi.fn()
  class MockAnthropic {
    messages = {
      create: mockCreate,
    }
  }
  return { mockCreate, MockAnthropic }
})

vi.mock('@anthropic-ai/sdk', () => ({
  default: MockAnthropic,
}))

// Import after mock setup
import { AIGroupGenerator } from '../AIGroupGenerator'

describe('AIGroupGenerator', () => {
  let generator: AIGroupGenerator

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
      examples: ['Finding Nemo', 'Interstellar'],
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
      rejectionReason: 'Too obvious and not interesting',
      createdAt: new Date(),
    },
  ]

  const mockFilters: GenerationFilters = {
    yearRange: [1980, 2024],
  }

  const mockAIResponse: AIGroupResponse = {
    groups: [
      {
        films: [
          { title: 'Run', year: 2020 },
          { title: 'Drive', year: 2011 },
          { title: 'Crash', year: 2004 },
          { title: 'Taken', year: 2008 },
        ],
        connection: 'Titles that are verbs',
        connectionType: 'word-game',
        explanation: 'Each film has a one-word title that is an action verb.',
      },
      {
        films: [
          { title: 'Finding Nemo', year: 2003 },
          { title: 'The Pursuit of Happyness', year: 2006 },
          { title: 'Interstellar', year: 2014 },
          { title: 'Big Fish', year: 2003 },
        ],
        connection: 'Films about fatherhood',
        connectionType: 'thematic',
        explanation:
          'Each film centers on the relationship between fathers and their children.',
      },
    ],
  }

  beforeEach(() => {
    generator = new AIGroupGenerator()
    vi.clearAllMocks()
  })

  describe('generate', () => {
    it('should generate groups from AI response', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      const result = await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        mockGoodExamples,
        mockBadExamples
      )

      expect(result).toHaveLength(2)
      expect(result[0].connection).toBe('Titles that are verbs')
      expect(result[0].films).toHaveLength(4)
      expect(result[0].allFilmsVerified).toBe(false) // Not verified yet
    })

    it('should call Anthropic API with correct model', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        mockGoodExamples,
        mockBadExamples
      )

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-20250514',
          max_tokens: expect.any(Number),
          messages: expect.any(Array),
        })
      )
    })

    it('should include connection types in the prompt', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        mockGoodExamples,
        mockBadExamples
      )

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('Titles that are verbs')
      expect(userMessage.content).toContain('Films about fatherhood')
    })

    it('should include good examples in the prompt', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        mockGoodExamples,
        []
      )

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('GOOD EXAMPLES')
      expect(userMessage.content).toContain('Run')
      expect(userMessage.content).toContain('Drive')
    })

    it('should include bad examples with rejection reasons in the prompt', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        [],
        mockBadExamples
      )

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('BAD EXAMPLES')
      expect(userMessage.content).toContain('Too obvious and not interesting')
    })

    it('should include year range filter in the prompt', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(
        { yearRange: [1990, 2010] },
        mockConnectionTypes,
        2,
        [],
        []
      )

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('1990')
      expect(userMessage.content).toContain('2010')
    })

    it('should generate unique IDs for each group', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      const result = await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        [],
        []
      )

      expect(result[0].id).toBeDefined()
      expect(result[1].id).toBeDefined()
      expect(result[0].id).not.toBe(result[1].id)
    })

    it('should throw error when API call fails', async () => {
      mockCreate.mockRejectedValue(new Error('API rate limit exceeded'))

      await expect(
        generator.generate(mockFilters, mockConnectionTypes, 2, [], [])
      ).rejects.toThrow('API rate limit exceeded')
    })

    it('should throw error when AI returns invalid JSON', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'not valid json',
          },
        ],
      })

      await expect(
        generator.generate(mockFilters, mockConnectionTypes, 2, [], [])
      ).rejects.toThrow()
    })

    it('should handle empty connection types', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({ groups: [] }),
          },
        ],
      })

      const result = await generator.generate(mockFilters, [], 2, [], [])

      expect(result).toHaveLength(0)
    })

    it('should exclude specified connections from generation', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(
        { excludeConnections: ['Films about time travel', 'Heist films'] },
        mockConnectionTypes,
        2,
        [],
        []
      )

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('Films about time travel')
      expect(userMessage.content).toContain('Heist films')
    })

    it('should request the specified number of groups', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      await generator.generate(mockFilters, mockConnectionTypes, 20, [], [])

      const callArgs = mockCreate.mock.calls[0][0]
      const userMessage = callArgs.messages.find(
        (m: { role: string }) => m.role === 'user'
      )

      expect(userMessage.content).toContain('20')
    })

    it('should set allFilmsVerified to false for all generated groups', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockAIResponse),
          },
        ],
      })

      const result = await generator.generate(
        mockFilters,
        mockConnectionTypes,
        2,
        [],
        []
      )

      result.forEach((group) => {
        expect(group.allFilmsVerified).toBe(false)
      })
    })
  })
})
