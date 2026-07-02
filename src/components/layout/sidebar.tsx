"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard,
  CircleCheck,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Building2,
  Ship,
  FileBarChart,
  Wallet,
  CreditCard,
  MapPin,
  Settings,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"
import type { NavItem, NavIcon } from "@/components/layout/nav-config"
import type { UserRole } from "@/lib/auth/roles"

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  approvals: CircleCheck,
  products: Package,
  orders: ShoppingCart,
  inventory: Boxes,
  customers: Users,
  suppliers: Building2,
  imports: Ship,
  reports: FileBarChart,
  payments: Wallet,
  gateways: CreditCard,
  addresses: MapPin,
  brands: Tag,
}

function SidebarNav({
  items,
  pathname,
  settingsHref,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  settingsHref: string
  onNavigate?: () => void
}) {
  const settingsActive =
    pathname === settingsHref || pathname.startsWith(`${settingsHref}/`)

  return (
    <>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((item) => {
          const isRoot = item.href.split("/").length === 2
          const isActive = isRoot
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

          const Icon = ICONS[item.icon]
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-border shrink-0 border-t p-2">
        <Link
          href={settingsHref}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            settingsActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </>
  )
}

function SidebarHeader({
  homeHref,
  onClose,
  showClose,
}: {
  homeHref: string
  onClose?: () => void
  showClose?: boolean
}) {
  return (
    <div className="flex h-14 items-center justify-between gap-2 border-b px-3">
      <BrandLogo href={homeHref} className="min-w-0 flex-1" />
      {showClose && onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </Button>
      ) : null}
    </div>
  )
}

/**
 * App sidebar. Desktop: fixed column. Mobile: slide-in drawer toggled from the top bar.
 */
export function Sidebar({
  items,
  homeHref,
  role,
  mobileOpen,
  onMobileClose,
}: {
  items: NavItem[]
  homeHref: string
  role: UserRole
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const pathname = usePathname()
  const settingsHref = `/${role}/settings`

  useEffect(() => {
    onMobileClose()
    // Close the mobile drawer when navigating; pathname is the only trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close menu"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        id="mobile-sidebar"
        aria-hidden={!mobileOpen}
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex h-dvh w-60 flex-col border-r transition-transform duration-200 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        )}
      >
        <SidebarHeader
          homeHref={homeHref}
          showClose
          onClose={onMobileClose}
        />
        <SidebarNav
          items={items}
          pathname={pathname}
          settingsHref={settingsHref}
          onNavigate={onMobileClose}
        />
      </aside>

      <aside className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30 hidden h-dvh w-60 flex-col border-r md:flex">
        <SidebarHeader homeHref={homeHref} />
        <SidebarNav items={items} pathname={pathname} settingsHref={settingsHref} />
      </aside>
    </>
  )
}
