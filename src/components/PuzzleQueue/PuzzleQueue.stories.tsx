import type { Meta, StoryObj } from '@storybook/react-vite';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import { MockQueryClientProvider } from '../../../.storybook/MockQueryClientProvider';
import { ToastProvider } from '../../providers/ToastProvider';
import { PuzzleQueue } from './PuzzleQueue';

const meta: Meta<typeof PuzzleQueue> = {
  title: 'Components/PuzzleQueue/PuzzleQueue',
  component: PuzzleQueue,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <MockQueryClientProvider>
          <ToastProvider>
            <Story />
          </ToastProvider>
        </MockQueryClientProvider>
      </MockThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PuzzleQueue>;

export const Default: Story = {};
