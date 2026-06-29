"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import {
  approveOrderCore,
  rejectOrderCore,
} from "@/lib/orders/approve-order"
import type { UserRole } from "@/lib/auth/roles"

type ActionResult = { error?: string } | void

async function canApproveOrders(role: UserRole): Promise<boolean> {
  if (role === "admin") return true
  if (role !== "manager") return false
  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()
  return settings.manager_can_approve_orders
}

export async function approveOrderAsRole(
  orderId: string,
  note: string
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }
  if (!(await canApproveOrders(role))) {
    return { error: "You are not authorized to approve orders." }
  }
  return approveOrderCore(orderId, user.id, role, note)
}

export async function rejectOrderAsRole(
  orderId: string,
  note: string
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }
  if (!(await canApproveOrders(role))) {
    return { error: "You are not authorized to reject orders." }
  }
  return rejectOrderCore(orderId, user.id, role, note)
}

export async function approveProductAsRole(
  productId: string,
  note: string
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }

  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()

  if (role === "manager" && !settings.manager_can_approve_products) {
    return { error: "You are not authorized to approve products." }
  }
  if (role !== "admin" && role !== "manager") {
    return { error: "Not authorized." }
  }

  const supabase = await createClient()
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .single()

  if (productError || !product) return { error: "Product not found." }
  if (product.status !== "pending_approval") {
    return { error: "This product is no longer pending approval." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      status: "active",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      rejection_note: null,
    })
    .eq("id", productId)

  if (updateError) return { error: updateError.message }

  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath("/manager/products")
  revalidatePath(`/manager/products/${productId}`)
}

export async function rejectProductAsRole(
  productId: string,
  note: string
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }

  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()

  if (role === "manager" && !settings.manager_can_approve_products) {
    return { error: "You are not authorized to reject products." }
  }
  if (role !== "admin" && role !== "manager") {
    return { error: "Not authorized." }
  }

  if (!note?.trim()) {
    return { error: "A rejection reason is required." }
  }

  const supabase = await createClient()
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .single()

  if (productError || !product) return { error: "Product not found." }
  if (product.status !== "pending_approval") {
    return { error: "This product is no longer pending approval." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "rejected", rejection_note: note })
    .eq("id", productId)

  if (updateError) return { error: updateError.message }

  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath("/manager/products")
  revalidatePath(`/manager/products/${productId}`)
}
