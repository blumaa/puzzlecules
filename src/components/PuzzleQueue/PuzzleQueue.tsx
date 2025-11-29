/**
 * PuzzleQueue Admin Page
 *
 * Calendar-based puzzle scheduling interface.
 * Displays a week view with puzzles scheduled on each day.
 */

import { useState, useMemo } from "react";
import { Box, Heading, Text, Button, Spinner } from "@mond-design-system/theme";
import {
  usePuzzleList,
  useUpdatePuzzle,
} from "../../lib/supabase/storage/usePuzzleStorage";
import { SupabaseStorage } from "../../lib/supabase/storage/SupabaseStorage";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../providers/useToast";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import { CalendarDay } from "./CalendarDay";
import { PuzzleDetailDrawer } from "./PuzzleDetailDrawer";
import { SchedulePuzzleDrawer } from "./SchedulePuzzleDrawer";
import {
  getWeekStart,
  getWeekDays,
  formatDateForStorage,
  formatWeekRange,
} from "../../utils/dateUtils";
import "./PuzzleQueue.css";

// Create storage instance
const storage = new SupabaseStorage(supabase);

export function PuzzleQueue() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const toast = useToast();

  // Get week days
  const weekDays = useMemo(
    () => getWeekDays(currentWeekStart),
    [currentWeekStart],
  );

  // Date range for the current week
  const dateFrom = formatDateForStorage(weekDays[0]);
  const dateTo = formatDateForStorage(weekDays[6]);

  // Fetch scheduled puzzles for current week
  const { data: scheduledData, isLoading: isLoadingScheduled } = usePuzzleList(
    { dateFrom, dateTo },
    storage,
  );

  // Fetch available (unscheduled) puzzles
  const { data: availableData, isLoading: isLoadingAvailable } = usePuzzleList(
    { unscheduled: true },
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

  // Schedule puzzle handler
  const handleSchedule = (puzzleId: string, date: string) => {
    updateMutation.mutate(
      { id: puzzleId, updates: { puzzleDate: date } },
      {
        onSuccess: () => {
          toast.showSuccess("Puzzle scheduled successfully");
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
