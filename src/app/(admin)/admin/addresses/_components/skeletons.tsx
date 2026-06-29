import { Skeleton } from "@/components/ui/skeleton"

export function AddressListSkeleton() {
  return <Skeleton className="h-96 w-full rounded-2xl" />
}

export function AddressStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  )
}
