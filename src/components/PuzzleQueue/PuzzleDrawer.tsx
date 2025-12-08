/**
 * Unified Puzzle Drawer Component
 *
 * Handles both viewing scheduled puzzles and scheduling new puzzles.
 * - When a puzzle is scheduled: shows puzzle details with edit/unschedule/delete actions
 * - When no puzzle is scheduled: shows list of available puzzles to schedule with delete option
 */

import { useState } from 'react';
import { Box, Heading, Button, Text, Badge } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody, Input, Accordion, Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';
import type { Group } from '../../types';
import { FilmGroupCard } from '../FilmGroupCard/FilmGroupCard';
import { formatDateHeader } from '../../utils/dateUtils';

interface PuzzleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  /** The scheduled puzzle for this date, if any */
  scheduledPuzzle: StoredPuzzle | null;
  /** Available puzzles for scheduling (only used when no scheduled puzzle) */
  availablePuzzles: StoredPuzzle[];
  /** Called when a puzzle is scheduled to this date */
  onSchedule: (puzzleId: string, date: string) => void;
  /** Called when puzzle is updated (title change, group swap) */
  onUpdate?: (puzzleId: string, updates: { title?: string; groupIds?: string[] }) => void;
  /** Called when puzzle is unscheduled (date cleared) */
  onUnschedule?: (puzzleId: string) => void;
  /** Called when puzzle is deleted */
  onDelete?: (puzzleId: string) => void;
  /** Whether an operation is in progress */
  isLoading?: boolean;
  /** Called when user wants to swap a group */
  onSwapGroup?: (groupIndex: number, currentGroup: Group) => void;
}

export function PuzzleDrawer({
  isOpen,
  onClose,
  selectedDate,
  scheduledPuzzle,
  availablePuzzles,
  onSchedule,
  onUpdate,
  onUnschedule,
  onDelete,
  isLoading = false,
  onSwapGroup,
}: PuzzleDrawerProps) {
  // Parse the date string and format it for display
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = formatDateHeader(dateObj);

  // If there's a scheduled puzzle, show the detail view
  if (scheduledPuzzle) {
    return (
      <ScheduledPuzzleView
        isOpen={isOpen}
        onClose={onClose}
        formattedDate={formattedDate}
        puzzle={scheduledPuzzle}
        onUpdate={onUpdate}
        onUnschedule={onUnschedule}
        onDelete={onDelete}
        isLoading={isLoading}
        onSwapGroup={onSwapGroup}
      />
    );
  }

  // Otherwise, show the list of available puzzles to schedule
  return (
    <AvailablePuzzlesView
      isOpen={isOpen}
      onClose={onClose}
      formattedDate={formattedDate}
      selectedDate={selectedDate}
      availablePuzzles={availablePuzzles}
      onSchedule={onSchedule}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
}

// ============================================================================
// Scheduled Puzzle View (detail view for a specific puzzle)
// ============================================================================

interface ScheduledPuzzleViewProps {
  isOpen: boolean;
  onClose: () => void;
  formattedDate: string;
  puzzle: StoredPuzzle;
  onUpdate?: (puzzleId: string, updates: { title?: string; groupIds?: string[] }) => void;
  onUnschedule?: (puzzleId: string) => void;
  onDelete?: (puzzleId: string) => void;
  isLoading: boolean;
  onSwapGroup?: (groupIndex: number, currentGroup: Group) => void;
}

function ScheduledPuzzleView({
  isOpen,
  onClose,
  formattedDate,
  puzzle,
  onUpdate,
  onUnschedule,
  onDelete,
  isLoading,
  onSwapGroup,
}: ScheduledPuzzleViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(puzzle.title || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStartEdit = () => {
    setEditedTitle(puzzle.title || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedTitle(puzzle.title || '');
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (onUpdate && editedTitle !== puzzle.title) {
      onUpdate(puzzle.id, { title: editedTitle || undefined });
    }
    setIsEditing(false);
  };

  const handleUnschedule = () => {
    if (onUnschedule) {
      onUnschedule(puzzle.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(puzzle.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleSwapClick = (index: number, group: Group) => {
    if (onSwapGroup) {
      onSwapGroup(index, group);
    }
  };

  const canEdit = Boolean(onUpdate);
  const canUnschedule = Boolean(onUnschedule);
  const canDelete = Boolean(onDelete);
  const canSwap = Boolean(onSwapGroup);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Box display="flex" flexDirection="column" gap="xs">
          <Box display="flex" alignItems="center" gap="sm">
            <Heading size="md" level={3} responsive>
              {formattedDate}
            </Heading>
            {puzzle.source === 'user' && (
              <Badge variant="primary">User</Badge>
            )}
          </Box>
          {puzzle.status && (
            <Text size="sm" semantic="secondary">
              Status: {puzzle.status}
            </Text>
          )}
        </Box>
      </DrawerHeader>
      <DrawerBody>
        <Box display="flex" flexDirection="column" gap="md">
          {/* Title Section */}
          <Box display="flex" flexDirection="column" gap="sm">
            <Text size="sm" weight="medium">Puzzle Title</Text>
            {isEditing ? (
              <Box display="flex" gap="sm" alignItems="center">
                <Box flex="1">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Enter puzzle title..."
                  />
                </Box>
                <Button size="sm" variant="primary" onClick={handleSaveEdit} loading={isLoading}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text>{puzzle.title || 'Untitled Puzzle'}</Text>
                {canEdit && (
                  <Button size="sm" variant="ghost" onClick={handleStartEdit}>
                    Edit
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Groups Section */}
          <Box display="flex" flexDirection="column" gap="sm">
            <Text size="sm" weight="medium">Groups</Text>
            {puzzle.groups?.map((group, index) => (
              <Box key={group.id || index} display="flex" flexDirection="column" gap="xs">
                <FilmGroupCard group={group as Group} />
                {canSwap && !isEditing && (
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSwapClick(index, group as Group)}
                    >
                      Swap
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
            {!puzzle.groups?.length && (
              <Text responsive semantic="secondary">
                No groups loaded
              </Text>
            )}
          </Box>

          {/* Actions Section */}
          {(canUnschedule || canDelete) && (
            <Box display="flex" flexDirection="column" gap="sm" paddingTop="4">
              <Text size="sm" weight="medium">Actions</Text>
              <Box display="flex" gap="sm">
                {canUnschedule && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnschedule}
                    loading={isLoading}
                  >
                    Unschedule
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DrawerBody>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Puzzle"
        size="sm"
      >
        <ModalBody>
          <Text size="md">
            Are you sure you want to delete this puzzle? This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isLoading}
            >
              Delete
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Drawer>
  );
}

// ============================================================================
// Available Puzzles View (list of puzzles to schedule)
// ============================================================================

interface AvailablePuzzlesViewProps {
  isOpen: boolean;
  onClose: () => void;
  formattedDate: string;
  selectedDate: string;
  availablePuzzles: StoredPuzzle[];
  onSchedule: (puzzleId: string, date: string) => void;
  onDelete?: (puzzleId: string) => void;
  isLoading: boolean;
}

function AvailablePuzzlesView({
  isOpen,
  onClose,
  formattedDate,
  selectedDate,
  availablePuzzles,
  onSchedule,
  onDelete,
  isLoading,
}: AvailablePuzzlesViewProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSchedule = (puzzleId: string) => {
    onSchedule(puzzleId, selectedDate);
  };

  const handleDelete = (puzzleId: string) => {
    if (onDelete) {
      onDelete(puzzleId);
    }
    setDeleteConfirmId(null);
  };

  const canDelete = Boolean(onDelete);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Heading size="md" level={3} responsive>
          Schedule for {formattedDate}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        {availablePuzzles.length === 0 ? (
          <Box padding="4">
            <Text responsive semantic="secondary">
              No puzzles available for scheduling. Create a puzzle first.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="md">
            {availablePuzzles.map((puzzle) => (
              <PuzzleAccordionItem
                key={puzzle.id}
                puzzle={puzzle}
                onSchedule={() => handleSchedule(puzzle.id)}
                onDelete={canDelete ? () => setDeleteConfirmId(puzzle.id) : undefined}
                isLoading={isLoading}
              />
            ))}
          </Box>
        )}
      </DrawerBody>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Puzzle"
        size="sm"
      >
        <ModalBody>
          <Text size="md">
            Are you sure you want to delete this puzzle? This action cannot be undone.
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
              loading={isLoading}
            >
              Delete
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Drawer>
  );
}

// ============================================================================
// Puzzle Accordion Item (for the available puzzles list)
// ============================================================================

interface PuzzleAccordionItemProps {
  puzzle: StoredPuzzle;
  onSchedule: () => void;
  onDelete?: () => void;
  isLoading: boolean;
}

function PuzzleAccordionItem({
  puzzle,
  onSchedule,
  onDelete,
  isLoading,
}: PuzzleAccordionItemProps) {
  const accordionItems = [
    {
      id: puzzle.id,
      title: (
        <Box display="flex" alignItems="center" gap="sm">
          <Text weight="semibold">{puzzle.title || 'Untitled Puzzle'}</Text>
          {puzzle.source === 'user' && (
            <Badge variant="primary" size="sm">User</Badge>
          )}
        </Box>
      ),
      content: (
        <Box display="flex" flexDirection="column" gap="md">
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
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={onSchedule}
              loading={isLoading}
            >
              Schedule
            </Button>
          </Box>
        </Box>
      ),
    },
  ];

  return <Accordion items={accordionItems} variant="bordered" />;
}
