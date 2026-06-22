"use client"

import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  approveProduct,
  deactivateProduct,
  reactivateProduct,
  rejectProduct,
} from "@/app/(admin)/admin/actions"
import type { ProductStatus } from "@/types"

/**
 * Contextual admin actions for a product detail page — approve/reject when
 * pending, deactivate when active, reactivate when inactive.
 */
export function ProductActions({
  productId,
  status,
}: {
  productId: string
  status: ProductStatus
}) {
  if (status === "pending_approval") {
    return (
      <ApprovalButtons
        itemLabel="product"
        onApprove={approveProduct.bind(null, productId)}
        onReject={rejectProduct.bind(null, productId)}
      />
    )
  }

  if (status === "active") {
    return (
      <ConfirmDialog
        title="Deactivate this product?"
        description="It will be hidden from the customer catalog. You can reactivate it later."
        confirmLabel="Deactivate"
        destructive
        successMessage="Product deactivated."
        onConfirm={deactivateProduct.bind(null, productId)}
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
        title="Reactivate this product?"
        description="It will go live in the catalog again for customers and managers."
        confirmLabel="Reactivate"
        successMessage="Product reactivated."
        onConfirm={reactivateProduct.bind(null, productId)}
        trigger={
          <Button size="sm" className="rounded-full px-5">
            Reactivate
          </Button>
        }
      />
    )
  }

  return (
    <p className="text-muted-foreground text-sm">
      This product was rejected and cannot be reactivated from here.
    </p>
  )
}
