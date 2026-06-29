"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import {
  createPaymentGatewaySchema,
  updatePaymentGatewaySchema,
  type CreatePaymentGatewayInput,
  type UpdatePaymentGatewayInput,
} from "@/lib/validations/payment-gateway"

type ActionResult = { error?: string } | void

async function requireManager() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "manager") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateGatewayPaths(gatewayId?: string) {
  revalidatePath("/manager/payment-gateways")
  revalidatePath("/admin/payment-gateways")
  revalidatePath("/manager/orders/new")
  if (gatewayId) {
    revalidatePath(`/manager/payment-gateways/${gatewayId}`)
    revalidatePath(`/manager/payment-gateways/${gatewayId}/edit`)
  }
}

function mapGatewayPayload(
  data: CreatePaymentGatewayInput | UpdatePaymentGatewayInput
) {
  return {
    name: data.name.trim(),
    type: data.type,
    account_name: data.accountName?.trim() || null,
    account_number: data.accountNumber?.trim() || null,
    bank_name: data.bankName?.trim() || null,
    branch_name: data.branchName?.trim() || null,
    routing_number: data.routingNumber?.trim() || null,
    instructions: data.instructions?.trim() || null,
    sort_order: data.sortOrder ?? 0,
  }
}

export async function createPaymentGateway(
  values: CreatePaymentGatewayInput
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth

  const parsed = createPaymentGatewaySchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const supabase = await createClient()
  const { data: gateway, error } = await supabase
    .from("payment_gateways")
    .insert({
      ...mapGatewayPayload(parsed.data),
      status: "active",
      created_by: auth.userId,
    })
    .select("id")
    .single()

  if (error || !gateway) {
    return { error: error?.message ?? "Could not create payment gateway." }
  }

  revalidateGatewayPaths(gateway.id)
  redirect(`/manager/payment-gateways/${gateway.id}`)
}

export async function updatePaymentGateway(
  values: UpdatePaymentGatewayInput
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth

  const parsed = updatePaymentGatewaySchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("payment_gateways")
    .update({
      ...mapGatewayPayload(parsed.data),
      status: parsed.data.status ?? "active",
    })
    .eq("id", parsed.data.id)

  if (error) return { error: error.message }

  revalidateGatewayPaths(parsed.data.id)
  redirect(`/manager/payment-gateways/${parsed.data.id}`)
}

export async function setPaymentGatewayStatus(
  gatewayId: string,
  status: "active" | "inactive"
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth

  const supabase = await createClient()
  const { error } = await supabase
    .from("payment_gateways")
    .update({ status })
    .eq("id", gatewayId)

  if (error) return { error: error.message }
  revalidateGatewayPaths(gatewayId)
}
