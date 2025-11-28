import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionTypeForm } from "./ConnectionTypeForm";
import { MockThemeProvider } from "../../../../.storybook/MockThemeProvider";

const meta: Meta<typeof ConnectionTypeForm> = {
  title: "Admin/Components/ConnectionTypeForm",
  component: ConnectionTypeForm,
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
    onSubmit: { action: "submit" },
    onCancel: { action: "cancel" },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionTypeForm>;

export const CreateNew: Story = {
  args: {
    isEditing: false,
  },
};

export const CreateWithInitialValues: Story = {
  args: {
    isEditing: false,
    initialValues: {
      name: "Titles that are verbs",
      category: "word-game",
      description: "Films with titles that are single verbs or verb phrases",
      examples: ["Run", "Drive", "Crash", "Fly"],
      active: true,
    },
  },
};

export const EditExisting: Story = {
  args: {
    isEditing: true,
    initialValues: {
      name: "Directed by Christopher Nolan",
      category: "people",
      description: "Films directed by Christopher Nolan",
      examples: ["Inception", "Interstellar", "The Dark Knight", "Tenet"],
      active: true,
    },
  },
};

export const EditInactive: Story = {
  args: {
    isEditing: true,
    initialValues: {
      name: "Set in New York City",
      category: "setting",
      description: "Films primarily set in New York City",
      examples: ["Taxi Driver", "Spider-Man", "The Avengers"],
      active: false,
    },
  },
};
