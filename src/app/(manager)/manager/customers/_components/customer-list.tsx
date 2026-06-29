import { Users } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { UserStatus } from "@/types"

import {
  CUSTOMER_FILTER_LABELS,
  type CustomerFilter,
} from "@/app/(admin)/admin/customers/_components/customer-filters"
import { CustomersTable, type CustomerRow } from "./customers-table"

function formatLocation(city: string | null, area: string | null): string | null {
  if (city && area) return `${area}, ${city}`
  return city ?? area ?? null
}

export async function CustomerList({ status }: { status: CustomerFilter }) {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load customers" />

  const supabase = await createClient()

  try {
    let query = supabase
      .from("customers")
      .select(
        "id, full_name, company_name, email, phone, city, area, status, created_at"
      )
      .order("created_at", { ascending: false })

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data: customers, error } = await query
    if (error) throw error

    const customerIds = (customers ?? []).map((c) => c.id)

    const orderStatsByCustomer = new Map<
      string,
      { orderCount: number; totalBilled: number; totalDue: number }
    >()

    if (customerIds.length > 0) {
      const { data: orders, error: ordersError } = await supabase
        .from("sales_orders")
        .select("customer_id, total_amount, due_amount")
        .eq("created_by", user.id)
        .in("customer_id", customerIds)
        .not("status", "in", "(rejected,cancelled)")

      if (ordersError) throw ordersError

      for (const order of orders ?? []) {
        if (!order.customer_id) continue
        const existing = orderStatsByCustomer.get(order.customer_id) ?? {
          orderCount: 0,
          totalBilled: 0,
          totalDue: 0,
        }
        orderStatsByCustomer.set(order.customer_id, {
          orderCount: existing.orderCount + 1,
          totalBilled: existing.totalBilled + (order.total_amount ?? 0),
          totalDue: existing.totalDue + (order.due_amount ?? 0),
        })
      }
    }

    const rows: CustomerRow[] = (customers ?? []).map((c) => {
      const stats = orderStatsByCustomer.get(c.id)

      return {
        id: c.id,
        fullName: c.full_name,
        companyName: c.company_name,
        email: c.email,
        phone: c.phone,
        location: formatLocation(c.city, c.area),
        orderCount: stats?.orderCount ?? 0,
        totalBilled: stats?.totalBilled ?? 0,
        totalDue: stats?.totalDue ?? 0,
        status: c.status as UserStatus,
        createdAt: c.created_at,
      }
    })

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              status === "all"
                ? "No customer accounts have been registered yet."
                : `No customers with status "${CUSTOMER_FILTER_LABELS[status]}".`
            }
          />
        </div>
      )
    }

    return <CustomersTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load customers" />
  }
}
