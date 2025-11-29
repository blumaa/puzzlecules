import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { MockThemeProvider } from "../../../.storybook/MockThemeProvider";
import { AdminDashboard } from "./Dashboard";
import "./Dashboard.css";

const meta: Meta<typeof AdminDashboard> = {
  title: "Components/Dashboard",
  component: AdminDashboard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Story />
        </MemoryRouter>
      </MockThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminDashboard>;

export const Default: Story = {};
