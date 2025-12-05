/**
 * PuzzleQueue Admin Page
 *
 * Calendar-based puzzle scheduling interface.
 * Displays a week view with puzzles scheduled on each day.
 */

import { useState, useMemo, useEffect } from "react";
import { Box, Heading, Text, Button, Spinner } from "@mond-design-system/theme";
import {
  usePuzzleList,
  useUpdatePuzzle,
} from "../../lib/supabase/storage/usePuzzleStorage";
import { SupabaseStorage } from "../../lib/supabase/storage/SupabaseStorage";
import { SupabaseGroupStorage } from "../../lib/supabase/storage/SupabaseGroupStorage";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../providers/useToast";
import { useGenre } from "../../providers";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import { CalendarDay } from "./CalendarDay";
import { PuzzleDetailDrawer } from "./PuzzleDetailDrawer";
import { SchedulePuzzleDrawer } from "./SchedulePuzzleDrawer";
import { PipelineControls } from "./PipelineControls";
import {
  usePipelineStatus,
  useTogglePipelineEnabled,
  useFillRollingWindowWithGeneration,
  DEFAULT_PIPELINE_CONFIG,
} from "../../services/pipeline";
import { ConnectionTypeStore } from "../../services/group-generator/ConnectionTypeStore";
import { FeedbackStore } from "../../services/group-generator/FeedbackStore";
import { createVerifier } from "../../services/group-generator/verifiers/VerifierFactory";
import {
  getWeekStart,
  getWeekDays,
  formatDateForStorage,
  formatWeekRange,
} from "../../utils/dateUtils";
import "./PuzzleQueue.css";

// Create storage instances
const storage = new SupabaseStorage(supabase);
const groupStorage = new SupabaseGroupStorage(supabase);
const connectionTypeStore = new ConnectionTypeStore();
const feedbackStore = new FeedbackStore();

// Get API key from environment (for AI generation)
const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

export function PuzzleQueue() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const toast = useToast();
  const { genre } = useGenre();

  // Create verifier based on genre
  const itemVerifier = useMemo(() => createVerifier(genre), [genre]);

  // Pipeline status and hooks
  const pipelineStatus = usePipelineStatus(supabase, storage, groupStorage, genre);
  const toggleEnabled = useTogglePipelineEnabled(supabase, genre);
  const fillWindow = useFillRollingWindowWithGeneration({
    puzzleStorage: storage,
    groupStorage,
    connectionTypeStore,
    feedbackStore,
    itemVerifier,
    apiKey: anthropicApiKey,
  });

  // Auto-fill when enabled and there are empty days
  useEffect(() => {
    if (
      pipelineStatus.config?.enabled &&
      pipelineStatus.emptyDays > 0 &&
      !fillWindow.isPending &&
      !pipelineStatus.isLoading
    ) {
      // Auto-trigger fill
      fillWindow.mutate(pipelineStatus.config, {
        onSuccess: (result) => {
          if (result.puzzlesCreated > 0) {
            toast.showSuccess(`Auto-filled ${result.puzzlesCreated} puzzle(s)`);
          }
          if (result.errors.length > 0) {
            toast.showError(
              'Some days could not be filled',
              result.errors[0].message
            );
          }
        },
        onError: (error) => {
          toast.showError('Auto-fill failed', error.message);
        },
      });
    }
  }, [
    pipelineStatus.config?.enabled,
    pipelineStatus.emptyDays,
    pipelineStatus.isLoading,
  ]);

  // Handler for toggle
  const handleToggleEnabled = () => {
    toggleEnabled.mutate(undefined, {
      onSuccess: (config) => {
        toast.showSuccess(
          config.enabled ? 'Auto-fill enabled' : 'Auto-fill disabled'
        );
      },
      onError: (error) => {
        toast.showError('Failed to toggle auto-fill', error.message);
      },
    });
  };

  // Handler for manual fill
  const handleFillNow = () => {
    const config = pipelineStatus.config ?? {
      ...DEFAULT_PIPELINE_CONFIG,
      genre,
    };
    fillWindow.mutate(config, {
      onSuccess: (result) => {
        // Build success message with AI generation info
        let message = '';
        if (result.aiGenerationTriggered && result.groupsGenerated > 0) {
          message += `Generated ${result.groupsGenerated} new group(s). `;
        }
        if (result.puzzlesCreated > 0) {
          message += `Filled ${result.puzzlesCreated} puzzle(s).`;
          toast.showSuccess(message);
        } else if (result.emptyDaysRemaining > 0) {
          toast.showError(
            'No puzzles created',
            result.errors[0]?.message ?? 'Insufficient groups'
          );
        } else {
          toast.showSuccess('All days already scheduled');
        }
      },
      onError: (error) => {
        toast.showError('Fill failed', error.message);
      },
    });
  };

  // Get week days
  const weekDays = useMemo(
    () => getWeekDays(currentWeekStart),
    [currentWeekStart],
  );

  // Date range for the current week
  const dateFrom = formatDateForStorage(weekDays[0]);
  const dateTo = formatDateForStorage(weekDays[6]);

  // Fetch scheduled puzzles for current week (filtered by genre)
  const { data: scheduledData, isLoading: isLoadingScheduled } = usePuzzleList(
    { dateFrom, dateTo, genre },
    storage,
  );

  // Fetch available (unscheduled) puzzles (filtered by genre)
  const { data: availableData, isLoading: isLoadingAvailable } = usePuzzleList(
    { unscheduled: true, genre },
    storage,
  );

  // Mutation for scheduling
  const updateMutation = useUpdatePuzzle(storage);

  // Build map of puzzles by date
  const puzzlesByDate = useMemo(() => {
    const map = new Map<string, StoredPuzzle>();
    if (scheduledData?.puzzles) {
      for (const puzzle of scheduledData.puzzles) {
        if (puzzle.puzzleDate) {
          map.set(puzzle.puzzleDate, puzzle);
        }
      }
    }
    return map;
  }, [scheduledData]);

  // Determine which drawer to show
  const selectedPuzzle = selectedDate ? puzzlesByDate.get(selectedDate) : null;
  const showDetailDrawer =
    selectedDate !== null && selectedPuzzle !== undefined;
  const showScheduleDrawer =
    selectedDate !== null && selectedPuzzle === undefined;

  // Navigation handlers
  const goToPrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Day click handler
  const handleDayClick = (date: Date) => {
    setSelectedDate(formatDateForStorage(date));
  };

  // Close drawer handler
  const handleCloseDrawer = () => {
    setSelectedDate(null);
  };

  // Schedule puzzle handler - also publishes the puzzle
  const handleSchedule = (puzzleId: string, date: string) => {
    updateMutation.mutate(
      { id: puzzleId, updates: { puzzleDate: date, status: 'published' } },
      {
        onSuccess: () => {
          toast.showSuccess("Puzzle scheduled and published");
          setSelectedDate(null);
        },
        onError: (err) => {
          toast.showError("Failed to schedule puzzle", err.message);
        },
      },
    );
  };

  // Get today's date for comparison
  const today = formatDateForStorage(new Date());

  return (
    <>
      <Box display="flex" flexDirection="column" gap="lg" padding="4">
        {/* Header */}
        <Box display="flex" flexDirection="column" gap="sm">
          <Heading level={1} size="2xl">
            Puzzle Queue
          </Heading>
        </Box>

        {/* Pipeline Controls */}
        {pipelineStatus.config && (
          <PipelineControls
            config={pipelineStatus.config}
            poolHealth={pipelineStatus.poolHealth}
            scheduledDays={pipelineStatus.scheduledDays}
            windowDays={pipelineStatus.windowDays}
            isFilling={fillWindow.isPending}
            currentStage={fillWindow.currentStage}
            isLoadingConfig={pipelineStatus.isLoadingConfig}
            onToggleEnabled={handleToggleEnabled}
            onFillNow={handleFillNow}
          />
        )}

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {/* Week Navigation */}
          <Box display="flex" alignItems="center" gap="md">
            <Button
              variant="outline"
              onClick={goToPrevWeek}
              aria-label="Previous week"
            >
              ← Prev
            </Button>
            <Text size="lg" weight="medium">
              {formatWeekRange(weekDays[0], weekDays[6])}
            </Text>
            <Button
              variant="outline"
              onClick={goToNextWeek}
              aria-label="Next week"
            >
              Next →
            </Button>
          </Box>
        </Box>

        {/* Calendar Grid */}
        {(isLoadingScheduled || isLoadingAvailable) && (
          <Box display="flex" justifyContent="center" padding="6">
            <Spinner size="lg" />
          </Box>
        )}

        {!isLoadingScheduled && !isLoadingAvailable && (
          <Box display="flex" justifyContent="space-evenly" gap="xxs" border="default" padding="2">
            {weekDays.map((date, index) => {
              const dateStr = formatDateForStorage(date);
              const puzzle = puzzlesByDate.get(dateStr) ?? null;
              const isToday = dateStr === today;
              const isPast = dateStr < today;

              return (
                <CalendarDay
                  key={index}
                  date={date}
                  puzzle={puzzle}
                  isToday={isToday}
                  isPast={isPast}
                  onClick={() => handleDayClick(date)}
                />
              );
            })}
          </Box>
        )}
      </Box>
      {/* Puzzle Detail Drawer - for days with scheduled puzzle */}
      {showDetailDrawer && selectedPuzzle && (
        <PuzzleDetailDrawer
          isOpen={true}
          onClose={handleCloseDrawer}
          selectedDate={selectedDate!}
          puzzle={selectedPuzzle}
        />
      )}

      {/* Schedule Puzzle Drawer - for empty days */}
      {showScheduleDrawer && (
        <SchedulePuzzleDrawer
          isOpen={true}
          onClose={handleCloseDrawer}
          selectedDate={selectedDate!}
          availablePuzzles={availableData?.puzzles ?? []}
          onSchedule={handleSchedule}
          isScheduling={updateMutation.isPending}
        />
      )}
    </>
  );
}
