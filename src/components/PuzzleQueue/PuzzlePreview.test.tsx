import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzlePreview } from './PuzzlePreview';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';

const createMockGroup = (color: DifficultyColor, connection: string): StoredGroup => ({
  id: `group-${color}`,
  createdAt: Date.now(),
  films: [
    { id: 1, title: 'Film 1', year: 2000 },
    { id: 2, title: 'Film 2', year: 2001 },
    { id: 3, title: 'Film 3', year: 2002 },
    { id: 4, title: 'Film 4', year: 2003 },
  ],
  connection,
  connectionType: 'director',
  difficultyScore: 2500,
  color,
  difficulty: color === 'yellow' ? 'easy' : color === 'green' ? 'medium' : color === 'blue' ? 'hard' : 'hardest',
  status: 'approved',
  usageCount: 0,
  lastUsedAt: null,
});

const mockSelectedGroups: Record<DifficultyColor, StoredGroup> = {
  yellow: createMockGroup('yellow', 'Easy connection'),
  green: createMockGroup('green', 'Medium connection'),
  blue: createMockGroup('blue', 'Hard connection'),
  purple: createMockGroup('purple', 'Hardest connection'),
};

describe('PuzzlePreview', () => {
  it('should render all 4 selected groups', () => {
    render(
      <PuzzlePreview
        selectedGroups={mockSelectedGroups}
        onSave={() => {}}
        isSaving={false}
      />
    );

    expect(screen.getByText('Easy connection')).toBeInTheDocument();
    expect(screen.getByText('Medium connection')).toBeInTheDocument();
    expect(screen.getByText('Hard connection')).toBeInTheDocument();
    expect(screen.getByText('Hardest connection')).toBeInTheDocument();
  });

  it('should render Puzzle Preview heading', () => {
    render(
      <PuzzlePreview
        selectedGroups={mockSelectedGroups}
        onSave={() => {}}
        isSaving={false}
      />
    );

    expect(screen.getByText('Puzzle Preview')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked', () => {
    const onSave = vi.fn();
    render(
      <PuzzlePreview
        selectedGroups={mockSelectedGroups}
        onSave={onSave}
        isSaving={false}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save puzzle/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should disable button when isSaving is true', () => {
    render(
      <PuzzlePreview
        selectedGroups={mockSelectedGroups}
        onSave={() => {}}
        isSaving={true}
      />
    );

    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
  });

  it('should show saving text when isSaving is true', () => {
    render(
      <PuzzlePreview
        selectedGroups={mockSelectedGroups}
        onSave={() => {}}
        isSaving={true}
      />
    );

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
});
