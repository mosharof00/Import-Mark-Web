import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorCard } from "@/components/shared/error-card"

import { AddProductForm } from "./_components/add-product-form"

export const dynamic = "force-dynamic"

export default async function NewManagerProductPage() {
  const supabase = await createClient()

  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ])

  if (categoriesRes.error || brandsRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Submit Product"
          description="Propose a new catalog item for admin approval."
        />
        <ErrorCard title="Couldn't load categories and brands" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/manager/products"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <PageHeader
        title="Submit Product"
        description="Propose a new catalog item. An admin will review it before it goes live."
      />

      <AddProductForm
        categories={categoriesRes.data ?? []}
        brands={brandsRes.data ?? []}
      />
    </div>
  )
}
