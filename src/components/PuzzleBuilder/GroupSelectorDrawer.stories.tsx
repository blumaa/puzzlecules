import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupSelectorDrawer } from './GroupSelectorDrawer';
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
    usageCount: 0,
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
    usageCount: 3,
    lastUsedAt: null,
  },
  {
    id: 'group-3',
    createdAt: Date.now(),
    films: [
      { id: 9, title: 'The Godfather', year: 1972 },
      { id: 10, title: 'Goodfellas', year: 1990 },
      { id: 11, title: 'Casino', year: 1995 },
      { id: 12, title: 'Scarface', year: 1983 },
    ],
    connection: 'Classic mob films',
    connectionType: 'genre',
    difficultyScore: 3500,
    color: 'yellow',
    difficulty: 'easy',
    status: 'approved',
    usageCount: 5,
    lastUsedAt: null,
  },
];

const meta: Meta<typeof GroupSelectorDrawer> = {
  title: 'Components/PuzzleBuilder/GroupSelectorDrawer',
  component: GroupSelectorDrawer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <Story />
      </MockThemeProvider>
    ),
  ],
  argTypes: {
    onClose: { action: 'close' },
    onSelect: { action: 'select' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupSelectorDrawer>;

export const Yellow: Story = {
  args: {
    isOpen: true,
    color: 'yellow',
    groups: mockGroups,
  },
};

export const Green: Story = {
  args: {
    isOpen: true,
    color: 'green',
    groups: mockGroups.map((g) => ({ ...g, color: 'green' as const, difficulty: 'medium' as const })),
  },
};

export const Blue: Story = {
  args: {
    isOpen: true,
    color: 'blue',
    groups: mockGroups.map((g) => ({ ...g, color: 'blue' as const, difficulty: 'hard' as const })),
  },
};

export const Purple: Story = {
  args: {
    isOpen: true,
    color: 'purple',
    groups: mockGroups.map((g) => ({ ...g, color: 'purple' as const, difficulty: 'hardest' as const })),
  },
};

export const Empty: Story = {
  args: {
    isOpen: true,
    color: 'yellow',
    groups: [],
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    color: 'yellow',
    groups: mockGroups,
  },
};
