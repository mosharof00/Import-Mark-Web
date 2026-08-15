import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { AddAccountButton } from "@/components/shared/add-account-button"
import type { UserStatus } from "@/types"

import { CustomerStats } from "./_components/customer-stats"
import { CustomerStatusTabs } from "./_components/customer-status-tabs"
import { CustomerStatusTabsLoader } from "./_components/customer-status-tabs-loader"
import { CustomerList } from "./_components/customer-list"
import type { CustomerFilter } from "./_components/customer-filters"
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage wholesale buyer accounts — activation, contact details, order history, and outstanding balances."
        action={
          <AddAccountButton
            href="/admin/customers/new"
            label="Add customer"
          />
        }
      />

      <FadeIn delay={0}>
        <Suspense fallback={<CustomerStatsSkeleton />}>
          <CustomerStats />
        </Suspense>
      </FadeIn>

      <Suspense fallback={<CustomerStatusTabs active={status} />}>
        <CustomerStatusTabsLoader active={status} />
      </Suspense>

      <FadeIn key={status}>
        <Suspense fallback={<CustomerListSkeleton />}>
          <CustomerList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
