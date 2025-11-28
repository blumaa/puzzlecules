import { Box, Text } from "@mond-design-system/theme";
import { Select } from "@mond-design-system/theme/client";
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

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

interface ConnectionTypesFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function ConnectionTypesFilter({
  selectedCategory,
  onCategoryChange,
  filteredCount,
  totalCount,
}: ConnectionTypesFilterProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Select
          options={CATEGORY_FILTER_OPTIONS}
          value={selectedCategory}
          onChange={(value) => onCategoryChange(value)}
        />
      </Box>
      <Text color="muted">
        Showing {filteredCount} of {totalCount} types
      </Text>
    </Box>
  );
}
