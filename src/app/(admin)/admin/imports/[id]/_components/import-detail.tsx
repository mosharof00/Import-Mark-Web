import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Wallet,
  Receipt,
  Truck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { PaymentMode, ShipmentStatus } from "@/types"

import { ImportStatusActions } from "./import-status-actions"

const PAYMENT_LABEL: Record<PaymentMode, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  mobile_banking: "Mobile banking",
  other: "Other",
}

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

export async function ImportDetail({ importId }: { importId: string }) {
  const supabase = await createClient()

  const { data: shipment, error } = await supabase
    .from("import_shipments")
    .select(
      "id, shipment_ref, status, currency, exchange_rate, total_invoice_cost, total_invoice_bdt, total_landed_cost, freight_cost, custom_duty, port_charges, other_charges, bl_number, lc_number, invoice_number, shipment_date, arrival_date, clearance_date, notes, created_at, updated_at, created_by, supplier_id, suppliers(id, name, country)"
    )
    .eq("id", importId)
    .single()

  if (error || !shipment) notFound()

  const [itemsRes, paymentsRes, managerRes, adminRes] = await Promise.all([
    supabase
      .from("import_shipment_items")
      .select(
        "id, quantity_imported, cost_per_unit_foreign, cost_per_unit_bdt, batch_number, expiry_date, products(id, name, sku, unit)"
      )
      .eq("shipment_id", importId)
      .order("created_at", { ascending: true }),
    supabase
      .from("supplier_payments")
      .select(
        "amount, amount_bdt, currency, payment_mode, payment_date, reference_no, notes"
      )
      .eq("shipment_id", importId)
      .order("payment_date", { ascending: false }),
    supabase
      .from("managers")
      .select("full_name")
      .eq("id", shipment.created_by)
      .maybeSingle(),
    supabase
      .from("admins")
      .select("full_name")
      .eq("id", shipment.created_by)
      .maybeSingle(),
  ])

  const items = itemsRes.data ?? []
  const payments = paymentsRes.data ?? []
  const recorderName =
    managerRes.data?.full_name ?? adminRes.data?.full_name ?? "Staff"
  const status = shipment.status as ShipmentStatus
  const landedCost =
    shipment.total_landed_cost ?? shipment.total_invoice_bdt ?? 0
  const chargesTotal =
    shipment.freight_cost +
    shipment.custom_duty +
    shipment.port_charges +
    shipment.other_charges
  const totalPaid = payments.reduce(
    (sum, p) => sum + (p.amount_bdt ?? p.amount),
    0
  )
  const itemQty = items.reduce((sum, i) => sum + i.quantity_imported, 0)

  return (
    <div className="space-y-6">
      <Link
        href="/admin/imports"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to imports
      </Link>

      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {shipment.shipment_ref ?? "Import shipment"}
            </h1>
            <StatusBadge kind="shipment" value={status} />
          </div>
          <p className="text-muted-foreground text-sm">
            <Link
              href={`/admin/suppliers/${shipment.supplier_id}`}
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              {shipment.suppliers?.name ?? "Unknown supplier"}
            </Link>
            {shipment.suppliers?.country
              ? ` · ${shipment.suppliers.country}`
              : null}
          </p>
          <p className="text-muted-foreground text-sm">
            Recorded {formatDate(shipment.created_at)} by {recorderName}
          </p>
        </div>
        <ImportStatusActions shipmentId={shipment.id} status={status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Landed Cost"
          value={formatTaka(landedCost)}
          icon={Wallet}
          hint="Total BDT value"
        />
        <StatCard
          label="Invoice (foreign)"
          value={`${shipment.currency} ${shipment.total_invoice_cost.toLocaleString("en-IN")}`}
          icon={Receipt}
          hint={`Rate ${shipment.exchange_rate}`}
        />
        <StatCard
          label="Charges"
          value={formatTaka(chargesTotal)}
          icon={Truck}
          hint="Freight, duty, port & other"
        />
        <StatCard
          label="Line Items"
          value={itemQty}
          icon={Package}
          hint={`${items.length} product${items.length === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailCard title="Line items">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No products on this shipment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                      <th className="px-2 py-2 font-medium">Product</th>
                      <th className="px-2 py-2 text-right font-medium">Qty</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Unit cost
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        BDT / unit
                      </th>
                      <th className="px-2 py-2 font-medium">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const lineTotal =
                        (item.cost_per_unit_bdt ?? 0) * item.quantity_imported

                      return (
                        <tr key={item.id} className="border-border border-t">
                          <td className="px-2 py-3">
                            {item.products?.id ? (
                              <Link
                                href={`/admin/products/${item.products.id}`}
                                className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
                              >
                                {item.products.name}
                              </Link>
                            ) : (
                              <span className="text-foreground font-medium">
                                Unknown product
                              </span>
                            )}
                            <p className="text-muted-foreground text-xs">
                              {item.products?.sku ?? "No SKU"}
                              {item.products?.unit
                                ? ` · ${item.products.unit}`
                                : ""}
                            </p>
                          </td>
                          <td className="text-foreground px-2 py-3 text-right tabular-nums">
                            {item.quantity_imported}
                          </td>
                          <td className="text-muted-foreground px-2 py-3 text-right tabular-nums">
                            {shipment.currency}{" "}
                            {item.cost_per_unit_foreign.toLocaleString("en-IN")}
                          </td>
                          <td className="text-foreground px-2 py-3 text-right font-medium tabular-nums">
                            {item.cost_per_unit_bdt
                              ? formatTaka(item.cost_per_unit_bdt)
                              : "—"}
                            {item.cost_per_unit_bdt ? (
                              <span className="text-muted-foreground block text-xs font-normal">
                                {formatTaka(lineTotal)} total
                              </span>
                            ) : null}
                          </td>
                          <td className="text-muted-foreground px-2 py-3 text-xs">
                            {item.batch_number ?? "—"}
                            {item.expiry_date ? (
                              <span className="block">
                                Exp {formatDate(item.expiry_date)}
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DetailCard>

          {payments.length > 0 ? (
            <DetailCard title="Supplier payments">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                      <th className="px-2 py-2 font-medium">Date</th>
                      <th className="px-2 py-2 font-medium">Mode</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-2 py-2 font-medium">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i} className="border-border border-t">
                        <td className="text-muted-foreground px-2 py-3 whitespace-nowrap">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="text-foreground px-2 py-3 whitespace-nowrap">
                          {PAYMENT_LABEL[p.payment_mode]}
                        </td>
                        <td className="text-foreground px-2 py-3 text-right font-medium tabular-nums">
                          {formatTaka(p.amount_bdt ?? p.amount)}
                        </td>
                        <td className="text-muted-foreground px-2 py-3">
                          {p.reference_no ?? p.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                Total paid on this shipment:{" "}
                <span className="text-foreground font-medium">
                  {formatTaka(totalPaid)}
                </span>
              </p>
            </DetailCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <DetailCard title="Shipment details">
            <div className="divide-border divide-y">
              <MetaRow label="BL number" value={shipment.bl_number ?? "—"} />
              <MetaRow label="LC number" value={shipment.lc_number ?? "—"} />
              <MetaRow
                label="Invoice #"
                value={shipment.invoice_number ?? "—"}
              />
              <MetaRow
                label="Shipped"
                value={
                  shipment.shipment_date
                    ? formatDate(shipment.shipment_date)
                    : "—"
                }
              />
              <MetaRow
                label="Arrived"
                value={
                  shipment.arrival_date
                    ? formatDate(shipment.arrival_date)
                    : "—"
                }
              />
              <MetaRow
                label="Cleared"
                value={
                  shipment.clearance_date
                    ? formatDate(shipment.clearance_date)
                    : "—"
                }
              />
            </div>
          </DetailCard>

          <DetailCard title="Cost breakdown">
            <div className="divide-border divide-y">
              <MetaRow
                label="Invoice (BDT)"
                value={formatTaka(shipment.total_invoice_bdt)}
              />
              <MetaRow
                label="Freight"
                value={formatTaka(shipment.freight_cost)}
              />
              <MetaRow
                label="Customs duty"
                value={formatTaka(shipment.custom_duty)}
              />
              <MetaRow
                label="Port charges"
                value={formatTaka(shipment.port_charges)}
              />
              <MetaRow
                label="Other charges"
                value={formatTaka(shipment.other_charges)}
              />
              <MetaRow
                label="Landed cost"
                value={
                  <span className="text-foreground font-semibold">
                    {formatTaka(landedCost)}
                  </span>
                }
              />
            </div>
          </DetailCard>

          {shipment.notes?.trim() ? (
            <DetailCard title="Notes">
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {shipment.notes}
              </p>
              <p className="text-muted-foreground mt-3 text-xs">
                Last updated {formatRelativeTime(shipment.updated_at)}
              </p>
            </DetailCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}
