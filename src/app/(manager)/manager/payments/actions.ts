"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { formatTaka } from "@/lib/format"
import {
  recordPaymentSchema,
  type RecordPaymentInput,
} from "@/lib/validations/payment"

type ActionResult = { error?: string } | void

async function requireManager() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "manager") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidatePaymentPaths(orderId: string) {
  revalidatePath("/manager")
  revalidatePath("/manager/payments")
  revalidatePath("/manager/orders")
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath("/manager/customers")
}

/**
 * Records a customer payment against one of the manager's orders. Order
 * paid/due totals are kept in sync by the `sync_order_paid_amount` trigger.
 */
export async function recordPayment(
  values: RecordPaymentInput
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth
  const managerId = auth.userId

  const parsed = recordPaymentSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, customer_id, due_amount, status, order_number, created_by")
    .eq("id", data.orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." }
  if (order.created_by !== managerId) {
    return { error: "You can only record payments on your own orders." }
  }
  if (order.status === "rejected" || order.status === "cancelled") {
    return { error: "Payments cannot be recorded on closed orders." }
  }

  const due = order.due_amount ?? 0
  if (due <= 0) {
    return { error: "This order has no outstanding balance." }
  }
  if (data.amount > due) {
    return { error: `Amount cannot exceed the due balance of ${formatTaka(due)}.` }
  }

  const { error: insertError } = await supabase.from("payments").insert({
    order_id: order.id,
    customer_id: order.customer_id,
    amount: data.amount,
    payment_mode: data.paymentMode,
    payment_date: data.paymentDate,
    reference_no: data.referenceNo?.trim() || null,
    notes: data.notes?.trim() || null,
    recorded_by: managerId,
  })

  if (insertError) return { error: insertError.message }

  await supabase.from("notifications").insert({
    user_id: order.customer_id,
    type: "payment_recorded",
    title: "Payment received",
    message: `A payment of ৳${data.amount.toLocaleString("en-IN")} was recorded for order ${order.order_number ?? ""}.`,
    ref_id: order.id,
    ref_table: "sales_orders",
  })

  revalidatePaymentPaths(order.id)
}
