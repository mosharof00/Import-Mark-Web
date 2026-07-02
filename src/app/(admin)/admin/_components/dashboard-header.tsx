import { formatDate } from "@/lib/format"

/** Page header for the admin dashboard. */
export async function DashboardHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">
        Dashboard
      </h1>

      <span className="text-muted-foreground text-sm">{formatDate()}</span>
    </div>
  )
}
