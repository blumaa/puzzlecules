import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupPoolFilter } from './GroupPoolFilter';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';

const meta: Meta<typeof GroupPoolFilter> = {
  title: 'Components/GroupPool/GroupPoolFilter',
  component: GroupPoolFilter,
  parameters: {
    layout: 'padded',
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
    onColorChange: { action: 'colorChange' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupPoolFilter>;

export const Default: Story = {
  args: {
    colorFilter: 'all',
    resultCount: 15,
    totalCount: 45,
  },
};

export const YellowFilter: Story = {
  args: {
    colorFilter: 'yellow',
    resultCount: 5,
    totalCount: 45,
  },
};

export const WithoutCounts: Story = {
  args: {
    colorFilter: 'all',
  },
};

export const PurpleFilter: Story = {
  args: {
    colorFilter: 'purple',
    resultCount: 8,
    totalCount: 45,
  },
};
