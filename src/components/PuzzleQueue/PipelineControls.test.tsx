import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('PipelineControls', () => {
  const defaultProps = {
    config: mockConfig,
    poolHealth: mockPoolHealth,
    scheduledDays: 23,
    windowDays: 30,
    isFilling: false,
    isLoadingConfig: false,
    onToggleEnabled: vi.fn(),
    onFillNow: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render scheduled days status', () => {
    render(<PipelineControls {...defaultProps} />);

    expect(screen.getByText('23/30')).toBeInTheDocument();
    expect(screen.getByText('days scheduled')).toBeInTheDocument();
  });

  it('should render pool health total', () => {
    render(<PipelineControls {...defaultProps} />);

    expect(screen.getByText('57')).toBeInTheDocument();
    expect(screen.getByText('groups available')).toBeInTheDocument();
  });

  it('should render toggle switch with correct state', () => {
    render(<PipelineControls {...defaultProps} />);

    const toggle = screen.getByRole('checkbox');
    expect(toggle).not.toBeChecked();
  });

  it('should render toggle as checked when enabled', () => {
    render(
      <PipelineControls
        {...defaultProps}
        config={{ ...mockConfig, enabled: true }}
      />
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
  });

  it('should call onToggleEnabled when toggle is clicked', () => {
    render(<PipelineControls {...defaultProps} />);

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(defaultProps.onToggleEnabled).toHaveBeenCalledTimes(1);
  });

  it('should render Fill Now button', () => {
    render(<PipelineControls {...defaultProps} />);

    expect(screen.getByRole('button', { name: /fill now/i })).toBeInTheDocument();
  });

  it('should call onFillNow when Fill Now button is clicked', () => {
    render(<PipelineControls {...defaultProps} />);

    const button = screen.getByRole('button', { name: /fill now/i });
    fireEvent.click(button);

    expect(defaultProps.onFillNow).toHaveBeenCalledTimes(1);
  });

  it('should disable Fill Now button and show progress indicator when filling', () => {
    render(<PipelineControls {...defaultProps} isFilling={true} currentStage="checking-pool" />);

    const button = screen.getByRole('button', { name: /fill now/i });
    expect(button).toBeDisabled();

    // Should show the progress indicator with stage label
    expect(screen.getByText(/checking group pool/i)).toBeInTheDocument();
  });

  it('should show warning when pool is low', () => {
    const lowPoolHealth: GroupAvailability = {
      yellow: 5,
      green: 8,
      blue: 12,
      purple: 3,
      total: 28,
      sufficient: false,
    };

    render(<PipelineControls {...defaultProps} poolHealth={lowPoolHealth} />);

    expect(screen.getByText(/low pool/i)).toBeInTheDocument();
  });

  it('should not show warning when pool is sufficient', () => {
    render(<PipelineControls {...defaultProps} />);

    expect(screen.queryByText(/low pool/i)).not.toBeInTheDocument();
  });

  it('should disable toggle when loading config', () => {
    render(<PipelineControls {...defaultProps} isLoadingConfig={true} />);

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeDisabled();
  });

  it('should show fully scheduled state', () => {
    render(<PipelineControls {...defaultProps} scheduledDays={30} />);

    expect(screen.getByText('30/30')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(<PipelineControls {...defaultProps} scheduledDays={0} />);

    expect(screen.getByText('0/30')).toBeInTheDocument();
  });
});
