import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorCard } from "@/components/shared/error-card"

import { AddProductForm } from "./_components/add-product-form"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const supabase = await createClient()

  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ])

  if (categoriesRes.error || brandsRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Add Product"
          description="Create a new catalog item and add it directly as active."
        />
        <ErrorCard title="Couldn't load categories and brands" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <PageHeader
        title="Add Product"
        description="Create a new catalog item. It goes live immediately — no manager approval needed when added by an admin."
      />

      <AddProductForm
        categories={categoriesRes.data ?? []}
        brands={brandsRes.data ?? []}
      />
    </div>
  )
}
