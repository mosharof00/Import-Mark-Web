import { Bell } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { formatDate } from "@/lib/format"

/**
 * Page header for the admin dashboard: large "Dashboard" title on the left,
 * today's date + a notification bell with an unread-count badge on the right.
 */
export async function DashboardHeader() {
  let unread = 0

  try {
    const { user } = await getAuthedUser()
    if (user) {
      const supabase = await createClient()
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
      unread = count ?? 0
    }
  } catch {
    // Non-critical: if the count fails, just show the bell with no badge.
    unread = 0
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">{formatDate()}</span>

        <div className="border-border bg-card relative flex size-10 items-center justify-center rounded-full border">
          <Bell className="text-foreground size-5" />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-[#141414] px-1 text-[11px] font-medium text-white tabular-nums dark:bg-white dark:text-[#141414]">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
