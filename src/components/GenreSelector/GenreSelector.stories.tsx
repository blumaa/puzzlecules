import type { Meta, StoryObj } from '@storybook/react-vite';
import { GenreSelector } from './GenreSelector';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import { GenreProvider } from '../../providers';

const meta: Meta<typeof GenreSelector> = {
  title: 'Components/GenreSelector/GenreSelector',
  component: GenreSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <GenreProvider initialGenre="films">
          <Story />
        </GenreProvider>
      </MockThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GenreSelector>;

export const Default: Story = {};

export const WithMusicSelected: Story = {
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <GenreProvider initialGenre="music">
          <Story />
        </GenreProvider>
      </MockThemeProvider>
    ),
  ],
};

export const AllGenres: Story = {
  args: {
    availableGenres: ['films', 'music', 'books', 'sports'],
  },
};

export const MediumSize: Story = {
  args: {
    size: 'md',
  },
};

export const WithCallback: Story = {
  args: {
    onGenreChange: (genre) => console.log('Genre changed to:', genre),
  },
};
