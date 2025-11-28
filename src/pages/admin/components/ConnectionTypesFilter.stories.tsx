import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionTypesFilter } from "./ConnectionTypesFilter";
import { MockThemeProvider } from "../../../../.storybook/MockThemeProvider";

const meta: Meta<typeof ConnectionTypesFilter> = {
  title: "Admin/Components/ConnectionTypesFilter",
  component: ConnectionTypesFilter,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <div style={{ maxWidth: "600px" }}>
          <Story />
        </div>
      </MockThemeProvider>
    ),
  ],
  argTypes: {
    onCategoryChange: { action: "categoryChange" },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionTypesFilter>;

export const Default: Story = {
  args: {
    selectedCategory: "all",
    filteredCount: 12,
    totalCount: 12,
  },
};

export const FilteredByCategory: Story = {
  args: {
    selectedCategory: "word-game",
    filteredCount: 3,
    totalCount: 12,
  },
};

export const EmptyResults: Story = {
  args: {
    selectedCategory: "cultural",
    filteredCount: 0,
    totalCount: 12,
  },
};
