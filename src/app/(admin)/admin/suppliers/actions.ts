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

function revalidateSupplierPaths(supplierId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/suppliers")
  revalidatePath(`/admin/suppliers/${supplierId}`)
}

/** Archives a supplier so they cannot be used for new imports. */
export async function deactivateSupplier(
  supplierId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: supplier, error: fetchError } = await supabase
    .from("suppliers")
    .select("id, is_active")
    .eq("id", supplierId)
    .single()

  if (fetchError || !supplier) return { error: "Supplier not found." }
  if (!supplier.is_active) {
    return { error: "This supplier is already inactive." }
  }

  const { error: updateError } = await supabase
    .from("suppliers")
    .update({ is_active: false })
    .eq("id", supplierId)

  if (updateError) return { error: updateError.message }

  revalidateSupplierPaths(supplierId)
}

/** Restores an inactive supplier for new imports. */
export async function reactivateSupplier(
  supplierId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: supplier, error: fetchError } = await supabase
    .from("suppliers")
    .select("id, is_active")
    .eq("id", supplierId)
    .single()

  if (fetchError || !supplier) return { error: "Supplier not found." }
  if (supplier.is_active) {
    return { error: "This supplier is already active." }
  }

  const { error: updateError } = await supabase
    .from("suppliers")
    .update({ is_active: true })
    .eq("id", supplierId)

  if (updateError) return { error: updateError.message }

  revalidateSupplierPaths(supplierId)
}
