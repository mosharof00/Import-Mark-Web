import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { AddressDetail } from "./_components/address-detail"

export const dynamic = "force-dynamic"

export default async function AdminAddressDetailPage({
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
      <AddressDetail
        addressId={id}
        basePath="/admin/addresses"
        customersPath="/admin/customers"
      />
    </Suspense>
  )
}
