import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { formatCustomerAddress } from "@/lib/format-address"
import { formatDate, formatRelativeTime } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AddressActions } from "./address-actions"

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  )
}

export async function AddressDetail({
  addressId,
  basePath,
  customersPath,
}: {
  addressId: string
  basePath: string
  customersPath: string
}) {
  const supabase = await createClient()

  const { data: address, error } = await supabase
    .from("customer_addresses")
    .select(
      "*, customers(id, full_name, company_name, phone, email)"
    )
    .eq("id", addressId)
    .single()

  if (error || !address) notFound()

  return (
    <div className="space-y-6">
      <Link
        href={basePath}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to addresses
      </Link>

      <div className="border-border bg-card flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {address.label}
            </h1>
            {address.is_default ? (
              <Badge
                variant="secondary"
                className="border-0 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
              >
                Default
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm">
            {formatCustomerAddress(address)}
          </p>
          <p className="text-muted-foreground text-sm">
            Added {formatDate(address.created_at)} (
            {formatRelativeTime(address.created_at)})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${basePath}/${addressId}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full px-5"
            )}
          >
            Edit
          </Link>
          <AddressActions addressId={addressId} isDefault={address.is_default} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
            Delivery contact
          </h2>
          <div className="divide-border divide-y">
            <MetaRow label="Recipient" value={address.recipient_name} />
            <MetaRow label="Phone" value={address.recipient_phone ?? "—"} />
          </div>
        </section>

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
            Customer
          </h2>
          <div className="divide-border divide-y">
            <MetaRow
              label="Name"
              value={
                <Link
                  href={`${customersPath}/${address.customers?.id}`}
                  className="hover:text-muted-foreground underline-offset-4 hover:underline"
                >
                  {address.customers?.full_name ?? "—"}
                </Link>
              }
            />
            <MetaRow
              label="Company"
              value={address.customers?.company_name ?? "—"}
            />
            <MetaRow label="Phone" value={address.customers?.phone ?? "—"} />
          </div>
        </section>
      </div>
    </div>
  )
}
