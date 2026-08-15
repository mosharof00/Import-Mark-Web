import { Users } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { DEFAULT_LIST_LIMIT } from "@/lib/query/list-limit"
import type { UserStatus } from "@/types"

import { ManagersTable, type ManagerRow } from "./managers-table"

export async function ManagerList({
  status,
}: {
  status: "all" | UserStatus
}) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("managers")
      .select("id, full_name, email, phone, status, created_at")
      .order("created_at", { ascending: false })
      .limit(DEFAULT_LIST_LIMIT)

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query
    if (error) throw error

    const rows: ManagerRow[] = (data ?? []).map((m) => ({
      id: m.id,
      fullName: m.full_name,
      email: m.email,
      phone: m.phone,
      status: m.status as UserStatus,
      createdAt: m.created_at,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Users}
            title="No managers yet"
            description="Add a manager account to invite staff to the platform."
          />
        </div>
      )
    }

    return <ManagersTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load managers" />
  }
}
