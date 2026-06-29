import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { LedgerStats } from "./_components/ledger-stats"
import { LedgerStatusTabs } from "./_components/ledger-status-tabs"
import { PaymentList } from "./_components/payment-list"
import { OutstandingList } from "./_components/outstanding-list"
import type { PaymentFilter } from "./_components/payment-filters"
import {
  LedgerStatsSkeleton,
  LedgerListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: PaymentFilter[] = ["all", "outstanding"]

function parseStatus(value: string | undefined): PaymentFilter {
  if (value && FILTERS.includes(value as PaymentFilter)) {
    return value as PaymentFilter
  }
  return "all"
}

export default async function CustomerLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const { user } = await getAuthedUser()
  const supabase = await createClient()

  let paymentCount = 0
  let outstandingCount = 0

  if (user) {
    const { data: orders } = await supabase
      .from("sales_orders")
      .select("id, due_amount")
      .eq("customer_id", user.id)
      .not("status", "in", "(rejected,cancelled)")

    const orderIds = (orders ?? []).map((o) => o.id)
    outstandingCount = (orders ?? []).filter(
      (o) => (o.due_amount ?? 0) > 0
    ).length

    if (orderIds.length > 0) {
      const { count } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .in("order_id", orderIds)
      paymentCount = count ?? 0
    }
  }

  const counts: Record<PaymentFilter, number> = {
    all: paymentCount,
    outstanding: outstandingCount,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ledger"
        description="View your account balance, payment history, and outstanding order dues."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<LedgerStatsSkeleton />}>
          <LedgerStats />
        </Suspense>
      </FadeIn>

      <LedgerStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<LedgerListSkeleton />}>
          {status === "outstanding" ? <OutstandingList /> : <PaymentList />}
        </Suspense>
      </FadeIn>
    </div>
  )
}
