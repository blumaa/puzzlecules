import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupSelector } from './GroupSelector';
import type { StoredGroup } from '../../lib/supabase/storage';

const mockGroups: StoredGroup[] = [
  {
    id: 'group-1',
    createdAt: Date.now(),
    items: [
      { id: 1, title: 'Pulp Fiction', year: 1994 },
      { id: 2, title: 'Kill Bill', year: 2003 },
      { id: 3, title: 'Reservoir Dogs', year: 1992 },
      { id: 4, title: 'Django Unchained', year: 2012 },
    ],
    connection: 'Directed by Quentin Tarantino',
    connectionType: 'director',
    difficultyScore: 2500,
    color: 'yellow',
    difficulty: 'easy',
    status: 'approved',
    usageCount: 2,
    lastUsedAt: null,
    genre: 'films',
  },
  {
    id: 'group-2',
    createdAt: Date.now(),
    items: [
      { id: 5, title: 'Toy Story', year: 1995 },
      { id: 6, title: 'Finding Nemo', year: 2003 },
      { id: 7, title: 'The Incredibles', year: 2004 },
      { id: 8, title: 'WALL-E', year: 2008 },
    ],
    connection: 'Pixar films',
    connectionType: 'studio',
    difficultyScore: 1500,
    color: 'yellow',
    difficulty: 'easy',
    status: 'approved',
    usageCount: 0,
    lastUsedAt: null,
    genre: 'films',
  },
];

describe('GroupSelector', () => {
  it('should render list of groups with their connections', () => {
    render(<GroupSelector groups={mockGroups} onSelect={() => {}} onCancel={() => {}} />);

    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
    expect(screen.getByText('Pixar films')).toBeInTheDocument();
  });

  it('should display usage count for each group', () => {
    render(<GroupSelector groups={mockGroups} onSelect={() => {}} onCancel={() => {}} />);

    expect(screen.getByText(/used 2x/i)).toBeInTheDocument();
    expect(screen.getByText(/used 0x/i)).toBeInTheDocument();
  });

  it('should call onSelect when a group is clicked', () => {
    const onSelect = vi.fn();
    render(<GroupSelector groups={mockGroups} onSelect={onSelect} onCancel={() => {}} />);

    fireEvent.click(screen.getByText('Directed by Quentin Tarantino'));

    expect(onSelect).toHaveBeenCalledWith(mockGroups[0]);
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<GroupSelector groups={mockGroups} onSelect={() => {}} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show empty message when no groups available', () => {
    render(<GroupSelector groups={[]} onSelect={() => {}} onCancel={() => {}} />);

    expect(screen.getByText(/no approved groups available/i)).toBeInTheDocument();
  });
});
