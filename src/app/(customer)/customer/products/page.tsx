import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { StatCard } from "@/components/shared/stat-card"
import { Package, Boxes } from "lucide-react"

import { ProductList } from "./_components/product-list"
import { ProductListSkeleton } from "./_components/skeletons"

export const dynamic = "force-dynamic"

export default async function CustomerProductsPage() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Products"
        description="View our active catalog — prices and availability for your reference."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Active products"
          value={count ?? 0}
          icon={Package}
          hint="In the catalog"
        />
        <StatCard
          label="Ordering"
          value="Via manager"
          icon={Boxes}
          hint="Contact your account manager to place orders"
        />
      </div>

      <FadeIn>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </FadeIn>
    </div>
  )
}
