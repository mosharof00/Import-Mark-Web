"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import {
  customerAddressSchema,
  updateCustomerAddressSchema,
  type CreateCustomerAddressInput,
  type UpdateCustomerAddressInput,
} from "@/lib/validations/customer-address"

type ActionResult = { error?: string; addressId?: string } | void

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateAddressPaths(addressId?: string, customerId?: string) {
  revalidatePath("/admin/addresses")
  revalidatePath("/manager/addresses")
  revalidatePath("/admin/customers")
  revalidatePath("/manager/customers")
  revalidatePath("/manager/orders/new")
  if (addressId) {
    revalidatePath(`/admin/addresses/${addressId}`)
    revalidatePath(`/admin/addresses/${addressId}/edit`)
    revalidatePath(`/manager/addresses/${addressId}`)
    revalidatePath(`/manager/addresses/${addressId}/edit`)
  }
  if (customerId) {
    revalidatePath(`/admin/customers/${customerId}`)
    revalidatePath(`/manager/customers/${customerId}`)
  }
}

function mapAddressPayload(data: CreateCustomerAddressInput) {
  return {
    customer_id: data.customerId,
    label: data.label.trim(),
    recipient_name: data.recipientName.trim(),
    recipient_phone: data.recipientPhone?.trim() || null,
    address_line_1: data.addressLine1.trim(),
    address_line_2: data.addressLine2?.trim() || null,
    city: data.city.trim(),
    state_province: data.stateProvince?.trim() || null,
    postal_code: data.postalCode?.trim() || null,
    country: data.country.trim(),
    is_default: data.isDefault ?? false,
  }
}

async function clearDefaultForCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customerId: string,
  exceptId?: string
) {
  let query = supabase
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("customer_id", customerId)
  if (exceptId) query = query.neq("id", exceptId)
  await query
}

export async function createCustomerAddress(
  values: CreateCustomerAddressInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = customerAddressSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the address form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", data.customerId)
    .maybeSingle()

  if (customerError || !customer) {
    return { error: "Customer not found." }
  }

  if (data.isDefault) {
    await clearDefaultForCustomer(supabase, data.customerId)
  }

  const { data: address, error } = await supabase
    .from("customer_addresses")
    .insert(mapAddressPayload(data))
    .select("id, customer_id")
    .single()

  if (error || !address) {
    return { error: error?.message ?? "Could not save address." }
  }

  revalidateAddressPaths(address.id, address.customer_id)
  redirect(`/admin/addresses/${address.id}`)
}

export async function updateCustomerAddress(
  values: UpdateCustomerAddressInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = updateCustomerAddressSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the address form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()

  if (data.isDefault) {
    await clearDefaultForCustomer(supabase, data.customerId, data.id)
  }

  const { error } = await supabase
    .from("customer_addresses")
    .update(mapAddressPayload(data))
    .eq("id", data.id)

  if (error) return { error: error.message }

  revalidateAddressPaths(data.id, data.customerId)
  redirect(`/admin/addresses/${data.id}`)
}

export async function deleteCustomerAddress(
  addressId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: address, error: fetchError } = await supabase
    .from("customer_addresses")
    .select("id, customer_id")
    .eq("id", addressId)
    .maybeSingle()

  if (fetchError || !address) {
    return { error: "Address not found." }
  }

  const { count } = await supabase
    .from("sales_orders")
    .select("id", { count: "exact", head: true })
    .eq("address_id", addressId)

  if (count && count > 0) {
    return {
      error: "This address is linked to orders and cannot be deleted.",
    }
  }

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)

  if (error) return { error: error.message }

  revalidateAddressPaths(undefined, address.customer_id)
  redirect("/admin/addresses")
}

export async function setDefaultCustomerAddress(
  addressId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: address, error: fetchError } = await supabase
    .from("customer_addresses")
    .select("id, customer_id")
    .eq("id", addressId)
    .maybeSingle()

  if (fetchError || !address) {
    return { error: "Address not found." }
  }

  await clearDefaultForCustomer(supabase, address.customer_id, address.id)

  const { error } = await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", addressId)

  if (error) return { error: error.message }

  revalidateAddressPaths(addressId, address.customer_id)
}
