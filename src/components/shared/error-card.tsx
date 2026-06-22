import { TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Subtle inline error shown when a data query fails, so one failing section
 * never crashes the whole dashboard. Rendered in place of the section content.
 */
export function ErrorCard({
  title = "Couldn't load this section",
  message = "Please refresh the page to try again.",
  className,
}: {
  title?: string
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-border bg-card flex items-start gap-3 rounded-2xl border p-6",
        className
      )}
    >
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
        <TriangleAlert className="size-4" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  )
}
