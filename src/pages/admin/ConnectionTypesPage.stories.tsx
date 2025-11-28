import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Text } from "@mond-design-system/theme";
import { MockThemeProvider } from "../../../.storybook/MockThemeProvider";
import { ToastProvider } from "../../providers/ToastProvider";
import type { ConnectionType } from "../../services/group-generator";
import { ConnectionTypeHeader } from "./components/ConnectionTypeHeader";
import { ConnectionTypeCard } from "./components/ConnectionTypeCard";
import { ConnectionTypesFilter } from "./components/ConnectionTypesFilter";
import { ConnectionTypeForm } from "./components/ConnectionTypeForm";

const mockConnectionTypes: ConnectionType[] = [
  {
    id: "1",
    name: "Titles that are verbs",
    category: "word-game",
    description: "Films with titles that are single verbs or verb phrases",
    examples: ["Run", "Drive", "Crash", "Fly"],
    active: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Directed by Christopher Nolan",
    category: "people",
    description: "Films directed by Christopher Nolan",
    examples: ["Inception", "Interstellar", "The Dark Knight", "Tenet"],
    active: true,
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "Time travel stories",
    category: "thematic",
    description: "Films featuring time travel as a central plot element",
    examples: ["Back to the Future", "The Terminator", "Looper"],
    active: true,
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "4",
    name: "Set in New York City",
    category: "setting",
    description: "Films primarily set in New York City",
    examples: ["Taxi Driver", "Spider-Man", "The Avengers"],
    active: false,
    createdAt: new Date("2024-01-04"),
  },
];

interface ConnectionTypesPageDisplayProps {
  connectionTypes: ConnectionType[];
  isLoading?: boolean;
  showForm?: boolean;
}

function ConnectionTypesPageDisplay({
  connectionTypes,
  isLoading = false,
  showForm = false,
}: ConnectionTypesPageDisplayProps) {
  if (isLoading) {
    return (
      <Box padding="4">
        <Text>Loading connection types...</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="4">
      <ConnectionTypeHeader onAddNew={() => {}} />

      {showForm && (
        <ConnectionTypeForm
          isEditing={false}
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      )}

      <ConnectionTypesFilter
        selectedCategory="all"
        onCategoryChange={() => {}}
        filteredCount={connectionTypes.length}
        totalCount={connectionTypes.length}
      />

      <Box display="flex" flexDirection="column" gap="md">
        {connectionTypes.map((type) => (
          <ConnectionTypeCard
            key={type.id}
            connectionType={type}
            onToggleActive={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
      </Box>

      {connectionTypes.length === 0 && (
        <Box padding="4">
          <Text color="muted">
            No connection types found. Create one to get started!
          </Text>
        </Box>
      )}
    </Box>
  );
}

const meta: Meta<typeof ConnectionTypesPageDisplay> = {
  title: "Admin/ConnectionTypesPage",
  component: ConnectionTypesPageDisplay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </MockThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectionTypesPageDisplay>;

export const Default: Story = {
  args: {
    connectionTypes: mockConnectionTypes,
  },
};

export const Loading: Story = {
  args: {
    connectionTypes: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    connectionTypes: [],
  },
};

export const WithForm: Story = {
  args: {
    connectionTypes: mockConnectionTypes,
    showForm: true,
  },
};
