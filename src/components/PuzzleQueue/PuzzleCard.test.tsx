import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleCard } from './PuzzleCard';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';

// Mock puzzle data
const mockPuzzle: StoredPuzzle = {
  id: 'puzzle-1',
  createdAt: Date.now(),
  puzzleDate: null,
  title: 'Test Puzzle',
  groupIds: ['group-1', 'group-2', 'group-3', 'group-4'],
  status: 'pending',
  genre: 'films',
  groups: [
    {
      id: 'group-1',
      items: [
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
      items: [
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
      items: [
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
      items: [
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

describe('PuzzleCard', () => {
  it('should render puzzle title', () => {
    render(<PuzzleCard puzzle={mockPuzzle} />);

    expect(screen.getByText('Test Puzzle')).toBeInTheDocument();
  });

  it('should render "Untitled Puzzle" when title is null', () => {
    const puzzleWithoutTitle = { ...mockPuzzle, title: null };
    render(<PuzzleCard puzzle={puzzleWithoutTitle} />);

    expect(screen.getByText('Untitled Puzzle')).toBeInTheDocument();
  });

  it('should render all 4 connection groups when expanded', () => {
    render(<PuzzleCard puzzle={mockPuzzle} />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
    expect(screen.getByText('Classic mob films')).toBeInTheDocument();
    expect(screen.getByText('Mind-bending narratives')).toBeInTheDocument();
    expect(screen.getByText('Sci-fi about communication')).toBeInTheDocument();
  });

  it('should render schedule button when expanded and onSchedule is provided', () => {
    const onSchedule = vi.fn();
    render(<PuzzleCard puzzle={mockPuzzle} onSchedule={onSchedule} />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    const scheduleButton = screen.getByRole('button', { name: /schedule/i });
    expect(scheduleButton).toBeInTheDocument();
  });

  it('should not render schedule button when onSchedule is not provided', () => {
    render(<PuzzleCard puzzle={mockPuzzle} />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    const scheduleButton = screen.queryByRole('button', { name: /schedule/i });
    expect(scheduleButton).not.toBeInTheDocument();
  });

  it('should call onSchedule when schedule button is clicked', () => {
    const onSchedule = vi.fn();
    render(<PuzzleCard puzzle={mockPuzzle} onSchedule={onSchedule} />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    const scheduleButton = screen.getByRole('button', { name: /schedule/i });
    fireEvent.click(scheduleButton);

    expect(onSchedule).toHaveBeenCalledTimes(1);
  });

  it('should disable schedule button when isScheduling is true', () => {
    const onSchedule = vi.fn();
    render(<PuzzleCard puzzle={mockPuzzle} onSchedule={onSchedule} isScheduling />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    // When isScheduling, button shows "Scheduling..." and is disabled
    const scheduleButton = screen.getByText(/scheduling/i).closest('button');
    expect(scheduleButton).toBeDisabled();
  });

  it('should show loading state when isScheduling is true', () => {
    const onSchedule = vi.fn();
    render(<PuzzleCard puzzle={mockPuzzle} onSchedule={onSchedule} isScheduling />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    expect(screen.getByText(/scheduling/i)).toBeInTheDocument();
  });

  it('should handle puzzle with no groups gracefully', () => {
    const puzzleWithoutGroups = { ...mockPuzzle, groups: undefined };
    render(<PuzzleCard puzzle={puzzleWithoutGroups} />);

    // Expand the accordion
    fireEvent.click(screen.getByText('Test Puzzle'));

    expect(screen.getByText(/no groups/i)).toBeInTheDocument();
  });
});
