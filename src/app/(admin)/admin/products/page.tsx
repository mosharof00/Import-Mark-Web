import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import type { ProductStatus } from "@/types"

import { ProductStats } from "./_components/product-stats"
import { ProductStatusTabs } from "./_components/product-status-tabs"
import { ProductStatusTabsLoader } from "./_components/product-status-tabs-loader"
import { ProductList } from "./_components/product-list"
import type { ProductFilter } from "./_components/product-status-tabs"
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

      <Suspense fallback={<ProductStatusTabs active={status} />}>
        <ProductStatusTabsLoader active={status} />
      </Suspense>

      <FadeIn key={status}>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
