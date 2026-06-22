"use client"

import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  activateCustomer,
  deactivateCustomer,
  reactivateCustomer,
  rejectCustomer,
} from "@/app/(admin)/admin/customers/actions"
import type { UserStatus } from "@/types"

/**
 * Contextual admin actions for a customer detail page — activate/reject when
 * pending, deactivate when active, reactivate when inactive.
 */
export function CustomerActions({
  customerId,
  status,
}: {
  customerId: string
  status: UserStatus
}) {
  if (status === "pending") {
    return (
      <ApprovalButtons
        itemLabel="customer"
        onApprove={activateCustomer.bind(null, customerId)}
        onReject={rejectCustomer.bind(null, customerId)}
      />
    )
  }

  if (status === "active") {
    return (
      <ConfirmDialog
        title="Deactivate this customer?"
        description="They will not be able to sign in or place new orders until reactivated."
        confirmLabel="Deactivate"
        destructive
        successMessage="Customer deactivated."
        onConfirm={deactivateCustomer.bind(null, customerId)}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-red-300 px-5 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
          >
            Deactivate
          </Button>
        }
      />
    )
  }

  if (status === "inactive") {
    return (
      <ConfirmDialog
        title="Reactivate this customer?"
        description="They will be able to sign in and place orders again."
        confirmLabel="Reactivate"
        successMessage="Customer reactivated."
        onConfirm={reactivateCustomer.bind(null, customerId)}
        trigger={
          <Button size="sm" className="rounded-full px-5">
            Reactivate
          </Button>
        }
      />
    )
  }

  return null
}
