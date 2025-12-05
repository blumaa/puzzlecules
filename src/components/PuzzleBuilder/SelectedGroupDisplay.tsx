import { Box, Text, Button } from '@mond-design-system/theme';
import type { StoredGroup } from '../../lib/supabase/storage';

interface SelectedGroupDisplayProps {
  group: StoredGroup;
  onRemove: () => void;
}

export function SelectedGroupDisplay({ group, onRemove }: SelectedGroupDisplayProps) {
  return (
    <Box display="flex" flexDirection="column" gap="sm">
      <Text size="md" weight="medium">
        {group.connection}
      </Text>
      <Box display="flex" flexWrap="wrap" gap="xs">
        {group.items.map((item) => (
          <Text key={item.id} size="xs">
            {item.title}
          </Text>
        ))}
      </Box>
      <Button variant="outline" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </Box>
  );
}
