import { Box, Text, Button } from "@mond-design-system/theme";
import { Accordion } from "@mond-design-system/theme/client";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import type { Group } from "../../types";
import { FilmGroupCard } from "../FilmGroupCard/FilmGroupCard";

interface PuzzleCardProps {
  puzzle: StoredPuzzle;
  onSchedule?: () => void;
  isScheduling?: boolean;
}

export function PuzzleCard({
  puzzle,
  onSchedule,
  isScheduling,
}: PuzzleCardProps) {
  const accordionItems = [
    {
      id: puzzle.id,
      title: puzzle.title || "Untitled Puzzle",
      content: (
        <Box display="flex" flexDirection="column" gap="md">
          {/* Groups */}
          {puzzle.groups?.map((group, index) => (
            <FilmGroupCard key={group.id || index} group={group as Group} />
          ))}
          {!puzzle.groups?.length && (
            <Text responsive semantic="secondary">
              No groups loaded
            </Text>
          )}

          {/* Schedule Button */}
          {onSchedule && (
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="primary"
                size="sm"
                onClick={onSchedule}
                disabled={isScheduling}
              >
                {isScheduling ? "Scheduling..." : "Schedule"}
              </Button>
            </Box>
          )}
        </Box>
      ),
    },
  ];

  return <Accordion items={accordionItems} variant="bordered" />;
}
