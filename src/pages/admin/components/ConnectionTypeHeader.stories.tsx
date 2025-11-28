import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionTypeHeader } from "./ConnectionTypeHeader";
import { MockThemeProvider } from "../../../../.storybook/MockThemeProvider";

const meta: Meta<typeof ConnectionTypeHeader> = {
  title: "Admin/Components/ConnectionTypeHeader",
  component: ConnectionTypeHeader,
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
    onAddNew: { action: "addNew" },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionTypeHeader>;

export const Default: Story = {
  args: {},
};
