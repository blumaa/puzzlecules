import { Box, Heading, Button, Text, Spinner } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody } from '@mond-design-system/theme/client';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage/IGroupStorage';
import type { Group } from '../../types';
import { FilmGroupCard } from '../FilmGroupCard/FilmGroupCard';

interface GroupSwapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** The current group being swapped */
  currentGroup: Group;
  /** Available groups to swap with (same color, approved, not in current puzzle) */
  availableGroups: StoredGroup[];
  /** Whether groups are loading */
  isLoading?: boolean;
  /** Called when a group is selected for swap */
  onSelectGroup: (group: StoredGroup) => void;
  /** Whether swap is in progress */
  isSwapping?: boolean;
}

/**
 * Color label mapping for display
 */
const COLOR_LABELS: Record<DifficultyColor, string> = {
  yellow: 'Easy (Yellow)',
  green: 'Medium (Green)',
  blue: 'Hard (Blue)',
  purple: 'Expert (Purple)',
};

export function GroupSwapDrawer({
  isOpen,
  onClose,
  currentGroup,
  availableGroups,
  isLoading = false,
  onSelectGroup,
  isSwapping = false,
}: GroupSwapDrawerProps) {
  const colorLabel = currentGroup.color ? COLOR_LABELS[currentGroup.color as DifficultyColor] : 'Unknown';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg">
      <DrawerHeader onClose={onClose}>
        <Box display="flex" flexDirection="column" gap="xs">
          <Heading size="md" level={3} responsive>
            Swap Group
          </Heading>
          <Text size="sm" semantic="secondary">
            Select a replacement {colorLabel} group
          </Text>
        </Box>
      </DrawerHeader>
      <DrawerBody>
        <Box display="flex" flexDirection="column" gap="md">
          {/* Current Group */}
          <Box display="flex" flexDirection="column" gap="sm">
            <Text size="sm" weight="medium">Current Group</Text>
            <FilmGroupCard group={currentGroup} />
          </Box>

          {/* Available Groups */}
          <Box display="flex" flexDirection="column" gap="sm">
            <Text size="sm" weight="medium">
              Available Groups ({availableGroups.length})
            </Text>

            {isLoading && (
              <Box display="flex" justifyContent="center" padding="4">
                <Spinner size="md" />
              </Box>
            )}

            {!isLoading && availableGroups.length === 0 && (
              <Text semantic="secondary">
                No other {colorLabel.toLowerCase()} groups available.
              </Text>
            )}

            {!isLoading && availableGroups.map((group) => (
              <Box
                key={group.id}
                display="flex"
                flexDirection="column"
                gap="xs"
              >
                <FilmGroupCard
                  group={{
                    id: group.id,
                    items: group.items,
                    connection: group.connection,
                    color: group.color ?? 'yellow',
                    difficulty: group.difficulty ?? 'easy',
                  }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Text size="xs" semantic="secondary">
                    Used {group.usageCount ?? 0} time(s)
                  </Text>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onSelectGroup(group)}
                    disabled={isSwapping}
                  >
                    {isSwapping ? 'Swapping...' : 'Select'}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DrawerBody>
    </Drawer>
  );
}
