/**
 * PuzzleBuilder Admin Page
 *
 * Allows building puzzles by selecting 4 groups (one per color)
 * from the approved group pool.
 */

import { useState, useMemo } from "react";
import { Box, Heading } from "@mond-design-system/theme";
import { Input } from "@mond-design-system/theme/client";
import { SupabaseGroupStorage } from "../../lib/supabase/storage/SupabaseGroupStorage";
import { SupabaseStorage } from "../../lib/supabase/storage/SupabaseStorage";
import {
  useGroupList,
  useIncrementGroupUsage,
} from "../../lib/supabase/storage/useGroupStorage";
import { useSavePuzzle } from "../../lib/supabase/storage/usePuzzleStorage";
import type {
  StoredGroup,
  DifficultyColor,
  PuzzleInput,
} from "../../lib/supabase/storage";
import { supabase } from "../../lib/supabase/client";
import { useToast } from "../../providers/useToast";
import { useGenre } from "../../providers";
import { DifficultySlot } from "../PuzzleQueue/DifficultySlot";
import { PuzzlePreview } from "../PuzzleQueue/PuzzlePreview";

// Create storage instances
const groupStorage = new SupabaseGroupStorage(supabase);
const puzzleStorage = new SupabaseStorage(supabase);

// Color order for puzzle building
const colors: DifficultyColor[] = ["yellow", "green", "blue", "purple"];

export function PuzzleBuilder() {
  const toast = useToast();
  const { genre } = useGenre();

  // Selected groups state (one per color)
  const [selectedGroups, setSelectedGroups] = useState<
    Record<DifficultyColor, StoredGroup | null>
  >({
    yellow: null,
    green: null,
    blue: null,
    purple: null,
  });

  // Puzzle title
  const [title, setTitle] = useState("");

  // Active color being selected
  const [activeColor, setActiveColor] = useState<DifficultyColor | null>(null);

  // Query approved groups for each color (filtered by genre)
  const yellowQuery = useGroupList(
    { status: "approved", color: "yellow", limit: 100, genre },
    groupStorage,
  );
  const greenQuery = useGroupList(
    { status: "approved", color: "green", limit: 100, genre },
    groupStorage,
  );
  const blueQuery = useGroupList(
    { status: "approved", color: "blue", limit: 100, genre },
    groupStorage,
  );
  const purpleQuery = useGroupList(
    { status: "approved", color: "purple", limit: 100, genre },
    groupStorage,
  );

  const groupsByColor = useMemo(() => {
    const sortByUsage = (groups: StoredGroup[]) =>
      [...groups].sort((a, b) => a.usageCount - b.usageCount);

    return {
      yellow: sortByUsage(yellowQuery.data?.groups || []),
      green: sortByUsage(greenQuery.data?.groups || []),
      blue: sortByUsage(blueQuery.data?.groups || []),
      purple: sortByUsage(purpleQuery.data?.groups || []),
    };
  }, [yellowQuery.data, greenQuery.data, blueQuery.data, purpleQuery.data]);

  // Mutations
  const savePuzzleMutation = useSavePuzzle(puzzleStorage);
  const incrementUsageMutation = useIncrementGroupUsage(groupStorage);

  // Check if all groups are selected
  const allSelected = colors.every((color) => selectedGroups[color] !== null);

  const handleSelectGroup = (color: DifficultyColor, group: StoredGroup) => {
    setSelectedGroups((prev) => ({ ...prev, [color]: group }));
    setActiveColor(null);
  };

  const handleRemoveGroup = (color: DifficultyColor) => {
    setSelectedGroups((prev) => ({ ...prev, [color]: null }));
  };

  const handleSavePuzzle = async () => {
    if (!allSelected) return;

    const groupIds = colors.map((color) => selectedGroups[color]!.id);

    const puzzleInput: PuzzleInput = {
      groupIds,
      title: title.trim() || undefined,
      genre,
    };

    try {
      await savePuzzleMutation.mutateAsync(puzzleInput);

      // Increment usage count for selected groups
      await incrementUsageMutation.mutateAsync(groupIds);

      // Reset form
      setSelectedGroups({
        yellow: null,
        green: null,
        blue: null,
        purple: null,
      });
      setTitle("");

      toast.showSuccess("Puzzle saved successfully!");
    } catch (error) {
      console.error("Failed to save puzzle:", error);
      toast.showError(
        "Failed to save puzzle",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="4">
      {/* Header */}
      <Box display="flex" flexDirection="column" gap="sm">
        <Heading level={1} size="2xl">
          Puzzle Builder
        </Heading>
      </Box>

      {/* Puzzle Title */}
      <Box>
        <Input
          label="Puzzle Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this puzzle..."
        />
      </Box>

      {/* Group Selection Grid */}
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="md">
        {colors.map((color) => (
          <DifficultySlot
            key={color}
            color={color}
            selectedGroup={selectedGroups[color]}
            availableGroups={groupsByColor[color]}
            isActive={activeColor === color}
            onActivate={() => setActiveColor(color)}
            onDeactivate={() => setActiveColor(null)}
            onSelectGroup={(group) => handleSelectGroup(color, group)}
            onRemoveGroup={() => handleRemoveGroup(color)}
          />
        ))}
      </Box>

      {/* Preview & Save */}
      {allSelected && (
        <PuzzlePreview
          selectedGroups={
            selectedGroups as Record<DifficultyColor, StoredGroup>
          }
          onSave={handleSavePuzzle}
          isSaving={savePuzzleMutation.isPending}
        />
      )}
    </Box>
  );
}
