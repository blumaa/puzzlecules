/**
 * NoOp Verifier
 *
 * A pass-through verifier that marks all items as verified.
 * Used for genres without external verification APIs (books, sports).
 */

import type { AIItem, VerifiedItem } from '../types'
import type { IItemVerifier } from './IItemVerifier'

export class NoOpVerifier implements IItemVerifier {
  /**
   * Always returns the item as verified
   */
  async verifyItem(title: string, year?: number): Promise<VerifiedItem> {
    return {
      title,
      year,
      externalId: null,
      verified: true,
    }
  }

  /**
   * Returns all items as verified
   */
  async verifyItems(items: AIItem[]): Promise<VerifiedItem[]> {
    return items.map((item) => ({
      title: item.title,
      year: item.year,
      externalId: null,
      verified: true,
    }))
  }
}
