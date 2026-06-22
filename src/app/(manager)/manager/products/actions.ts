"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import {
  createProductSchema,
  type CreateProductInput,
  updateProductSchema,
  type UpdateProductInput,
} from "@/lib/validations/product"

type ActionResult = { error?: string } | void

async function requireManager() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "manager") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateProductPaths(productId?: string) {
  revalidatePath("/manager")
  revalidatePath("/manager/products")
  if (productId) {
    revalidatePath(`/manager/products/${productId}`)
    revalidatePath(`/manager/products/${productId}/edit`)
  }
}

/** Submits a new product for admin approval (status stays pending_approval). */
export async function createProduct(
  values: CreateProductInput
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth
  const managerId = auth.userId

  const parsed = createProductSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      name: data.name.trim(),
      sku: data.sku?.trim() || null,
      category_id: data.categoryId,
      brand_id: data.brandId?.trim() || null,
      unit: data.unit.trim(),
      unit_size: (() => {
        if (!data.unitSize?.trim()) return null
        const n = Number(data.unitSize)
        return Number.isFinite(n) && n > 0 ? n : null
      })(),
      sell_price: data.sellPrice,
      origin_country: data.originCountry?.trim() || null,
      description: data.description?.trim() || null,
      specifications: data.specifications?.trim() || null,
      status: "pending_approval",
      created_by: managerId,
    })
    .select("id")
    .single()

  if (insertError || !product) {
    return { error: insertError?.message ?? "Could not submit product." }
  }

  const { error: stockError } = await supabase
    .from("stock")
    .update({
      low_stock_threshold: data.lowStockThreshold,
      last_updated: now,
    })
    .eq("product_id", product.id)

  if (stockError) {
    return { error: stockError.message }
  }

  revalidateProductPaths(product.id)
  redirect(`/manager/products/${product.id}`)
}

/** Updates a manager-owned product still in the approval queue. */
export async function updateProduct(
  productId: string,
  values: UpdateProductInput
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth
  const managerId = auth.userId

  const parsed = updateProductSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("id, status, created_by")
    .eq("id", productId)
    .single()

  if (fetchError || !existing) {
    return { error: "Product not found." }
  }

  if (existing.created_by !== managerId) {
    return { error: "You can only edit products you submitted." }
  }

  if (
    existing.status !== "pending_approval" &&
    existing.status !== "rejected"
  ) {
    return { error: "Only pending or rejected products can be edited." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name: data.name.trim(),
      sku: data.sku?.trim() || null,
      category_id: data.categoryId,
      brand_id: data.brandId?.trim() || null,
      unit: data.unit.trim(),
      unit_size: (() => {
        if (!data.unitSize?.trim()) return null
        const n = Number(data.unitSize)
        return Number.isFinite(n) && n > 0 ? n : null
      })(),
      sell_price: data.sellPrice,
      origin_country: data.originCountry?.trim() || null,
      description: data.description?.trim() || null,
      specifications: data.specifications?.trim() || null,
      status: "pending_approval",
      rejection_note: null,
    })
    .eq("id", productId)

  if (updateError) {
    return { error: updateError.message }
  }

  const { error: stockError } = await supabase
    .from("stock")
    .update({
      low_stock_threshold: data.lowStockThreshold,
      last_updated: new Date().toISOString(),
    })
    .eq("product_id", productId)

  if (stockError) {
    return { error: stockError.message }
  }

  revalidateProductPaths(productId)
  redirect(`/manager/products/${productId}`)
}
