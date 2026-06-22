"use client"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  deactivateSupplier,
  reactivateSupplier,
} from "@/app/(admin)/admin/suppliers/actions"

/** Activate / deactivate controls for a supplier detail page. */
export function SupplierActions({
  supplierId,
  isActive,
}: {
  supplierId: string
  isActive: boolean
}) {
  if (isActive) {
    return (
      <ConfirmDialog
        title="Deactivate this supplier?"
        description="They will be hidden from new import shipments. Existing records are kept."
        confirmLabel="Deactivate"
        destructive
        successMessage="Supplier deactivated."
        onConfirm={deactivateSupplier.bind(null, supplierId)}
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

  return (
    <ConfirmDialog
      title="Reactivate this supplier?"
      description="They will be available again when recording import shipments."
      confirmLabel="Reactivate"
      successMessage="Supplier reactivated."
      onConfirm={reactivateSupplier.bind(null, supplierId)}
      trigger={
        <Button size="sm" className="rounded-full px-5">
          Reactivate
        </Button>
      }
    />
  )
}
