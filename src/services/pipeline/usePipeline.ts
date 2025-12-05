/**
 * Pipeline React Hooks
 *
 * React Query hooks for pipeline operations.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/supabase/types';
import type { Genre } from '../../types';
import type { PipelineConfig, PipelineFillResult, PipelineStage } from './types';
import { PipelineService } from './PipelineService';
import { PipelineConfigStore } from './PipelineConfigStore';
import { PipelineGenerator } from './PipelineGenerator';
import type { IPuzzleStorage } from '../../lib/supabase/storage/IPuzzleStorage';
import type { IGroupStorage } from '../../lib/supabase/storage/IGroupStorage';
import type { IConnectionTypeStore, IFeedbackStore, IItemVerifier } from '../group-generator/types';
import { generateGroupsV2Browser } from '../group-generator/generateGroupsV2';

/**
 * Options for fill rolling window with AI generation
 */
interface FillWithGenerationOptions {
  puzzleStorage: IPuzzleStorage;
  groupStorage: IGroupStorage;
  connectionTypeStore: IConnectionTypeStore;
  feedbackStore: IFeedbackStore;
  itemVerifier: IItemVerifier;
  apiKey?: string;
}

// Query keys
const PIPELINE_KEYS = {
  config: (genre: Genre) => ['pipeline', 'config', genre] as const,
  poolHealth: (genre: Genre) => ['pipeline', 'poolHealth', genre] as const,
  scheduledCount: (genre: Genre, windowDays: number) =>
    ['pipeline', 'scheduledCount', genre, windowDays] as const,
  emptyDates: (genre: Genre, windowDays: number) =>
    ['pipeline', 'emptyDates', genre, windowDays] as const,
};

/**
 * Hook to get pipeline configuration for a genre
 */
export function usePipelineConfig(
  supabase: SupabaseClient<Database>,
  genre: Genre
) {
  const store = new PipelineConfigStore(supabase);

  return useQuery({
    queryKey: PIPELINE_KEYS.config(genre),
    queryFn: () => store.getConfig(genre),
  });
}

/**
 * Hook to update pipeline configuration
 */
export function useUpdatePipelineConfig(
  supabase: SupabaseClient<Database>,
  genre: Genre
) {
  const queryClient = useQueryClient();
  const store = new PipelineConfigStore(supabase);

  return useMutation({
    mutationFn: (updates: Partial<Omit<PipelineConfig, 'genre'>>) =>
      store.updateConfig(genre, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_KEYS.config(genre) });
    },
  });
}

/**
 * Hook to toggle pipeline enabled state
 */
export function useTogglePipelineEnabled(
  supabase: SupabaseClient<Database>,
  genre: Genre
) {
  const queryClient = useQueryClient();
  const store = new PipelineConfigStore(supabase);

  return useMutation({
    mutationFn: () => store.toggleEnabled(genre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_KEYS.config(genre) });
    },
  });
}

/**
 * Hook to get pool health (group availability by color)
 */
export function usePoolHealth(
  puzzleStorage: IPuzzleStorage,
  groupStorage: IGroupStorage,
  genre: Genre
) {
  const service = new PipelineService(puzzleStorage, groupStorage);

  return useQuery({
    queryKey: PIPELINE_KEYS.poolHealth(genre),
    queryFn: () => service.checkPoolHealth(genre),
  });
}

/**
 * Hook to get scheduled count
 */
export function useScheduledCount(
  puzzleStorage: IPuzzleStorage,
  groupStorage: IGroupStorage,
  genre: Genre,
  windowDays: number = 30
) {
  const service = new PipelineService(puzzleStorage, groupStorage);

  return useQuery({
    queryKey: PIPELINE_KEYS.scheduledCount(genre, windowDays),
    queryFn: () => service.getScheduledCount(genre, windowDays),
  });
}

/**
 * Hook to get empty dates in rolling window
 */
export function useEmptyDates(
  puzzleStorage: IPuzzleStorage,
  groupStorage: IGroupStorage,
  genre: Genre,
  windowDays: number = 30
) {
  const service = new PipelineService(puzzleStorage, groupStorage);

  return useQuery({
    queryKey: PIPELINE_KEYS.emptyDates(genre, windowDays),
    queryFn: () => service.getEmptyDates(genre, windowDays),
  });
}

/**
 * Hook to fill rolling window with puzzles
 *
 * Simple version without AI generation support.
 */
export function useFillRollingWindow(
  puzzleStorage: IPuzzleStorage,
  groupStorage: IGroupStorage
) {
  const queryClient = useQueryClient();
  const service = new PipelineService(puzzleStorage, groupStorage);

  return useMutation({
    mutationFn: (config: PipelineConfig): Promise<PipelineFillResult> =>
      service.fillRollingWindow(config),
    onSuccess: (_result, config) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ['pipeline', 'scheduledCount', config.genre],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline', 'emptyDates', config.genre],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline', 'poolHealth', config.genre],
      });
      // Also invalidate puzzle list queries
      queryClient.invalidateQueries({
        queryKey: ['puzzles'],
      });
      // Also invalidate group list queries (if new groups were generated)
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });
    },
  });
}

/**
 * Hook to fill rolling window with AI generation support
 *
 * When the group pool is low, automatically generates new groups via AI.
 * Returns the current stage for UI display.
 */
export function useFillRollingWindowWithGeneration(options: FillWithGenerationOptions) {
  const queryClient = useQueryClient();
  const [currentStage, setCurrentStage] = useState<PipelineStage>('idle');
  const {
    puzzleStorage,
    groupStorage,
    connectionTypeStore,
    feedbackStore,
    itemVerifier,
    apiKey,
  } = options;

  const handleStageChange = useCallback((stage: PipelineStage) => {
    setCurrentStage(stage);
  }, []);

  const mutation = useMutation({
    mutationFn: async (config: PipelineConfig): Promise<PipelineFillResult> => {
      // Create service and generator inside mutation to ensure fresh instances
      const service = new PipelineService(puzzleStorage, groupStorage);

      // Set up the generator if API key is available
      if (apiKey) {
        const generator = new PipelineGenerator(
          groupStorage,
          connectionTypeStore,
          feedbackStore,
          itemVerifier,
          generateGroupsV2Browser
        );
        service.setGenerator(generator, apiKey);
      }

      return service.fillRollingWindow(config, handleStageChange);
    },
    onMutate: () => {
      setCurrentStage('idle');
    },
    onSuccess: (_result, config) => {
      setCurrentStage('complete');
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ['pipeline', 'scheduledCount', config.genre],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline', 'emptyDates', config.genre],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline', 'poolHealth', config.genre],
      });
      // Also invalidate puzzle list queries
      queryClient.invalidateQueries({
        queryKey: ['puzzles'],
      });
      // Also invalidate group list queries (if new groups were generated)
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });
    },
    onError: () => {
      setCurrentStage('error');
    },
  });

  return {
    ...mutation,
    currentStage,
  };
}

/**
 * Combined hook for pipeline status
 */
export function usePipelineStatus(
  supabase: SupabaseClient<Database>,
  puzzleStorage: IPuzzleStorage,
  groupStorage: IGroupStorage,
  genre: Genre
) {
  const configQuery = usePipelineConfig(supabase, genre);
  const poolHealthQuery = usePoolHealth(puzzleStorage, groupStorage, genre);
  const scheduledCountQuery = useScheduledCount(
    puzzleStorage,
    groupStorage,
    genre,
    configQuery.data?.rollingWindowDays ?? 30
  );

  const windowDays = configQuery.data?.rollingWindowDays ?? 30;
  const emptyDays = windowDays - (scheduledCountQuery.data ?? 0);

  return {
    config: configQuery.data,
    isLoadingConfig: configQuery.isLoading,
    poolHealth: poolHealthQuery.data ?? {
      yellow: 0,
      green: 0,
      blue: 0,
      purple: 0,
      total: 0,
      sufficient: false,
    },
    isLoadingPoolHealth: poolHealthQuery.isLoading,
    scheduledDays: scheduledCountQuery.data ?? 0,
    isLoadingScheduledCount: scheduledCountQuery.isLoading,
    emptyDays,
    windowDays,
    isLoading:
      configQuery.isLoading ||
      poolHealthQuery.isLoading ||
      scheduledCountQuery.isLoading,
  };
}
