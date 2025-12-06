import { Box, Button, Text, Tag } from "@mond-design-system/theme";
import { Checkbox } from "@mond-design-system/theme/client";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import "./CalendarDay.css";

interface CalendarDayProps {
  date: Date;
  puzzle: StoredPuzzle | null;
  isToday: boolean;
  isPast: boolean;
  onClick: () => void;
  /** Whether selection mode is active */
  isSelectMode?: boolean;
  /** Whether this day is selected (only used in select mode) */
  isSelected?: boolean;
  /** Called when checkbox is toggled (only used in select mode) */
  onSelect?: () => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarDay({
  date,
  puzzle,
  isToday,
  onClick,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}: CalendarDayProps) {
  const dayNumber = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];

  const handleClick = () => {
    if (isSelectMode && puzzle && onSelect) {
      onSelect();
    } else {
      onClick();
    }
  };

  // Determine button variant based on state
  const getVariant = (): "primary" | "outline" | "ghost" => {
    if (isToday) return "primary";
    if (isSelected) return "ghost";
    return "outline";
  };

  return (
    <Box className={`calendar-day ${isSelected ? "calendar-day--selected" : ""}`}>
      {isSelectMode && puzzle && (
        <Box className="calendar-day-checkbox">
          <Checkbox
            checked={isSelected}
            onChange={onSelect}
            aria-label={`Select ${dayName} ${dayNumber}`}
          />
        </Box>
      )}
      <Button
        variant={getVariant()}
        onClick={handleClick}
        aria-label={`${dayName} ${dayNumber}${puzzle ? ", has puzzle scheduled" : ""}${isSelected ? ", selected" : ""}`}
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
