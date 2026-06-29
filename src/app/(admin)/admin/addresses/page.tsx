import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { AddressStats } from "./_components/address-stats"
import { AddressList } from "./_components/address-list"
import { AddAddressButton } from "./_components/add-address-button"
import { AddressCustomerFilter } from "./_components/address-customer-filter"
import {
  AddressStatsSkeleton,
  AddressListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const BASE_PATH = "/admin/addresses"

export default async function AdminAddressesPage({
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
        description="Manage customer delivery locations used when placing orders."
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
