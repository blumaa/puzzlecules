/**
 * PuzzleQueue Admin Page
 *
 * Calendar-based puzzle scheduling interface.
 * Displays a week view with puzzles scheduled on each day.
 */

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Heading, Text, Button, Spinner } from "@mond-design-system/theme";
import {
  usePuzzleList,
  useUpdatePuzzle,
  useDeletePuzzle,
  useBatchUpdatePuzzles,
} from "../../lib/supabase/storage/usePuzzleStorage";
import { useGroupList } from "../../lib/supabase/storage/useGroupStorage";
import { SupabaseStorage } from "../../lib/supabase/storage/SupabaseStorage";
import { SupabaseGroupStorage } from "../../lib/supabase/storage/SupabaseGroupStorage";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../providers/useToast";
import { useGenre } from "../../providers";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import type { DifficultyColor } from "../../lib/supabase/storage/IGroupStorage";
import type { Group } from "../../types";
import { CalendarDay } from "./CalendarDay";
import { PuzzleDrawer } from "./PuzzleDrawer";
import { GroupSwapDrawer } from "./GroupSwapDrawer";
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
const connectionTypeStore = new ConnectionTypeStore(supabase);
const feedbackStore = new FeedbackStore(supabase);

// Get API key from environment (for AI generation)
const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

export function PuzzleQueue() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  // State for group swap drawer
  const [swapGroupInfo, setSwapGroupInfo] = useState<{
    index: number;
    group: Group;
  } | null>(null);
  const toast = useToast();
  const { genre } = useGenre();
  const queryClient = useQueryClient();

  // Helper to invalidate pipeline status queries
  const invalidatePipelineStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['pipeline', 'scheduledCount', genre] });
    queryClient.invalidateQueries({ queryKey: ['pipeline', 'poolHealth', genre] });
    queryClient.invalidateQueries({ queryKey: ['pipeline', 'emptyDates', genre] });
  };

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

  // Note: Auto-fill is handled by the cron job when enabled.
  // The toggle only changes the enabled state in the database.
  // Use "Fill Now" button for manual fill on this page.

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
        // Build detailed summary
        const parts: string[] = [];

        // AI generation stats
        if (result.aiGenerationTriggered) {
          const colorStats = Object.entries(result.groupsByColor)
            .filter(([, stats]) => stats.generated > 0)
            .map(([color, stats]) => `${color}: ${stats.saved}/${stats.generated}`)
            .join(', ');
          if (colorStats) {
            parts.push(`Groups saved: ${colorStats}`);
          }
          if (result.groupsSaved < result.groupsGenerated) {
            parts.push(`${result.groupsGenerated - result.groupsSaved} group(s) failed`);
          }
        }

        // Puzzle creation stats
        if (result.puzzlesCreated > 0) {
          parts.push(`${result.puzzlesCreated} puzzle(s) created`);
        }
        if (result.emptyDaysRemaining > 0) {
          parts.push(`${result.emptyDaysRemaining} day(s) still empty`);
        }

        // Error summary
        if (result.errors.length > 0) {
          parts.push(`${result.errors.length} error(s)`);
        }

        // Show result
        const summary = parts.join(' | ');
        if (result.puzzlesCreated > 0 || result.groupsSaved > 0) {
          toast.showSuccess('Pipeline complete', summary);
        } else if (result.emptyDaysRemaining === 0 && result.puzzlesCreated === 0) {
          toast.showSuccess('All days already scheduled');
        } else {
          toast.showError('Pipeline incomplete', summary || result.errors[0]?.message || 'Unknown error');
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

  // Mutation for scheduling and updates
  const updateMutation = useUpdatePuzzle(storage);

  // Mutation for deleting puzzles
  const deleteMutation = useDeletePuzzle(storage);

  // Batch mutation for selection mode (unschedule)
  const batchUpdateMutation = useBatchUpdatePuzzles(storage);

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

  // Fetch available groups for swap (same color, approved)
  const swapColor = swapGroupInfo?.group?.color as DifficultyColor | undefined;
  const currentPuzzleGroupIds = selectedPuzzle?.groups?.map(g => g.id).filter(Boolean) as string[] ?? [];
  const { data: availableGroupsData, isLoading: isLoadingSwapGroups } = useGroupList(
    swapColor ? {
      status: 'approved',
      color: swapColor,
      excludeIds: currentPuzzleGroupIds,
      sortByFreshness: true,
      genre,
    } : undefined,
    groupStorage,
    { enabled: swapGroupInfo !== null }
  );
  const showDrawer = selectedDate !== null;

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

  // Selection mode handlers
  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      // Clear selections when exiting select mode
      setSelectedDates(new Set());
    }
  };

  const handleToggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const handleClearSelected = () => {
    // Get puzzle IDs for selected dates
    const puzzleUpdates = Array.from(selectedDates)
      .map((date) => puzzlesByDate.get(date))
      .filter((puzzle): puzzle is StoredPuzzle => puzzle !== undefined)
      .map((puzzle) => ({
        id: puzzle.id,
        updates: { puzzleDate: null, status: 'approved' as const },
      }));

    if (puzzleUpdates.length === 0) {
      toast.showError("No puzzles selected");
      return;
    }

    batchUpdateMutation.mutate(puzzleUpdates, {
      onSuccess: () => {
        toast.showSuccess(`Unscheduled ${puzzleUpdates.length} puzzle(s)`);
        setSelectedDates(new Set());
        setIsSelectMode(false);
        invalidatePipelineStatus();
      },
      onError: (err) => {
        toast.showError("Failed to unschedule puzzles", err.message);
      },
    });
  };

  // Puzzle detail handlers
  const handlePuzzleUpdate = (puzzleId: string, updates: { title?: string; groupIds?: string[] }) => {
    updateMutation.mutate(
      { id: puzzleId, updates },
      {
        onSuccess: () => {
          toast.showSuccess("Puzzle updated");
        },
        onError: (err) => {
          toast.showError("Failed to update puzzle", err.message);
        },
      },
    );
  };

  const handlePuzzleUnschedule = (puzzleId: string) => {
    updateMutation.mutate(
      { id: puzzleId, updates: { puzzleDate: null, status: 'approved' } },
      {
        onSuccess: () => {
          toast.showSuccess("Puzzle unscheduled");
          setSelectedDate(null);
          invalidatePipelineStatus();
        },
        onError: (err) => {
          toast.showError("Failed to unschedule puzzle", err.message);
        },
      },
    );
  };

  const handlePuzzleDelete = (puzzleId: string) => {
    deleteMutation.mutate(puzzleId, {
      onSuccess: () => {
        toast.showSuccess("Puzzle deleted");
        setSelectedDate(null);
        invalidatePipelineStatus();
      },
      onError: (err) => {
        toast.showError("Failed to delete puzzle", err.message);
      },
    });
  };

  const handleSwapGroup = (groupIndex: number, currentGroup: Group) => {
    setSwapGroupInfo({ index: groupIndex, group: currentGroup });
  };

  const handleCloseSwapDrawer = () => {
    setSwapGroupInfo(null);
  };

  const handleSelectSwapGroup = (newGroup: { id: string }) => {
    if (!selectedPuzzle || swapGroupInfo === null) return;

    // Build new group IDs array with the swapped group
    const newGroupIds = selectedPuzzle.groups?.map((g, idx) =>
      idx === swapGroupInfo.index ? newGroup.id : g.id
    ).filter(Boolean) as string[];

    updateMutation.mutate(
      { id: selectedPuzzle.id, updates: { groupIds: newGroupIds } },
      {
        onSuccess: () => {
          toast.showSuccess("Group swapped");
          setSwapGroupInfo(null);
        },
        onError: (err) => {
          toast.showError("Failed to swap group", err.message);
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

        {/* Week Navigation and Selection Mode Controls */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Left: Select Mode Toggle */}
          <Box>
            <Button
              variant={isSelectMode ? "ghost" : "outline"}
              size="sm"
              onClick={handleToggleSelectMode}
            >
              {isSelectMode ? "Cancel" : "Select"}
            </Button>
          </Box>

          {/* Center: Week Navigation */}
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

          {/* Right: Selection Actions */}
          <Box display="flex" gap="sm">
            {isSelectMode && selectedDates.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelected}
                disabled={batchUpdateMutation.isPending}
              >
                Unschedule ({selectedDates.size})
              </Button>
            )}
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
                  isSelectMode={isSelectMode}
                  isSelected={selectedDates.has(dateStr)}
                  onSelect={() => handleToggleDateSelection(dateStr)}
                />
              );
            })}
          </Box>
        )}
      </Box>
      {/* Unified Puzzle Drawer - handles both scheduled and unscheduled days */}
      {showDrawer && (
        <PuzzleDrawer
          isOpen={true}
          onClose={handleCloseDrawer}
          selectedDate={selectedDate!}
          scheduledPuzzle={selectedPuzzle ?? null}
          availablePuzzles={availableData?.puzzles ?? []}
          onSchedule={handleSchedule}
          onUpdate={handlePuzzleUpdate}
          onUnschedule={handlePuzzleUnschedule}
          onDelete={handlePuzzleDelete}
          isLoading={updateMutation.isPending || deleteMutation.isPending}
          onSwapGroup={handleSwapGroup}
        />
      )}

      {/* Group Swap Drawer - for swapping groups in a puzzle */}
      {swapGroupInfo && (
        <GroupSwapDrawer
          isOpen={true}
          onClose={handleCloseSwapDrawer}
          currentGroup={swapGroupInfo.group}
          availableGroups={availableGroupsData?.groups ?? []}
          isLoading={isLoadingSwapGroups}
          onSelectGroup={handleSelectSwapGroup}
          isSwapping={updateMutation.isPending}
        />
      )}
    </>
  );
}
