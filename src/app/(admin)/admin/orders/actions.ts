"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/validations/order"
import {
  customerAddressSchema,
  type CreateCustomerAddressInput,
} from "@/lib/validations/customer-address"

type ActionResult = { error?: string; orderId?: string; addressId?: string }

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

export async function createCustomerAddress(
  values: CreateCustomerAddressInput
): Promise<{ error?: string; addressId?: string }> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = customerAddressSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address." }
  }

  const data = parsed.data
  const supabase = await createClient()

  const { data: address, error } = await supabase
    .from("customer_addresses")
    .insert({
      customer_id: data.customerId,
      label: data.label.trim(),
      recipient_name: data.recipientName.trim(),
      recipient_phone: data.recipientPhone?.trim() || null,
      address_line_1: data.addressLine1.trim(),
      address_line_2: data.addressLine2?.trim() || null,
      city: data.city.trim(),
      state_province: data.stateProvince?.trim() || null,
      postal_code: data.postalCode?.trim() || null,
      country: data.country.trim() || "Bangladesh",
      is_default: Boolean(data.isDefault),
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/admin/addresses")
  revalidatePath("/admin/orders/new")
  revalidatePath(`/admin/customers/${data.customerId}`)
  return { addressId: address.id }
}

export async function placeOrder(
  values: PlaceOrderInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = placeOrderSchema.safeParse(values)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { error: first ?? "Please check the order and try again." }
  }

  const { placeOrderCore } = await import("@/lib/orders/place-order")
  const result = await placeOrderCore(parsed.data, auth.userId, "admin")

  if (result.orderId) {
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${result.orderId}`)
  }

  return result
}
