import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineService } from '../PipelineService';
import type { IPuzzleStorage, StoredPuzzle } from '../../../lib/supabase/storage/IPuzzleStorage';
import type { IGroupStorage, FreshestGroupSet, GroupCountsByColor, StoredGroup } from '../../../lib/supabase/storage/IGroupStorage';
import type { PipelineConfig } from '../types';

// Mock storage implementations
const createMockPuzzleStorage = (): IPuzzleStorage => ({
  savePuzzle: vi.fn(),
  getPuzzle: vi.fn(),
  getDailyPuzzle: vi.fn(),
  listPuzzles: vi.fn(),
  updatePuzzle: vi.fn(),
  deletePuzzle: vi.fn(),
  getEmptyDays: vi.fn(),
  checkPuzzleExists: vi.fn(),
  batchUpdatePuzzles: vi.fn(),
  batchDeletePuzzles: vi.fn(),
  getUsedGroupIds: vi.fn().mockResolvedValue(new Set<string>()),
});

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

const createMockGroup = (color: string, id: string): StoredGroup => ({
  id,
  createdAt: Date.now(),
  items: [
    { id: 1, title: 'Item 1', year: 2020 },
    { id: 2, title: 'Item 2', year: 2021 },
    { id: 3, title: 'Item 3', year: 2022 },
    { id: 4, title: 'Item 4', year: 2023 },
  ],
  connection: `Test ${color} connection`,
  connectionType: 'test-type',
  difficultyScore: 5000,
  color: color as 'yellow' | 'green' | 'blue' | 'purple',
  difficulty: 'medium',
  status: 'approved',
  usageCount: 0,
  lastUsedAt: null,
  genre: 'films',
});

const createMockPuzzle = (id: string, groupIds: string[]): StoredPuzzle => ({
  id,
  createdAt: Date.now(),
  puzzleDate: null,
  title: null,
  groupIds,
  status: 'pending',
  genre: 'films',
  source: 'system',
});

describe('PipelineService', () => {
  let service: PipelineService;
  let mockPuzzleStorage: IPuzzleStorage;
  let mockGroupStorage: IGroupStorage;

  beforeEach(() => {
    mockPuzzleStorage = createMockPuzzleStorage();
    mockGroupStorage = createMockGroupStorage();
    service = new PipelineService(mockPuzzleStorage, mockGroupStorage);
  });

  describe('getDefaultConfig', () => {
    it('should return default config with specified genre', () => {
      const config = service.getDefaultConfig('films');

      expect(config.genre).toBe('films');
      expect(config.enabled).toBe(false);
      expect(config.rollingWindowDays).toBe(30);
      expect(config.minGroupsPerColor).toBe(10);
      expect(config.aiGenerationBatchSize).toBe(20);
    });
  });

  describe('checkPoolHealth', () => {
    it('should return group counts by color', async () => {
      const counts: GroupCountsByColor = {
        yellow: 15,
        green: 20,
        blue: 12,
        purple: 8,
      };
      vi.mocked(mockGroupStorage.getGroupCountsByColor).mockResolvedValue(counts);

      const health = await service.checkPoolHealth('films');

      expect(health.yellow).toBe(15);
      expect(health.green).toBe(20);
      expect(health.blue).toBe(12);
      expect(health.purple).toBe(8);
      expect(health.total).toBe(55);
      expect(health.sufficient).toBe(true);
    });

    it('should mark insufficient when any color has zero groups', async () => {
      const counts: GroupCountsByColor = {
        yellow: 15,
        green: 0,
        blue: 12,
        purple: 8,
      };
      vi.mocked(mockGroupStorage.getGroupCountsByColor).mockResolvedValue(counts);

      const health = await service.checkPoolHealth('films');

      expect(health.sufficient).toBe(false);
    });
  });

  describe('getEmptyDates', () => {
    it('should return empty dates from storage', async () => {
      const emptyDays = ['2024-12-10', '2024-12-12', '2024-12-15'];
      vi.mocked(mockPuzzleStorage.getEmptyDays).mockResolvedValue(emptyDays);

      const result = await service.getEmptyDates('films', 30);

      expect(result).toEqual(emptyDays);
      expect(mockPuzzleStorage.getEmptyDays).toHaveBeenCalled();
    });
  });

  describe('fillRollingWindow', () => {
    const config: PipelineConfig = {
      enabled: true,
      rollingWindowDays: 30,
      genre: 'films',
      minGroupsPerColor: 10,
      aiGenerationBatchSize: 20,
    };

    it('should return early when no empty days', async () => {
      vi.mocked(mockPuzzleStorage.getEmptyDays).mockResolvedValue([]);

      const result = await service.fillRollingWindow(config);

      expect(result.puzzlesCreated).toBe(0);
      expect(result.emptyDaysRemaining).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should create puzzles for empty days', async () => {
      const emptyDays = ['2024-12-10', '2024-12-11'];
      vi.mocked(mockPuzzleStorage.getEmptyDays).mockResolvedValue(emptyDays);

      // Mock listGroups to return enough unused groups for each color
      const mockGroups = [
        createMockGroup('yellow', 'y1'),
        createMockGroup('yellow', 'y2'),
        createMockGroup('yellow', 'y3'),
        createMockGroup('green', 'g1'),
        createMockGroup('green', 'g2'),
        createMockGroup('green', 'g3'),
        createMockGroup('blue', 'b1'),
        createMockGroup('blue', 'b2'),
        createMockGroup('blue', 'b3'),
        createMockGroup('purple', 'p1'),
        createMockGroup('purple', 'p2'),
        createMockGroup('purple', 'p3'),
      ];
      vi.mocked(mockGroupStorage.listGroups).mockResolvedValue({ groups: mockGroups, total: mockGroups.length });

      // Mock getFreshestGroupSet to return different groups each time
      let callCount = 0;
      vi.mocked(mockGroupStorage.getFreshestGroupSet).mockImplementation(async () => {
        callCount++;
        return {
          yellow: createMockGroup('yellow', `yellow-${callCount}`),
          green: createMockGroup('green', `green-${callCount}`),
          blue: createMockGroup('blue', `blue-${callCount}`),
          purple: createMockGroup('purple', `purple-${callCount}`),
        };
      });

      vi.mocked(mockPuzzleStorage.checkPuzzleExists).mockResolvedValue(false);

      let puzzleCount = 0;
      vi.mocked(mockPuzzleStorage.savePuzzle).mockImplementation(async (input) => {
        puzzleCount++;
        return createMockPuzzle(`puzzle-${puzzleCount}`, input.groupIds);
      });

      vi.mocked(mockPuzzleStorage.updatePuzzle).mockImplementation(async (id, updates) => ({
        ...createMockPuzzle(id, ['y', 'g', 'b', 'p']),
        ...updates,
        status: updates.status || 'pending',
      }));

      vi.mocked(mockGroupStorage.incrementUsage).mockResolvedValue(undefined);

      const result = await service.fillRollingWindow(config);

      expect(result.puzzlesCreated).toBe(2);
      expect(result.emptyDaysRemaining).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockPuzzleStorage.savePuzzle).toHaveBeenCalledTimes(2);
      expect(mockGroupStorage.incrementUsage).toHaveBeenCalledTimes(2);
    });

    it('should handle insufficient groups gracefully', async () => {
      const emptyDays = ['2024-12-10'];
      vi.mocked(mockPuzzleStorage.getEmptyDays).mockResolvedValue(emptyDays);

      // Mock listGroups to return groups with no purple
      const mockGroups = [
        createMockGroup('yellow', 'y1'),
        createMockGroup('green', 'g1'),
        createMockGroup('blue', 'b1'),
        // No purple groups!
      ];
      vi.mocked(mockGroupStorage.listGroups).mockResolvedValue({ groups: mockGroups, total: mockGroups.length });

      // Return incomplete group set (missing purple)
      vi.mocked(mockGroupStorage.getFreshestGroupSet).mockResolvedValue({
        yellow: createMockGroup('yellow', 'y1'),
        green: createMockGroup('green', 'g1'),
        blue: createMockGroup('blue', 'b1'),
        purple: null, // No purple available
      });

      const result = await service.fillRollingWindow(config);

      expect(result.puzzlesCreated).toBe(0);
      expect(result.emptyDaysRemaining).toBe(1);
      // Expect 2 errors: one from getColorsNeeded (no generator configured) and one from createPuzzleForDate
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some(e => e.code === 'INSUFFICIENT_GROUPS')).toBe(true);
    });

    it('should report insufficient groups when unused count is below puzzles needed', async () => {
      // Need 5 puzzles but only have 2 unused yellow groups
      const emptyDays = ['2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14'];
      vi.mocked(mockPuzzleStorage.getEmptyDays).mockResolvedValue(emptyDays);

      // Return groups that exist but are mostly used
      const mockGroups = [
        createMockGroup('yellow', 'y1'),
        createMockGroup('yellow', 'y2'),
        createMockGroup('green', 'g1'),
        createMockGroup('green', 'g2'),
        createMockGroup('green', 'g3'),
        createMockGroup('green', 'g4'),
        createMockGroup('green', 'g5'),
        createMockGroup('blue', 'b1'),
        createMockGroup('blue', 'b2'),
        createMockGroup('blue', 'b3'),
        createMockGroup('blue', 'b4'),
        createMockGroup('blue', 'b5'),
        createMockGroup('purple', 'p1'),
        createMockGroup('purple', 'p2'),
        createMockGroup('purple', 'p3'),
        createMockGroup('purple', 'p4'),
        createMockGroup('purple', 'p5'),
      ];
      vi.mocked(mockGroupStorage.listGroups).mockResolvedValue({ groups: mockGroups, total: mockGroups.length });

      // Still return groups for the puzzle
      vi.mocked(mockGroupStorage.getFreshestGroupSet).mockResolvedValue({
        yellow: createMockGroup('yellow', 'y1'),
        green: createMockGroup('green', 'g1'),
        blue: createMockGroup('blue', 'b1'),
        purple: createMockGroup('purple', 'p1'),
      });

      vi.mocked(mockPuzzleStorage.checkPuzzleExists).mockResolvedValue(false);
      vi.mocked(mockPuzzleStorage.savePuzzle).mockResolvedValue(createMockPuzzle('p1', ['y1', 'g1', 'b1', 'p1']));
      vi.mocked(mockPuzzleStorage.updatePuzzle).mockResolvedValue({
        ...createMockPuzzle('p1', ['y1', 'g1', 'b1', 'p1']),
        status: 'published',
      });
      vi.mocked(mockGroupStorage.incrementUsage).mockResolvedValue(undefined);

      const result = await service.fillRollingWindow(config);

      // No generator configured, so it should report the shortage but not trigger
      expect(result.aiGenerationTriggered).toBe(false);
      expect(result.errors.some(e => e.message.includes('yellow'))).toBe(true);
    });

    it('should retry when puzzle combination already exists', async () => {
      const emptyDays = ['2024-12-10'];
      vi.mocked(mockPuzzleStorage.getEmptyDays).mockResolvedValue(emptyDays);

      const poolCounts: GroupCountsByColor = {
        yellow: 15,
        green: 20,
        blue: 12,
        purple: 10,
      };
      vi.mocked(mockGroupStorage.getGroupCountsByColor).mockResolvedValue(poolCounts);

      let callCount = 0;
      vi.mocked(mockGroupStorage.getFreshestGroupSet).mockImplementation(async () => {
        callCount++;
        return {
          yellow: createMockGroup('yellow', `yellow-${callCount}`),
          green: createMockGroup('green', `green-${callCount}`),
          blue: createMockGroup('blue', `blue-${callCount}`),
          purple: createMockGroup('purple', `purple-${callCount}`),
        };
      });

      // First attempt: exists, second attempt: doesn't exist
      vi.mocked(mockPuzzleStorage.checkPuzzleExists)
        .mockResolvedValueOnce(true) // First combo exists
        .mockResolvedValueOnce(false); // Second combo doesn't exist

      vi.mocked(mockPuzzleStorage.savePuzzle).mockResolvedValue(
        createMockPuzzle('p1', ['yellow-2', 'green-2', 'blue-2', 'purple-2'])
      );
      vi.mocked(mockPuzzleStorage.updatePuzzle).mockResolvedValue({
        ...createMockPuzzle('p1', ['yellow-2', 'green-2', 'blue-2', 'purple-2']),
        status: 'published',
      });
      vi.mocked(mockGroupStorage.incrementUsage).mockResolvedValue(undefined);

      const result = await service.fillRollingWindow(config);

      expect(result.puzzlesCreated).toBe(1);
      expect(mockGroupStorage.getFreshestGroupSet).toHaveBeenCalledTimes(2);
      expect(mockPuzzleStorage.checkPuzzleExists).toHaveBeenCalledTimes(2);
    });
  });

  describe('createPuzzleForDate', () => {
    it('should create and publish a puzzle', async () => {
      const groupSet: FreshestGroupSet = {
        yellow: createMockGroup('yellow', 'y1'),
        green: createMockGroup('green', 'g1'),
        blue: createMockGroup('blue', 'b1'),
        purple: createMockGroup('purple', 'p1'),
      };

      vi.mocked(mockGroupStorage.getFreshestGroupSet).mockResolvedValue(groupSet);
      vi.mocked(mockPuzzleStorage.checkPuzzleExists).mockResolvedValue(false);
      vi.mocked(mockPuzzleStorage.savePuzzle).mockResolvedValue(
        createMockPuzzle('p1', ['y1', 'g1', 'b1', 'p1'])
      );
      vi.mocked(mockPuzzleStorage.updatePuzzle).mockResolvedValue({
        ...createMockPuzzle('p1', ['y1', 'g1', 'b1', 'p1']),
        puzzleDate: '2024-12-10',
        status: 'published',
      });
      vi.mocked(mockGroupStorage.incrementUsage).mockResolvedValue(undefined);

      const result = await service.createPuzzleForDate('2024-12-10', 'films', new Set());

      expect(result).not.toBeNull();
      expect(result?.puzzleDate).toBe('2024-12-10');
      expect(result?.status).toBe('published');
      expect(mockPuzzleStorage.updatePuzzle).toHaveBeenCalledWith('p1', {
        puzzleDate: '2024-12-10',
        status: 'published',
      });
      expect(mockGroupStorage.incrementUsage).toHaveBeenCalledWith(['y1', 'g1', 'b1', 'p1']);
    });

    it('should return null when groups are insufficient', async () => {
      vi.mocked(mockGroupStorage.getFreshestGroupSet).mockResolvedValue({
        yellow: createMockGroup('yellow', 'y1'),
        green: null, // Missing!
        blue: createMockGroup('blue', 'b1'),
        purple: createMockGroup('purple', 'p1'),
      });

      const result = await service.createPuzzleForDate('2024-12-10', 'films', new Set());

      expect(result).toBeNull();
      expect(mockPuzzleStorage.savePuzzle).not.toHaveBeenCalled();
    });
  });
});
