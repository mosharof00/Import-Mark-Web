import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StatAccent = "default" | "amber" | "red"

type Trend = {
  direction: "up" | "down"
  /** e.g. "12%" */
  value: string
  /** small muted label after the trend, e.g. "vs last month" */
  label?: string
}

/**
 * KPI metric tile used across dashboards. Editorial styling: warm card, soft
 * border, generous padding, uppercase tracked label, large value. Hovers lift
 * subtly. Use `accent` to draw attention (amber for pending, red for alerts).
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "default",
  hint,
  className,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: Trend
  accent?: StatAccent
  hint?: string
  className?: string
}) {
  const accentCard: Record<StatAccent, string> = {
    default: "border-border bg-card",
    amber:
      "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
    red: "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30",
  }

  const accentChip: Record<StatAccent, string> = {
    default: "bg-muted text-foreground",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        accentCard[accent],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {label}
        </p>
        {Icon ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              accentChip[accent]
            )}
          >
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>

      <p className="text-foreground mt-4 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      {trend || hint ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                trend.direction === "up"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.value}
            </span>
          ) : null}
          {trend?.label || hint ? (
            <span className="text-muted-foreground">{trend?.label ?? hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
