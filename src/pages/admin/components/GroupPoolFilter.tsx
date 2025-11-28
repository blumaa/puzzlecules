import { Box, Divider, Text } from "@mond-design-system/theme";
import { Radio } from "@mond-design-system/theme/client";
import type {
  GroupStatus,
  DifficultyColor,
} from "../../../lib/supabase/storage";
import "./GroupPoolFilter.css";

const statusOptions: { value: GroupStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
];

const colorOptions: { value: DifficultyColor | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
];

interface GroupPoolFilterProps {
  statusFilter: GroupStatus | "all";
  colorFilter: DifficultyColor | "all";
  onStatusChange: (status: GroupStatus | "all") => void;
  onColorChange: (color: DifficultyColor | "all") => void;
  resultCount?: number;
  totalCount?: number;
}

export function GroupPoolFilter({
  statusFilter,
  colorFilter,
  onStatusChange,
  onColorChange,
  resultCount,
  totalCount,
}: GroupPoolFilterProps) {
  return (
    <Box display="flex" flexDirection="column" gap="md">
      <Box display="flex" gap="xs">
        <Box display="flex" flexDirection="column" gap="xs">
          <Text size="sm" weight="medium">
            Status
          </Text>
          <Box display="flex" gap="xs">
            {statusOptions.map((option) => (
              <Radio
                key={option.value}
                name="status-filter"
                label={option.label}
                value={option.value}
                checked={statusFilter === option.value}
                onChange={() => onStatusChange(option.value)}
              />
            ))}
          </Box>
        </Box>

        <Box display="flex" alignItems="center">
          <Divider orientation="vertical" />
        </Box>

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
      </Box>
      {resultCount !== undefined && totalCount !== undefined && (
        <Text weight="light" size="sm">
          Showing {resultCount} of {totalCount} groups
        </Text>
      )}
    </Box>
  );
}
