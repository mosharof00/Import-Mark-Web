"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  setPaymentGatewayStatus,
} from "@/app/(admin)/admin/payment-gateways/actions"
import type { PaymentGatewayStatus } from "@/types"

export function GatewayActions({
  gatewayId,
  status,
}: {
  gatewayId: string
  status: PaymentGatewayStatus
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
        description="Managers will no longer see it when placing orders. Existing orders are unaffected."
        confirmLabel="Deactivate"
        destructive
        successMessage="Gateway deactivated."
        onConfirm={() =>
          setPaymentGatewayStatus(gatewayId, "inactive")
        }
      />
    )
  }

  return (
    <ConfirmDialog
      trigger={
        <Button className="rounded-full">Activate</Button>
      }
      title="Activate this gateway?"
      description="It will appear in the payment options when managers place orders."
      confirmLabel="Activate"
      successMessage="Gateway activated."
      onConfirm={() => setPaymentGatewayStatus(gatewayId, "active")}
    />
  )
}
