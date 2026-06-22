import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import type { ProductStatus } from "@/types"

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

const PRODUCT_STATUSES: ProductStatus[] = [
  "active",
  "pending_approval",
  "inactive",
  "rejected",
]

function parseStatus(value: string | undefined): ProductFilter {
  if (value && PRODUCT_STATUSES.includes(value as ProductStatus)) {
    return value as ProductStatus
  }
  return "all"
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const countResults = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    ...PRODUCT_STATUSES.map((s) =>
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", s)
    ),
  ])

  const counts: Record<ProductFilter, number> = {
    all: countResults[0].count ?? 0,
    active: countResults[1].count ?? 0,
    pending_approval: countResults[2].count ?? 0,
    inactive: countResults[3].count ?? 0,
    rejected: countResults[4].count ?? 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Browse and monitor your full product catalog — stock levels, pricing, and approval status."
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
