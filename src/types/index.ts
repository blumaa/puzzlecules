/**
 * Genre/domain type for multi-domain support
 */
export type Genre = 'films' | 'music' | 'books' | 'sports';

/**
 * Available genres for the admin UI
 */
export const GENRES: Genre[] = ['films', 'music', 'books', 'sports'];

/**
 * Default genre for backward compatibility
 */
export const DEFAULT_GENRE: Genre = 'films';

/**
 * Generic item type - can be a film, song, word, etc.
 * Domain-specific properties are optional.
 */
export interface Item {
  id: number | string; // TMDB uses number, MusicBrainz uses string UUID
  title: string;
  year?: number;
  director?: string;
  cast?: string[];
  genres?: string[];
  poster_path?: string;
  artist?: string; // For music
  album?: string; // For music
}

/**
 * @deprecated Use Item instead - kept for backward compatibility
 */
export type Film = Item;

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'hardest';
export type DifficultyColor = 'yellow' | 'green' | 'blue' | 'purple';

export interface Group {
  id: string;
  items: Item[];
  connection: string; // e.g., "Directed by Tarantino"
  difficulty: DifficultyLevel;
  color: DifficultyColor;
}

export interface GameState {
  items: Item[];
  groups: Group[];
  selectedItemIds: number[];
  foundGroups: Group[];
  previousGuesses: number[][]; // Track attempted combinations
  mistakes: number;
  gameStatus: 'playing' | 'won' | 'lost';
  isLoading: boolean;
  notification: string | null; // For "One away!" and other messages
  isShaking: boolean; // Trigger shake animation on wrong guess
  puzzleDate: string | null; // YYYY-MM-DD format of current puzzle
}

export type GroupingStrategy =
  | 'director'
  | 'actor'
  | 'theme'
  | 'wordplay'
  | 'decade'
  | 'year';

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  genre_ids: number[];
  overview: string;
  vote_count: number;
  popularity: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: Array<{
    id: number;
    name: string;
  }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
}

export interface TMDBDiscoverResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
}

/**
 * Saved puzzle format for persistence.
 */
export interface SavedPuzzle {
  id: string;
  groups: Group[];
  items: Item[];
  createdAt: number;
  metadata?: Record<string, unknown>;
}

// Re-export stats types
export type { GameResult, UserStats, IStatsStorage } from './stats';
