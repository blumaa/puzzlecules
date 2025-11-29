import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { MockThemeProvider } from "../../../.storybook/MockThemeProvider";
import { Header } from "./Header";
import "./Layout.css";

const meta: Meta<typeof Header> = {
  title: "Components/Layout/Header",
  component: Header,
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
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    onSignOut: () => console.log("Sign out clicked"),
    onMenuOpen: () => console.log("Menu open clicked"),
  },
};

