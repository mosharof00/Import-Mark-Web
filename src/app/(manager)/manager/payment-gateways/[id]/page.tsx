import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { GatewayDetail } from "./_components/gateway-detail"

export const dynamic = "force-dynamic"

export default async function ManagerPaymentGatewayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      }
    >
      <GatewayDetail gatewayId={id} />
    </Suspense>
  )
}
