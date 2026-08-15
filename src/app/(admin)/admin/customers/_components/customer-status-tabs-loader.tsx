import { createClient } from "@/lib/supabase/server"
import type { UserStatus } from "@/types"

import { CustomerStatusTabs } from "./customer-status-tabs"
import type { CustomerFilter } from "./customer-filters"

const CUSTOMER_STATUSES: UserStatus[] = ["active", "pending", "inactive"]

export async function CustomerStatusTabsLoader({
  active,
}: {
  active: CustomerFilter
}) {
  const supabase = await createClient()
  const countResults = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    ...CUSTOMER_STATUSES.map((s) =>
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("status", s)
    ),
  ])

  const counts: Record<CustomerFilter, number> = {
    all: countResults[0].count ?? 0,
    active: countResults[1].count ?? 0,
    pending: countResults[2].count ?? 0,
    inactive: countResults[3].count ?? 0,
  }

  return <CustomerStatusTabs active={active} counts={counts} />
}
