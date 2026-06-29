import Link from "next/link"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { EditPaymentGatewayForm } from "@/components/shared/edit-payment-gateway-form"
import type { PaymentGatewayStatus, PaymentMode } from "@/types"

export const dynamic = "force-dynamic"

export default async function ManagerEditPaymentGatewayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: gateway, error } = await supabase
    .from("payment_gateways")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !gateway) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${gateway.name}`}
        description="Update payment gateway details and status."
      />
      <Link
        href={`/manager/payment-gateways/${id}`}
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Back to gateway
      </Link>
      <EditPaymentGatewayForm
        role="manager"
        gatewayId={id}
        defaultValues={{
          name: gateway.name,
          type: gateway.type as PaymentMode,
          status: gateway.status as PaymentGatewayStatus,
          accountName: gateway.account_name ?? "",
          accountNumber: gateway.account_number ?? "",
          bankName: gateway.bank_name ?? "",
          branchName: gateway.branch_name ?? "",
          routingNumber: gateway.routing_number ?? "",
          instructions: gateway.instructions ?? "",
          sortOrder: gateway.sort_order,
        }}
      />
    </div>
  )
}
