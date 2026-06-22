import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { ProductStats } from "./_components/product-stats"
import {
  ProductStatusTabs,
  type ProductFilter,
} from "./_components/product-status-tabs"
import { ProductList } from "./_components/product-list"
import {
  ProductStatsSkeleton,
  ProductListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: ProductFilter[] = [
  "all",
  "active",
  "pending_approval",
  "rejected",
]

function parseStatus(value: string | undefined): ProductFilter {
  if (value && FILTERS.includes(value as ProductFilter)) {
    return value as ProductFilter
  }
  return "all"
}

export default async function ManagerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const { user } = await getAuthedUser()
  const supabase = await createClient()
  const userId = user?.id ?? ""

  const [allRes, activeRes, pendingRes, rejectedRes] = user
    ? await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .or(`status.eq.active,created_by.eq.${userId}`),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("created_by", userId)
          .eq("status", "pending_approval"),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("created_by", userId)
          .eq("status", "rejected"),
      ])
    : [
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
      ]

  const counts: Record<ProductFilter, number> = {
    all: allRes.count ?? 0,
    active: activeRes.count ?? 0,
    pending_approval: pendingRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Browse the active catalog and submit new products for admin approval."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<ProductStatsSkeleton />}>
          <ProductStats />
        </Suspense>
      </FadeIn>

      <ProductStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
