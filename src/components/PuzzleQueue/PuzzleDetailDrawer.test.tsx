import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleDetailDrawer } from './PuzzleDetailDrawer';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';

const mockPuzzle: StoredPuzzle = {
  id: 'puzzle-1',
  createdAt: Date.now(),
  puzzleDate: '2024-12-04',
  title: 'Test Puzzle',
  groupIds: ['g1', 'g2', 'g3', 'g4'],
  status: 'pending',
  groups: [
    {
      id: 'group-1',
      films: [
        { id: 1, title: 'Pulp Fiction', year: 1994 },
        { id: 2, title: 'Kill Bill', year: 2003 },
        { id: 3, title: 'Reservoir Dogs', year: 1992 },
        { id: 4, title: 'Django Unchained', year: 2012 },
      ],
      connection: 'Directed by Quentin Tarantino',
      difficulty: 'easy',
      color: 'yellow',
    },
    {
      id: 'group-2',
      films: [
        { id: 5, title: 'The Godfather', year: 1972 },
        { id: 6, title: 'Goodfellas', year: 1990 },
        { id: 7, title: 'Casino', year: 1995 },
        { id: 8, title: 'Scarface', year: 1983 },
      ],
      connection: 'Classic mob films',
      difficulty: 'medium',
      color: 'green',
    },
    {
      id: 'group-3',
      films: [
        { id: 9, title: 'Inception', year: 2010 },
        { id: 10, title: 'The Matrix', year: 1999 },
        { id: 11, title: 'Tenet', year: 2020 },
        { id: 12, title: 'Memento', year: 2000 },
      ],
      connection: 'Mind-bending narratives',
      difficulty: 'hard',
      color: 'blue',
    },
    {
      id: 'group-4',
      films: [
        { id: 13, title: 'Interstellar', year: 2014 },
        { id: 14, title: 'Arrival', year: 2016 },
        { id: 15, title: '2001: A Space Odyssey', year: 1968 },
        { id: 16, title: 'Contact', year: 1997 },
      ],
      connection: 'Sci-fi about communication',
      difficulty: 'hardest',
      color: 'purple',
    },
  ],
};

describe('PuzzleDetailDrawer', () => {
  it('should not render when isOpen is false', () => {
    render(
      <PuzzleDetailDrawer
        isOpen={false}
        onClose={() => {}}
        selectedDate="2024-12-04"
        puzzle={mockPuzzle}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <PuzzleDetailDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        puzzle={mockPuzzle}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display the formatted date in header', () => {
    render(
      <PuzzleDetailDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        puzzle={mockPuzzle}
      />
    );

    expect(screen.getByText('December 4, 2024')).toBeInTheDocument();
  });

  it('should display the puzzle title', () => {
    render(
      <PuzzleDetailDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        puzzle={mockPuzzle}
      />
    );

    expect(screen.getByText('Test Puzzle')).toBeInTheDocument();
  });

  it('should display puzzle groups', () => {
    render(
      <PuzzleDetailDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        puzzle={mockPuzzle}
      />
    );

    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
    expect(screen.getByText('Classic mob films')).toBeInTheDocument();
    expect(screen.getByText('Mind-bending narratives')).toBeInTheDocument();
    expect(screen.getByText('Sci-fi about communication')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <PuzzleDetailDrawer
        isOpen={true}
        onClose={onClose}
        selectedDate="2024-12-04"
        puzzle={mockPuzzle}
      />
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
