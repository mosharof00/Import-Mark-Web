import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Wallet,
  CreditCard,
  AlertCircle,
  Globe,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { ShipmentStatus } from "@/types"

function DetailCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  )
}

export async function SupplierDetail({ supplierId }: { supplierId: string }) {
  const supabase = await createClient()

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .select(
      "id, name, country, contact_person, email, phone, address, website, notes, is_active, created_at, updated_at"
    )
    .eq("id", supplierId)
    .single()

  if (error || !supplier) notFound()

  const [ledgerRes, shipmentsRes] = await Promise.all([
    supabase
      .from("supplier_ledger")
      .select(
        "total_shipments, total_purchased_bdt, total_paid_bdt, total_due_bdt"
      )
      .eq("supplier_id", supplierId)
      .maybeSingle(),
    supabase
      .from("import_shipments")
      .select(
        "id, shipment_ref, status, total_landed_cost, total_invoice_bdt, arrival_date, created_at"
      )
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const ledger = ledgerRes.data
  const shipments = shipmentsRes.data ?? []
  const totalDue = ledger?.total_due_bdt ?? 0
  const status = supplier.is_active ? "active" : "inactive"

  return (
    <div className="space-y-6">
      <Link
        href="/manager/suppliers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to suppliers
      </Link>

      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {supplier.name}
            </h1>
            <StatusBadge kind="user" value={status} />
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Globe className="size-3.5" />
            {supplier.country}
          </p>
          <p className="text-muted-foreground text-sm">
            Added {formatDate(supplier.created_at)}
            {supplier.updated_at !== supplier.created_at
              ? ` · Updated ${formatRelativeTime(supplier.updated_at)}`
              : null}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Shipments"
          value={ledger?.total_shipments ?? 0}
          icon={Package}
          hint="Import records"
        />
        <StatCard
          label="Total Purchased"
          value={formatTaka(ledger?.total_purchased_bdt ?? 0)}
          icon={Wallet}
          hint="Landed cost value"
        />
        <StatCard
          label="Total Paid"
          value={formatTaka(ledger?.total_paid_bdt ?? 0)}
          icon={CreditCard}
          hint="Payments made"
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(totalDue)}
          icon={AlertCircle}
          accent={totalDue > 0 ? "amber" : "default"}
          hint={totalDue > 0 ? "Payables remaining" : "Fully settled"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DetailCard title="Contact">
          <div className="divide-border divide-y">
            <MetaRow
              label="Contact person"
              value={supplier.contact_person ?? "—"}
            />
            <MetaRow label="Email" value={supplier.email ?? "—"} />
            <MetaRow label="Phone" value={supplier.phone ?? "—"} />
            <MetaRow label="Address" value={supplier.address ?? "—"} />
            <MetaRow
              label="Website"
              value={
                supplier.website ? (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {supplier.website}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </DetailCard>

        <DetailCard title="Notes">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {supplier.notes?.trim() || "No notes on file."}
          </p>
        </DetailCard>

        <DetailCard title="Recent shipments">
          {shipments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No shipments yet.</p>
          ) : (
            <ul className="divide-border divide-y">
              {shipments.map((shipment) => {
                const amount =
                  shipment.total_landed_cost ?? shipment.total_invoice_bdt ?? 0

                return (
                  <li
                    key={shipment.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/manager/imports/${shipment.id}`}
                        className="text-foreground hover:text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {shipment.shipment_ref ?? "Shipment"}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {shipment.arrival_date
                          ? formatDate(shipment.arrival_date)
                          : formatRelativeTime(shipment.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-sm font-medium tabular-nums">
                        {formatTaka(amount)}
                      </p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {(shipment.status as ShipmentStatus).replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {shipments.length > 0 ? (
            <Link
              href="/manager/imports"
              className="text-muted-foreground hover:text-foreground mt-4 inline-block text-sm underline-offset-4 hover:underline"
            >
              Browse all imports
            </Link>
          ) : null}
        </DetailCard>
      </div>
    </div>
  )
}
