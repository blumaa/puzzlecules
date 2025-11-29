import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { MockThemeProvider } from "../../../.storybook/MockThemeProvider";
import { HeaderMenu } from "./HeaderMenu";
import "./Layout.css";

const meta: Meta<typeof HeaderMenu> = {
  title: "Components/Layout/HeaderMenu",
  component: HeaderMenu,
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
type Story = StoryObj<typeof HeaderMenu>;

export const Row: Story = {
  args: {
    direction: "row",
  },
};

export const Column: Story = {
  args: {
    direction: "column",
  },
};
