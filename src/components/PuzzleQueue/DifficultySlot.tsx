import { Box, Text, Button } from '@mond-design-system/theme';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../../constants/difficulty';
import { SelectedGroupDisplay } from '../PuzzleBuilder/SelectedGroupDisplay';
import { GroupSelectorDrawer } from '../PuzzleBuilder/GroupSelectorDrawer';

interface DifficultySlotProps {
  color: DifficultyColor;
  selectedGroup: StoredGroup | null;
  availableGroups: StoredGroup[];
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onSelectGroup: (group: StoredGroup) => void;
  onRemoveGroup: () => void;
}

export function DifficultySlot({
  color,
  selectedGroup,
  availableGroups,
  isActive,
  onActivate,
  onDeactivate,
  onSelectGroup,
  onRemoveGroup,
}: DifficultySlotProps) {
  const label = DIFFICULTY_LABELS[color];
  const colorValue = DIFFICULTY_COLORS[color];

  return (
    <Box
      display="flex"
      flexDirection="column"
      border="default"
    >
      {/* Slot Header */}
      <div style={{ borderTop: `4px solid ${colorValue}` }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding="3"
        >
          <Box display="flex" alignItems="center" gap="sm">
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: colorValue,
              }}
            />
            <Text size="md" weight="medium">
              {label}
            </Text>
          </Box>
          <Text size="xs">{availableGroups.length} available</Text>
        </Box>
      </div>

      {/* Slot Content */}
      <Box padding="3">
        {selectedGroup ? (
          <SelectedGroupDisplay group={selectedGroup} onRemove={onRemoveGroup} />
        ) : (
          <Button variant="outline" size="md" onClick={onActivate}>
            Select {label} Group
          </Button>
        )}
      </Box>

      {/* Group Selector Drawer */}
      <GroupSelectorDrawer
        isOpen={isActive}
        onClose={onDeactivate}
        color={color}
        groups={availableGroups}
        onSelect={onSelectGroup}
      />
    </Box>
  );
}
