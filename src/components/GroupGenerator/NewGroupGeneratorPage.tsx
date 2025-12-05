/**
 * New Group Generator Page
 *
 * AI-first group generation using Claude.
 * Generates film connection groups with TMDB verification.
 * Admin approves/rejects groups with difficulty settings.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Spinner,
} from "@mond-design-system/theme";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Accordion,
} from "@mond-design-system/theme/client";
import { useToast } from "../../providers/useToast";
import { useGenre } from "../../providers";
import {
  ConnectionTypeStore,
  FeedbackStore,
} from "../../services/group-generator";
import { createVerifier } from "../../services/group-generator/verifiers";
import type {
  GeneratedGroup,
  Difficulty,
  GenerationFilters,
  ConnectionType,
} from "../../services/group-generator";
import { SupabaseGroupStorage } from "../../lib/supabase/storage/SupabaseGroupStorage";
import { useSaveGroupBatch } from "../../lib/supabase/storage/useGroupStorage";
import { supabase } from "../../lib/supabase/client";
import "./NewGroupGeneratorPage.css";

// Initialize services (these are safe for browser - they use Supabase, not Anthropic)
const connectionTypeStore = new ConnectionTypeStore();
const feedbackStore = new FeedbackStore();
const groupStorage = new SupabaseGroupStorage(supabase);

const DIFFICULTY_OPTIONS: {
  value: Difficulty;
  label: string;
  color: string;
}[] = [
  { value: "easy", label: "Easy", color: "yellow" },
  { value: "medium", label: "Medium", color: "green" },
  { value: "hard", label: "Hard", color: "blue" },
  { value: "expert", label: "Expert", color: "purple" },
];

// Map our difficulty to legacy difficulty level
const difficultyToLevel: Record<
  Difficulty,
  "easy" | "medium" | "hard" | "hardest"
> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
  expert: "hardest",
};

export function NewGroupGeneratorPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { genre } = useGenre();

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGroups, setGeneratedGroups] = useState<GeneratedGroup[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Filters
  const [yearStart, setYearStart] = useState(1920);
  const [yearEnd, setYearEnd] = useState(new Date().getFullYear());
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);

  // Review state
  const [approveModalGroup, setApproveModalGroup] =
    useState<GeneratedGroup | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");
  const [rejectModalGroup, setRejectModalGroup] =
    useState<GeneratedGroup | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Filters accordion state - expanded by default
  const [filtersExpanded, setFiltersExpanded] = useState<string[]>(["filters"]);

  // Save mutation
  const saveMutation = useSaveGroupBatch(groupStorage, {
    onSuccess: (data) => {
      showSuccess(`Saved ${data.length} groups to pool!`);
    },
    onError: (err) => {
      showError("Failed to save", err.message);
    },
  });

  // Load connection types (filtered by genre)
  const loadConnectionTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const types = await connectionTypeStore.getActive(genre);
      setConnectionTypes(types);
    } catch (err) {
      showError(
        "Failed to load",
        err instanceof Error ? err.message : "Failed to load connection types",
      );
    } finally {
      setLoadingTypes(false);
    }
  }, [showError, genre]);

  useEffect(() => {
    loadConnectionTypes();
  }, [loadConnectionTypes]);

  // Generate groups via API
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedGroups([]);

    try {
      // Get active connection types (filter by selected if any)
      let typesToUse = connectionTypes;
      if (selectedTypeIds.length > 0) {
        typesToUse = connectionTypes.filter((t) =>
          selectedTypeIds.includes(t.id),
        );
      }

      // Get feedback examples for learning and existing connections to exclude (filtered by genre)
      const [goodExamples, badExamples, existingGroupsResult] =
        await Promise.all([
          feedbackStore.getAcceptedExamples(10, genre),
          feedbackStore.getRejectedExamples(10, genre),
          groupStorage.listGroups({ limit: 1000, genre }),
        ]);

      // Extract existing connection strings to avoid duplicates
      const existingConnections = existingGroupsResult.groups.map(
        (g) => g.connection,
      );

      const filters: GenerationFilters = {
        yearRange: [yearStart, yearEnd],
        excludeConnections: existingConnections,
        genre,
      };

      // Call API route (Claude runs server-side)
      const response = await fetch("/api/generate-groups-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters,
          connectionTypes: typesToUse,
          goodExamples,
          badExamples,
          count: 20,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate groups");
      }

      const data = await response.json();
      let groups: GeneratedGroup[] = data.groups;

      // Create verifier based on genre (TMDB for films, MusicBrainz for music, etc.)
      const verifier = createVerifier(genre);

      // Verify items with the appropriate verifier (this is safe to run in browser)
      groups = await Promise.all(
        groups.map(async (group) => {
          const verifiedItems = await verifier.verifyItems(
            group.items.map((item) => ({ title: item.title, year: item.year })),
          );
          const allVerified = verifiedItems.every((item) => item.verified);
          return {
            ...group,
            items: verifiedItems,
            allItemsVerified: allVerified,
          };
        }),
      );

      setGeneratedGroups(groups);

      if (groups.length === 0) {
        showInfo("No groups generated");
      } else {
        const verifiedCount = groups.filter((g) => g.allItemsVerified).length;
        showSuccess(
          `Generated ${groups.length} groups! (${verifiedCount} fully verified)`,
        );
        // Collapse filters accordion when groups are ready
        setFiltersExpanded([]);
      }
    } catch (err) {
      showError(
        "Generation failed",
        err instanceof Error ? err.message : "Failed to generate groups",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve a group
  const handleApprove = async () => {
    if (!approveModalGroup) return;

    try {
      // Record positive feedback for learning
      await feedbackStore.recordFeedback(approveModalGroup, true);

      // Save to database
      saveMutation.mutate([
        {
          items: approveModalGroup.items.map((item, index) => ({
            // Use externalId if available, otherwise generate unique ID from timestamp + index
            id: item.externalId ?? Date.now() + index,
            title: item.title,
            year: item.year,
          })),
          connection: approveModalGroup.connection,
          connectionType: approveModalGroup.connectionType,
          difficultyScore:
            DIFFICULTY_OPTIONS.findIndex(
              (d) => d.value === selectedDifficulty,
            ) + 1,
          color: DIFFICULTY_OPTIONS.find((d) => d.value === selectedDifficulty)
            ?.color as "yellow" | "green" | "blue" | "purple",
          difficulty: difficultyToLevel[selectedDifficulty],
          status: "approved" as const,
          genre,
        },
      ]);

      // Remove from list
      setGeneratedGroups((prev) =>
        prev.filter((g) => g.id !== approveModalGroup.id),
      );
      setApproveModalGroup(null);
      showSuccess("Group approved!");
    } catch (err) {
      showError(
        "Failed to approve",
        err instanceof Error ? err.message : "Failed to approve group",
      );
    }
  };

  // Reject a group
  const handleReject = async () => {
    if (!rejectModalGroup) return;

    try {
      // Record negative feedback for learning
      await feedbackStore.recordFeedback(
        rejectModalGroup,
        false,
        rejectReason || undefined,
      );
      setGeneratedGroups((prev) =>
        prev.filter((g) => g.id !== rejectModalGroup.id),
      );
      setRejectModalGroup(null);
      setRejectReason("");
      showSuccess("Group rejected");
    } catch (err) {
      showError(
        "Failed to reject",
        err instanceof Error ? err.message : "Failed to reject group",
      );
    }
  };

  // Toggle connection type filter
  const toggleTypeFilter = (typeId: string) => {
    setSelectedTypeIds((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId],
    );
  };

  // Group connection types by category
  const typesByCategory = connectionTypes.reduce(
    (acc, type) => {
      if (!acc[type.category]) {
        acc[type.category] = [];
      }
      acc[type.category].push(type);
      return acc;
    },
    {} as Record<string, ConnectionType[]>,
  );

  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="4">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading level={1} size="2xl">
          Generate Groups
        </Heading>
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Spinner size="sm" /> Generating...
            </>
          ) : (
            "Generate 20 Groups"
          )}
        </Button>
      </Box>

      {/* Filters / Generating State */}
      {isGenerating ? (
        <Card>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="md"
            padding="6"
          >
            <Spinner size="lg" />
            <Text size="lg">Generating groups with AI...</Text>
          </Box>
        </Card>
      ) : (
        <Accordion
          items={[
            {
              id: "filters",
              title: "Filters",
              scrollable: true,
              content: (
                <Card>
                  <CardBody>
                    <Box display="flex" flexDirection="column" gap="md">
                      {/* Year Range */}
                      <Box display="flex" gap="md" alignItems="center">
                        <Text>Year Range:</Text>
                        <input
                          type="number"
                          className="new-generator-input"
                          value={yearStart}
                          onChange={(e) =>
                            setYearStart(parseInt(e.target.value) || 1900)
                          }
                          min={1900}
                          max={yearEnd}
                        />
                        <Text>to</Text>
                        <input
                          type="number"
                          className="new-generator-input"
                          value={yearEnd}
                          onChange={(e) =>
                            setYearEnd(parseInt(e.target.value) || 2024)
                          }
                          min={yearStart}
                          max={new Date().getFullYear()}
                        />
                      </Box>

                      {/* Connection Types Filter */}
                      <Box display="flex" flexDirection="column" gap="sm">
                        <Text>
                          Connection Types (optional - leave empty for all):
                        </Text>
                        {loadingTypes ? (
                          <Spinner size="sm" />
                        ) : (
                          <Box display="flex" flexDirection="column" gap="sm">
                            {Object.entries(typesByCategory).map(
                              ([category, types]) => (
                                <Box
                                  key={category}
                                  display="flex"
                                  flexDirection="column"
                                  gap="xs"
                                >
                                  <Text size="sm" color="muted">
                                    {category}:
                                  </Text>
                                  <Box
                                    display="flex"
                                    gap="xs"
                                    className="flex-wrap"
                                  >
                                    {types.map((type) => (
                                      <Button
                                        key={type.id}
                                        variant={
                                          selectedTypeIds.includes(type.id)
                                            ? "primary"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          toggleTypeFilter(type.id)
                                        }
                                      >
                                        {type.name}
                                      </Button>
                                    ))}
                                  </Box>
                                </Box>
                              ),
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardBody>
                </Card>
              ),
            },
          ]}
          mode="single"
          variant="bordered"
          expandedIds={filtersExpanded}
          onExpandedChange={setFiltersExpanded}
          allowToggleOff={true}
        />
      )}

      {/* Generated Groups */}
      {generatedGroups.length > 0 && (
        <Box display="flex" flexDirection="column" gap="md">
          <Heading level={2} size="xl">
            Generated Groups ({generatedGroups.length})
          </Heading>

          {generatedGroups.map((group) => (
            <Card key={group.id}>
              <Box display="flex" flexDirection="column" gap="md" padding="4">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box display="flex" flexDirection="column" gap="sm" flex="1">
                    <Box display="flex" alignItems="center" gap="sm">
                      <Text size="lg">{group.connection}</Text>
                      <Badge color="blue">{group.connectionType}</Badge>
                      {!group.allItemsVerified && (
                        <Badge color="orange">Unverified Items</Badge>
                      )}
                    </Box>
                    <Text color="muted" size="sm">
                      {group.explanation}
                    </Text>
                  </Box>
                </Box>

                {/* Items */}
                <Box display="flex" gap="sm" className="flex-wrap">
                  {group.items.map((item, idx) => (
                    <Box
                      key={idx}
                      className={`item-chip ${item.verified ? "verified" : "unverified"}`}
                    >
                      <Text size="sm">
                        {item.title} ({item.year})
                        {item.verified && item.externalId && (
                          <span className="verified-badge">Verified</span>
                        )}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {/* Actions */}
                <Box display="flex" gap="sm" justifyContent="flex-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRejectModalGroup(group)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setApproveModalGroup(group);
                      setSelectedDifficulty("medium");
                    }}
                  >
                    Approve
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalGroup !== null}
        onClose={() => setApproveModalGroup(null)}
        title="Approve Group"
        size="md"
      >
        <ModalBody>
          <Box display="flex" flexDirection="column" gap="md">
            <Text size="md">
              Approve &quot;{approveModalGroup?.connection}&quot;?
            </Text>
            <Box display="flex" flexDirection="column" gap="sm">
              <Text>Select difficulty:</Text>
              <Box display="flex" gap="sm">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={
                      selectedDifficulty === opt.value ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDifficulty(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button
              variant="outline"
              onClick={() => setApproveModalGroup(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApprove}>
              Approve
            </Button>
          </Box>
        </ModalFooter>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalGroup !== null}
        onClose={() => setRejectModalGroup(null)}
        title="Reject Group"
        size="md"
      >
        <ModalBody>
          <Box display="flex" flexDirection="column" gap="md">
            <Text size="md">
              Reject &quot;{rejectModalGroup?.connection}&quot;?
            </Text>
            <Box display="flex" flexDirection="column" gap="sm">
              <Text>Reason (optional, helps improve future generation):</Text>
              <textarea
                className="new-generator-textarea"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Connection is too obvious, films don't fit well..."
                rows={3}
              />
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setRejectModalGroup(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
