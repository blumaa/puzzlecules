import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { MockThemeProvider } from "../../../.storybook/MockThemeProvider";
import { MobileMenu } from "./MobileMenu";
import "./Layout.css";

const meta: Meta<typeof MobileMenu> = {
  title: "Components/Layout/MobileMenu",
  component: MobileMenu,
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
type Story = StoryObj<typeof MobileMenu>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close clicked"),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log("Close clicked"),
  },
};
