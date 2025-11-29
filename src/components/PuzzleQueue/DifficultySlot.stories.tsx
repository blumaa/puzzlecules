import type { Meta, StoryObj } from '@storybook/react-vite';
import { DifficultySlot } from './DifficultySlot';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import type { StoredGroup } from '../../lib/supabase/storage';

const mockGroups: StoredGroup[] = [
  {
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
  },
  {
    id: 'group-2',
    createdAt: Date.now(),
    films: [
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
  },
];

const meta: Meta<typeof DifficultySlot> = {
  title: 'Components/PuzzleQueue/DifficultySlot',
  component: DifficultySlot,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <div style={{ maxWidth: '300px' }}>
          <Story />
        </div>
      </MockThemeProvider>
    ),
  ],
  argTypes: {
    onActivate: { action: 'activate' },
    onDeactivate: { action: 'deactivate' },
    onSelectGroup: { action: 'selectGroup' },
    onRemoveGroup: { action: 'removeGroup' },
  },
};

export default meta;
type Story = StoryObj<typeof DifficultySlot>;

export const Empty: Story = {
  args: {
    color: 'yellow',
    selectedGroup: null,
    availableGroups: mockGroups,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    color: 'yellow',
    selectedGroup: null,
    availableGroups: mockGroups,
    isActive: true,
  },
};

export const Selected: Story = {
  args: {
    color: 'yellow',
    selectedGroup: mockGroups[0],
    availableGroups: mockGroups,
    isActive: false,
  },
};

export const GreenEmpty: Story = {
  args: {
    color: 'green',
    selectedGroup: null,
    availableGroups: mockGroups,
    isActive: false,
  },
};

export const BlueEmpty: Story = {
  args: {
    color: 'blue',
    selectedGroup: null,
    availableGroups: mockGroups,
    isActive: false,
  },
};

export const PurpleEmpty: Story = {
  args: {
    color: 'purple',
    selectedGroup: null,
    availableGroups: mockGroups,
    isActive: false,
  },
};
