import type { Meta, StoryObj } from '@storybook/react-vite';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import { MockQueryClientProvider } from '../../../.storybook/MockQueryClientProvider';
import { ToastProvider } from '../../providers/ToastProvider';
import { PuzzleBuilder } from './PuzzleBuilder';

const meta: Meta<typeof PuzzleBuilder> = {
  title: 'Components/PuzzleBuilder/PuzzleBuilder',
  component: PuzzleBuilder,
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
type Story = StoryObj<typeof PuzzleBuilder>;

export const Default: Story = {};
