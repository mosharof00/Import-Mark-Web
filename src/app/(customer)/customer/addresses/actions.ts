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

async function requireCustomer() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "customer") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateAddressPaths(addressId?: string) {
  revalidatePath("/customer/addresses")
  if (addressId) {
    revalidatePath(`/customer/addresses/${addressId}`)
    revalidatePath(`/customer/addresses/${addressId}/edit`)
  }
}

function mapAddressPayload(
  customerId: string,
  data: CreateCustomerAddressInput
) {
  return {
    customer_id: customerId,
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
  const auth = await requireCustomer()
  if ("error" in auth) return auth

  const parsed = customerAddressSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the address form and try again." }
  }

  const data = parsed.data
  if (data.customerId !== auth.userId) {
    return { error: "You can only add addresses to your own account." }
  }

  const supabase = await createClient()

  if (data.isDefault) {
    await clearDefaultForCustomer(supabase, auth.userId)
  }

  const { data: address, error } = await supabase
    .from("customer_addresses")
    .insert(mapAddressPayload(auth.userId, data))
    .select("id")
    .single()

  if (error || !address) {
    return { error: error?.message ?? "Could not save address." }
  }

  revalidateAddressPaths(address.id)
  return { addressId: address.id }
}

export async function createCustomerAddressPage(
  values: CreateCustomerAddressInput
): Promise<ActionResult> {
  const result = await createCustomerAddress(values)
  if (result && "addressId" in result && result.addressId) {
    redirect(`/customer/addresses/${result.addressId}`)
  }
  return result
}

export async function updateCustomerAddress(
  values: UpdateCustomerAddressInput
): Promise<ActionResult> {
  const auth = await requireCustomer()
  if ("error" in auth) return auth

  const parsed = updateCustomerAddressSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the address form and try again." }
  }

  const data = parsed.data
  if (data.customerId !== auth.userId) {
    return { error: "You can only update your own addresses." }
  }

  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("customer_addresses")
    .select("id")
    .eq("id", data.id)
    .eq("customer_id", auth.userId)
    .maybeSingle()

  if (fetchError || !existing) {
    return { error: "Address not found." }
  }

  if (data.isDefault) {
    await clearDefaultForCustomer(supabase, auth.userId, data.id)
  }

  const { error } = await supabase
    .from("customer_addresses")
    .update(mapAddressPayload(auth.userId, data))
    .eq("id", data.id)
    .eq("customer_id", auth.userId)

  if (error) return { error: error.message }

  revalidateAddressPaths(data.id)
  redirect(`/customer/addresses/${data.id}`)
}

export async function setDefaultCustomerAddress(
  addressId: string
): Promise<ActionResult> {
  const auth = await requireCustomer()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: address, error: fetchError } = await supabase
    .from("customer_addresses")
    .select("id")
    .eq("id", addressId)
    .eq("customer_id", auth.userId)
    .maybeSingle()

  if (fetchError || !address) {
    return { error: "Address not found." }
  }

  await clearDefaultForCustomer(supabase, auth.userId, address.id)

  const { error } = await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("customer_id", auth.userId)

  if (error) return { error: error.message }

  revalidateAddressPaths(addressId)
}
