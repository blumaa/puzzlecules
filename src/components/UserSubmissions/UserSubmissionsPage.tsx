/**
 * User Submissions Management Page
 *
 * Admin page for reviewing and managing user-submitted puzzles.
 * Supports: view, approve, reject, delete user submissions.
 */

import { useState } from "react";
import { Box, Text, Button, Heading, Badge } from "@mond-design-system/theme";
import { Modal, ModalBody, ModalFooter } from "@mond-design-system/theme/client";
import { useToast } from "../../providers/useToast";
import { useGenre } from "../../providers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseStorage } from "../../lib/supabase/storage/SupabaseStorage";
import { supabase } from "../../lib/supabase/client";
import type { PuzzleStatus, StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";
import { UserSubmissionCard } from "./UserSubmissionCard";

// Create storage instance
const puzzleStorage = new SupabaseStorage(supabase);

type StatusFilter = "all" | PuzzleStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function UserSubmissionsPage() {
  const { showSuccess, showError } = useToast();
  const { genre } = useGenre();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch user submissions
  const { data, isLoading } = useQuery({
    queryKey: ["userSubmissions", genre, statusFilter],
    queryFn: async () => {
      const filters = {
        source: "user" as const,
        genre,
        ...(statusFilter !== "all" && { status: statusFilter }),
      };
      return puzzleStorage.listPuzzles(filters);
    },
  });

  // Update puzzle mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PuzzleStatus }) => {
      return puzzleStorage.updatePuzzle(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubmissions"] });
    },
  });

  // Delete puzzle mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return puzzleStorage.deletePuzzle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubmissions"] });
      setDeleteConfirmId(null);
    },
  });

  const handleApprove = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: "approved" });
      showSuccess("Submission approved");
    } catch (err) {
      showError(
        "Failed to approve",
        err instanceof Error ? err.message : "Failed to approve submission"
      );
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: "rejected" });
      showSuccess("Submission rejected");
    } catch (err) {
      showError(
        "Failed to reject",
        err instanceof Error ? err.message : "Failed to reject submission"
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess("Submission deleted");
    } catch (err) {
      showError(
        "Failed to delete",
        err instanceof Error ? err.message : "Failed to delete submission"
      );
    }
  };

  const submissions = data?.puzzles || [];
  const pendingCount = submissions.filter((p: StoredPuzzle) => p.status === "pending").length;

  return (
    <Box display="flex" flexDirection="column" gap="md" padding="4">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap="sm">
          <Heading level={2}>User Submissions</Heading>
          {statusFilter === "pending" && pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} pending</Badge>
          )}
        </Box>
      </Box>

      {/* Status Filter */}
      <Box display="flex" gap="xs">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box padding="4">
          <Text>Loading submissions...</Text>
        </Box>
      )}

      {/* Submissions List */}
      {!isLoading && (
        <Box display="flex" flexDirection="column" gap="sm">
          {submissions.map((puzzle: StoredPuzzle) => (
            <UserSubmissionCard
              key={puzzle.id}
              puzzle={puzzle}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={() => setDeleteConfirmId(puzzle.id)}
              isUpdating={updateMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && submissions.length === 0 && (
        <Box padding="4">
          <Text semantic="secondary">
            No {statusFilter === "all" ? "" : statusFilter} user submissions found.
          </Text>
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Submission"
        size="sm"
      >
        <ModalBody>
          <Text size="md">
            Are you sure you want to delete this submission? This action cannot
            be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
