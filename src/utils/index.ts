/**
 * Utilities
 */

/**
 * Get today's date in YYYY-MM-DD format (UTC).
 *
 * @returns Date string (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTextLengthProps(title: string) {
  const length = title.length;
  if (length > 20) {
    return { isReallyLongText: true };
  }
  if (length > 12) {
    return { isLongText: true };
  }
  return {};
}
