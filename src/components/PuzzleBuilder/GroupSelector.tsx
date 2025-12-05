import { Box, Text, Button, Card, CardBody, Badge } from '@mond-design-system/theme';
import type { StoredGroup } from '../../lib/supabase/storage';

interface GroupSelectorProps {
  groups: StoredGroup[];
  onSelect: (group: StoredGroup) => void;
  onCancel?: () => void;
}

export function GroupSelector({ groups, onSelect, onCancel }: GroupSelectorProps) {
  if (groups.length === 0) {
    return (
      <Box display="flex" flexDirection="column" gap="sm">
        <Text size="xs">No approved groups available</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="sm">
      {onCancel && (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text size="xs">Select a group:</Text>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      )}
      <Box display="flex" flexDirection="column" gap="xs">
        {groups.map((group) => (
          <Card key={group.id} onClick={() => onSelect(group)}>
            <CardBody>
              <Box display="flex" flexDirection="column" gap="xs">
                <Text size="md" weight="medium">
                  {group.connection}
                </Text>
                <Text size="xs">
                  {group.items.map((item) => item.title).join(', ')}
                </Text>
                <Badge size="sm">Used {group.usageCount}x</Badge>
              </Box>
            </CardBody>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
