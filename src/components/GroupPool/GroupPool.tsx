/**
 * GroupPool Admin Page
 *
 * Displays and manages the connection groups pool.
 * Allows filtering by color, genre, and editing groups.
 */

import { useState } from 'react';
import { Box, Text, Button } from '@mond-design-system/theme';
import { Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import { SupabaseGroupStorage } from '../../lib/supabase/storage/SupabaseGroupStorage';
import {
  useGroupList,
  useUpdateGroup,
  useDeleteGroup,
} from '../../lib/supabase/storage/useGroupStorage';
import type { GroupListFilters, DifficultyColor } from '../../lib/supabase/storage';
import { supabase } from '../../lib/supabase/client';
import { useToast } from '../../providers/useToast';
import { useGenre } from '../../providers';
import { COLOR_TO_DIFFICULTY } from '../../constants/difficulty';
import { GroupPoolHeader } from './GroupPoolHeader';
import { GroupPoolFilter } from './GroupPoolFilter';
import { GroupPoolList } from './GroupPoolList';
import './GroupPool.css';

// Create storage instance
const storage = new SupabaseGroupStorage(supabase);

export function GroupPool() {
  const toast = useToast();
  const { genre } = useGenre();

  // Filter state
  const [colorFilter, setColorFilter] = useState<DifficultyColor | 'all'>('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Build filters for query
  const filters: GroupListFilters = {
    limit: pageSize,
    offset: page * pageSize,
    genre,
  };

  if (colorFilter !== 'all') {
    filters.color = colorFilter;
  }

  // Query groups
  const { data, isLoading, error } = useGroupList(filters, storage);

  // Mutations
  const updateMutation = useUpdateGroup(storage);
  const deleteMutation = useDeleteGroup(storage);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedColor, setEditedColor] = useState<DifficultyColor>('green');

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm, {
        onSuccess: () => {
          toast.showSuccess('Group deleted');
          setDeleteConfirm(null);
        },
        onError: (err) => toast.showError('Failed to delete group', err.message),
      });
    }
  };

  const handleSaveEdit = (id: string) => {
    const difficulty = COLOR_TO_DIFFICULTY[editedColor];
    updateMutation.mutate(
      { id, updates: { color: editedColor, difficulty } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditedColor('green');
          toast.showSuccess('Group updated');
        },
        onError: (err) => toast.showError('Failed to update group', err.message),
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedColor('green');
  };

  const handleGroupColorChange = (id: string, color: DifficultyColor) => {
    const difficulty = COLOR_TO_DIFFICULTY[color];
    updateMutation.mutate(
      { id, updates: { color, difficulty } },
      {
        onSuccess: () => toast.showSuccess('Color updated'),
        onError: (err) => toast.showError('Failed to update color', err.message),
      }
    );
  };

  const handleFilterColorChange = (color: DifficultyColor | 'all') => {
    setColorFilter(color);
    setPage(0);
  };

  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="4">
      <GroupPoolHeader />

      <GroupPoolFilter
        colorFilter={colorFilter}
        onColorChange={handleFilterColorChange}
        resultCount={data?.groups.length}
        totalCount={data?.total}
      />

      <GroupPoolList
        groups={data?.groups || []}
        isLoading={isLoading}
        error={error}
        editingId={editingId}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onColorChange={handleGroupColorChange}
        onDelete={handleDelete}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onPageChange={setPage}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Group"
        size="sm"
      >
        <ModalBody>
          <Text size="md">
            Are you sure you want to delete this group? This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
