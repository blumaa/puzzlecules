/**
 * MusicBrainzVerifier Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MusicBrainzVerifier } from '../MusicBrainzVerifier'

describe('MusicBrainzVerifier', () => {
  const verifier = new MusicBrainzVerifier()
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('verifyItem', () => {
    it('should return verified item when MusicBrainz finds a match', async () => {
      const mockResponse = {
        recordings: [
          {
            id: 'abc123',
            title: 'Bohemian Rhapsody',
            'first-release-date': '1975-10-31',
          },
        ],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await verifier.verifyItem('Bohemian Rhapsody', 1975)

      expect(result.verified).toBe(true)
      expect(result.title).toBe('Bohemian Rhapsody')
      expect(result.year).toBe(1975)
    })

    it('should return unverified when no recordings found', async () => {
      const mockResponse = {
        recordings: [],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await verifier.verifyItem('Nonexistent Song', 2020)

      expect(result.verified).toBe(false)
      expect(result.title).toBe('Nonexistent Song')
      expect(result.year).toBe(2020)
      expect(result.externalId).toBeNull()
    })

    it('should return unverified when API fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      const result = await verifier.verifyItem('Test Song', 2020)

      expect(result.verified).toBe(false)
      expect(result.title).toBe('Test Song')
    })

    it('should return unverified when fetch throws', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await verifier.verifyItem('Test Song', 2020)

      expect(result.verified).toBe(false)
      expect(result.title).toBe('Test Song')
    })

    it('should match within year tolerance', async () => {
      const mockResponse = {
        recordings: [
          {
            id: 'abc123',
            title: 'Test Song',
            'first-release-date': '1976-01-01', // Off by 1 year
          },
        ],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await verifier.verifyItem('Test Song', 1975)

      expect(result.verified).toBe(true)
      expect(result.year).toBe(1976)
    })
  })

  describe('verifyItems', () => {
    it('should return empty array for empty input', async () => {
      const result = await verifier.verifyItems([])
      expect(result).toEqual([])
    })

    it('should verify multiple items sequentially', async () => {
      const mockResponse = {
        recordings: [
          {
            id: 'abc123',
            title: 'Song Title',
            'first-release-date': '1980-01-01',
          },
        ],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const items = [
        { title: 'Song 1', year: 1980 },
        { title: 'Song 2', year: 1981 },
      ]

      const result = await verifier.verifyItems(items)

      expect(result).toHaveLength(2)
      // Fetch should be called for each item
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
