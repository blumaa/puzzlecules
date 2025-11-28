import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionTypeCard } from "./ConnectionTypeCard";
import { MockThemeProvider } from "../../../../.storybook/MockThemeProvider";
import type { ConnectionType } from "../../../services/group-generator";

const mockConnectionType: ConnectionType = {
  id: "1",
  name: "Titles that are verbs",
  category: "word-game",
  description: "Films with titles that are single verbs or verb phrases",
  examples: ["Run", "Drive", "Crash", "Fly"],
  active: true,
  createdAt: new Date("2024-01-01"),
};

const meta: Meta<typeof ConnectionTypeCard> = {
  title: "Admin/Components/ConnectionTypeCard",
  component: ConnectionTypeCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <Story />
      </MockThemeProvider>
    ),
  ],
  argTypes: {
    onToggleActive: { action: "toggleActive" },
    onEdit: { action: "edit" },
    onDelete: { action: "delete" },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionTypeCard>;

export const Active: Story = {
  args: {
    connectionType: mockConnectionType,
  },
};

export const Inactive: Story = {
  args: {
    connectionType: {
      ...mockConnectionType,
      id: "2",
      active: false,
    },
  },
};

export const WordGame: Story = {
  args: {
    connectionType: {
      ...mockConnectionType,
      category: "word-game",
      name: "Titles that are verbs",
    },
  },
};

export const People: Story = {
  args: {
    connectionType: {
      ...mockConnectionType,
      id: "3",
      category: "people",
      name: "Directed by Christopher Nolan",
      description: "Films directed by the same filmmaker",
      examples: ["Inception", "Interstellar", "The Dark Knight", "Tenet"],
    },
  },
};

export const Thematic: Story = {
  args: {
    connectionType: {
      ...mockConnectionType,
      id: "4",
      category: "thematic",
      name: "Time travel stories",
      description: "Films featuring time travel as a central plot element",
      examples: [
        "Back to the Future",
        "The Terminator",
        "Looper",
        "Interstellar",
      ],
    },
  },
};

export const NoExamples: Story = {
  args: {
    connectionType: {
      ...mockConnectionType,
      id: "5",
      examples: undefined,
    },
  },
};

export const LongDescription: Story = {
  args: {
    connectionType: {
      ...mockConnectionType,
      id: "6",
      description:
        "Films where the main character undergoes a significant transformation in their worldview, morality, or identity throughout the course of the narrative, often culminating in a pivotal moment of realization or change",
    },
  },
};

export const AllCategories: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {(
        [
          "word-game",
          "people",
          "thematic",
          "setting",
          "cultural",
          "narrative",
          "character",
          "production",
          "elements",
        ] as const
      ).map((category) => (
        <ConnectionTypeCard
          key={category}
          connectionType={{
            ...mockConnectionType,
            id: category,
            category,
            name: `${category} example`,
          }}
          onToggleActive={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  ),
};
