/**
 * User Submission Card Component
 *
 * Displays a user-submitted puzzle with groups and action buttons.
 */

import { Box, Text, Button, Badge } from "@mond-design-system/theme";
import { Accordion } from "@mond-design-system/theme/client";
import type { StoredPuzzle, PuzzleStatus } from "../../lib/supabase/storage/IPuzzleStorage";
import type { Group } from "../../types";
import { FilmGroupCard } from "../FilmGroupCard/FilmGroupCard";

interface UserSubmissionCardProps {
  puzzle: StoredPuzzle;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

const STATUS_BADGE_VARIANT: Record<PuzzleStatus, "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  approved: "success",
  published: "primary",
  rejected: "error",
};

export function UserSubmissionCard({
  puzzle,
  onApprove,
  onReject,
  onDelete,
  isUpdating = false,
}: UserSubmissionCardProps) {
  const submittedDate = new Date(puzzle.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const accordionItems = [
    {
      id: puzzle.id,
      title: (
        <Box display="flex" alignItems="center" gap="sm">
          <Text weight="semibold">{puzzle.title || "Untitled Puzzle"}</Text>
          <Badge variant={STATUS_BADGE_VARIANT[puzzle.status]}>{puzzle.status}</Badge>
          <Text size="sm" semantic="secondary">
            {puzzle.genre}
          </Text>
        </Box>
      ),
      content: (
        <Box display="flex" flexDirection="column" gap="md">
          <Box display="flex" gap="sm" alignItems="center">
            <Text size="sm" semantic="secondary">
              Submitted: {submittedDate}
            </Text>
          </Box>

          {/* Groups */}
          {puzzle.groups?.map((group, index) => (
            <FilmGroupCard key={group.id || index} group={group as Group} />
          ))}
          {!puzzle.groups?.length && (
            <Text responsive semantic="secondary">
              No groups loaded
            </Text>
          )}

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" gap="sm">
            {puzzle.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(puzzle.id)}
                  disabled={isUpdating}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApprove(puzzle.id)}
                  disabled={isUpdating}
                >
                  Approve
                </Button>
              </>
            )}
            {puzzle.status === "rejected" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(puzzle.id)}
                disabled={isUpdating}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      ),
    },
  ];

  return <Accordion items={accordionItems} variant="bordered" />;
}
