import type { Meta, StoryObj } from '@storybook/react-vite';
import { PuzzleCard } from './PuzzleCard';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';

const mockPuzzle: StoredPuzzle = {
  id: 'puzzle-1',
  createdAt: Date.now(),
  puzzleDate: null,
  title: 'Classic Film Connections',
  groupIds: ['group-1', 'group-2', 'group-3', 'group-4'],
  status: 'pending',
  groups: [
    {
      id: 'group-1',
      films: [
        { id: 1, title: 'Pulp Fiction', year: 1994 },
        { id: 2, title: 'Kill Bill', year: 2003 },
        { id: 3, title: 'Reservoir Dogs', year: 1992 },
        { id: 4, title: 'Django Unchained', year: 2012 },
      ],
      connection: 'Directed by Quentin Tarantino',
      difficulty: 'easy',
      color: 'yellow',
    },
    {
      id: 'group-2',
      films: [
        { id: 5, title: 'The Godfather', year: 1972 },
        { id: 6, title: 'Goodfellas', year: 1990 },
        { id: 7, title: 'Casino', year: 1995 },
        { id: 8, title: 'Scarface', year: 1983 },
      ],
      connection: 'Classic mob films',
      difficulty: 'medium',
      color: 'green',
    },
    {
      id: 'group-3',
      films: [
        { id: 9, title: 'Inception', year: 2010 },
        { id: 10, title: 'The Matrix', year: 1999 },
        { id: 11, title: 'Tenet', year: 2020 },
        { id: 12, title: 'Memento', year: 2000 },
      ],
      connection: 'Mind-bending narratives',
      difficulty: 'hard',
      color: 'blue',
    },
    {
      id: 'group-4',
      films: [
        { id: 13, title: 'Interstellar', year: 2014 },
        { id: 14, title: 'Arrival', year: 2016 },
        { id: 15, title: '2001: A Space Odyssey', year: 1968 },
        { id: 16, title: 'Contact', year: 1997 },
      ],
      connection: 'Sci-fi about communication',
      difficulty: 'hardest',
      color: 'purple',
    },
  ],
};

const meta: Meta<typeof PuzzleCard> = {
  title: 'Components/PuzzleQueue/PuzzleCard',
  component: PuzzleCard,
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
    onSchedule: { action: 'schedule' },
  },
};

export default meta;
type Story = StoryObj<typeof PuzzleCard>;

export const Default: Story = {
  args: {
    puzzle: mockPuzzle,
  },
};

export const WithScheduleButton: Story = {
  args: {
    puzzle: mockPuzzle,
    onSchedule: () => {},
  },
};

export const Scheduling: Story = {
  args: {
    puzzle: mockPuzzle,
    onSchedule: () => {},
    isScheduling: true,
  },
};

export const UntitledPuzzle: Story = {
  args: {
    puzzle: { ...mockPuzzle, title: null },
  },
};

