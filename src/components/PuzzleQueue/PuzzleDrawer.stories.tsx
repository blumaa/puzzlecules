import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@mond-design-system/theme";
import { PuzzleDrawer } from "./PuzzleDrawer";
import { createMockStoredPuzzle, createMockGroups } from "../../test/fixtures";

const mockScheduledPuzzle = createMockStoredPuzzle({
  id: "puzzle-1",
  title: "Scheduled Puzzle",
  puzzleDate: "2026-01-07",
  status: "published",
  source: "system",
  groups: createMockGroups(),
});

const mockUserSubmittedPuzzle = createMockStoredPuzzle({
  id: "puzzle-user",
  title: "User Submitted Puzzle",
  puzzleDate: "2026-01-08",
  status: "published",
  source: "user",
  groups: createMockGroups(),
});

const mockAvailablePuzzles = [
  createMockStoredPuzzle({
    id: "avail-1",
    title: "Available Puzzle 1",
    puzzleDate: null,
    status: "approved",
    source: "system",
    groups: createMockGroups(),
  }),
  createMockStoredPuzzle({
    id: "avail-2",
    title: "User Submitted Puzzle",
    puzzleDate: null,
    status: "approved",
    source: "user",
    groups: createMockGroups(),
  }),
  createMockStoredPuzzle({
    id: "avail-3",
    title: null,
    puzzleDate: null,
    status: "approved",
    source: "system",
    groups: createMockGroups(),
  }),
];

const meta: Meta<typeof PuzzleDrawer> = {
  title: "PuzzleQueue/PuzzleDrawer",
  component: PuzzleDrawer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "close" },
    onSchedule: { action: "schedule" },
    onUpdate: { action: "update" },
    onUnschedule: { action: "unschedule" },
    onDelete: { action: "delete" },
    onSwapGroup: { action: "swapGroup" },
  },
};

export default meta;
type Story = StoryObj<typeof PuzzleDrawer>;

// Interactive demo that shows both modes
function InteractiveDemo() {
  const [mode, setMode] = useState<"scheduled" | "empty">("scheduled");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button
          variant={mode === "scheduled" ? "primary" : "outline"}
          onClick={() => setMode("scheduled")}
        >
          Scheduled Day
        </Button>
        <Button
          variant={mode === "empty" ? "primary" : "outline"}
          onClick={() => setMode("empty")}
        >
          Empty Day
        </Button>
      </div>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <PuzzleDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedDate="2026-01-07"
        scheduledPuzzle={mode === "scheduled" ? mockScheduledPuzzle : null}
        availablePuzzles={mockAvailablePuzzles}
        onSchedule={(id, date) => {
          console.log("Schedule:", id, date);
          setIsOpen(false);
        }}
        onUpdate={(id, updates) => console.log("Update:", id, updates)}
        onUnschedule={(id) => {
          console.log("Unschedule:", id);
          setIsOpen(false);
        }}
        onDelete={(id) => {
          console.log("Delete:", id);
          setIsOpen(false);
        }}
        onSwapGroup={(index, group) => console.log("Swap:", index, group)}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

export const ScheduledPuzzle: Story = {
  args: {
    isOpen: true,
    selectedDate: "2026-01-07",
    scheduledPuzzle: mockScheduledPuzzle,
    availablePuzzles: [],
    isLoading: false,
  },
};

export const UserSubmittedScheduled: Story = {
  args: {
    isOpen: true,
    selectedDate: "2026-01-08",
    scheduledPuzzle: mockUserSubmittedPuzzle,
    availablePuzzles: [],
    isLoading: false,
  },
};

export const EmptyDayWithAvailable: Story = {
  args: {
    isOpen: true,
    selectedDate: "2026-01-09",
    scheduledPuzzle: null,
    availablePuzzles: mockAvailablePuzzles,
    isLoading: false,
  },
};

export const EmptyDayNoAvailable: Story = {
  args: {
    isOpen: true,
    selectedDate: "2026-01-09",
    scheduledPuzzle: null,
    availablePuzzles: [],
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    selectedDate: "2026-01-07",
    scheduledPuzzle: mockScheduledPuzzle,
    availablePuzzles: [],
    isLoading: true,
  },
};
