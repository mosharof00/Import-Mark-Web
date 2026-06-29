/**
 * Formatting helpers shared across the app.
 */

export {
  formatCurrency,
  formatTaka,
  FALLBACK_CURRENCY,
  type CurrencyFormat,
} from "@/lib/format-currency"

/**
 * Compact relative time, e.g. "just now", "5 minutes ago", "2 hours ago",
 * "3 days ago". Lightweight on purpose — no date library needed.
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ""

  const then = typeof date === "string" ? new Date(date) : date
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000)

  if (Number.isNaN(seconds)) return ""
  if (seconds < 45) return "just now"

  const units: [limit: number, secs: number, label: string][] = [
    [60, 1, "second"],
    [3600, 60, "minute"],
    [86400, 3600, "hour"],
    [604800, 86400, "day"],
    [2592000, 604800, "week"],
    [31536000, 2592000, "month"],
    [Infinity, 31536000, "year"],
  ]

  for (const [limit, secs, label] of units) {
    if (seconds < limit) {
      const value = Math.floor(seconds / secs)
      return `${value} ${label}${value === 1 ? "" : "s"} ago`
    }
  }

  return ""
}

/** Short, human date like "22 Jun 2026". Used in the dashboard header. */
export function formatDate(date: string | Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}
