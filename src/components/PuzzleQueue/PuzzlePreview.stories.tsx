import type { Meta, StoryObj } from '@storybook/react-vite';
import { PuzzlePreview } from './PuzzlePreview';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';

const createMockGroup = (color: DifficultyColor, connection: string): StoredGroup => ({
  id: `group-${color}`,
  createdAt: Date.now(),
  items: [
    { id: 1, title: 'Pulp Fiction', year: 1994 },
    { id: 2, title: 'Kill Bill', year: 2003 },
    { id: 3, title: 'Reservoir Dogs', year: 1992 },
    { id: 4, title: 'Django Unchained', year: 2012 },
  ],
  connection,
  connectionType: 'director',
  difficultyScore: 2500,
  color,
  difficulty: color === 'yellow' ? 'easy' : color === 'green' ? 'medium' : color === 'blue' ? 'hard' : 'hardest',
  status: 'approved',
  usageCount: 0,
  lastUsedAt: null,
  genre: 'films',
});

const mockSelectedGroups: Record<DifficultyColor, StoredGroup> = {
  yellow: createMockGroup('yellow', 'Directed by Quentin Tarantino'),
  green: createMockGroup('green', 'Classic mob films'),
  blue: createMockGroup('blue', 'Mind-bending narratives'),
  purple: createMockGroup('purple', 'Sci-fi about communication'),
};

const meta: Meta<typeof PuzzlePreview> = {
  title: 'Components/PuzzleQueue/PuzzlePreview',
  component: PuzzlePreview,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <div style={{ maxWidth: '600px' }}>
          <Story />
        </div>
      </MockThemeProvider>
    ),
  ],
  argTypes: {
    onSave: { action: 'save' },
  },
};

export default meta;
type Story = StoryObj<typeof PuzzlePreview>;

export const Default: Story = {
  args: {
    selectedGroups: mockSelectedGroups,
    isSaving: false,
  },
};

export const Saving: Story = {
  args: {
    selectedGroups: mockSelectedGroups,
    isSaving: true,
  },
};
