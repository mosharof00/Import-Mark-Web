import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Package,
  TrendingUp,
  Wallet,
  Boxes,
  Percent,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { ProductStatus, StockMovementType, StockRefType } from "@/types"

import { ProductActions } from "./product-actions"
import { AddProductButton } from "@/app/(admin)/admin/products/_components/add-product-button"
import { EditProductButton } from "@/app/(admin)/admin/products/_components/edit-product-button"

const MOVEMENT_LABEL: Record<StockMovementType, string> = {
  in: "Stock in",
  out: "Stock out",
  adjustment: "Adjustment",
}

const REF_LABEL: Record<StockRefType, string> = {
  import: "Import",
  sale: "Sale",
  manual_adjustment: "Manual",
  return: "Return",
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

export async function ProductDetail({ productId }: { productId: string }) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, sku, sell_price, unit, unit_size, status, description, specifications, origin_country, image_urls, rejection_note, created_at, updated_at, approved_at, created_by, approved_by, last_import_id, categories(name), brands(name), stock(quantity_available, low_stock_threshold, last_updated)"
    )
    .eq("id", productId)
    .single()

  if (error || !product) notFound()

  const stock = Array.isArray(product.stock)
    ? product.stock[0]
    : product.stock

  const [
    profitabilityRes,
    movementsRes,
    managerRes,
    approverRes,
    importRes,
  ] = await Promise.all([
    supabase
      .from("product_profitability")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle(),
    supabase
      .from("stock_movements")
      .select(
        "id, movement_type, quantity, quantity_before, quantity_after, ref_type, notes, created_at"
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("managers")
      .select("full_name")
      .eq("id", product.created_by)
      .maybeSingle(),
    product.approved_by
      ? supabase
          .from("admins")
          .select("full_name")
          .eq("id", product.approved_by)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    product.last_import_id
      ? supabase
          .from("import_shipments")
          .select("shipment_ref, status, arrival_date, suppliers(name)")
          .eq("id", product.last_import_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const profitability = profitabilityRes.data
  const movements = movementsRes.data ?? []
  const status = product.status as ProductStatus
  const stockQty = stock?.quantity_available ?? null
  const threshold = stock?.low_stock_threshold ?? null
  const isLowStock =
    stockQty !== null && threshold !== null && stockQty <= threshold

  const marginPct = profitability?.margin_percent
  const marginTrend =
    marginPct !== null && marginPct !== undefined
      ? {
          direction: marginPct >= 0 ? ("up" as const) : ("down" as const),
          value: `${Math.abs(marginPct).toFixed(1)}%`,
          label: "gross margin",
        }
      : undefined

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      {/* Header */}
      <div className="border-border bg-card flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6 shadow-sm">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <StatusBadge kind="product" value={status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {product.sku ? `SKU ${product.sku}` : "No SKU"}
            {" · "}
            {product.categories?.name ?? "Uncategorized"}
            {product.brands?.name ? ` · ${product.brands.name}` : ""}
          </p>
          {isLowStock ? (
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Low stock — {stockQty} available (threshold {threshold})
            </p>
          ) : null}
          {product.rejection_note ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              Rejection reason: {product.rejection_note}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddProductButton />
          <EditProductButton productId={product.id} />
          <ProductActions productId={product.id} status={status} />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sell price"
          value={formatTaka(product.sell_price)}
          icon={Wallet}
          hint={`Per ${product.unit}`}
        />
        <StatCard
          label="Stock available"
          value={stockQty ?? "—"}
          icon={Boxes}
          accent={isLowStock ? "red" : "default"}
          hint={
            threshold !== null ? `Threshold ${threshold}` : "No stock record"
          }
        />
        <StatCard
          label="Avg cost / unit"
          value={
            profitability?.avg_cost_per_unit_bdt != null
              ? formatTaka(profitability.avg_cost_per_unit_bdt, 2)
              : "—"
          }
          icon={Package}
          hint="Landed cost basis"
        />
        <StatCard
          label="Gross margin"
          value={
            profitability?.gross_margin_per_unit != null
              ? formatTaka(profitability.gross_margin_per_unit, 2)
              : "—"
          }
          icon={marginTrend ? TrendingUp : Percent}
          trend={marginTrend}
          hint={marginTrend ? undefined : "Per unit sold"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <DetailCard title="Description">
            {product.description ? (
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">No description.</p>
            )}
          </DetailCard>

          <DetailCard title="Specifications">
            {product.specifications ? (
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {product.specifications}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No specifications listed.
              </p>
            )}
          </DetailCard>

          <DetailCard title="Recent stock movements">
            {movements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No stock movements recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                      <th className="px-2 py-2 font-medium">Type</th>
                      <th className="px-2 py-2 text-right font-medium">Qty</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Before → After
                      </th>
                      <th className="px-2 py-2 font-medium">Reference</th>
                      <th className="px-2 py-2 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr
                        key={m.id}
                        className="border-border border-t"
                      >
                        <td className="text-foreground px-2 py-3 whitespace-nowrap">
                          {MOVEMENT_LABEL[m.movement_type]}
                        </td>
                        <td className="text-foreground px-2 py-3 text-right tabular-nums">
                          {m.movement_type === "out" ? "−" : "+"}
                          {m.quantity}
                        </td>
                        <td className="text-muted-foreground px-2 py-3 text-right tabular-nums">
                          {m.quantity_before} → {m.quantity_after}
                        </td>
                        <td className="text-muted-foreground px-2 py-3 whitespace-nowrap">
                          {REF_LABEL[m.ref_type]}
                        </td>
                        <td className="text-muted-foreground px-2 py-3 whitespace-nowrap">
                          {formatRelativeTime(m.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DetailCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DetailCard title="Product details">
            <div className="divide-border divide-y">
              <MetaRow label="Unit" value={product.unit} />
              <MetaRow
                label="Unit size"
                value={product.unit_size ?? "—"}
              />
              <MetaRow
                label="Origin"
                value={product.origin_country ?? "—"}
              />
              <MetaRow
                label="Category"
                value={product.categories?.name ?? "—"}
              />
              <MetaRow label="Brand" value={product.brands?.name ?? "—"} />
              <MetaRow
                label="Last stock update"
                value={
                  stock?.last_updated
                    ? formatRelativeTime(stock.last_updated)
                    : "—"
                }
              />
            </div>
          </DetailCard>

          <DetailCard title="Audit trail">
            <div className="divide-border divide-y">
              <MetaRow
                label="Submitted by"
                value={managerRes.data?.full_name ?? "Staff"}
              />
              <MetaRow
                label="Created"
                value={`${formatDate(product.created_at)} (${formatRelativeTime(product.created_at)})`}
              />
              <MetaRow
                label="Approved by"
                value={approverRes.data?.full_name ?? "—"}
              />
              <MetaRow
                label="Approved at"
                value={
                  product.approved_at
                    ? formatDate(product.approved_at)
                    : "—"
                }
              />
              <MetaRow
                label="Last updated"
                value={formatRelativeTime(product.updated_at)}
              />
            </div>
          </DetailCard>

          {importRes.data ? (
            <DetailCard title="Last import">
              <div className="divide-border divide-y">
                <MetaRow
                  label="Shipment"
                  value={importRes.data.shipment_ref ?? "—"}
                />
                <MetaRow
                  label="Supplier"
                  value={importRes.data.suppliers?.name ?? "—"}
                />
                <MetaRow
                  label="Status"
                  value={
                    <StatusBadge
                      kind="shipment"
                      value={importRes.data.status}
                    />
                  }
                />
                <MetaRow
                  label="Arrived"
                  value={
                    importRes.data.arrival_date
                      ? formatDate(importRes.data.arrival_date)
                      : "—"
                  }
                />
              </div>
              <Link
                href="/admin/imports"
                className="text-foreground hover:text-muted-foreground mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline"
              >
                View imports →
              </Link>
            </DetailCard>
          ) : null}

          {product.image_urls && product.image_urls.length > 0 ? (
            <DetailCard title="Images">
              <div className="grid grid-cols-2 gap-3">
                {product.image_urls.map((url) => (
                  <div
                    key={url}
                    className="border-border bg-muted/40 aspect-square overflow-hidden rounded-xl border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </DetailCard>
          ) : (
            <DetailCard title="Images">
              <div className="bg-muted/40 text-muted-foreground flex aspect-video flex-col items-center justify-center rounded-xl">
                <Package className="mb-2 size-8 opacity-50" />
                <p className="text-sm">No images uploaded</p>
              </div>
            </DetailCard>
          )}
        </div>
      </div>
    </div>
  )
}
