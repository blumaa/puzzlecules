import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupSelectorDrawer } from './GroupSelectorDrawer';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';

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
    usageCount: 0,
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
    usageCount: 3,
    lastUsedAt: null,
    genre: 'films',
  },
];

describe('GroupSelectorDrawer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    color: 'yellow' as DifficultyColor,
    groups: mockGroups,
    onSelect: vi.fn(),
  };

  it('should render the drawer with color label in header', () => {
    render(<GroupSelectorDrawer {...defaultProps} />);

    expect(screen.getByText('Select Easy Group')).toBeInTheDocument();
  });

  it('should render all available groups', () => {
    render(<GroupSelectorDrawer {...defaultProps} />);

    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
    expect(screen.getByText('Pixar films')).toBeInTheDocument();
  });

  it('should display usage count for each group', () => {
    render(<GroupSelectorDrawer {...defaultProps} />);

    expect(screen.getByText(/used 0x/i)).toBeInTheDocument();
    expect(screen.getByText(/used 3x/i)).toBeInTheDocument();
  });

  it('should call onSelect when a group is clicked', () => {
    const onSelect = vi.fn();
    render(<GroupSelectorDrawer {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Directed by Quentin Tarantino'));

    expect(onSelect).toHaveBeenCalledWith(mockGroups[0]);
  });

  it('should show empty state when no groups available', () => {
    render(<GroupSelectorDrawer {...defaultProps} groups={[]} />);

    expect(screen.getByText(/no.*groups available/i)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<GroupSelectorDrawer {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Select Easy Group')).not.toBeInTheDocument();
  });
});
