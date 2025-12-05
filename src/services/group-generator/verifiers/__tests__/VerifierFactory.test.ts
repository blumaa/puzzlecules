/**
 * VerifierFactory Tests
 */

import { describe, it, expect } from 'vitest'
import { createVerifier } from '../VerifierFactory'
import { TMDBVerifier } from '../../TMDBVerifier'
import { MusicBrainzVerifier } from '../MusicBrainzVerifier'
import { NoOpVerifier } from '../NoOpVerifier'

describe('createVerifier', () => {
  it('should return TMDBVerifier for films genre', () => {
    const verifier = createVerifier('films')
    expect(verifier).toBeInstanceOf(TMDBVerifier)
  })

  it('should return MusicBrainzVerifier for music genre', () => {
    const verifier = createVerifier('music')
    expect(verifier).toBeInstanceOf(MusicBrainzVerifier)
  })

  it('should return NoOpVerifier for books genre', () => {
    const verifier = createVerifier('books')
    expect(verifier).toBeInstanceOf(NoOpVerifier)
  })

  it('should return NoOpVerifier for sports genre', () => {
    const verifier = createVerifier('sports')
    expect(verifier).toBeInstanceOf(NoOpVerifier)
  })
})
