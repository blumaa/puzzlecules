import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectedGroupDisplay } from './SelectedGroupDisplay';
import type { StoredGroup } from '../../lib/supabase/storage';

const mockGroup: StoredGroup = {
  id: 'group-1',
  createdAt: Date.now(),
  films: [
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
};

describe('SelectedGroupDisplay', () => {
  it('should render the group connection', () => {
    render(<SelectedGroupDisplay group={mockGroup} onRemove={() => {}} />);

    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
  });

  it('should render all film titles', () => {
    render(<SelectedGroupDisplay group={mockGroup} onRemove={() => {}} />);

    expect(screen.getByText('Pulp Fiction')).toBeInTheDocument();
    expect(screen.getByText('Kill Bill')).toBeInTheDocument();
    expect(screen.getByText('Reservoir Dogs')).toBeInTheDocument();
    expect(screen.getByText('Django Unchained')).toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<SelectedGroupDisplay group={mockGroup} onRemove={onRemove} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
