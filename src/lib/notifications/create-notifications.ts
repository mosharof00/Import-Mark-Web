import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { NotificationType } from "@/types"

export type NotificationInsert = {
  user_id: string
  type: NotificationType
  title: string
  message: string
  ref_id?: string | null
  ref_table?: string | null
}

/** Insert notifications with the service-role client (bypasses RLS). */
export async function insertNotifications(
  rows: NotificationInsert[]
): Promise<{ error?: string }> {
  if (rows.length === 0) return {}

  const unique = new Map<string, NotificationInsert>()
  for (const row of rows) {
    unique.set(`${row.user_id}:${row.type}:${row.ref_id ?? ""}:${row.title}`, row)
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("notifications")
    .insert([...unique.values()])

  if (error) return { error: error.message }
  return {}
}

/** Active admin user ids (service role — managers cannot SELECT admins under RLS). */
export async function listActiveAdminIds(
  excludeUserId?: string
): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("admins")
    .select("id")
    .eq("is_active", true)

  return (data ?? [])
    .map((row) => row.id)
    .filter((id) => id !== excludeUserId)
}

/** Manager user ids (service role — staff cannot list all managers under RLS). */
export async function listManagerIds(
  excludeUserId?: string
): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("managers").select("id")

  return (data ?? [])
    .map((row) => row.id)
    .filter((id) => id !== excludeUserId)
}

/**
 * Fan out a payment notification to the customer, all admins, and all managers
 * (except the actor who recorded the payment).
 */
export async function notifyPaymentRecorded(input: {
  actorId: string
  actorRoleLabel: string
  customerId: string
  orderId: string
  orderNumber: string | null
  amountLabel: string
  isAdvance?: boolean
}): Promise<{ error?: string }> {
  const [adminIds, managerIds] = await Promise.all([
    listActiveAdminIds(input.actorId),
    listManagerIds(input.actorId),
  ])

  const recipients = new Set<string>([
    input.customerId,
    ...adminIds,
    ...managerIds,
  ])
  recipients.delete(input.actorId)

  const orderLabel = input.orderNumber ?? "an order"
  const title = input.isAdvance
    ? "Advance payment recorded"
    : "Payment recorded"
  const customerTitle = input.isAdvance
    ? "Advance payment recorded"
    : "Payment received"

  const rows: NotificationInsert[] = [...recipients].map((userId) => {
    const isCustomer = userId === input.customerId
    return {
      user_id: userId,
      type: "payment_recorded",
      title: isCustomer ? customerTitle : title,
      message: isCustomer
        ? `${input.actorRoleLabel} recorded a payment of ${input.amountLabel} for order ${orderLabel}.`
        : `${input.actorRoleLabel} recorded ${input.amountLabel} on order ${orderLabel}.`,
      ref_id: input.orderId,
      ref_table: "sales_orders",
    }
  })

  return insertNotifications(rows)
}
