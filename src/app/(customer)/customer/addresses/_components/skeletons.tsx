import { Skeleton } from "@/components/ui/skeleton"

export function AddressStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card rounded-2xl border p-6 shadow-sm"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function AddressListSkeleton() {
  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <Skeleton className="mb-4 h-9 w-56" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
