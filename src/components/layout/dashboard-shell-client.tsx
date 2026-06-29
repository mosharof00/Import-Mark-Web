"use client"

import { useState } from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { NAV_BY_ROLE } from "@/components/layout/nav-config"
import { ROLE_HOME, type UserRole } from "@/lib/auth/roles"

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
    <div className="flex h-full">
      <Sidebar
        items={NAV_BY_ROLE[role]}
        homeHref={ROLE_HOME[role]}
        role={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
          unreadCount={unreadCount}
          menuOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((open) => !open)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
