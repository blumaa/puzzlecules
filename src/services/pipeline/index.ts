/**
 * Pipeline Module
 *
 * Auto-generates and schedules puzzles for a rolling 30-day window.
 */

export { PipelineService } from './PipelineService';
export { PipelineConfigStore } from './PipelineConfigStore';
export { PipelineGenerator } from './PipelineGenerator';
export type { PipelineGenerationResult, PipelineGenerationConfig } from './PipelineGenerator';
export type {
  PipelineConfig,
  PipelineFillResult,
  PipelineError,
  PipelineErrorCode,
  GroupAvailability,
  PipelineStatus,
  PipelineStage,
  PipelineStageCallback,
  PipelineProgress,
} from './types';
export { DEFAULT_PIPELINE_CONFIG, PIPELINE_STAGE_LABELS } from './types';

// React hooks
export {
  usePipelineConfig,
  useUpdatePipelineConfig,
  useTogglePipelineEnabled,
  usePoolHealth,
  useScheduledCount,
  useEmptyDates,
  useFillRollingWindow,
  useFillRollingWindowWithGeneration,
  usePipelineStatus,
} from './usePipeline';
