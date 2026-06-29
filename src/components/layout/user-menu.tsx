"use client"

import Link from "next/link"
import { Bell, LogOut, Settings, User } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROLE_HOME, type UserRole } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  customer: "Customer",
}

export function UserMenu({
  role,
  displayName,
  email,
  avatarUrl,
  unreadCount,
}: {
  role: UserRole
  displayName: string
  email: string
  avatarUrl?: string | null
  unreadCount?: number
}) {
  const base = ROLE_HOME[role]
  const unread = unreadCount ?? 0

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${base}/notifications`}
        aria-label="Notifications"
        className="hover:bg-muted relative inline-flex size-10 items-center justify-center rounded-full transition-colors"
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex size-10 items-center justify-center rounded-full outline-none",
            "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Open account menu"
        >
          <Avatar name={displayName} src={avatarUrl} size="md" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72 p-0">
          <div className="flex items-start gap-3 p-4">
            <Avatar name={displayName} src={avatarUrl} size="lg" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="text-muted-foreground truncate text-xs">{email}</p>
              <Badge variant="secondary" className="mt-1">
                {ROLE_LABEL[role]}
              </Badge>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="p-1">
            <DropdownMenuItem render={<Link href={`${base}/profile`} />}>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`${base}/notifications`} />}>
              <Bell />
              Notifications
              {unread > 0 ? (
                <span className="bg-primary text-primary-foreground ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`${base}/settings`} />}>
              <Settings />
              Settings
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <div className="p-1">
            <DropdownMenuItem variant="destructive" className="p-0">
              <form action="/auth/signout" method="post" className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm"
                >
                  <LogOut />
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
