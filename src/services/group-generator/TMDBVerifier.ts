/**
 * TMDB Verifier
 *
 * Lightweight verification service that checks if films exist in TMDB.
 * Used to validate AI-generated film references before admin review.
 */

import { tmdbService } from '../tmdb'
import type { AIFilm, VerifiedFilm, ITMDBVerifier } from './types'

export class TMDBVerifier implements ITMDBVerifier {
  /** Year tolerance for matching (films can be off by 1 year) */
  private readonly yearTolerance = 1

  /**
   * Verify a single film exists in TMDB
   * @param title - Film title to search for
   * @param year - Expected release year
   * @returns VerifiedFilm with tmdbId if found, null if not
   */
  async verifyFilm(title: string, year: number): Promise<VerifiedFilm> {
    try {
      const searchResults = await tmdbService.searchMovies(title)

      if (!searchResults.results || searchResults.results.length === 0) {
        return this.createUnverifiedFilm(title, year)
      }

      // Find a film that matches both title and year (within tolerance)
      const match = searchResults.results.find((movie) => {
        const releaseYear = this.extractYear(movie.release_date)
        if (releaseYear === null) return false

        const yearMatches = Math.abs(releaseYear - year) <= this.yearTolerance
        const titleMatches = this.normalizeTitle(movie.title) === this.normalizeTitle(title)

        return yearMatches && titleMatches
      })

      if (match) {
        return {
          title: match.title,
          year: this.extractYear(match.release_date) ?? year,
          tmdbId: match.id,
          verified: true,
        }
      }

      // If no exact title match, try to find just by year match
      const yearMatch = searchResults.results.find((movie) => {
        const releaseYear = this.extractYear(movie.release_date)
        if (releaseYear === null) return false
        return Math.abs(releaseYear - year) <= this.yearTolerance
      })

      if (yearMatch) {
        return {
          title: yearMatch.title,
          year: this.extractYear(yearMatch.release_date) ?? year,
          tmdbId: yearMatch.id,
          verified: true,
        }
      }

      return this.createUnverifiedFilm(title, year)
    } catch (error) {
      console.warn(`Failed to verify film "${title}" (${year}):`, error)
      return this.createUnverifiedFilm(title, year)
    }
  }

  /**
   * Verify multiple films in parallel
   * @param films - Array of films to verify
   * @returns Array of VerifiedFilm results
   */
  async verifyFilms(films: AIFilm[]): Promise<VerifiedFilm[]> {
    if (films.length === 0) return []

    const verificationPromises = films.map((film) =>
      this.verifyFilm(film.title, film.year)
    )

    return Promise.all(verificationPromises)
  }

  /**
   * Extract year from TMDB date string
   * @param dateString - Date in "YYYY-MM-DD" format
   * @returns Year as number, or null if invalid
   */
  private extractYear(dateString: string | undefined): number | null {
    if (!dateString || dateString.length < 4) return null
    const year = parseInt(dateString.substring(0, 4), 10)
    return isNaN(year) ? null : year
  }

  /**
   * Normalize title for comparison (lowercase, trim whitespace)
   * @param title - Title to normalize
   * @returns Normalized title
   */
  private normalizeTitle(title: string): string {
    return title.toLowerCase().trim()
  }

  /**
   * Create an unverified film result
   * @param title - Film title
   * @param year - Film year
   * @returns VerifiedFilm with verified=false
   */
  private createUnverifiedFilm(title: string, year: number): VerifiedFilm {
    return {
      title,
      year,
      tmdbId: null,
      verified: false,
    }
  }
}
