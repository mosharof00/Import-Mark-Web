import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { AddressStats } from "@/app/(admin)/admin/addresses/_components/address-stats"
import { AddressList } from "@/app/(admin)/admin/addresses/_components/address-list"
import { AddAddressButton } from "@/app/(admin)/admin/addresses/_components/add-address-button"
import { AddressCustomerFilter } from "@/app/(admin)/admin/addresses/_components/address-customer-filter"
import {
  AddressStatsSkeleton,
  AddressListSkeleton,
} from "@/app/(admin)/admin/addresses/_components/skeletons"

export const dynamic = "force-dynamic"

const BASE_PATH = "/manager/addresses"

export default async function ManagerAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>
}) {
  const { customer: customerId } = await searchParams
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from("customers")
    .select("id, full_name, company_name")
    .eq("status", "active")
    .order("full_name")

  const customerOptions = (customers ?? []).map((c) => ({
    id: c.id,
    label: c.company_name ? `${c.full_name} · ${c.company_name}` : c.full_name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Addresses"
        description="Manage customer delivery locations for order fulfillment."
        action={
          <AddAddressButton
            href={
              customerId
                ? `${BASE_PATH}/new?customer=${customerId}`
                : `${BASE_PATH}/new`
            }
          />
        }
      />

      <FadeIn delay={0}>
        <Suspense fallback={<AddressStatsSkeleton />}>
          <AddressStats />
        </Suspense>
      </FadeIn>

      <Suspense fallback={null}>
        <AddressCustomerFilter customers={customerOptions} />
      </Suspense>

      <FadeIn key={customerId ?? "all"}>
        <Suspense fallback={<AddressListSkeleton />}>
          <AddressList basePath={BASE_PATH} customerId={customerId} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
