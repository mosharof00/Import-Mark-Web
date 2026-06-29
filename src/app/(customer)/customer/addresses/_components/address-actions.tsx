"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { setDefaultCustomerAddress } from "../actions"

export function AddressActions({
  addressId,
  isDefault,
}: {
  addressId: string
  isDefault: boolean
}) {
  if (isDefault) return null

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" className="rounded-full">
          Set as default
        </Button>
      }
      title="Set as default address?"
      description="This will become your primary delivery address for new orders."
      confirmLabel="Set default"
      successMessage="Default address updated."
      onConfirm={() => setDefaultCustomerAddress(addressId)}
    />
  )
}
