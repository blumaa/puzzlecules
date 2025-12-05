import { Box, Button, Tag, Card } from "@mond-design-system/theme";
import { Radio } from "@mond-design-system/theme/client";
import type {
  StoredGroup,
  DifficultyColor,
} from "../../lib/supabase/storage";
import type { Group } from "../../types";
import { DIFFICULTY_LABELS } from "../../constants/difficulty";
import { FilmGroupCard } from "../FilmGroupCard/FilmGroupCard";
import "./GroupPoolCard.css";

const availableColors: DifficultyColor[] = [
  "yellow",
  "green",
  "blue",
  "purple",
];

interface GroupPoolCardProps {
  group: StoredGroup;
  isEditing: boolean;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onColorChange: (id: string, color: DifficultyColor) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function GroupPoolCard({
  group,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  onColorChange,
  onDelete,
  isUpdating,
  isDeleting,
}: GroupPoolCardProps) {
  return (
    <Card maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap="sm"
        padding="2"
        height="full"
        justifyContent="space-between"
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="stretch"
        >
          <Box display="flex" flexDirection="column" gap="xs">
            <Box display="flex" gap="sm" alignItems="center">
              <Tag>{group.connectionType}</Tag>
              <Tag variant="outlined" semantic="warning">
                Used: {group.usageCount}x
              </Tag>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box display="flex" gap="xs">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSaveEdit}
                  disabled={isUpdating}
                >
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <div className="reject-btn-wrapper">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </div>
            )}
          </Box>
        </Box>

        {/* Items list */}
        <FilmGroupCard
          group={
            {
              id: group.id,
              items: group.items,
              connection: group.connection,
              difficulty: "medium",
              color: group.color || "green",
            } as Group
          }
        />

        {/* Color selection */}
        <Box
          display="flex"
          gap="sm"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            corners="rounded-full"
            className={`color-indicator color-indicator--${group.color || "green"}`}
          />

          <Box display="flex" >
            {availableColors.map((color) => (
              <Radio
                key={color}
                name={`color-${group.id}`}
                label={DIFFICULTY_LABELS[color]}
                value={color}
                checked={group.color === color}
                onChange={() => onColorChange(group.id, color)}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
