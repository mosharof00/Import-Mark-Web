import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { PaymentGatewayForm } from "@/components/shared/payment-gateway-form"
import { createPaymentGateway } from "../actions"

export const dynamic = "force-dynamic"

export default function NewPaymentGatewayPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Payment Gateway"
        description="Create a new payment method for order placement."
      />
      <Link
        href="/admin/payment-gateways"
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Back to gateways
      </Link>
      <PaymentGatewayForm
        submitLabel="Create gateway"
        onSubmit={createPaymentGateway}
      />
    </div>
  )
}
