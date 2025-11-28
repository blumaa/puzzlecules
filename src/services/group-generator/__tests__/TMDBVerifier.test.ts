import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TMDBVerifier } from '../TMDBVerifier'
import type { AIFilm } from '../types'

// Mock the TMDB service
vi.mock('../../tmdb', () => ({
  tmdbService: {
    searchMovies: vi.fn(),
  },
}))

import { tmdbService } from '../../tmdb'

describe('TMDBVerifier', () => {
  let verifier: TMDBVerifier

  beforeEach(() => {
    verifier = new TMDBVerifier()
    vi.clearAllMocks()
  })

  describe('verifyFilm', () => {
    it('should return verified film when exact match found', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [
          {
            id: 278,
            title: 'The Shawshank Redemption',
            release_date: '1994-09-23',
            poster_path: '/poster.jpg',
            genre_ids: [18, 80],
            overview: 'Two imprisoned men bond...',
            vote_count: 25000,
            popularity: 100,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      })

      const result = await verifier.verifyFilm('The Shawshank Redemption', 1994)

      expect(result).toEqual({
        title: 'The Shawshank Redemption',
        year: 1994,
        tmdbId: 278,
        verified: true,
      })
      expect(tmdbService.searchMovies).toHaveBeenCalledWith(
        'The Shawshank Redemption'
      )
    })

    it('should return verified film when year matches within 1 year tolerance', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [
          {
            id: 123,
            title: 'Some Movie',
            release_date: '1995-01-15', // Film released in Jan 1995
            poster_path: null,
            genre_ids: [],
            overview: '',
            vote_count: 1000,
            popularity: 50,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      })

      // AI says 1994, but film was released early 1995 - should still match
      const result = await verifier.verifyFilm('Some Movie', 1994)

      expect(result.verified).toBe(true)
      expect(result.tmdbId).toBe(123)
    })

    it('should return unverified when no results found', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [],
        page: 1,
        total_pages: 0,
        total_results: 0,
      })

      const result = await verifier.verifyFilm('Nonexistent Movie', 2020)

      expect(result).toEqual({
        title: 'Nonexistent Movie',
        year: 2020,
        tmdbId: null,
        verified: false,
      })
    })

    it('should return unverified when year does not match any result', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [
          {
            id: 456,
            title: 'Some Movie',
            release_date: '2010-05-01', // Wrong year
            poster_path: null,
            genre_ids: [],
            overview: '',
            vote_count: 1000,
            popularity: 50,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      })

      const result = await verifier.verifyFilm('Some Movie', 2020)

      expect(result.verified).toBe(false)
      expect(result.tmdbId).toBe(null)
    })

    it('should find correct film from multiple results', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [
          {
            id: 100,
            title: 'Dune',
            release_date: '1984-12-14', // Original
            poster_path: null,
            genre_ids: [],
            overview: '',
            vote_count: 2000,
            popularity: 30,
          },
          {
            id: 438631,
            title: 'Dune',
            release_date: '2021-09-15', // Remake
            poster_path: null,
            genre_ids: [],
            overview: '',
            vote_count: 10000,
            popularity: 100,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 2,
      })

      const result = await verifier.verifyFilm('Dune', 2021)

      expect(result.verified).toBe(true)
      expect(result.tmdbId).toBe(438631) // Should match the 2021 version
    })

    it('should handle TMDB API errors gracefully', async () => {
      vi.mocked(tmdbService.searchMovies).mockRejectedValue(
        new Error('API Error')
      )

      const result = await verifier.verifyFilm('Some Movie', 2020)

      expect(result).toEqual({
        title: 'Some Movie',
        year: 2020,
        tmdbId: null,
        verified: false,
      })
    })

    it('should handle films with missing release_date', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [
          {
            id: 789,
            title: 'Mystery Film',
            release_date: '', // Empty release date
            poster_path: null,
            genre_ids: [],
            overview: '',
            vote_count: 100,
            popularity: 10,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      })

      const result = await verifier.verifyFilm('Mystery Film', 2020)

      expect(result.verified).toBe(false)
    })

    it('should normalize title matching (case insensitive)', async () => {
      vi.mocked(tmdbService.searchMovies).mockResolvedValue({
        results: [
          {
            id: 111,
            title: 'THE MATRIX',
            release_date: '1999-03-31',
            poster_path: null,
            genre_ids: [],
            overview: '',
            vote_count: 20000,
            popularity: 80,
          },
        ],
        page: 1,
        total_pages: 1,
        total_results: 1,
      })

      const result = await verifier.verifyFilm('The Matrix', 1999)

      expect(result.verified).toBe(true)
      expect(result.tmdbId).toBe(111)
    })
  })

  describe('verifyFilms', () => {
    it('should verify multiple films in parallel', async () => {
      vi.mocked(tmdbService.searchMovies)
        .mockResolvedValueOnce({
          results: [
            {
              id: 278,
              title: 'The Shawshank Redemption',
              release_date: '1994-09-23',
              poster_path: null,
              genre_ids: [],
              overview: '',
              vote_count: 25000,
              popularity: 100,
            },
          ],
          page: 1,
          total_pages: 1,
          total_results: 1,
        })
        .mockResolvedValueOnce({
          results: [
            {
              id: 238,
              title: 'The Godfather',
              release_date: '1972-03-14',
              poster_path: null,
              genre_ids: [],
              overview: '',
              vote_count: 20000,
              popularity: 90,
            },
          ],
          page: 1,
          total_pages: 1,
          total_results: 1,
        })

      const films: AIFilm[] = [
        { title: 'The Shawshank Redemption', year: 1994 },
        { title: 'The Godfather', year: 1972 },
      ]

      const results = await verifier.verifyFilms(films)

      expect(results).toHaveLength(2)
      expect(results[0].verified).toBe(true)
      expect(results[0].tmdbId).toBe(278)
      expect(results[1].verified).toBe(true)
      expect(results[1].tmdbId).toBe(238)
    })

    it('should handle mixed verified and unverified films', async () => {
      vi.mocked(tmdbService.searchMovies)
        .mockResolvedValueOnce({
          results: [
            {
              id: 278,
              title: 'The Shawshank Redemption',
              release_date: '1994-09-23',
              poster_path: null,
              genre_ids: [],
              overview: '',
              vote_count: 25000,
              popularity: 100,
            },
          ],
          page: 1,
          total_pages: 1,
          total_results: 1,
        })
        .mockResolvedValueOnce({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        })

      const films: AIFilm[] = [
        { title: 'The Shawshank Redemption', year: 1994 },
        { title: 'Fake Movie That Does Not Exist', year: 2020 },
      ]

      const results = await verifier.verifyFilms(films)

      expect(results).toHaveLength(2)
      expect(results[0].verified).toBe(true)
      expect(results[1].verified).toBe(false)
    })

    it('should return empty array for empty input', async () => {
      const results = await verifier.verifyFilms([])

      expect(results).toEqual([])
      expect(tmdbService.searchMovies).not.toHaveBeenCalled()
    })
  })
})
