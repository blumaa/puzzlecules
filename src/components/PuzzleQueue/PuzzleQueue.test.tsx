import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PuzzleQueue } from './PuzzleQueue';

// Mock the storage hooks
vi.mock('../../lib/supabase/storage/usePuzzleStorage', () => ({
  usePuzzleList: vi.fn(() => ({
    data: { puzzles: [], total: 0 },
    isLoading: false,
    error: null,
  })),
  useUpdatePuzzle: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock the supabase client and storage
vi.mock('../../lib/supabase/client', () => ({
  supabase: {},
}));

vi.mock('../../lib/supabase/storage/SupabaseStorage', () => ({
  SupabaseStorage: vi.fn(),
}));

// Mock toast
vi.mock('../../providers/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('PuzzleQueue', () => {
  it('should render the page heading', () => {
    renderWithProviders(<PuzzleQueue />);

    expect(screen.getByText('Puzzle Queue')).toBeInTheDocument();
  });

  it('should render 7 calendar days', () => {
    renderWithProviders(<PuzzleQueue />);

    // Should have MON, TUE, WED, THU, FRI, SAT, SUN (uppercase)
    expect(screen.getByText('MON')).toBeInTheDocument();
    expect(screen.getByText('TUE')).toBeInTheDocument();
    expect(screen.getByText('WED')).toBeInTheDocument();
    expect(screen.getByText('THU')).toBeInTheDocument();
    expect(screen.getByText('FRI')).toBeInTheDocument();
    expect(screen.getByText('SAT')).toBeInTheDocument();
    expect(screen.getByText('SUN')).toBeInTheDocument();
  });

  it('should render prev and next week buttons', () => {
    renderWithProviders(<PuzzleQueue />);

    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should navigate to previous week when prev button is clicked', () => {
    renderWithProviders(<PuzzleQueue />);

    // Click prev week
    const prevButton = screen.getByRole('button', { name: /prev/i });
    fireEvent.click(prevButton);

    // Verify the calendar still renders with days
    expect(screen.getByText('MON')).toBeInTheDocument();
  });

  it('should navigate to next week when next button is clicked', () => {
    renderWithProviders(<PuzzleQueue />);

    // Click next week
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Verify the calendar still renders
    expect(screen.getByText('MON')).toBeInTheDocument();
  });
});
