import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Dashboard metric tile, e.g. "Pending approvals: 12". Used across all role
 * dashboards. `hint` is small helper text under the value (e.g. a delta).
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? (
            <p className="text-muted-foreground text-xs">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg"
            )}
          >
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
