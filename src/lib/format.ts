/**
 * Formatting helpers shared across the app.
 */

const TAKA = "\u09F3" // ৳ Bangladeshi Taka sign

/**
 * Formats a number as Bangladeshi Taka using the South Asian grouping system
 * (e.g. 145000 -> "৳1,45,000", 12500000 -> "৳1,25,00,000").
 *
 * `en-IN` locale gives the lakh/crore comma placement we want. Defaults to no
 * decimals for clean editorial KPIs; pass `fractionDigits` for line amounts.
 */
export function formatTaka(
  amount: number | null | undefined,
  fractionDigits = 0
): string {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
  return `${TAKA}${formatted}`
}

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
