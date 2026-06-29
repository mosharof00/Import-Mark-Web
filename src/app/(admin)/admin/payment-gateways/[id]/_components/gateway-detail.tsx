import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/shared/status-badge"
import { PAYMENT_MODE_LABEL } from "@/lib/constants"
import { formatDate, formatRelativeTime } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PaymentGatewayStatus, PaymentMode } from "@/types"

import { GatewayActions } from "./gateway-actions"

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  )
}

export async function GatewayDetail({
  gatewayId,
  basePath,
}: {
  gatewayId: string
  basePath: string
}) {
  const supabase = await createClient()

  const { data: gateway, error } = await supabase
    .from("payment_gateways")
    .select("*")
    .eq("id", gatewayId)
    .single()

  if (error || !gateway) notFound()

  const status = gateway.status as PaymentGatewayStatus
  const type = gateway.type as PaymentMode

  return (
    <div className="space-y-6">
      <Link
        href={basePath}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to gateways
      </Link>

      <div className="border-border bg-card flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {gateway.name}
            </h1>
            <StatusBadge kind="gateway" value={status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {PAYMENT_MODE_LABEL[type]} · Sort order {gateway.sort_order}
          </p>
          <p className="text-muted-foreground text-sm">
            Added {formatDate(gateway.created_at)} (
            {formatRelativeTime(gateway.created_at)})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${basePath}/${gatewayId}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full px-5"
            )}
          >
            Edit
          </Link>
          <GatewayActions gatewayId={gatewayId} status={status} />
        </div>
      </div>

      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
          Account details
        </h2>
        <div className="divide-border divide-y">
          <MetaRow label="Account name" value={gateway.account_name ?? "—"} />
          <MetaRow
            label="Account number"
            value={gateway.account_number ?? "—"}
          />
          <MetaRow label="Bank" value={gateway.bank_name ?? "—"} />
          <MetaRow label="Branch" value={gateway.branch_name ?? "—"} />
          <MetaRow
            label="Routing number"
            value={gateway.routing_number ?? "—"}
          />
          <MetaRow
            label="Instructions"
            value={gateway.instructions ?? "—"}
          />
        </div>
      </section>
    </div>
  )
}
