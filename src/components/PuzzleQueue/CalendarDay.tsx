import { Box, Button, Text, Tag } from "@mond-design-system/theme";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import "./CalendarDay.css";

interface CalendarDayProps {
  date: Date;
  puzzle: StoredPuzzle | null;
  isToday: boolean;
  isPast: boolean;
  onClick: () => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarDay({
  date,
  puzzle,
  isToday,
  onClick,
}: CalendarDayProps) {
  const dayNumber = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];

  return (
    <Box className="calendar-day">
      <Button
        variant={isToday ? "primary" : "outline"}
        onClick={onClick}
        aria-label={`${dayName} ${dayNumber}${puzzle ? ", has puzzle scheduled" : ""}`}
        fullWidth
      >
        <Box display="grid" gridTemplateRows="repeat(3, 1fr)">
          <Text size="xs">{dayName.toUpperCase()}</Text>
          <Text size="2xl" weight="bold">
            {dayNumber}
          </Text>
          {puzzle && <Tag size="sm">Scheduled</Tag>}
        </Box>
      </Button>
    </Box>
  );
}
