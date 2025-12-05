/**
 * Genre Context
 *
 * React context for managing selected genre state throughout the admin app.
 * Enables filtering by genre (films, music, books, sports).
 */

import { createContext, useContext } from 'react';
import type { Genre } from '../types';
import { DEFAULT_GENRE } from '../types';

/**
 * Genre context value type
 */
export interface GenreContextValue {
  /** Currently selected genre */
  genre: Genre;
  /** Update the selected genre */
  setGenre: (genre: Genre) => void;
}

/**
 * Default context value - used when no provider is present
 */
const defaultValue: GenreContextValue = {
  genre: DEFAULT_GENRE,
  setGenre: () => {
    console.warn('GenreProvider not found. Genre changes will not persist.');
  },
};

/**
 * Genre context for provider
 */
export const GenreContext = createContext<GenreContextValue>(defaultValue);

/**
 * Hook to access genre context.
 * Must be used within a GenreProvider.
 *
 * @returns GenreContextValue with current genre and setter
 *
 * @example
 * ```tsx
 * const { genre, setGenre } = useGenre();
 * ```
 */
export function useGenre(): GenreContextValue {
  const context = useContext(GenreContext);
  return context;
}
