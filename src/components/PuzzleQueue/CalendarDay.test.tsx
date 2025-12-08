import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarDay } from './CalendarDay';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';

const mockPuzzle: StoredPuzzle = {
  id: 'puzzle-1',
  createdAt: Date.now(),
  puzzleDate: '2024-12-04',
  title: 'Test Puzzle',
  groupIds: ['g1', 'g2', 'g3', 'g4'],
  status: 'pending',
  genre: 'films',
  source: 'system',
};

describe('CalendarDay', () => {
  it('should render the day number', () => {
    const date = new Date(2024, 11, 4); // December 4, 2024
    render(
      <CalendarDay
        date={date}
        puzzle={null}
        isToday={false}
        isPast={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render the day name in uppercase', () => {
    const date = new Date(2024, 11, 4); // December 4, 2024 (Wednesday)
    render(
      <CalendarDay
        date={date}
        puzzle={null}
        isToday={false}
        isPast={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('WED')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const date = new Date(2024, 11, 4);
    render(
      <CalendarDay
        date={date}
        puzzle={null}
        isToday={false}
        isPast={false}
        onClick={onClick}
      />
    );

    const dayCell = screen.getByRole('button');
    fireEvent.click(dayCell);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should show Scheduled tag when puzzle is scheduled', () => {
    const date = new Date(2024, 11, 4);
    render(
      <CalendarDay
        date={date}
        puzzle={mockPuzzle}
        isToday={false}
        isPast={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('should use primary variant when isToday is true', () => {
    const date = new Date(2024, 11, 4);
    render(
      <CalendarDay
        date={date}
        puzzle={null}
        isToday={true}
        isPast={false}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('mond-button--primary');
  });

  it('should use outline variant for other days', () => {
    const date = new Date(2024, 11, 1);
    render(
      <CalendarDay
        date={date}
        puzzle={null}
        isToday={false}
        isPast={true}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('mond-button--outline');
  });

  it('should show empty state when no puzzle scheduled', () => {
    const date = new Date(2024, 11, 4);
    render(
      <CalendarDay
        date={date}
        puzzle={null}
        isToday={false}
        isPast={false}
        onClick={() => {}}
      />
    );

    // Should not show scheduled indicator
    expect(screen.queryByText('Scheduled')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Puzzle')).not.toBeInTheDocument();
  });
});
