/**
 * Pipeline Fill API Tests
 *
 * Tests for the cron job endpoint that auto-fills puzzles.
 * The actual pipeline logic is tested in PipelineService.test.ts.
 * These tests verify the API correctly wires up the service.
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Set environment variables before importing handler
beforeAll(() => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
});

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));

// Mock the storage classes with proper class syntax
vi.mock('../../src/lib/supabase/storage/SupabaseStorage', () => ({
  SupabaseStorage: class MockSupabaseStorage {
    constructor() {}
  },
}));

vi.mock('../../src/lib/supabase/storage/SupabaseGroupStorage', () => ({
  SupabaseGroupStorage: class MockSupabaseGroupStorage {
    constructor() {}
  },
}));

// Mock PipelineService
const mockFillRollingWindow = vi.fn();
const mockSetGenerator = vi.fn();
vi.mock('../../src/services/pipeline/PipelineService', () => ({
  PipelineService: class MockPipelineService {
    fillRollingWindow = mockFillRollingWindow;
    setGenerator = mockSetGenerator;
    constructor() {}
  },
}));

// Mock PipelineConfigStore
const mockGetConfig = vi.fn();
vi.mock('../../src/services/pipeline/PipelineConfigStore', () => ({
  PipelineConfigStore: class MockPipelineConfigStore {
    getConfig = mockGetConfig;
    constructor() {}
  },
}));

// Mock PipelineGenerator
vi.mock('../../src/services/pipeline/PipelineGenerator', () => ({
  PipelineGenerator: class MockPipelineGenerator {
    constructor() {}
  },
}));

// Mock other dependencies
vi.mock('../../src/services/group-generator/ConnectionTypeStore', () => ({
  ConnectionTypeStore: class MockConnectionTypeStore {
    constructor() {}
  },
}));

vi.mock('../../src/services/group-generator/FeedbackStore', () => ({
  FeedbackStore: class MockFeedbackStore {
    constructor() {}
  },
}));

vi.mock('../../src/services/group-generator/verifiers/VerifierFactory', () => ({
  createVerifier: vi.fn(() => ({
    verifyItem: vi.fn(),
    verifyItems: vi.fn(),
  })),
}));

vi.mock('../../src/services/group-generator/generateGroupsV2', () => ({
  generateGroupsV2: vi.fn(),
}));

// Helper to create mock request
function createMockRequest(options: {
  method?: string;
  headers?: Record<string, string>;
}): VercelRequest {
  return {
    method: options.method || 'POST',
    headers: options.headers || {},
  } as VercelRequest;
}

// Helper to create mock response
function createMockResponse(): VercelResponse & {
  _status: number;
  _json: unknown;
} {
  const res = {
    _status: 200,
    _json: null as unknown,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(data: unknown) {
      this._json = data;
      return this;
    },
  };
  return res as VercelResponse & { _status: number; _json: unknown };
}

describe('pipeline-fill API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    delete process.env.CRON_SECRET;
  });

  describe('authentication', () => {
    it('should return 401 when CRON_SECRET is set but auth header is missing', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(401);
      expect(res._json).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when CRON_SECRET is set but auth header is wrong', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({
        method: 'POST',
        headers: { authorization: 'Bearer wrong-secret' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(401);
      expect(res._json).toEqual({ error: 'Unauthorized' });
    });

    it('should allow request when auth header matches CRON_SECRET', async () => {
      process.env.CRON_SECRET = 'test-secret';

      // Setup mocks for successful path
      mockGetConfig.mockResolvedValue({ enabled: false, genre: 'films' });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({
        method: 'POST',
        headers: { authorization: 'Bearer test-secret' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
    });

    it('should allow request when CRON_SECRET is not set', async () => {
      mockGetConfig.mockResolvedValue({ enabled: false, genre: 'films' });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
    });
  });

  describe('HTTP methods', () => {
    it('should return 405 for PUT method', async () => {
      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'PUT' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(405);
      expect(res._json).toEqual({ error: 'Method not allowed' });
    });

    it('should allow GET method', async () => {
      mockGetConfig.mockResolvedValue({ enabled: false, genre: 'films' });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'GET' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
    });

    it('should allow POST method', async () => {
      mockGetConfig.mockResolvedValue({ enabled: false, genre: 'films' });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
    });
  });

  describe('pipeline execution', () => {
    it('should skip when genre is disabled', async () => {
      mockGetConfig.mockResolvedValue({
        enabled: false,
        genre: 'films',
        rollingWindowDays: 30,
        minGroupsPerColor: 10,
        aiGenerationBatchSize: 20,
      });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res._status).toBe(200);
      const json = res._json as { results: Record<string, { result?: { skipped: boolean } }> };
      expect(json.results.films.result?.skipped).toBe(true);
      expect(mockFillRollingWindow).not.toHaveBeenCalled();
    });

    it('should call PipelineService.fillRollingWindow when enabled', async () => {
      mockGetConfig.mockResolvedValue({
        enabled: true,
        genre: 'films',
        rollingWindowDays: 30,
        minGroupsPerColor: 10,
        aiGenerationBatchSize: 20,
      });

      mockFillRollingWindow.mockResolvedValue({
        puzzlesCreated: 5,
        emptyDaysRemaining: 0,
        aiGenerationTriggered: false,
        groupsGenerated: 0,
        groupsSaved: 0,
        groupsByColor: {
          yellow: { generated: 0, saved: 0 },
          green: { generated: 0, saved: 0 },
          blue: { generated: 0, saved: 0 },
          purple: { generated: 0, saved: 0 },
        },
        errors: [],
      });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      expect(mockFillRollingWindow).toHaveBeenCalled();
      expect(res._status).toBe(200);
      const json = res._json as { results: Record<string, { result?: { puzzlesCreated: number } }> };
      expect(json.results.films.result?.puzzlesCreated).toBe(5);
    });

    it('should return correct response format', async () => {
      mockGetConfig.mockResolvedValue({ enabled: false, genre: 'films' });

      const handler = (await import('../pipeline-fill')).default;
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      await handler(req, res);

      const json = res._json as { timestamp: string; results: Record<string, unknown> };
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('results');
      expect(json.results).toHaveProperty('films');
      expect(json.results).toHaveProperty('music');
    });
  });
});
