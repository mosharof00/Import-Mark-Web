"use client"

import { Menu, X } from "lucide-react"

import { UserMenu } from "@/components/layout/user-menu"
import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"
import { LANDING_HOME, type UserRole } from "@/lib/auth/roles"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  customer: "Customer",
}

/**
 * Top bar shown above each role's content. On mobile, includes a menu toggle
 * for the sidebar drawer.
 */
export function Topbar({
  role,
  displayName,
  email,
  avatarUrl,
  unreadCount,
  menuOpen,
  onMenuToggle,
}: {
  role: UserRole
  displayName: string
  email: string
  avatarUrl?: string | null
  unreadCount?: number
  menuOpen: boolean
  onMenuToggle: () => void
}) {
  const roleLabel = ROLE_LABEL[role]

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onMenuToggle}
          aria-expanded={menuOpen}
          aria-controls="mobile-sidebar"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        <BrandLogo
          href={LANDING_HOME}
          className="md:hidden"
          showTagline={false}
        />

        <div className="hidden min-w-0 flex-col leading-tight md:flex">
          <span className="truncate text-sm font-medium">{displayName}</span>
          <span className="text-muted-foreground truncate text-xs">
            {roleLabel}
          </span>
        </div>
      </div>

      <UserMenu
        role={role}
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
      />
    </header>
  )
}
