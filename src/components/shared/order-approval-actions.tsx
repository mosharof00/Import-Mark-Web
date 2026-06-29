"use client"

import { ApprovalButtons } from "@/components/shared/approval-buttons"
import {
  approveOrderAsRole,
  rejectOrderAsRole,
} from "@/lib/orders/approval-actions"
import type { OrderStatus } from "@/types"

export function OrderApprovalActions({
  orderId,
  status,
  canApprove,
}: {
  orderId: string
  status: OrderStatus
  canApprove: boolean
}) {
  if (status !== "pending_approval") return null
  if (!canApprove) return null

  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
      <p className="text-muted-foreground mb-3 text-sm">
        This order is awaiting approval.
      </p>
      <ApprovalButtons
        itemLabel="order"
        onApprove={(note) => approveOrderAsRole(orderId, note)}
        onReject={(note) => rejectOrderAsRole(orderId, note)}
      />
    </div>
  )
}
