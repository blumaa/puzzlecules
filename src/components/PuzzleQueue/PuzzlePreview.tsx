import { Box, Heading, Text, Button } from '@mond-design-system/theme';
import type { StoredGroup, DifficultyColor } from '../../lib/supabase/storage';
import { DIFFICULTY_COLORS } from '../../constants/difficulty';

const colors: DifficultyColor[] = ['yellow', 'green', 'blue', 'purple'];

interface PuzzlePreviewProps {
  selectedGroups: Record<DifficultyColor, StoredGroup>;
  onSave: () => void;
  isSaving: boolean;
}

export function PuzzlePreview({ selectedGroups, onSave, isSaving }: PuzzlePreviewProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="md"
      padding="4"
      border="default"
    >
      <Heading level={2} size="lg">
        Puzzle Preview
      </Heading>

      <Box display="flex" flexDirection="column" gap="sm">
        {colors.map((color) => (
          <Box
            key={color}
            display="flex"
            gap="md"
            alignItems="center"
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                backgroundColor: DIFFICULTY_COLORS[color],
                flexShrink: 0,
              }}
            />
            <Box display="flex" flexDirection="column">
              <Text size="md" weight="medium">
                {selectedGroups[color].connection}
              </Text>
              <Text size="xs">
                {selectedGroups[color].films.map((f) => f.title).join(' | ')}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      <Box display="flex" justifyContent="center" padding="4">
        <Button
          variant="primary"
          size="lg"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Puzzle'}
        </Button>
      </Box>
    </Box>
  );
}
