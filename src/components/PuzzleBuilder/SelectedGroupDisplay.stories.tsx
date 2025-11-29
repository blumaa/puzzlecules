import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectedGroupDisplay } from './SelectedGroupDisplay';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
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

const meta: Meta<typeof SelectedGroupDisplay> = {
  title: 'Components/PuzzleBuilder/SelectedGroupDisplay',
  component: SelectedGroupDisplay,
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
    onRemove: { action: 'remove' },
  },
};

export default meta;
type Story = StoryObj<typeof SelectedGroupDisplay>;

export const Default: Story = {
  args: {
    group: mockGroup,
  },
};
