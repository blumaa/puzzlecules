import { describe, it, expect } from 'vitest';
import {
  getWeekStart,
  getWeekDays,
  formatDateHeader,
  formatDateShort,
  formatDateForStorage,
  formatWeekRange,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getWeekStart', () => {
    it('should return Monday when given a Wednesday', () => {
      // Wednesday, December 4, 2024
      const wednesday = new Date(2024, 11, 4);
      const monday = getWeekStart(wednesday);

      expect(monday.getFullYear()).toBe(2024);
      expect(monday.getMonth()).toBe(11); // December
      expect(monday.getDate()).toBe(2); // Monday Dec 2
      expect(monday.getDay()).toBe(1); // Monday = 1
    });

    it('should return same day when given a Monday', () => {
      // Monday, December 2, 2024
      const monday = new Date(2024, 11, 2);
      const result = getWeekStart(monday);

      expect(result.getDate()).toBe(2);
      expect(result.getDay()).toBe(1);
    });

    it('should return previous Monday when given a Sunday', () => {
      // Sunday, December 8, 2024
      const sunday = new Date(2024, 11, 8);
      const monday = getWeekStart(sunday);

      expect(monday.getDate()).toBe(2); // Monday Dec 2
      expect(monday.getDay()).toBe(1);
    });

    it('should handle month boundary crossing', () => {
      // Thursday, November 28, 2024
      const thursday = new Date(2024, 10, 28);
      const monday = getWeekStart(thursday);

      expect(monday.getMonth()).toBe(10); // November
      expect(monday.getDate()).toBe(25); // Monday Nov 25
    });

    it('should handle year boundary crossing', () => {
      // Wednesday, January 1, 2025
      const jan1 = new Date(2025, 0, 1);
      const monday = getWeekStart(jan1);

      expect(monday.getFullYear()).toBe(2024);
      expect(monday.getMonth()).toBe(11); // December
      expect(monday.getDate()).toBe(30); // Monday Dec 30, 2024
    });
  });

  describe('getWeekDays', () => {
    it('should return 7 days starting from Monday', () => {
      const monday = new Date(2024, 11, 2);
      const days = getWeekDays(monday);

      expect(days).toHaveLength(7);
      expect(days[0].getDate()).toBe(2); // Monday
      expect(days[1].getDate()).toBe(3); // Tuesday
      expect(days[2].getDate()).toBe(4); // Wednesday
      expect(days[3].getDate()).toBe(5); // Thursday
      expect(days[4].getDate()).toBe(6); // Friday
      expect(days[5].getDate()).toBe(7); // Saturday
      expect(days[6].getDate()).toBe(8); // Sunday
    });

    it('should handle month boundary', () => {
      // Monday, November 25, 2024 - week crosses into December
      const monday = new Date(2024, 10, 25);
      const days = getWeekDays(monday);

      expect(days[0].getMonth()).toBe(10); // Nov 25
      expect(days[5].getMonth()).toBe(10); // Nov 30
      expect(days[6].getMonth()).toBe(11); // Dec 1
    });

    it('should return dates with day of week 1-7 (Mon-Sun)', () => {
      const monday = new Date(2024, 11, 2);
      const days = getWeekDays(monday);

      expect(days[0].getDay()).toBe(1); // Monday
      expect(days[6].getDay()).toBe(0); // Sunday
    });
  });

  describe('formatDateHeader', () => {
    it('should format date as full month day, year', () => {
      const date = new Date(2025, 11, 1); // December 1, 2025
      expect(formatDateHeader(date)).toBe('December 1, 2025');
    });

    it('should handle single digit day', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatDateHeader(date)).toBe('January 5, 2024');
    });

    it('should handle all months correctly', () => {
      expect(formatDateHeader(new Date(2024, 0, 1))).toContain('January');
      expect(formatDateHeader(new Date(2024, 5, 15))).toContain('June');
      expect(formatDateHeader(new Date(2024, 11, 25))).toContain('December');
    });
  });

  describe('formatDateShort', () => {
    it('should format date as short month and day', () => {
      const date = new Date(2025, 11, 1); // December 1, 2025
      expect(formatDateShort(date)).toBe('Dec 1');
    });

    it('should handle single digit day', () => {
      const date = new Date(2024, 0, 5);
      expect(formatDateShort(date)).toBe('Jan 5');
    });

    it('should handle double digit day', () => {
      const date = new Date(2024, 6, 15);
      expect(formatDateShort(date)).toBe('Jul 15');
    });
  });

  describe('formatDateForStorage', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 11, 1); // December 1, 2025
      expect(formatDateForStorage(date)).toBe('2025-12-01');
    });

    it('should pad single digit month and day', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatDateForStorage(date)).toBe('2024-01-05');
    });

    it('should handle December correctly', () => {
      const date = new Date(2024, 11, 25);
      expect(formatDateForStorage(date)).toBe('2024-12-25');
    });
  });

  describe('formatWeekRange', () => {
    it('should format range within same month', () => {
      const start = new Date(2024, 11, 2); // December 2, 2024
      const end = new Date(2024, 11, 8); // December 8, 2024
      expect(formatWeekRange(start, end)).toBe('December 2 - 8, 2024');
    });

    it('should format range crossing months', () => {
      const start = new Date(2024, 10, 25); // November 25, 2024
      const end = new Date(2024, 11, 1); // December 1, 2024
      expect(formatWeekRange(start, end)).toBe('November 25 - December 1, 2024');
    });

    it('should format range crossing years', () => {
      const start = new Date(2024, 11, 30); // December 30, 2024
      const end = new Date(2025, 0, 5); // January 5, 2025
      expect(formatWeekRange(start, end)).toBe('December 30 - January 5, 2025');
    });
  });
});
