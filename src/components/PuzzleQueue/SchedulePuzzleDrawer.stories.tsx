import type { Meta, StoryObj } from "@storybook/react-vite";
import { SchedulePuzzleDrawer } from "./SchedulePuzzleDrawer";
import { MockThemeProvider } from "../../../.storybook/MockThemeProvider";
import type { StoredPuzzle } from "../../lib/supabase/storage/IPuzzleStorage";

const mockPuzzles: StoredPuzzle[] = [
  {
    id: "puzzle-1",
    createdAt: Date.now(),
    puzzleDate: null,
    title: "Classic Film Connections",
    groupIds: ["g1", "g2", "g3", "g4"],
    status: "pending",
    genre: "films",
    groups: [
      {
        id: "group-1",
        items: [
          { id: 1, title: "Pulp Fiction", year: 1994 },
          { id: 2, title: "Kill Bill", year: 2003 },
          { id: 3, title: "Reservoir Dogs", year: 1992 },
          { id: 4, title: "Django Unchained", year: 2012 },
        ],
        connection: "Directed by Quentin Tarantino",
        difficulty: "easy",
        color: "yellow",
      },
      {
        id: "group-2",
        items: [
          { id: 5, title: "The Godfather", year: 1972 },
          { id: 6, title: "Goodfellas", year: 1990 },
          { id: 7, title: "Casino", year: 1995 },
          { id: 8, title: "Scarface", year: 1983 },
        ],
        connection: "Classic mob films",
        difficulty: "medium",
        color: "green",
      },
      {
        id: "group-3",
        items: [
          { id: 9, title: "Inception", year: 2010 },
          { id: 10, title: "The Matrix", year: 1999 },
          { id: 11, title: "Tenet", year: 2020 },
          { id: 12, title: "Memento", year: 2000 },
        ],
        connection: "Mind-bending narratives",
        difficulty: "hard",
        color: "blue",
      },
      {
        id: "group-4",
        items: [
          { id: 13, title: "Interstellar", year: 2014 },
          { id: 14, title: "Arrival", year: 2016 },
          { id: 15, title: "2001: A Space Odyssey", year: 1968 },
          { id: 16, title: "Contact", year: 1997 },
        ],
        connection: "Sci-fi about communication",
        difficulty: "hardest",
        color: "purple",
      },
    ],
  },
  {
    id: "puzzle-2",
    createdAt: Date.now() - 86400000,
    puzzleDate: null,
    title: "Sci-Fi Masters",
    groupIds: ["g5", "g6", "g7", "g8"],
    status: "pending",
    genre: "films",
    groups: [
      {
        id: "group-5",
        items: [
          { id: 17, title: "Blade Runner", year: 1982 },
          { id: 18, title: "Alien", year: 1979 },
          { id: 19, title: "The Martian", year: 2015 },
          { id: 20, title: "Gladiator", year: 2000 },
        ],
        connection: "Directed by Ridley Scott",
        difficulty: "medium",
        color: "green",
      },
      {
        id: "group-3",
        items: [
          { id: 9, title: "Inception", year: 2010 },
          { id: 10, title: "The Matrix", year: 1999 },
          { id: 11, title: "Tenet", year: 2020 },
          { id: 12, title: "Memento", year: 2000 },
        ],
        connection: "Mind-bending narratives",
        difficulty: "hard",
        color: "blue",
      },
      {
        id: "group-4",
        items: [
          { id: 13, title: "Interstellar", year: 2014 },
          { id: 14, title: "Arrival", year: 2016 },
          { id: 15, title: "2001: A Space Odyssey", year: 1968 },
          { id: 16, title: "Contact", year: 1997 },
        ],
        connection: "Sci-fi about communication",
        difficulty: "hardest",
        color: "purple",
      },
      {
        id: "group-1",
        items: [
          { id: 1, title: "Pulp Fiction", year: 1994 },
          { id: 2, title: "Kill Bill", year: 2003 },
          { id: 3, title: "Reservoir Dogs", year: 1992 },
          { id: 4, title: "Django Unchained", year: 2012 },
        ],
        connection: "Directed by Quentin Tarantino",
        difficulty: "easy",
        color: "yellow",
      },
    ],
  },
];

const meta: Meta<typeof SchedulePuzzleDrawer> = {
  title: "Components/PuzzleQueue/SchedulePuzzleDrawer",
  component: SchedulePuzzleDrawer,
  parameters: {
    layout: "fullscreen",
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
    onClose: { action: "close" },
    onSchedule: { action: "schedule" },
  },
};

export default meta;
type Story = StoryObj<typeof SchedulePuzzleDrawer>;

export const Open: Story = {
  args: {
    isOpen: true,
    selectedDate: "2024-12-04",
    availablePuzzles: mockPuzzles,
    isScheduling: false,
  },
};

export const Scheduling: Story = {
  args: {
    isOpen: true,
    selectedDate: "2024-12-04",
    availablePuzzles: mockPuzzles,
    isScheduling: true,
  },
};

export const NoPuzzlesAvailable: Story = {
  args: {
    isOpen: true,
    selectedDate: "2024-12-04",
    availablePuzzles: [],
    isScheduling: false,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    selectedDate: "2024-12-04",
    availablePuzzles: mockPuzzles,
    isScheduling: false,
  },
};
