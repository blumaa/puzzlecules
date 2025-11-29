import { Box, Heading, Text } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody } from '@mond-design-system/theme/client';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';
import { DIFFICULTY_LABELS } from '../../constants/difficulty';
import { GroupSelector } from './GroupSelector';

interface GroupSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  color: DifficultyColor;
  groups: StoredGroup[];
  onSelect: (group: StoredGroup) => void;
}

export function GroupSelectorDrawer({
  isOpen,
  onClose,
  color,
  groups,
  onSelect,
}: GroupSelectorDrawerProps) {
  const label = DIFFICULTY_LABELS[color];

  const handleSelect = (group: StoredGroup) => {
    onSelect(group);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Heading size="md" level={3} responsive>
          Select {label} Group
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        {groups.length === 0 ? (
          <Box padding="4">
            <Text responsive semantic="secondary">
              No approved groups available for this difficulty level.
            </Text>
          </Box>
        ) : (
          <GroupSelector groups={groups} onSelect={handleSelect} />
        )}
      </DrawerBody>
    </Drawer>
  );
}
