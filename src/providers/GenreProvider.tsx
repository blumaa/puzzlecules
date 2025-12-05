/**
 * Genre Provider
 *
 * Provides genre state management for the admin app.
 * Persists selected genre to localStorage for session persistence.
 */

import { ReactNode, useState, useEffect, useCallback } from 'react';
import type { Genre } from '../types';
import { DEFAULT_GENRE, GENRES } from '../types';
import { GenreContext } from './GenreContext';

const STORAGE_KEY = 'puzzlecules-genre';

/**
 * Check if a value is a valid Genre
 */
function isValidGenre(value: unknown): value is Genre {
  return typeof value === 'string' && GENRES.includes(value as Genre);
}

/**
 * Load genre from localStorage with validation
 */
function loadGenreFromStorage(): Genre {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidGenre(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, private mode, etc.)
  }
  return DEFAULT_GENRE;
}

/**
 * Save genre to localStorage
 */
function saveGenreToStorage(genre: Genre): void {
  try {
    localStorage.setItem(STORAGE_KEY, genre);
  } catch {
    // localStorage unavailable
  }
}

interface GenreProviderProps {
  children: ReactNode;
  /** Optional initial genre (overrides localStorage) */
  initialGenre?: Genre;
}

/**
 * Provider component for genre state.
 * Wraps the app to provide genre selection across all admin pages.
 *
 * @example
 * ```tsx
 * <GenreProvider>
 *   <App />
 * </GenreProvider>
 * ```
 */
export function GenreProvider({ children, initialGenre }: GenreProviderProps) {
  const [genre, setGenreState] = useState<Genre>(
    initialGenre ?? DEFAULT_GENRE
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (!initialGenre) {
      const stored = loadGenreFromStorage();
      setGenreState(stored);
    }
    setIsInitialized(true);
  }, [initialGenre]);

  // Persist to localStorage when genre changes
  const setGenre = useCallback((newGenre: Genre) => {
    setGenreState(newGenre);
    saveGenreToStorage(newGenre);
  }, []);

  // Avoid hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <GenreContext.Provider value={{ genre, setGenre }}>
      {children}
    </GenreContext.Provider>
  );
}
