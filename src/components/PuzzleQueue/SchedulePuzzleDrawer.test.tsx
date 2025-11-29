import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchedulePuzzleDrawer } from './SchedulePuzzleDrawer';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';

const mockPuzzles: StoredPuzzle[] = [
  {
    id: 'puzzle-1',
    createdAt: Date.now(),
    puzzleDate: null,
    title: 'Classic Film Connections',
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
    ],
  },
  {
    id: 'puzzle-2',
    createdAt: Date.now() - 86400000,
    puzzleDate: null,
    title: 'Sci-Fi Masters',
    groupIds: ['g5', 'g6', 'g7', 'g8'],
    status: 'pending',
    groups: [
      {
        id: 'group-5',
        films: [
          { id: 17, title: 'Blade Runner', year: 1982 },
          { id: 18, title: 'Alien', year: 1979 },
          { id: 19, title: 'The Martian', year: 2015 },
          { id: 20, title: 'Gladiator', year: 2000 },
        ],
        connection: 'Directed by Ridley Scott',
        difficulty: 'medium',
        color: 'green',
      },
    ],
  },
];

describe('SchedulePuzzleDrawer', () => {
  it('should not render when isOpen is false', () => {
    render(
      <SchedulePuzzleDrawer
        isOpen={false}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={() => {}}
        isScheduling={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={() => {}}
        isScheduling={false}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display the formatted date in header', () => {
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={() => {}}
        isScheduling={false}
      />
    );

    expect(screen.getByText(/schedule for december 4, 2024/i)).toBeInTheDocument();
  });

  it('should display list of available puzzles', () => {
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={() => {}}
        isScheduling={false}
      />
    );

    expect(screen.getByText('Classic Film Connections')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi Masters')).toBeInTheDocument();
  });

  it('should call onSchedule with puzzle id and date when schedule button is clicked', () => {
    const onSchedule = vi.fn();
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={onSchedule}
        isScheduling={false}
      />
    );

    // Expand the first accordion to reveal the schedule button
    fireEvent.click(screen.getByText('Classic Film Connections'));

    const scheduleButton = screen.getByRole('button', { name: /schedule/i });
    fireEvent.click(scheduleButton);

    expect(onSchedule).toHaveBeenCalledWith('puzzle-1', '2024-12-04');
  });

  it('should disable schedule button when isScheduling is true', () => {
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={() => {}}
        isScheduling={true}
      />
    );

    // Expand the first accordion
    fireEvent.click(screen.getByText('Classic Film Connections'));

    // Button shows "Scheduling..." when disabled
    const schedulingButtons = screen.getAllByText(/scheduling/i);
    expect(schedulingButtons.length).toBeGreaterThan(0);
    expect(schedulingButtons[0].closest('button')).toBeDisabled();
  });

  it('should show empty state when no puzzles available', () => {
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={() => {}}
        selectedDate="2024-12-04"
        availablePuzzles={[]}
        onSchedule={() => {}}
        isScheduling={false}
      />
    );

    expect(screen.getByText(/no puzzles available/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <SchedulePuzzleDrawer
        isOpen={true}
        onClose={onClose}
        selectedDate="2024-12-04"
        availablePuzzles={mockPuzzles}
        onSchedule={() => {}}
        isScheduling={false}
      />
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
