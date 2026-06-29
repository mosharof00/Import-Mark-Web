import { Skeleton } from "@/components/ui/skeleton"

export function InventoryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card rounded-2xl border p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-8 w-16" />
          <Skeleton className="mt-3 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function InventoryListSkeleton() {
  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <Skeleton className="mb-4 h-9 w-56" />
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
