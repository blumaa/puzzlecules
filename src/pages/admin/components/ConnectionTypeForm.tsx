import { useState } from "react";
import { Box, Button, Card, Heading } from "@mond-design-system/theme";
import {
  Input,
  Textarea,
  Select,
  Checkbox,
} from "@mond-design-system/theme/client";
import type { ConnectionCategory } from "../../../services/group-generator";

const CATEGORIES: ConnectionCategory[] = [
  "word-game",
  "people",
  "thematic",
  "setting",
  "cultural",
  "narrative",
  "character",
  "production",
  "elements",
];

const CATEGORY_OPTIONS = CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}));

export interface ConnectionTypeFormData {
  name: string;
  category: ConnectionCategory;
  description: string;
  examples: string[];
  active: boolean;
}

interface ConnectionTypeFormProps {
  initialValues?: Partial<ConnectionTypeFormData>;
  isEditing?: boolean;
  onSubmit: (data: ConnectionTypeFormData) => void;
  onCancel: () => void;
}

export function ConnectionTypeForm({
  initialValues,
  isEditing = false,
  onSubmit,
  onCancel,
}: ConnectionTypeFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState<ConnectionCategory>(
    initialValues?.category ?? "word-game"
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [examples, setExamples] = useState(
    initialValues?.examples?.join("\n") ?? ""
  );
  const [active, setActive] = useState(initialValues?.active ?? true);

  const isSubmitDisabled = !name || !description;

  const handleSubmit = () => {
    onSubmit({
      name,
      category,
      description,
      examples: examples.split("\n").filter((e) => e.trim()),
      active,
    });
  };

  return (
    <Card>
      <Box display="flex" flexDirection="column" gap="md" padding="4">
        <Heading level={3} size="lg">
          {isEditing ? "Edit Connection Type" : "Create New Connection Type"}
        </Heading>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Titles that are verbs"
        />

        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(value) => setCategory(value as ConnectionCategory)}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description for AI prompt"
        />

        <Textarea
          label="Examples (one per line)"
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          placeholder="Run&#10;Drive&#10;Crash"
          rows={4}
        />

        <Checkbox
          label="Active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />

        <Box display="flex" gap="md">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
