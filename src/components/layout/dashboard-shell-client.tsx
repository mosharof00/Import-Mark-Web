"use client"

import { useState } from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { NAV_BY_ROLE } from "@/components/layout/nav-config"
import { LANDING_HOME, type UserRole } from "@/lib/auth/roles"

export function DashboardShellClient({
  role,
  displayName,
  email,
  avatarUrl,
  unreadCount,
  children,
}: {
  role: UserRole
  displayName: string
  email: string
  avatarUrl?: string | null
  unreadCount?: number
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        items={NAV_BY_ROLE[role]}
        homeHref={LANDING_HOME}
        role={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:ml-60">
        <Topbar
          role={role}
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
          unreadCount={unreadCount}
          menuOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((open) => !open)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
