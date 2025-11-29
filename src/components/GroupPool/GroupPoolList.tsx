import { Box, Text, Spinner } from '@mond-design-system/theme';
import { Pagination } from '@mond-design-system/theme/client';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';
import { GroupPoolCard } from './GroupPoolCard';
import './GroupPoolList.css';

interface GroupPoolListProps {
  groups: StoredGroup[];
  isLoading: boolean;
  error: Error | null;
  editingId: string | null;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onColorChange: (id: string, color: DifficultyColor) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function GroupPoolList({
  groups,
  isLoading,
  error,
  editingId,
  onSaveEdit,
  onCancelEdit,
  onColorChange,
  onDelete,
  isUpdating,
  isDeleting,
  page,
  pageSize,
  total,
  onPageChange,
}: GroupPoolListProps) {
  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" padding="4" gap="sm">
        <Spinner size="md" />
        <Text responsive>Loading groups...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding="3" className="error-message">
        <Text responsive>Error loading groups: {error.message}</Text>
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Box padding="4" className="empty-state">
        <Text responsive>No groups found with current filters</Text>
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" gap="md" flexWrap='wrap'>
        {groups.map((group) => (
          <GroupPoolCard
            key={group.id}
            group={group}
            isEditing={editingId === group.id}
            onSaveEdit={() => onSaveEdit(group.id)}
            onCancelEdit={onCancelEdit}
            onColorChange={onColorChange}
            onDelete={() => onDelete(group.id)}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        ))}
      </Box>

      {total > pageSize && (
        <Box padding="4">
          <Pagination
            currentPage={page + 1}
            totalItems={total}
            itemsPerPage={pageSize}
            onPageChange={(newPage) => onPageChange(newPage - 1)}
            showItemsPerPage={false}
            size="sm"
          />
        </Box>
      )}
    </>
  );
}
