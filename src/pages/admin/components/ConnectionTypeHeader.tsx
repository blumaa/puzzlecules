import { Box, Heading, Button } from "@mond-design-system/theme";

interface ConnectionTypeHeaderProps {
  onAddNew: () => void;
}

export function ConnectionTypeHeader({ onAddNew }: ConnectionTypeHeaderProps) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Heading level={1} size="2xl">
        Connection Types
      </Heading>
      <Button variant="primary" onClick={onAddNew}>
        Add New Type
      </Button>
    </Box>
  );
}
