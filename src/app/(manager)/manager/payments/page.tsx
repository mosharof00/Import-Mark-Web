import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { PaymentStats } from "./_components/payment-stats"
import { PaymentStatusTabs } from "./_components/payment-status-tabs"
import { PaymentList } from "./_components/payment-list"
import { OutstandingList } from "./_components/outstanding-list"
import type { PaymentFilter } from "./_components/payment-filters"
import {
  PaymentStatsSkeleton,
  PaymentListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: PaymentFilter[] = ["all", "outstanding"]

function parseStatus(value: string | undefined): PaymentFilter {
  if (value && FILTERS.includes(value as PaymentFilter)) {
    return value as PaymentFilter
  }
  return "all"
}

export default async function ManagerPaymentsPage({
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
    const [{ count: paymentCountRes }, { count: outstandingCountRes }] =
      await Promise.all([
        supabase
          .from("payments")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("sales_orders")
          .select("id", { count: "exact", head: true })
          .gt("due_amount", 0)
          .not("status", "in", "(rejected,cancelled)"),
      ])

    paymentCount = paymentCountRes ?? 0
    outstandingCount = outstandingCountRes ?? 0
  }

  const counts: Record<PaymentFilter, number> = {
    all: paymentCount,
    outstanding: outstandingCount,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Record customer payments against your orders and track outstanding balances."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<PaymentStatsSkeleton />}>
          <PaymentStats />
        </Suspense>
      </FadeIn>

      <PaymentStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<PaymentListSkeleton />}>
          {status === "outstanding" ? <OutstandingList /> : <PaymentList />}
        </Suspense>
      </FadeIn>
    </div>
  )
}
