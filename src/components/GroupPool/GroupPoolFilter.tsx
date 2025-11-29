import { Box, Text } from "@mond-design-system/theme";
import { Radio } from "@mond-design-system/theme/client";
import type { DifficultyColor } from "../../lib/supabase/storage";
import "./GroupPoolFilter.css";

const colorOptions: { value: DifficultyColor | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
];

interface GroupPoolFilterProps {
  colorFilter: DifficultyColor | "all";
  onColorChange: (color: DifficultyColor | "all") => void;
  resultCount?: number;
  totalCount?: number;
}

export function GroupPoolFilter({
  colorFilter,
  onColorChange,
  resultCount,
  totalCount,
}: GroupPoolFilterProps) {
  return (
    <Box display="flex" flexDirection="column" gap="md">
      <Box display="flex" flexDirection="column" gap="xs">
        <Text size="sm" weight="medium">
          Color
        </Text>
        <Box display="flex" gap="xs">
          {colorOptions.map((option) => (
            <Radio
              key={option.value}
              name="color-filter"
              label={option.label}
              value={option.value}
              checked={colorFilter === option.value}
              onChange={() => onColorChange(option.value)}
            />
          ))}
        </Box>
      </Box>
      {resultCount !== undefined && totalCount !== undefined && (
        <Text weight="light" size="sm">
          Showing {resultCount} of {totalCount} groups
        </Text>
      )}
    </Box>
  );
}
