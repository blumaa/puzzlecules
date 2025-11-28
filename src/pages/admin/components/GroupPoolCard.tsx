import {
  Box,
  Button,
  BadgeVariant,
  Tag,
  Card,
  Badge,
} from "@mond-design-system/theme";
import { Radio } from "@mond-design-system/theme/client";
import type {
  StoredGroup,
  DifficultyColor,
} from "../../../lib/supabase/storage";
import type { Group } from "../../../types";
import { DIFFICULTY_LABELS } from "../../../constants/difficulty";
import { FilmGroupCard } from "../../../components/game/FilmGroupCard";
import "./GroupPoolCard.css";

const availableColors: DifficultyColor[] = [
  "yellow",
  "green",
  "blue",
  "purple",
];

const groupStatus = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

interface GroupPoolCardProps {
  group: StoredGroup;
  isEditing: boolean;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onColorChange: (id: string, color: DifficultyColor) => void;
  onApprove: () => void;
  onReject: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function GroupPoolCard({
  group,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  onColorChange,
  onApprove,
  onReject,
  isUpdating,
  isDeleting,
}: GroupPoolCardProps) {
  return (
    <Card>
      <Box display="flex" flexDirection="column" gap="sm" padding="2">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box display="flex" flexDirection="column" gap="xs">
            <Box display="flex" gap="sm" alignItems="center">
              <Tag>{group.connectionType}</Tag>
              <Tag variant="outlined" semantic="warning">
                Used: {group.usageCount}x
              </Tag>
              <Badge variant={groupStatus[group.status] as BadgeVariant}>
                {group.status}
              </Badge>
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
              <>
                {group.status === "pending" && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onApprove}
                      disabled={isUpdating}
                    >
                      Approve
                    </Button>
                    <div className="reject-btn-wrapper">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={onReject}
                        disabled={isDeleting}
                      >
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Films list */}
        <FilmGroupCard
          group={
            {
              id: group.id,
              films: group.films,
              connection: group.connection,
              difficulty: "medium",
              color: group.color || "green",
            } as Group
          }
        />
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

          <Box display="flex" gap="sm">
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
