"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "@/app/(manager)/manager/addresses/actions"

export function AddressActions({
  addressId,
  isDefault,
}: {
  addressId: string
  isDefault: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {!isDefault ? (
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="rounded-full">
              Set as default
            </Button>
          }
          title="Set as default address?"
          description="This will become the primary delivery address for this customer."
          confirmLabel="Set default"
          successMessage="Default address updated."
          onConfirm={() => setDefaultCustomerAddress(addressId)}
        />
      ) : null}
      <ConfirmDialog
        trigger={
          <Button variant="destructive" className="rounded-full">
            Delete
          </Button>
        }
        title="Delete this address?"
        description="This cannot be undone. Addresses linked to orders cannot be deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteCustomerAddress(addressId)}
      />
    </div>
  )
}
