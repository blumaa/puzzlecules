/**
 * Genre Selector Component
 *
 * A tab selector for switching between genres in the admin app.
 * Uses the genre context for state management.
 */

import { Box, Button } from '@mond-design-system/theme';
import type { Genre } from '../../types';
import { GENRES } from '../../types';
import { useGenre } from '../../providers/GenreContext';

/**
 * Human-readable labels for each genre
 */
const GENRE_LABELS: Record<Genre, string> = {
  films: 'Films',
  music: 'Music',
  books: 'Books',
  sports: 'Sports',
};

interface GenreSelectorProps {
  /** Optional callback when genre changes */
  onGenreChange?: (genre: Genre) => void;
  /** Show only specific genres (default: show all available) */
  availableGenres?: Genre[];
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Genre selector component for admin pages.
 * Renders as a row of buttons/tabs for each genre.
 *
 * @example
 * ```tsx
 * <GenreSelector onGenreChange={(genre) => console.log(genre)} />
 * ```
 */
export function GenreSelector({
  onGenreChange,
  availableGenres = GENRES.slice(0, 2), // Default to films + music for MVP
  size = 'sm',
}: GenreSelectorProps) {
  const { genre, setGenre } = useGenre();

  const handleGenreSelect = (newGenre: Genre) => {
    setGenre(newGenre);
    onGenreChange?.(newGenre);
  };

  return (
    <Box display="flex" gap="xs">
      {availableGenres.map((g) => (
        <Button
          key={g}
          variant={genre === g ? 'primary' : 'outline'}
          size={size}
          onClick={() => handleGenreSelect(g)}
          aria-label={`Select ${GENRE_LABELS[g]} genre`}
        >
          {GENRE_LABELS[g]}
        </Button>
      ))}
    </Box>
  );
}
