import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { OrderDetail } from "./_components/order-detail"
import { OrderPlacedToast } from "./_components/order-placed-toast"

export const dynamic = "force-dynamic"

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default async function ManagerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <Suspense fallback={null}>
        <OrderPlacedToast />
      </Suspense>
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetail orderId={id} />
      </Suspense>
    </>
  )
}
