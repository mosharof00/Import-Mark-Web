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

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateProductPaths(productId?: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/admin/inventory")
  if (productId) {
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/admin/products/${productId}/edit`)
  }
}

/**
 * Creates a product directly as active (admin bypasses the manager approval
 * queue). Optionally seeds initial stock and logs an opening-balance movement.
 */
export async function createProduct(
  values: CreateProductInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth
  const adminId = auth.userId

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
      status: "active",
      created_by: adminId,
      approved_by: adminId,
      approved_at: now,
    })
    .select("id")
    .single()

  if (insertError || !product) {
    return { error: insertError?.message ?? "Could not create product." }
  }

  // Stock row is auto-created at 0 by trigger — update threshold + quantity.
  const stockUpdate: {
    low_stock_threshold: number
    quantity_available?: number
    last_updated: string
  } = {
    low_stock_threshold: data.lowStockThreshold,
    last_updated: now,
  }

  if (data.initialQuantity > 0) {
    stockUpdate.quantity_available = data.initialQuantity
  }

  const { error: stockError } = await supabase
    .from("stock")
    .update(stockUpdate)
    .eq("product_id", product.id)

  if (stockError) {
    return { error: stockError.message }
  }

  if (data.initialQuantity > 0) {
    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: product.id,
        movement_type: "in",
        quantity: data.initialQuantity,
        quantity_before: 0,
        quantity_after: data.initialQuantity,
        ref_type: "manual_adjustment",
        ref_id: product.id,
        notes: "Opening stock on product creation",
        created_by: adminId,
      })

    if (movementError) {
      return { error: movementError.message }
    }
  }

  revalidateProductPaths(product.id)
  redirect(`/admin/products/${product.id}`)
}

/**
 * Updates catalog fields for an existing product. Stock quantity is managed
 * separately via the Inventory screen; only the low-stock threshold is
 * updated here.
 */
export async function updateProduct(
  productId: string,
  values: UpdateProductInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = updateProductSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .single()

  if (fetchError || !existing) {
    return { error: "Product not found." }
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
  redirect(`/admin/products/${productId}`)
}
