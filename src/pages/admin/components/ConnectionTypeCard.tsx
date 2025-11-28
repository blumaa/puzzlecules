import { Box, Text, Button, Card, Badge } from "@mond-design-system/theme";
import type { ConnectionType } from "../../../services/group-generator";

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    "word-game": "blue",
    people: "green",
    thematic: "purple",
    setting: "orange",
    cultural: "pink",
    narrative: "cyan",
    character: "yellow",
    production: "red",
    elements: "gray",
  };
  return colors[category] || "gray";
};

interface ConnectionTypeCardProps {
  connectionType: ConnectionType;
  onToggleActive: (id: string) => void;
  onEdit: (type: ConnectionType) => void;
  onDelete: (id: string) => void;
}

export function ConnectionTypeCard({
  connectionType,
  onToggleActive,
  onEdit,
  onDelete,
}: ConnectionTypeCardProps) {
  return (
    <Card>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        padding="4"
      >
        <Box display="flex" flexDirection="column" gap="sm" flex="1">
          <Box display="flex" alignItems="center" gap="sm">
            <Text size="lg">{connectionType.name}</Text>
            <Badge color={getCategoryColor(connectionType.category)}>
              {connectionType.category}
            </Badge>
            {!connectionType.active && <Badge color="gray">Inactive</Badge>}
          </Box>
          <Text color="muted">{connectionType.description}</Text>
          {connectionType.examples && connectionType.examples.length > 0 && (
            <Text size="sm" color="muted">
              Examples: {connectionType.examples.join(", ")}
            </Text>
          )}
        </Box>

        <Box display="flex" gap="sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(connectionType.id)}
          >
            {connectionType.active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(connectionType)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(connectionType.id)}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
