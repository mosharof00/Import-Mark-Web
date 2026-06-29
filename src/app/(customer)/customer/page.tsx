import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { AccountBanner } from "./_components/account-banner"
import { DashboardStats } from "./_components/dashboard-stats"
import { RecentOrders } from "./_components/recent-orders"
import {
  DashboardStatsSkeleton,
  RecentOrdersSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

export default async function CustomerDashboardPage() {
  const { user } = await getAuthedUser()

  let name = "there"
  if (user) {
    const supabase = await createClient()
    const { data: customer } = await supabase
      .from("customers")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
    name = customer?.full_name ?? user.email?.split("@")[0] ?? "there"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${name}`}
        description="Browse products, track your orders, and view your account balance."
      />

      <AccountBanner />

      <FadeIn delay={0}>
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Suspense fallback={<RecentOrdersSkeleton />}>
          <RecentOrders />
        </Suspense>
      </FadeIn>
    </div>
  )
}
