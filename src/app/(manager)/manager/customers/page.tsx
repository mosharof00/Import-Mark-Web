import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { AddAccountButton } from "@/components/shared/add-account-button"
import type { UserStatus } from "@/types"

import { CustomerStats } from "./_components/customer-stats"
import { CustomerStatusTabs } from "./_components/customer-status-tabs"
import { CustomerList } from "./_components/customer-list"
import type { CustomerFilter } from "@/app/(admin)/admin/customers/_components/customer-filters"
import {
  CustomerStatsSkeleton,
  CustomerListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const CUSTOMER_STATUSES: UserStatus[] = ["active", "pending", "inactive"]

function parseStatus(value: string | undefined): CustomerFilter {
  if (value && CUSTOMER_STATUSES.includes(value as UserStatus)) {
    return value as UserStatus
  }
  return "all"
}

export default async function ManagerCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const countResults = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    ...CUSTOMER_STATUSES.map((s) =>
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("status", s)
    ),
  ])

  const counts: Record<CustomerFilter, number> = {
    all: countResults[0].count ?? 0,
    active: countResults[1].count ?? 0,
    pending: countResults[2].count ?? 0,
    inactive: countResults[3].count ?? 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="View wholesale buyer accounts — contact details, balances, and order history for customers you serve."
        action={
          <AddAccountButton
            href="/manager/customers/new"
            label="Add customer"
          />
        }
      />

      <FadeIn delay={0}>
        <Suspense fallback={<CustomerStatsSkeleton />}>
          <CustomerStats />
        </Suspense>
      </FadeIn>

      <CustomerStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<CustomerListSkeleton />}>
          <CustomerList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
