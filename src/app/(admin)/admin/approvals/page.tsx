import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { ApprovalTabs } from "./_components/approval-tabs"
import { OrderApprovals } from "./_components/order-approvals"
import { ProductApprovals } from "./_components/product-approvals"
import { ApprovalListSkeleton } from "./_components/skeletons"

// Approvals mutate the underlying tables constantly — always render fresh.
export const dynamic = "force-dynamic"

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam } = await searchParams
  const tab = tabParam === "products" ? "products" : "orders"

  // Head counts drive the tab badges. These return null (→ 0) on failure
  // rather than throwing, so a hiccup never crashes the whole page.
  const supabase = await createClient()
  const [orderRes, productRes] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval"),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Review and act on orders and products submitted by your managers."
      />

      <ApprovalTabs
        active={tab}
        orderCount={orderRes.count ?? 0}
        productCount={productRes.count ?? 0}
      />

      {/* key={tab} restarts the fade + Suspense fallback on each tab switch. */}
      <FadeIn key={tab}>
        <Suspense fallback={<ApprovalListSkeleton />}>
          {tab === "products" ? <ProductApprovals /> : <OrderApprovals />}
        </Suspense>
      </FadeIn>
    </div>
  )
}
