import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ShoppingCart, Wallet, CreditCard, AlertCircle } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { OrderStatus, UserStatus } from "@/types"

import { CustomerActions } from "./customer-actions"
import { CustomerAddressesSection } from "@/components/shared/customer-addresses-section"

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

function formatAddress(
  address: string | null,
  area: string | null,
  city: string | null
): string {
  const parts = [address, area, city].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "—"
}

export async function CustomerDetail({ customerId }: { customerId: string }) {
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      "id, full_name, company_name, email, phone, address, area, city, notes, status, created_at, updated_at"
    )
    .eq("id", customerId)
    .single()

  if (error || !customer) notFound()

  const [ledgerRes, ordersRes] = await Promise.all([
    supabase
      .from("customer_ledger")
      .select("total_orders, total_billed, total_paid, total_due")
      .eq("customer_id", customerId)
      .maybeSingle(),
    supabase
      .from("sales_orders")
      .select("id, order_number, status, total_amount, paid_amount, due_amount, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const ledger = ledgerRes.data
  const orders = ordersRes.data ?? []
  const status = customer.status as UserStatus
  const totalDue = ledger?.total_due ?? 0

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>

      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {customer.full_name}
            </h1>
            <StatusBadge kind="user" value={status} />
          </div>
          {customer.company_name ? (
            <p className="text-muted-foreground">{customer.company_name}</p>
          ) : null}
          <p className="text-muted-foreground text-sm">
            Joined {formatDate(customer.created_at)}
            {customer.updated_at !== customer.created_at
              ? ` · Updated ${formatRelativeTime(customer.updated_at)}`
              : null}
          </p>
        </div>
        <CustomerActions customerId={customerId} status={status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={ledger?.total_orders ?? 0}
          icon={ShoppingCart}
          hint="All time"
        />
        <StatCard
          label="Total Billed"
          value={formatTaka(ledger?.total_billed ?? 0)}
          icon={Wallet}
          hint="Order value"
        />
        <StatCard
          label="Total Paid"
          value={formatTaka(ledger?.total_paid ?? 0)}
          icon={CreditCard}
          hint="Payments received"
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(totalDue)}
          icon={AlertCircle}
          accent={totalDue > 0 ? "amber" : "default"}
          hint={totalDue > 0 ? "Needs collection" : "Fully paid up"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DetailCard title="Contact & address">
          <div className="divide-border divide-y">
            <MetaRow label="Email" value={customer.email} />
            <MetaRow label="Phone" value={customer.phone ?? "—"} />
            <MetaRow
              label="Address"
              value={formatAddress(customer.address, customer.area, customer.city)}
            />
          </div>
        </DetailCard>

        <DetailCard title="Account notes">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {customer.notes?.trim() || "No notes on file."}
          </p>
        </DetailCard>

        <DetailCard title="Recent orders">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-border divide-y">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-foreground hover:text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {order.order_number ?? "Order"}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeTime(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-medium tabular-nums">
                      {formatTaka(order.total_amount)}
                    </p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {(order.status as OrderStatus).replaceAll("_", " ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {orders.length > 0 ? (
            <Link
              href="/admin/orders"
              className="text-muted-foreground hover:text-foreground mt-4 inline-block text-sm underline-offset-4 hover:underline"
            >
              Browse all orders
            </Link>
          ) : null}
        </DetailCard>
      </div>

      <CustomerAddressesSection
        customerId={customerId}
        addressesPath="/admin/addresses"
        newAddressHref={`/admin/addresses/new?customer=${customerId}`}
      />
    </div>
  )
}
