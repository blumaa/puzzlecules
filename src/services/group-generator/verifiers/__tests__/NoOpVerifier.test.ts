/**
 * NoOpVerifier Tests
 */

import { describe, it, expect } from 'vitest'
import { NoOpVerifier } from '../NoOpVerifier'

describe('NoOpVerifier', () => {
  const verifier = new NoOpVerifier()

  describe('verifyItem', () => {
    it('should return item as verified', async () => {
      const result = await verifier.verifyItem('Test Item', 2020)

      expect(result).toEqual({
        title: 'Test Item',
        year: 2020,
        externalId: null,
        verified: true,
      })
    })

    it('should preserve exact title and year', async () => {
      const result = await verifier.verifyItem('Special Title (Extended)', 1999)

      expect(result.title).toBe('Special Title (Extended)')
      expect(result.year).toBe(1999)
      expect(result.verified).toBe(true)
    })
  })

  describe('verifyItems', () => {
    it('should return empty array for empty input', async () => {
      const result = await verifier.verifyItems([])

      expect(result).toEqual([])
    })

    it('should return all items as verified', async () => {
      const items = [
        { title: 'Item 1', year: 2020 },
        { title: 'Item 2', year: 2019 },
        { title: 'Item 3', year: 2018 },
      ]

      const result = await verifier.verifyItems(items)

      expect(result).toHaveLength(3)
      expect(result.every((r) => r.verified)).toBe(true)
      expect(result.every((r) => r.externalId === null)).toBe(true)
      expect(result[0].title).toBe('Item 1')
      expect(result[1].title).toBe('Item 2')
      expect(result[2].title).toBe('Item 3')
    })
  })
})
