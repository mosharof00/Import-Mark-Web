import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { PaymentHistoryItem } from "@/components/shared/payments/payment-history"
import type { PaymentMode } from "@/types"

export async function getOrderPaymentHistory(
  orderId: string
): Promise<PaymentHistoryItem[]> {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, amount, payment_mode, payment_date, reference_no, notes, proof_image_url, recorded_by, payment_gateway_id, payment_gateways(name)"
    )
    .eq("order_id", orderId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })

  const rows = payments ?? []
  const actorIds = [...new Set(rows.map((p) => p.recorded_by))]

  const [{ data: managers }, { data: admins }, { data: customers }] =
    await Promise.all([
      actorIds.length
        ? supabase.from("managers").select("id, full_name").in("id", actorIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
      actorIds.length
        ? supabase.from("admins").select("id, full_name").in("id", actorIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
      actorIds.length
        ? supabase.from("customers").select("id, full_name").in("id", actorIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
    ])

  const actorMap = new Map<
    string,
    { name: string; role: PaymentHistoryItem["recordedByRole"] }
  >()
  for (const a of admins ?? []) {
    actorMap.set(a.id, { name: a.full_name, role: "admin" })
  }
  for (const m of managers ?? []) {
    if (!actorMap.has(m.id)) {
      actorMap.set(m.id, { name: m.full_name, role: "manager" })
    }
  }
  for (const c of customers ?? []) {
    if (!actorMap.has(c.id)) {
      actorMap.set(c.id, { name: c.full_name, role: "customer" })
    }
  }

  return rows.map((p) => {
    const actor = actorMap.get(p.recorded_by)
    return {
      id: p.id,
      amount: p.amount,
      paymentMode: p.payment_mode as PaymentMode,
      paymentDate: p.payment_date,
      referenceNo: p.reference_no,
      notes: p.notes,
      proofImageUrl: p.proof_image_url,
      gatewayName: p.payment_gateways?.name ?? null,
      recordedByName: actor?.name ?? null,
      recordedByRole: actor?.role ?? "unknown",
    }
  })
}
