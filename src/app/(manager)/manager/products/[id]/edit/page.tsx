import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorCard } from "@/components/shared/error-card"
import type { UpdateProductInput } from "@/lib/validations/product"

import { EditProductForm } from "./_components/edit-product-form"

export const dynamic = "force-dynamic"

export default async function EditManagerProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await getAuthedUser()
  if (!user) notFound()

  const supabase = await createClient()

  const [productRes, categoriesRes, brandsRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, sku, category_id, brand_id, unit, unit_size, sell_price, origin_country, description, specifications, status, created_by, stock(quantity_available, low_stock_threshold)"
      )
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ])

  if (productRes.error || !productRes.data) {
    notFound()
  }

  const product = productRes.data

  if (product.created_by !== user.id) {
    notFound()
  }

  if (
    product.status !== "pending_approval" &&
    product.status !== "rejected"
  ) {
    notFound()
  }

  if (categoriesRes.error || brandsRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Product" description="Update catalog details." />
        <ErrorCard title="Couldn't load categories and brands" />
      </div>
    )
  }

  const stock = Array.isArray(product.stock)
    ? product.stock[0]
    : product.stock

  const defaultValues: UpdateProductInput = {
    name: product.name,
    sku: product.sku ?? "",
    categoryId: product.category_id,
    brandId: product.brand_id ?? "",
    unit: product.unit,
    unitSize:
      product.unit_size !== null && product.unit_size !== undefined
        ? String(product.unit_size)
        : "",
    sellPrice: product.sell_price,
    originCountry: product.origin_country ?? "",
    description: product.description ?? "",
    specifications: product.specifications ?? "",
    lowStockThreshold: stock?.low_stock_threshold ?? 10,
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/manager/products/${id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to product
      </Link>

      <PageHeader
        title="Edit Product"
        description={`Update and resubmit ${product.name} for admin approval.`}
      />

      <EditProductForm
        productId={id}
        categories={categoriesRes.data ?? []}
        brands={brandsRes.data ?? []}
        defaultValues={defaultValues}
        stockQuantity={stock?.quantity_available ?? null}
      />
    </div>
  )
}
