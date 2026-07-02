import { formatDate } from "@/lib/format"

export async function DashboardHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create orders, manage stock, and record payments.
        </p>
      </div>

      <span className="text-muted-foreground text-sm">{formatDate()}</span>
    </div>
  )
}
