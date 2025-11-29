import { Box, Heading, Text } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody } from '@mond-design-system/theme/client';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';
import { PuzzleCard } from './PuzzleCard';
import { formatDateHeader } from '../../utils/dateUtils';

interface SchedulePuzzleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  availablePuzzles: StoredPuzzle[];
  onSchedule: (puzzleId: string, date: string) => void;
  isScheduling: boolean;
}

export function SchedulePuzzleDrawer({
  isOpen,
  onClose,
  selectedDate,
  availablePuzzles,
  onSchedule,
  isScheduling,
}: SchedulePuzzleDrawerProps) {
  // Parse the date string and format it for display
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = formatDateHeader(dateObj);

  const handleSchedule = (puzzleId: string) => {
    onSchedule(puzzleId, selectedDate);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Heading size='md' level={3} responsive>
          Schedule for {formattedDate}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        {availablePuzzles.length === 0 ? (
          <Box padding="4">
            <Text responsive semantic="secondary">
              No puzzles available for scheduling. Create a puzzle first.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="md">
            {availablePuzzles.map((puzzle) => (
              <PuzzleCard
                key={puzzle.id}
                puzzle={puzzle}
                onSchedule={() => handleSchedule(puzzle.id)}
                isScheduling={isScheduling}
              />
            ))}
          </Box>
        )}
      </DrawerBody>
    </Drawer>
  );
}
