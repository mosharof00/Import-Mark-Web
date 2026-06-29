import { notFound } from "next/navigation"
import { Bell, CheckCheck } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/get-user"
import type { UserRole } from "@/lib/auth/roles"
import { formatRelativeTime } from "@/lib/format"
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/profile/actions"
import type { Notification } from "@/types"

export async function NotificationsPage({ role }: { role: UserRole }) {
  const { user } = await requireRole(role)
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, title, message, type, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) notFound()

  const items = (notifications ?? []) as Pick<
    Notification,
    "id" | "title" | "message" | "type" | "is_read" | "created_at"
  >[]
  const unread = items.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date with account activity and order updates."
        action={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck className="size-4" />
                Mark all read
              </Button>
            </form>
          ) : null
        }
      />

      {items.length === 0 ? (
        <section className="border-border bg-card flex flex-col items-center justify-center rounded-2xl border px-6 py-16 text-center shadow-sm">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <Bell className="text-muted-foreground size-6" />
          </div>
          <h2 className="text-lg font-medium">No notifications yet</h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            When something important happens, you&apos;ll see it here.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {items.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}

async function NotificationCard({
  notification,
}: {
  notification: Pick<
    Notification,
    "id" | "title" | "message" | "is_read" | "created_at"
  >
}) {
  return (
    <section
      className={`border-border bg-card rounded-2xl border p-5 shadow-sm ${
        notification.is_read ? "opacity-80" : "ring-primary/20 ring-1"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{notification.title}</h3>
            {!notification.is_read ? (
              <span className="bg-primary size-2 rounded-full" />
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm">{notification.message}</p>
          <p className="text-muted-foreground text-xs">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>

        {!notification.is_read ? (
          <form action={markNotificationReadAction}>
            <input type="hidden" name="id" value={notification.id} />
            <Button type="submit" variant="ghost" size="sm">
              Mark read
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  )
}
