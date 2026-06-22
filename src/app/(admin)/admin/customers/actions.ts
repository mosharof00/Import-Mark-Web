"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"

type ActionResult = { error?: string } | void

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateCustomerPaths(customerId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/customers")
  revalidatePath(`/admin/customers/${customerId}`)
}

/** Activates a pending customer so they can sign in and place orders. */
export async function activateCustomer(
  customerId: string,
  _note?: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id, status, full_name")
    .eq("id", customerId)
    .single()

  if (fetchError || !customer) return { error: "Customer not found." }
  if (customer.status !== "pending") {
    return { error: "Only pending customers can be activated." }
  }

  const { error: updateError } = await supabase
    .from("customers")
    .update({ status: "active" })
    .eq("id", customerId)

  if (updateError) return { error: updateError.message }

  await supabase.from("notifications").insert({
    user_id: customerId,
    type: "order_status_changed",
    title: "Account activated",
    message: `Welcome, ${customer.full_name}! Your account is now active. You can sign in and place orders.`,
    ref_id: customerId,
    ref_table: "customers",
  })

  revalidateCustomerPaths(customerId)
}

/** Rejects a pending registration (sets status to inactive). */
export async function rejectCustomer(
  customerId: string,
  note: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  if (!note || note.trim().length === 0) {
    return { error: "A rejection reason is required." }
  }

  const supabase = await createClient()

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id, status")
    .eq("id", customerId)
    .single()

  if (fetchError || !customer) return { error: "Customer not found." }
  if (customer.status !== "pending") {
    return { error: "Only pending customers can be rejected." }
  }

  const { error: updateError } = await supabase
    .from("customers")
    .update({ status: "inactive", notes: note.trim() })
    .eq("id", customerId)

  if (updateError) return { error: updateError.message }

  revalidateCustomerPaths(customerId)
}

/** Suspends an active customer from placing new orders. */
export async function deactivateCustomer(
  customerId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id, status")
    .eq("id", customerId)
    .single()

  if (fetchError || !customer) return { error: "Customer not found." }
  if (customer.status !== "active") {
    return { error: "Only active customers can be deactivated." }
  }

  const { error: updateError } = await supabase
    .from("customers")
    .update({ status: "inactive" })
    .eq("id", customerId)

  if (updateError) return { error: updateError.message }

  revalidateCustomerPaths(customerId)
}

/** Restores a previously inactive customer to active status. */
export async function reactivateCustomer(
  customerId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("id, status")
    .eq("id", customerId)
    .single()

  if (fetchError || !customer) return { error: "Customer not found." }
  if (customer.status !== "inactive") {
    return { error: "Only inactive customers can be reactivated." }
  }

  const { error: updateError } = await supabase
    .from("customers")
    .update({ status: "active" })
    .eq("id", customerId)

  if (updateError) return { error: updateError.message }

  await supabase.from("notifications").insert({
    user_id: customerId,
    type: "order_status_changed",
    title: "Account reactivated",
    message: "Your account has been reactivated. You can sign in and place orders again.",
    ref_id: customerId,
    ref_table: "customers",
  })

  revalidateCustomerPaths(customerId)
}
