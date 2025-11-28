import { Box, Text, Badge, BadgeVariant } from '@mond-design-system/theme';
import type { PuzzleStatus } from '../../../lib/supabase/storage/IPuzzleStorage';

const STATUS_BADGE_VARIANTS: Record<PuzzleStatus, BadgeVariant> = {
  pending: 'warning',
  approved: 'success',
  published: 'default',
  rejected: 'error',
};

interface PuzzleQueueCardHeaderProps {
  status: PuzzleStatus;
  title?: string | null;
  puzzleDate?: string | null;
}

export function PuzzleQueueCardHeader({
  status,
  title,
  puzzleDate,
}: PuzzleQueueCardHeaderProps) {
  return (
    <Box display="flex" alignItems="center" gap="md" flexWrap="wrap">
      <Badge variant={STATUS_BADGE_VARIANTS[status]}>
        {status.toUpperCase()}
      </Badge>
      {title && <Text responsive semantic="secondary">Title: {title}</Text>}
      {puzzleDate && (
        <Text responsive semantic="secondary">
          Scheduled: {new Date(puzzleDate).toLocaleDateString()}
        </Text>
      )}
    </Box>
  );
}
