import { Skeleton } from "@/components/ui/skeleton"

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      {children}
    </div>
  )
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardShell key={i}>
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-20" />
        </CardShell>
      ))}
    </div>
  )
}

export function PendingOrdersSkeleton() {
  return (
    <CardShell>
      <Skeleton className="mb-6 h-5 w-52" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export function RevenueChartSkeleton() {
  return (
    <CardShell>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-4 h-[260px] w-full rounded-xl" />
    </CardShell>
  )
}

export function ListSectionSkeleton() {
  return (
    <CardShell>
      <Skeleton className="mb-6 h-5 w-40" />
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </CardShell>
  )
}
