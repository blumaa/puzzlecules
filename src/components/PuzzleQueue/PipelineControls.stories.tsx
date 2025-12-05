import type { Meta, StoryObj } from '@storybook/react-vite';
import { PipelineControls } from './PipelineControls';
import type { GroupAvailability, PipelineConfig } from '../../services/pipeline/types';

const mockConfig: PipelineConfig = {
  enabled: false,
  rollingWindowDays: 30,
  genre: 'films',
  minGroupsPerColor: 10,
  aiGenerationBatchSize: 20,
};

const mockPoolHealth: GroupAvailability = {
  yellow: 15,
  green: 20,
  blue: 12,
  purple: 10,
  total: 57,
  sufficient: true,
};

const lowPoolHealth: GroupAvailability = {
  yellow: 5,
  green: 8,
  blue: 12,
  purple: 3,
  total: 28,
  sufficient: false,
};

const meta: Meta<typeof PipelineControls> = {
  title: 'PuzzleQueue/PipelineControls',
  component: PipelineControls,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onToggleEnabled: { action: 'toggle enabled' },
    onFillNow: { action: 'fill now' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: mockConfig,
    poolHealth: mockPoolHealth,
    scheduledDays: 23,
    windowDays: 30,
    isFilling: false,
    isLoadingConfig: false,
  },
};

export const Enabled: Story = {
  args: {
    ...Default.args,
    config: { ...mockConfig, enabled: true },
  },
};

export const FullyScheduled: Story = {
  args: {
    ...Default.args,
    scheduledDays: 30,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    scheduledDays: 0,
  },
};

export const LowPool: Story = {
  args: {
    ...Default.args,
    poolHealth: lowPoolHealth,
  },
};

export const Filling: Story = {
  args: {
    ...Default.args,
    isFilling: true,
  },
};

export const LoadingConfig: Story = {
  args: {
    ...Default.args,
    isLoadingConfig: true,
  },
};
