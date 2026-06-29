"use client"

import { PaymentGatewayForm } from "@/components/shared/payment-gateway-form"
import { updatePaymentGateway as adminUpdate } from "@/app/(admin)/admin/payment-gateways/actions"
import { updatePaymentGateway as managerUpdate } from "@/app/(manager)/manager/payment-gateways/actions"
import type { CreatePaymentGatewayInput } from "@/lib/validations/payment-gateway"
import type { PaymentGatewayStatus, PaymentMode } from "@/types"

export function EditPaymentGatewayForm({
  gatewayId,
  role,
  defaultValues,
}: {
  gatewayId: string
  role: "admin" | "manager"
  defaultValues: Partial<CreatePaymentGatewayInput> & {
    type: PaymentMode
    status: PaymentGatewayStatus
  }
}) {
  const update = role === "admin" ? adminUpdate : managerUpdate

  return (
    <PaymentGatewayForm
      showStatus
      submitLabel="Save changes"
      defaultValues={defaultValues}
      onSubmit={(values) => update({ ...values, id: gatewayId })}
    />
  )
}
