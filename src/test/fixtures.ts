/**
 * Test Fixtures
 *
 * Shared mock data factories for tests and stories.
 * Ensures consistent test data with all required fields including genre.
 */

import type { StoredGroup, DifficultyColor, DifficultyLevel, GroupStatus } from '../lib/supabase/storage/IGroupStorage';
import type { StoredPuzzle, PuzzleStatus } from '../lib/supabase/storage/IPuzzleStorage';
import type { ConnectionType, ConnectionCategory } from '../services/group-generator/types';
import type { Genre, Item, Group } from '../types';

/**
 * Default genre for all test fixtures
 */
export const DEFAULT_TEST_GENRE: Genre = 'films';

/**
 * Create a mock item
 */
export function createMockItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 1,
    title: 'Test Item',
    year: 2020,
    ...overrides,
  };
}

/**
 * Create mock items array (4 items for a group)
 */
export function createMockItems(count: number = 4): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Test Item ${i + 1}`,
    year: 2020 + i,
  }));
}

/**
 * Create a mock StoredGroup
 */
export function createMockStoredGroup(overrides: Partial<StoredGroup> = {}): StoredGroup {
  return {
    id: 'group-1',
    createdAt: Date.now(),
    items: createMockItems(),
    connection: 'Test Connection',
    connectionType: 'thematic',
    difficultyScore: 50,
    color: 'yellow' as DifficultyColor,
    difficulty: 'easy' as DifficultyLevel,
    status: 'approved' as GroupStatus,
    usageCount: 0,
    lastUsedAt: null,
    genre: DEFAULT_TEST_GENRE,
    ...overrides,
  };
}

/**
 * Create multiple mock groups with varying difficulties
 */
export function createMockStoredGroups(count: number = 4): StoredGroup[] {
  const colors: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'hardest'];

  return Array.from({ length: count }, (_, i) => ({
    ...createMockStoredGroup(),
    id: `group-${i + 1}`,
    connection: `Test Connection ${i + 1}`,
    color: colors[i % 4],
    difficulty: difficulties[i % 4],
    difficultyScore: 25 + (i * 25),
  }));
}

/**
 * Create a mock Group (game format, not StoredGroup)
 */
export function createMockGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: 'group-1',
    items: createMockItems(),
    connection: 'Test Connection',
    difficulty: 'easy',
    color: 'yellow',
    ...overrides,
  };
}

/**
 * Create mock Groups for a puzzle (4 groups)
 */
export function createMockGroups(count: number = 4): Group[] {
  const colors: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'hardest'];

  return Array.from({ length: count }, (_, i) => ({
    id: `group-${i + 1}`,
    items: createMockItems().map((item, idx) => ({ ...item, id: (i * 4) + idx + 1 })),
    connection: `Test Connection ${i + 1}`,
    difficulty: difficulties[i % 4],
    color: colors[i % 4],
  }));
}

/**
 * Create a mock StoredPuzzle
 */
export function createMockStoredPuzzle(overrides: Partial<StoredPuzzle> = {}): StoredPuzzle {
  return {
    id: 'puzzle-1',
    createdAt: Date.now(),
    puzzleDate: null,
    title: 'Test Puzzle',
    groupIds: ['group-1', 'group-2', 'group-3', 'group-4'],
    status: 'pending' as PuzzleStatus,
    genre: DEFAULT_TEST_GENRE,
    groups: createMockGroups(),
    ...overrides,
  };
}

/**
 * Create a mock ConnectionType
 */
export function createMockConnectionType(overrides: Partial<ConnectionType> = {}): ConnectionType {
  return {
    id: 'ct-1',
    name: 'Test Connection Type',
    category: 'thematic' as ConnectionCategory,
    description: 'A test connection type for testing purposes',
    examples: ['Example 1', 'Example 2'],
    active: true,
    createdAt: new Date(),
    genre: DEFAULT_TEST_GENRE,
    ...overrides,
  };
}

/**
 * Create multiple mock ConnectionTypes
 */
export function createMockConnectionTypes(count: number = 3): ConnectionType[] {
  const categories: ConnectionCategory[] = ['word-game', 'people', 'thematic'];

  return Array.from({ length: count }, (_, i) => ({
    ...createMockConnectionType(),
    id: `ct-${i + 1}`,
    name: `Connection Type ${i + 1}`,
    category: categories[i % categories.length],
  }));
}
