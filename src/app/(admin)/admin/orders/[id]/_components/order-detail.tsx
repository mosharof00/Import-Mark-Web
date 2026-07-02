import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Wallet, CreditCard, AlertCircle, Package } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { ORDER_STATUS_CONFIG } from "@/lib/constants"
import { formatCustomerAddress } from "@/lib/format-address"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { DeliveryMethod, OrderStatus, PaymentMode } from "@/types"

import { OrderActions } from "./order-actions"
import { OrderFulfillmentActions } from "@/components/shared/order-fulfillment-actions"

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  own_team: "Own delivery team",
  customer_pickup: "Customer pickup",
}

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

export async function OrderDetail({ orderId }: { orderId: string }) {
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from("sales_orders")
    .select(
      "id, order_number, status, subtotal, discount_amount, total_amount, paid_amount, due_amount, delivery_method, address_id, payment_gateway_id, payment_mode, payment_note, notes, rejection_note, created_at, updated_at, approved_at, delivered_at, dispatched_at, created_by, approved_by, customer_id, customers(full_name, company_name, phone, email), customer_addresses(label, recipient_name, recipient_phone, address_line_1, address_line_2, city, state_province, postal_code, country), payment_gateways(name, type, account_name, account_number, bank_name, instructions)"
    )
    .eq("id", orderId)
    .single()

  if (error || !order) notFound()

  const [
    itemsRes,
    historyRes,
    managerRes,
    approverRes,
    paymentsRes,
  ] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "id, quantity, unit_price, discount, subtotal, products(id, name, sku, unit)"
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("from_status, to_status, note, changed_at, changed_by")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: true }),
    supabase
      .from("managers")
      .select("full_name")
      .eq("id", order.created_by)
      .maybeSingle(),
    order.approved_by
      ? supabase
          .from("admins")
          .select("full_name")
          .eq("id", order.approved_by)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("payments")
      .select("amount, payment_mode, payment_date, reference_no, notes")
      .eq("order_id", orderId)
      .order("payment_date", { ascending: false }),
  ])

  const items = itemsRes.data ?? []
  const history = historyRes.data ?? []
  const payments = paymentsRes.data ?? []
  const status = order.status as OrderStatus
  const dueAmount = order.due_amount ?? 0
  const itemCount = items.length
  const address = order.customer_addresses
  const gateway = order.payment_gateways

  const deliveryAddressText =
    order.delivery_method === "customer_pickup"
      ? "Godown pickup — no delivery address"
      : address
        ? `${address.label} — ${formatCustomerAddress(address)}${address.recipient_phone ? ` · ${address.recipient_phone}` : ""}`
        : "—"

  // Resolve names for status-history actors (manager or admin ids).
  const actorIds = [...new Set(history.map((h) => h.changed_by))]
  const [{ data: historyManagers }, { data: historyAdmins }] = await Promise.all([
    actorIds.length
      ? supabase.from("managers").select("id, full_name").in("id", actorIds)
      : Promise.resolve({ data: [] }),
    actorIds.length
      ? supabase.from("admins").select("id, full_name").in("id", actorIds)
      : Promise.resolve({ data: [] }),
  ])
  const actorName = new Map<string, string>()
  for (const m of historyManagers ?? []) actorName.set(m.id, m.full_name)
  for (const a of historyAdmins ?? []) actorName.set(a.id, a.full_name)

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

      {/* Header */}
      <div className="border-border bg-card flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6 shadow-sm">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {order.order_number ?? "Order"}
            </h1>
            <StatusBadge kind="order" value={status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {order.customers?.full_name ?? "Unknown customer"}
            {order.customers?.company_name
              ? ` · ${order.customers.company_name}`
              : ""}
          </p>
          <p className="text-muted-foreground text-sm">
            Placed {formatDate(order.created_at)} (
            {formatRelativeTime(order.created_at)})
          </p>
          {order.rejection_note ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              Rejection reason: {order.rejection_note}
            </p>
          ) : null}
          {order.notes ? (
            <p className="text-foreground bg-muted/50 rounded-xl px-3 py-2 text-sm">
              Note: {order.notes}
            </p>
          ) : null}
        </div>
        <OrderActions orderId={order.id} status={status} />
      </div>

      <OrderFulfillmentActions
        orderId={order.id}
        status={status}
        deliveryMethod={order.delivery_method as DeliveryMethod}
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Order total"
          value={formatTaka(order.total_amount)}
          icon={Wallet}
          hint={
            order.discount_amount > 0
              ? `Subtotal ${formatTaka(order.subtotal)} · Discount ${formatTaka(order.discount_amount)}`
              : `${itemCount} line item${itemCount === 1 ? "" : "s"}`
          }
        />
        <StatCard
          label="Paid"
          value={formatTaka(order.paid_amount)}
          icon={CreditCard}
          hint={payments.length > 0 ? `${payments.length} payment(s)` : "No payments logged"}
        />
        <StatCard
          label="Due"
          value={formatTaka(dueAmount)}
          icon={AlertCircle}
          accent={dueAmount > 0 ? "red" : "default"}
          hint={dueAmount > 0 ? "Outstanding balance" : "Fully paid"}
        />
        <StatCard
          label="Line items"
          value={itemCount}
          icon={Package}
          hint="Products in this order"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailCard title="Line items">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm">No line items.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                      <th className="px-2 py-2 font-medium">Product</th>
                      <th className="px-2 py-2 text-right font-medium">Qty</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Unit price
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Discount
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-border border-t">
                        <td className="px-2 py-3">
                          <Link
                            href={`/admin/products/${item.products?.id}`}
                            className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
                          >
                            {item.products?.name ?? "Product"}
                          </Link>
                          {item.products?.sku ? (
                            <p className="text-muted-foreground text-xs">
                              {item.products.sku}
                            </p>
                          ) : null}
                        </td>
                        <td className="text-foreground px-2 py-3 text-right tabular-nums">
                          {item.quantity}
                          {item.products?.unit
                            ? ` ${item.products.unit}`
                            : ""}
                        </td>
                        <td className="text-muted-foreground px-2 py-3 text-right tabular-nums">
                          {formatTaka(item.unit_price)}
                        </td>
                        <td className="text-muted-foreground px-2 py-3 text-right tabular-nums">
                          {item.discount > 0
                            ? formatTaka(item.discount)
                            : "—"}
                        </td>
                        <td className="text-foreground px-2 py-3 text-right font-medium tabular-nums">
                          {formatTaka(item.subtotal ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DetailCard>

          <DetailCard title="Status history">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No status changes recorded yet.
              </p>
            ) : (
              <ol className="space-y-4">
                {history.map((entry, index) => (
                  <li key={`${entry.changed_at}-${index}`} className="flex gap-3">
                    <div className="bg-border mt-1.5 size-2 shrink-0 rounded-full" />
                    <div className="min-w-0">
                      <p className="text-foreground text-sm font-medium">
                        {entry.from_status
                          ? `${ORDER_STATUS_CONFIG[entry.from_status].label} → ${ORDER_STATUS_CONFIG[entry.to_status].label}`
                          : ORDER_STATUS_CONFIG[entry.to_status].label}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {actorName.get(entry.changed_by) ?? "Staff"} ·{" "}
                        {formatDate(entry.changed_at)} (
                        {formatRelativeTime(entry.changed_at)})
                      </p>
                      {entry.note ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {entry.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </DetailCard>

          {payments.length > 0 ? (
            <DetailCard title="Payments recorded">
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
                          {formatTaka(p.amount)}
                        </td>
                        <td className="text-muted-foreground px-2 py-3">
                          {p.reference_no ?? p.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetailCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <DetailCard title="Customer">
            <div className="divide-border divide-y">
              <MetaRow
                label="Name"
                value={order.customers?.full_name ?? "—"}
              />
              <MetaRow
                label="Company"
                value={order.customers?.company_name ?? "—"}
              />
              <MetaRow
                label="Phone"
                value={order.customers?.phone ?? "—"}
              />
              <MetaRow
                label="Email"
                value={order.customers?.email ?? "—"}
              />
            </div>
          </DetailCard>

          <DetailCard title="Delivery">
            <div className="divide-border divide-y">
              <MetaRow
                label="Method"
                value={DELIVERY_LABEL[order.delivery_method]}
              />
              <MetaRow
                label="Address"
                value={deliveryAddressText}
              />
              <MetaRow
                label="Dispatched"
                value={
                  order.dispatched_at
                    ? formatDate(order.dispatched_at)
                    : "—"
                }
              />
              <MetaRow
                label="Delivered"
                value={
                  order.delivered_at
                    ? formatDate(order.delivered_at)
                    : "—"
                }
              />
            </div>
          </DetailCard>

          <DetailCard title="Payment">
            <div className="divide-border divide-y">
              <MetaRow label="Gateway" value={gateway?.name ?? "—"} />
              <MetaRow
                label="Type"
                value={
                  gateway?.type
                    ? PAYMENT_LABEL[gateway.type]
                    : order.payment_mode
                      ? PAYMENT_LABEL[order.payment_mode]
                      : "—"
                }
              />
              {gateway?.account_number ? (
                <MetaRow label="Account" value={gateway.account_number} />
              ) : null}
              {gateway?.instructions ? (
                <MetaRow label="Instructions" value={gateway.instructions} />
              ) : null}
              <MetaRow
                label="Payment note"
                value={order.payment_note ?? "—"}
              />
              <MetaRow
                label="Subtotal"
                value={formatTaka(order.subtotal)}
              />
              <MetaRow
                label="Advance paid"
                value={formatTaka(order.paid_amount)}
              />
              <MetaRow
                label="Due"
                value={formatTaka(dueAmount)}
              />
              <MetaRow
                label="Discount"
                value={formatTaka(order.discount_amount)}
              />
            </div>
          </DetailCard>

          <DetailCard title="Audit trail">
            <div className="divide-border divide-y">
              <MetaRow
                label="Created by"
                value={managerRes.data?.full_name ?? "Staff"}
              />
              <MetaRow
                label="Approved by"
                value={approverRes.data?.full_name ?? "—"}
              />
              <MetaRow
                label="Approved at"
                value={
                  order.approved_at
                    ? formatDate(order.approved_at)
                    : "—"
                }
              />
              <MetaRow
                label="Last updated"
                value={formatRelativeTime(order.updated_at)}
              />
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
