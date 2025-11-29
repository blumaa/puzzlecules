import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mond-design-system/theme';
import { ToastProvider } from '../../providers/ToastProvider';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';
import { GroupPoolHeader } from './GroupPoolHeader';
import { GroupPoolFilter } from './GroupPoolFilter';
import { GroupPoolList } from './GroupPoolList';
import './GroupPool.css';

// Mock data for stories
const mockFilms = [
  { id: 1, title: 'Pulp Fiction', year: 1994 },
  { id: 2, title: 'Kill Bill', year: 2003 },
  { id: 3, title: 'Reservoir Dogs', year: 1992 },
  { id: 4, title: 'Django Unchained', year: 2012 },
];

const mockGroups: StoredGroup[] = [
  {
    id: '1',
    createdAt: Date.now(),
    films: mockFilms,
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
    id: '2',
    createdAt: Date.now() - 86400000,
    films: [
      { id: 5, title: 'The Godfather', year: 1972 },
      { id: 6, title: 'Goodfellas', year: 1990 },
      { id: 7, title: 'Casino', year: 1995 },
      { id: 8, title: 'Scarface', year: 1983 },
    ],
    connection: 'Classic mob films',
    connectionType: 'genre',
    difficultyScore: 4500,
    color: 'green',
    difficulty: 'medium',
    status: 'approved',
    usageCount: 3,
    lastUsedAt: Date.now() - 172800000,
  },
  {
    id: '3',
    createdAt: Date.now() - 172800000,
    films: [
      { id: 9, title: 'Inception', year: 2010 },
      { id: 10, title: 'The Matrix', year: 1999 },
      { id: 11, title: 'Tenet', year: 2020 },
      { id: 12, title: 'Memento', year: 2000 },
    ],
    connection: 'Mind-bending narratives',
    connectionType: 'theme',
    difficultyScore: 6800,
    color: 'blue',
    difficulty: 'hard',
    status: 'approved',
    usageCount: 1,
    lastUsedAt: null,
  },
];

// Static presentational component for page-level stories
interface GroupPoolDisplayProps {
  groups: StoredGroup[];
  colorFilter: DifficultyColor | 'all';
  isLoading?: boolean;
  error?: Error | null;
}

function GroupPoolDisplay({
  groups,
  colorFilter,
  isLoading = false,
  error = null,
}: GroupPoolDisplayProps) {
  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="4">
      <GroupPoolHeader />

      <GroupPoolFilter
        colorFilter={colorFilter}
        onColorChange={() => {}}
        resultCount={groups.length}
        totalCount={groups.length}
      />

      <GroupPoolList
        groups={groups}
        isLoading={isLoading}
        error={error}
        editingId={null}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        onColorChange={() => {}}
        onDelete={() => {}}
        isUpdating={false}
        isDeleting={false}
        page={0}
        pageSize={20}
        total={groups.length}
        onPageChange={() => {}}
      />
    </Box>
  );
}

const meta: Meta<typeof GroupPoolDisplay> = {
  title: 'Components/GroupPool/GroupPool',
  component: GroupPoolDisplay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </MockThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GroupPoolDisplay>;

export const Default: Story = {
  args: {
    groups: mockGroups,
    colorFilter: 'all',
  },
};

export const Loading: Story = {
  args: {
    groups: [],
    colorFilter: 'all',
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    groups: [],
    colorFilter: 'all',
    error: new Error('Failed to connect to database'),
  },
};

export const Empty: Story = {
  args: {
    groups: [],
    colorFilter: 'purple',
  },
};

export const YellowGroupsOnly: Story = {
  args: {
    groups: mockGroups.filter(g => g.color === 'yellow'),
    colorFilter: 'yellow',
  },
};
