/**
 * Verifier Factory
 *
 * Creates the appropriate verifier based on genre/domain configuration.
 */

import type { Genre } from '../../../types'
import { getDomainConfig } from '../domainConfig'
import { TMDBVerifier } from '../TMDBVerifier'
import { MusicBrainzVerifier } from './MusicBrainzVerifier'
import { NoOpVerifier } from './NoOpVerifier'
import type { IItemVerifier } from './IItemVerifier'

/**
 * Create the appropriate verifier for a given genre
 */
export function createVerifier(genre: Genre): IItemVerifier {
  const config = getDomainConfig(genre)

  switch (config.verifierType) {
    case 'tmdb':
      return new TMDBVerifier()
    case 'musicbrainz':
      return new MusicBrainzVerifier()
    case 'none':
    default:
      return new NoOpVerifier()
  }
}
