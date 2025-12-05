import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDay } from './CalendarDay';
import { MockThemeProvider } from '../../../.storybook/MockThemeProvider';
import type { StoredPuzzle } from '../../lib/supabase/storage/IPuzzleStorage';

const mockPuzzle: StoredPuzzle = {
  id: 'puzzle-1',
  createdAt: Date.now(),
  puzzleDate: '2024-12-04',
  title: 'Classic Film Connections',
  groupIds: ['g1', 'g2', 'g3', 'g4'],
  status: 'pending',
  genre: 'films',
};

const meta: Meta<typeof CalendarDay> = {
  title: 'Components/PuzzleQueue/CalendarDay',
  component: CalendarDay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockThemeProvider>
        <Story />
      </MockThemeProvider>
    ),
  ],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarDay>;

export const Default: Story = {
  args: {
    date: new Date(2024, 11, 4),
    puzzle: null,
    isToday: false,
    isPast: false,
  },
};

export const Today: Story = {
  args: {
    date: new Date(),
    puzzle: null,
    isToday: true,
    isPast: false,
  },
};

export const Scheduled: Story = {
  args: {
    date: new Date(2024, 11, 4),
    puzzle: mockPuzzle,
    isToday: false,
    isPast: false,
  },
};

export const TodayScheduled: Story = {
  args: {
    date: new Date(),
    puzzle: mockPuzzle,
    isToday: true,
    isPast: false,
  },
};

export const WeekView: Story = {
  render: () => {
    const startDate = new Date(2024, 11, 2);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });

    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {days.map((date, i) => (
          <CalendarDay
            key={i}
            date={date}
            puzzle={i === 2 || i === 5 ? mockPuzzle : null}
            isToday={i === 2}
            isPast={i < 2}
            onClick={() => {}}
          />
        ))}
      </div>
    );
  },
};
