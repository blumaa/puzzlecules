/**
 * Domain Configuration
 *
 * Genre-specific configuration for AI group generation.
 * Defines expert roles, item terminology, and verifier types.
 */

import type { Genre } from '../../types';

export interface DomainConfig {
  genre: Genre;
  expertRole: string;
  itemName: string;
  itemNamePlural: string;
  yearLabel: string;
  verifierType: 'tmdb' | 'musicbrainz' | 'none';
  /** Optional format instruction for AI (e.g., include artist for music) */
  formatInstruction?: string;
}

export const DOMAIN_CONFIGS: Record<Genre, DomainConfig> = {
  films: {
    genre: 'films',
    expertRole: 'film expert with deep knowledge of cinema history',
    itemName: 'film',
    itemNamePlural: 'films',
    yearLabel: 'release year',
    verifierType: 'tmdb',
  },
  music: {
    genre: 'music',
    expertRole: 'music expert with deep knowledge of music history across all genres',
    itemName: 'song',
    itemNamePlural: 'songs',
    yearLabel: '',
    verifierType: 'none', // MusicBrainz matching is too strict, skip verification
  },
  books: {
    genre: 'books',
    expertRole: 'literary expert with deep knowledge of books and authors',
    itemName: 'book',
    itemNamePlural: 'books',
    yearLabel: 'publication year',
    verifierType: 'none',
  },
  sports: {
    genre: 'sports',
    expertRole: 'sports expert with deep knowledge of athletes and sporting events',
    itemName: 'athlete/team',
    itemNamePlural: 'athletes/teams',
    yearLabel: 'year active',
    verifierType: 'none',
  },
};

export function getDomainConfig(genre: Genre): DomainConfig {
  return DOMAIN_CONFIGS[genre];
}
