import { Skeleton } from "@/components/ui/skeleton"

/** Instant route feedback while a dashboard page streams. */
export function DashboardPageLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card rounded-2xl border p-5 shadow-sm"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-5 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <Skeleton className="mb-4 h-9 w-56" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
