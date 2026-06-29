"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { setPaymentGatewayStatus } from "../../actions"

export function GatewayActions({
  gatewayId,
  status,
}: {
  gatewayId: string
  status: "active" | "inactive"
}) {
  if (status === "active") {
    return (
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="rounded-full">
            Deactivate
          </Button>
        }
        title="Deactivate this gateway?"
        description="It will be hidden when placing new orders."
        confirmLabel="Deactivate"
        destructive
        successMessage="Gateway deactivated."
        onConfirm={() => setPaymentGatewayStatus(gatewayId, "inactive")}
      />
    )
  }

  return (
    <ConfirmDialog
      trigger={<Button className="rounded-full">Activate</Button>}
      title="Activate this gateway?"
      description="It will appear in payment options when placing orders."
      confirmLabel="Activate"
      successMessage="Gateway activated."
      onConfirm={() => setPaymentGatewayStatus(gatewayId, "active")}
    />
  )
}
