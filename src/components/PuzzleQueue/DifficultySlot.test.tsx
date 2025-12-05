import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySlot } from './DifficultySlot';
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
];

describe('DifficultySlot', () => {
  it('should display the correct color label', () => {
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={null}
        availableGroups={mockGroups}
        isActive={false}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={() => {}}
      />
    );

    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('should display available count', () => {
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={null}
        availableGroups={mockGroups}
        isActive={false}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={() => {}}
      />
    );

    expect(screen.getByText('1 available')).toBeInTheDocument();
  });

  it('should show select button when empty and not active', () => {
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={null}
        availableGroups={mockGroups}
        isActive={false}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /select easy group/i })).toBeInTheDocument();
  });

  it('should call onActivate when select button is clicked', () => {
    const onActivate = vi.fn();
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={null}
        availableGroups={mockGroups}
        isActive={false}
        onActivate={onActivate}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /select easy group/i }));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('should show GroupSelectorDrawer when active', () => {
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={null}
        availableGroups={mockGroups}
        isActive={true}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={() => {}}
      />
    );

    // Drawer header should be visible
    expect(screen.getByRole('heading', { name: 'Select Easy Group' })).toBeInTheDocument();
    // Group from availableGroups should be listed in drawer
    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
  });

  it('should show SelectedGroupDisplay when group is selected', () => {
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={mockGroups[0]}
        availableGroups={mockGroups}
        isActive={false}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={() => {}}
      />
    );

    expect(screen.getByText('Directed by Quentin Tarantino')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('should call onSelectGroup when a group is selected', () => {
    const onSelectGroup = vi.fn();
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={null}
        availableGroups={mockGroups}
        isActive={true}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={onSelectGroup}
        onRemoveGroup={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Directed by Quentin Tarantino'));

    expect(onSelectGroup).toHaveBeenCalledWith(mockGroups[0]);
  });

  it('should call onRemoveGroup when remove is clicked', () => {
    const onRemoveGroup = vi.fn();
    render(
      <DifficultySlot
        color="yellow"
        selectedGroup={mockGroups[0]}
        availableGroups={mockGroups}
        isActive={false}
        onActivate={() => {}}
        onDeactivate={() => {}}
        onSelectGroup={() => {}}
        onRemoveGroup={onRemoveGroup}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    expect(onRemoveGroup).toHaveBeenCalledTimes(1);
  });
});
