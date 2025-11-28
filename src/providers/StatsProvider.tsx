/**
 * Stats Provider
 *
 * Provides stats storage instance throughout the app.
 * Makes stats storage available to all components via context.
 */

import { ReactNode } from 'react';
import { StatsContext, statsStorage } from './useStatsContext';

interface StatsProviderProps {
  children: ReactNode;
}

/**
 * Provides stats context to children.
 * Single stats storage instance shared across the app.
 */
export function StatsProvider({ children }: StatsProviderProps) {
  return <StatsContext.Provider value={statsStorage}>{children}</StatsContext.Provider>;
}
