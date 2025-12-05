/**
 * Pipeline Controls Component
 *
 * Displays pipeline status and controls for auto-filling puzzles.
 * Shows scheduled days count, pool health, toggle switch, and fill button.
 * When filling, shows a spinner with the current pipeline stage.
 */

import { Box, Button, Text, Tag, Spinner } from '@mond-design-system/theme';
import { Switch } from '@mond-design-system/theme/client';
import type { GroupAvailability, PipelineConfig, PipelineStage } from '../../services/pipeline/types';
import { PIPELINE_STAGE_LABELS } from '../../services/pipeline/types';

export interface PipelineControlsProps {
  /** Current pipeline configuration */
  config: PipelineConfig;
  /** Pool health showing group availability by color */
  poolHealth: GroupAvailability;
  /** Number of days currently scheduled */
  scheduledDays: number;
  /** Total days in the rolling window */
  windowDays: number;
  /** Whether a fill operation is in progress */
  isFilling: boolean;
  /** Current pipeline stage when filling */
  currentStage?: PipelineStage;
  /** Whether config is being loaded */
  isLoadingConfig: boolean;
  /** Handler for toggling auto-fill enabled */
  onToggleEnabled: () => void;
  /** Handler for manual fill trigger */
  onFillNow: () => void;
}

export function PipelineControls({
  config,
  poolHealth,
  scheduledDays,
  windowDays,
  isFilling,
  currentStage = 'idle',
  isLoadingConfig,
  onToggleEnabled,
  onFillNow,
}: PipelineControlsProps) {
  const isLowPool = !poolHealth.sufficient;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="md"
      padding="3"
      border="default"
    >
      {/* Main controls row */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="md"
      >
        {/* Status indicators */}
        <Box display="flex" alignItems="center" gap="lg">
          {/* Scheduled days */}
          <Box display="flex" alignItems="center" gap="xs">
            <Text size="2xl" weight="bold">
              {scheduledDays}/{windowDays}
            </Text>
            <Text size="sm" semantic="secondary">
              days scheduled
            </Text>
          </Box>

          {/* Pool health */}
          <Box display="flex" alignItems="center" gap="xs">
            <Text size="2xl" weight="bold">
              {poolHealth.total}
            </Text>
            <Text size="sm" semantic="secondary">
              groups available
            </Text>
          </Box>

          {/* Low pool warning */}
          {isLowPool && !isFilling && (
            <Tag size="sm" variant="filled" semantic="warning">
              Low pool
            </Tag>
          )}
        </Box>

        {/* Controls */}
        <Box display="flex" alignItems="center" gap="md">
          {/* Auto-fill toggle */}
          <Switch
            label="Auto-fill"
            size="sm"
            checked={config.enabled}
            onChange={onToggleEnabled}
            disabled={isLoadingConfig || isFilling}
          />

          {/* Fill Now button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onFillNow}
            disabled={isFilling}
          >
            Fill Now
          </Button>
        </Box>
      </Box>

      {/* Pipeline progress indicator */}
      {isFilling && (
        <Box
          display="flex"
          alignItems="center"
          gap="sm"
          padding="2"
          border="subtle"
          corners="rounded-md"
        >
          <Spinner size="sm" />
          <Text size="sm" weight="medium">
            {PIPELINE_STAGE_LABELS[currentStage]}
          </Text>
        </Box>
      )}
    </Box>
  );
}
