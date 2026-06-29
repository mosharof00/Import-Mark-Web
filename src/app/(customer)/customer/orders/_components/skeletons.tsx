import { Skeleton } from "@/components/ui/skeleton"

export function OrderListSkeleton() {
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
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
