import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ShoppingCart,
  Wallet,
  CreditCard,
  AlertCircle,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { CustomerAddressesSection } from "@/components/shared/customer-addresses-section"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { OrderStatus, UserStatus } from "@/types"

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
  const { user } = await getAuthedUser()
  if (!user) notFound()

  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      "id, full_name, company_name, email, phone, address, area, city, notes, status, created_at, updated_at"
    )
    .eq("id", customerId)
    .single()

  if (error || !customer) notFound()

  const { data: orders, error: ordersError } = await supabase
    .from("sales_orders")
    .select(
      "id, order_number, status, total_amount, paid_amount, due_amount, created_at"
    )
    .eq("customer_id", customerId)
    .eq("created_by", user.id)
    .not("status", "in", "(rejected,cancelled)")
    .order("created_at", { ascending: false })
    .limit(10)

  if (ordersError) notFound()

  const myOrders = orders ?? []
  let totalBilled = 0
  let totalPaid = 0
  let totalDue = 0

  for (const order of myOrders) {
    totalBilled += order.total_amount ?? 0
    totalPaid += order.paid_amount ?? 0
    totalDue += order.due_amount ?? 0
  }

  const status = customer.status as UserStatus

  return (
    <div className="space-y-6">
      <Link
        href="/manager/customers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>

      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My Orders"
          value={myOrders.length}
          icon={ShoppingCart}
          hint="Orders you've created"
        />
        <StatCard
          label="Total Billed"
          value={formatTaka(totalBilled)}
          icon={Wallet}
          hint="From your orders"
        />
        <StatCard
          label="Total Paid"
          value={formatTaka(totalPaid)}
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
              value={formatAddress(
                customer.address,
                customer.area,
                customer.city
              )}
            />
          </div>
        </DetailCard>

        <DetailCard title="Account notes">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {customer.notes?.trim() || "No notes on file."}
          </p>
        </DetailCard>

        <DetailCard title="My orders with this customer">
          {myOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              You haven&apos;t created any orders for this customer yet.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {myOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/manager/orders/${order.id}`}
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
          {myOrders.length > 0 ? (
            <Link
              href="/manager/orders"
              className="text-muted-foreground hover:text-foreground mt-4 inline-block text-sm underline-offset-4 hover:underline"
            >
              View all my orders
            </Link>
          ) : null}
        </DetailCard>
      </div>

      <CustomerAddressesSection
        customerId={customerId}
        addressesPath="/manager/addresses"
        newAddressHref={`/manager/addresses/new?customer=${customerId}`}
      />
    </div>
  )
}
