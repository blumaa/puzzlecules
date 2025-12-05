import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineGenerator } from '../PipelineGenerator';
import type { IGroupStorage, GroupInput } from '../../../lib/supabase/storage/IGroupStorage';
import type {
  ConnectionType,
  GeneratedGroup,
  IConnectionTypeStore,
  IFeedbackStore,
  IItemVerifier,
  FeedbackRecord,
  GenerationFilters,
} from '../../group-generator/types';

// Type for the generate function
type GenerateGroupsFn = (
  apiKey: string,
  filters: GenerationFilters,
  connectionTypes: ConnectionType[],
  count: number,
  goodExamples: FeedbackRecord[],
  badExamples: FeedbackRecord[]
) => Promise<{ groups: GeneratedGroup[]; tokensUsed: { input: number | undefined; output: number | undefined } }>;

// Mock type for generate function
type MockGenerateGroupsFn = ReturnType<typeof vi.fn> & GenerateGroupsFn;

// Mock implementations
const createMockGroupStorage = (): IGroupStorage => ({
  saveGroup: vi.fn(),
  saveBatch: vi.fn(),
  getGroup: vi.fn(),
  getGroupsByIds: vi.fn(),
  listGroups: vi.fn().mockResolvedValue({ groups: [], total: 0 }),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  incrementUsage: vi.fn(),
  getGroupCountsByColor: vi.fn(),
  getFreshestGroupSet: vi.fn(),
});

const createMockConnectionTypeStore = (): IConnectionTypeStore => ({
  getActive: vi.fn().mockResolvedValue([]),
  getAll: vi.fn().mockResolvedValue([]),
  getByCategory: vi.fn().mockResolvedValue([]),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  toggleActive: vi.fn(),
});

const createMockFeedbackStore = (): IFeedbackStore => ({
  getAcceptedExamples: vi.fn().mockResolvedValue([]),
  getRejectedExamples: vi.fn().mockResolvedValue([]),
  recordFeedback: vi.fn(),
});

const createMockItemVerifier = (): IItemVerifier => ({
  verifyItem: vi.fn(),
  verifyItems: vi.fn(),
});

const createMockGeneratedGroup = (connection: string, type: string): GeneratedGroup => ({
  id: `gen-${Math.random()}`,
  items: [
    { title: 'Item 1', year: 2020, externalId: null, verified: false },
    { title: 'Item 2', year: 2021, externalId: null, verified: false },
    { title: 'Item 3', year: 2022, externalId: null, verified: false },
    { title: 'Item 4', year: 2023, externalId: null, verified: false },
  ],
  connection,
  connectionType: type,
  explanation: 'Test explanation',
  allItemsVerified: false,
});

describe('PipelineGenerator', () => {
  let generator: PipelineGenerator;
  let mockGroupStorage: IGroupStorage;
  let mockConnectionTypeStore: IConnectionTypeStore;
  let mockFeedbackStore: IFeedbackStore;
  let mockItemVerifier: IItemVerifier;
  let mockGenerateGroupsFn: MockGenerateGroupsFn;

  beforeEach(() => {
    mockGroupStorage = createMockGroupStorage();
    mockConnectionTypeStore = createMockConnectionTypeStore();
    mockFeedbackStore = createMockFeedbackStore();
    mockItemVerifier = createMockItemVerifier();
    mockGenerateGroupsFn = vi.fn() as MockGenerateGroupsFn;

    generator = new PipelineGenerator(
      mockGroupStorage,
      mockConnectionTypeStore,
      mockFeedbackStore,
      mockItemVerifier,
      mockGenerateGroupsFn
    );

    vi.clearAllMocks();
  });

  describe('generateForPipeline', () => {
    it('should return early when no colors needed', async () => {
      const result = await generator.generateForPipeline({
        genre: 'films',
        groupsPerColor: 10,
        colorsNeeded: [],
        apiKey: 'test-key',
      });

      expect(result.groupsGenerated).toBe(0);
      expect(result.groupsSaved).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockGenerateGroupsFn).not.toHaveBeenCalled();
    });

    it('should return error when no connection types available', async () => {
      vi.mocked(mockConnectionTypeStore.getActive).mockResolvedValue([]);

      const result = await generator.generateForPipeline({
        genre: 'films',
        groupsPerColor: 10,
        colorsNeeded: ['yellow'],
        apiKey: 'test-key',
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('No active connection types');
    });

    it('should generate groups for specified colors', async () => {
      const connectionTypes: ConnectionType[] = [
        { id: '1', name: 'test-type', category: 'thematic', description: 'Test', active: true, createdAt: new Date(), genre: 'films' },
      ];
      vi.mocked(mockConnectionTypeStore.getActive).mockResolvedValue(connectionTypes);

      const generatedGroups = [
        createMockGeneratedGroup('Yellow Connection', 'test-type'),
        createMockGeneratedGroup('Yellow Connection 2', 'test-type'),
      ];
      mockGenerateGroupsFn.mockResolvedValue({
        groups: generatedGroups,
        tokensUsed: { input: 100, output: 200 },
      });

      // Mock item verification - all items verified
      vi.mocked(mockItemVerifier.verifyItems).mockResolvedValue([
        { title: 'Item 1', year: 2020, externalId: 101, verified: true },
        { title: 'Item 2', year: 2021, externalId: 102, verified: true },
        { title: 'Item 3', year: 2022, externalId: 103, verified: true },
        { title: 'Item 4', year: 2023, externalId: 104, verified: true },
      ]);

      const result = await generator.generateForPipeline({
        genre: 'films',
        groupsPerColor: 2,
        colorsNeeded: ['yellow'],
        apiKey: 'test-key',
      });

      expect(result.groupsGenerated).toBe(2);
      expect(result.groupsSaved).toBe(2);
      expect(result.byColor.yellow).toBe(2);
      expect(mockGroupStorage.saveGroup).toHaveBeenCalledTimes(2);

      // Verify the saved group has correct color and difficulty
      const savedGroup = vi.mocked(mockGroupStorage.saveGroup).mock.calls[0][0] as GroupInput;
      expect(savedGroup.color).toBe('yellow');
      expect(savedGroup.difficulty).toBe('easy');
      expect(savedGroup.difficultyScore).toBe(1);
      expect(savedGroup.status).toBe('approved');
    });

    it('should skip groups with unverified items', async () => {
      const connectionTypes: ConnectionType[] = [
        { id: '1', name: 'test-type', category: 'thematic', description: 'Test', active: true, createdAt: new Date(), genre: 'films' },
      ];
      vi.mocked(mockConnectionTypeStore.getActive).mockResolvedValue(connectionTypes);

      const generatedGroups = [createMockGeneratedGroup('Connection', 'test-type')];
      mockGenerateGroupsFn.mockResolvedValue({
        groups: generatedGroups,
        tokensUsed: { input: 100, output: 200 },
      });

      // Mock item verification - one item not verified
      vi.mocked(mockItemVerifier.verifyItems).mockResolvedValue([
        { title: 'Item 1', year: 2020, externalId: 101, verified: true },
        { title: 'Item 2', year: 2021, externalId: null, verified: false }, // Not verified!
        { title: 'Item 3', year: 2022, externalId: 103, verified: true },
        { title: 'Item 4', year: 2023, externalId: 104, verified: true },
      ]);

      const result = await generator.generateForPipeline({
        genre: 'films',
        groupsPerColor: 1,
        colorsNeeded: ['yellow'],
        apiKey: 'test-key',
      });

      expect(result.groupsGenerated).toBe(1);
      expect(result.groupsSaved).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('unverified items');
    });

    it('should generate with correct difficulty for each color', async () => {
      const connectionTypes: ConnectionType[] = [
        { id: '1', name: 'test-type', category: 'thematic', description: 'Test', active: true, createdAt: new Date(), genre: 'films' },
      ];
      vi.mocked(mockConnectionTypeStore.getActive).mockResolvedValue(connectionTypes);

      // Mock to return one group per call
      mockGenerateGroupsFn.mockImplementation(async (_key: string, filters: GenerationFilters) => ({
        groups: [createMockGeneratedGroup(`${filters.targetDifficulty} Connection`, 'test-type')],
        tokensUsed: { input: 100, output: 200 },
      }));

      // All items verified
      vi.mocked(mockItemVerifier.verifyItems).mockResolvedValue([
        { title: 'Item 1', year: 2020, externalId: 101, verified: true },
        { title: 'Item 2', year: 2021, externalId: 102, verified: true },
        { title: 'Item 3', year: 2022, externalId: 103, verified: true },
        { title: 'Item 4', year: 2023, externalId: 104, verified: true },
      ]);

      const result = await generator.generateForPipeline({
        genre: 'films',
        groupsPerColor: 1,
        colorsNeeded: ['yellow', 'green', 'blue', 'purple'],
        apiKey: 'test-key',
      });

      expect(result.groupsSaved).toBe(4);

      // Check that each color was called with correct difficulty
      const calls = mockGenerateGroupsFn.mock.calls;
      expect(calls[0][1].targetDifficulty).toBe('easy'); // yellow
      expect(calls[1][1].targetDifficulty).toBe('medium'); // green
      expect(calls[2][1].targetDifficulty).toBe('hard'); // blue
      expect(calls[3][1].targetDifficulty).toBe('expert'); // purple

      // Check saved groups have correct mapping
      const savedGroups = vi.mocked(mockGroupStorage.saveGroup).mock.calls.map(
        (call) => call[0] as GroupInput
      );

      const yellowGroup = savedGroups.find((g) => g.color === 'yellow');
      expect(yellowGroup?.difficulty).toBe('easy');
      expect(yellowGroup?.difficultyScore).toBe(1);

      const purpleGroup = savedGroups.find((g) => g.color === 'purple');
      expect(purpleGroup?.difficulty).toBe('hardest'); // Storage uses 'hardest' not 'expert'
      expect(purpleGroup?.difficultyScore).toBe(4);
    });

    it('should exclude existing connections', async () => {
      const connectionTypes: ConnectionType[] = [
        { id: '1', name: 'test-type', category: 'thematic', description: 'Test', active: true, createdAt: new Date(), genre: 'films' },
      ];
      vi.mocked(mockConnectionTypeStore.getActive).mockResolvedValue(connectionTypes);

      // Mock existing groups
      vi.mocked(mockGroupStorage.listGroups).mockResolvedValue({
        groups: [
          { id: '1', connection: 'Existing Connection 1', color: 'yellow' } as never,
          { id: '2', connection: 'Existing Connection 2', color: 'green' } as never,
        ],
        total: 2,
      });

      mockGenerateGroupsFn.mockResolvedValue({
        groups: [],
        tokensUsed: { input: 100, output: 200 },
      });

      await generator.generateForPipeline({
        genre: 'films',
        groupsPerColor: 1,
        colorsNeeded: ['yellow'],
        apiKey: 'test-key',
      });

      // Check that excludeConnections was passed to generate function
      const filters = mockGenerateGroupsFn.mock.calls[0][1];
      expect(filters.excludeConnections).toContain('Existing Connection 1');
      expect(filters.excludeConnections).toContain('Existing Connection 2');
    });
  });
});
