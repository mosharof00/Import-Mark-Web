"use client"

import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { approveOrder, rejectOrder } from "@/app/(admin)/admin/actions"
import type { OrderStatus } from "@/types"

/** Approve / reject controls shown when an order is awaiting admin review. */
export function OrderActions({
  orderId,
  status,
}: {
  orderId: string
  status: OrderStatus
}) {
  if (status !== "pending_approval") {
    return (
      <p className="text-muted-foreground text-sm">
        This order has already been reviewed.
      </p>
    )
  }

  return (
    <ApprovalButtons
      itemLabel="order"
      onApprove={approveOrder.bind(null, orderId)}
      onReject={rejectOrder.bind(null, orderId)}
    />
  )
}
