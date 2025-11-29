import { Heading } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody } from '@mond-design-system/theme/client';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';
import { PuzzleCard } from './PuzzleCard';
import { formatDateHeader } from '../../utils/dateUtils';

interface PuzzleDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  puzzle: StoredPuzzle;
}

export function PuzzleDetailDrawer({
  isOpen,
  onClose,
  selectedDate,
  puzzle,
}: PuzzleDetailDrawerProps) {
  // Parse the date string and format it for display
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = formatDateHeader(dateObj);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Heading size='md' level={3} responsive>
          {formattedDate}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <PuzzleCard puzzle={puzzle} />
      </DrawerBody>
    </Drawer>
  );
}
