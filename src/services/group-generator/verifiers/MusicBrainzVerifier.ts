/**
 * MusicBrainz Verifier
 *
 * Verification service that checks if songs exist in MusicBrainz.
 * Uses the free MusicBrainz API (no API key required).
 * https://musicbrainz.org/doc/MusicBrainz_API
 */

import type { AIItem, VerifiedItem } from '../types'
import type { IItemVerifier } from './IItemVerifier'

interface MusicBrainzRecording {
  id: string
  title: string
  'first-release-date'?: string
}

interface MusicBrainzSearchResponse {
  recordings: MusicBrainzRecording[]
}

export class MusicBrainzVerifier implements IItemVerifier {
  private readonly baseUrl = 'https://musicbrainz.org/ws/2'
  private readonly userAgent = 'Puzzlecules/1.0 (puzzlecules.com)'

  /**
   * Verify a single song exists in MusicBrainz
   */
  async verifyItem(title: string, year?: number): Promise<VerifiedItem> {
    try {
      // Build search query by song title
      const query = `recording:"${encodeURIComponent(title)}"`
      const url = `${this.baseUrl}/recording?query=${query}&fmt=json&limit=10`

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        console.warn(`MusicBrainz API returned ${response.status}`)
        return this.createUnverifiedItem(title, year)
      }

      const data = (await response.json()) as MusicBrainzSearchResponse

      if (!data.recordings || data.recordings.length === 0) {
        return this.createUnverifiedItem(title, year)
      }

      // Find a recording that matches title
      const match = data.recordings.find((recording) => {
        const titleMatches =
          this.normalizeTitle(recording.title) === this.normalizeTitle(title)
        return titleMatches
      })

      if (match) {
        return {
          title: title,
          year: this.extractYear(match['first-release-date']),
          externalId: null, // MusicBrainz IDs are strings, not stored
          verified: true,
        }
      }

      return this.createUnverifiedItem(title, year)
    } catch (error) {
      console.warn(`Failed to verify song "${title}":`, error)
      return this.createUnverifiedItem(title, year)
    }
  }

  /**
   * Verify multiple songs in sequence (MusicBrainz has rate limits)
   */
  async verifyItems(items: AIItem[]): Promise<VerifiedItem[]> {
    if (items.length === 0) return []

    const results: VerifiedItem[] = []

    // MusicBrainz rate limit: 1 request per second
    // Process sequentially with small delay
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const result = await this.verifyItem(item.title, item.year)
      results.push(result)

      // Add small delay to avoid rate limiting (only between requests)
      if (i < items.length - 1) {
        await this.delay(300)
      }
    }

    return results
  }

  private extractYear(dateString: string | undefined): number | undefined {
    if (!dateString || dateString.length < 4) return undefined
    const year = parseInt(dateString.substring(0, 4), 10)
    return isNaN(year) ? undefined : year
  }

  private normalizeTitle(title: string): string {
    return title.toLowerCase().trim()
  }

  private createUnverifiedItem(title: string, year?: number): VerifiedItem {
    return {
      title,
      year,
      externalId: null,
      verified: false,
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
