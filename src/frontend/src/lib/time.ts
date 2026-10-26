/**
 * Backend timestamps are nanosecond bigints from Motoko Time.now().
 * Convert through this helper before any JavaScript Date operation.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Human-readable order date, with a safe fallback for invalid values. */
export function formatOrderDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Date unavailable";
  return date.toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
