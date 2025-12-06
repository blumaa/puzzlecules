import { useState } from 'react';
import { Box, Heading, Button, Text, Card } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody, Input } from '@mond-design-system/theme/client';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';
import type { Group } from '../../types';
import { FilmGroupCard } from '../FilmGroupCard/FilmGroupCard';
import { formatDateHeader } from '../../utils/dateUtils';

interface PuzzleDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  puzzle: StoredPuzzle;
  /** Called when puzzle is updated (title change, group swap) */
  onUpdate?: (puzzleId: string, updates: { title?: string; groupIds?: string[] }) => void;
  /** Called when puzzle is unscheduled (date cleared) */
  onUnschedule?: (puzzleId: string) => void;
  /** Called when puzzle is deleted */
  onDelete?: (puzzleId: string) => void;
  /** Whether update is in progress */
  isUpdating?: boolean;
  /** Called when user wants to swap a group */
  onSwapGroup?: (groupIndex: number, currentGroup: Group) => void;
}

export function PuzzleDetailDrawer({
  isOpen,
  onClose,
  selectedDate,
  puzzle,
  onUpdate,
  onUnschedule,
  onDelete,
  isUpdating = false,
  onSwapGroup,
}: PuzzleDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(puzzle.title || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Parse the date string and format it for display
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = formatDateHeader(dateObj);

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

  // Check if editing features are available
  const canEdit = Boolean(onUpdate);
  const canUnschedule = Boolean(onUnschedule);
  const canDelete = Boolean(onDelete);
  const canSwap = Boolean(onSwapGroup);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Box display="flex" flexDirection="column" gap="xs">
          <Heading size="md" level={3} responsive>
            {formattedDate}
          </Heading>
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
                <Button size="sm" variant="primary" onClick={handleSaveEdit} disabled={isUpdating}>
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
                    disabled={isUpdating}
                  >
                    Unschedule
                  </Button>
                )}
                {canDelete && !showDeleteConfirm && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                )}
              </Box>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <Card>
                  <Box padding="3" display="flex" flexDirection="column" gap="sm">
                    <Text>Are you sure you want to delete this puzzle? This cannot be undone.</Text>
                    <Box display="flex" gap="sm">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isUpdating}
                      >
                        Yes, Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </DrawerBody>
    </Drawer>
  );
}
