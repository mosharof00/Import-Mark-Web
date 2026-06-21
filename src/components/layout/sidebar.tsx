"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import type { NavItem } from "@/components/layout/nav-config"

/**
 * App sidebar. Client component so it can highlight the active link based on the
 * current pathname. The list of items is passed in by the role layout.
 */
export function Sidebar({
  items,
  title,
}: {
  items: NavItem[]
  title: string
}) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-base font-semibold">ImportMark</span>
        <span className="text-muted-foreground ml-2 text-xs">{title}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((item) => {
          // The role root (e.g. "/admin") is only active on an exact match,
          // otherwise it would stay highlighted on every sub-page. Sub-pages
          // match their own path or any deeper nested path.
          const isRoot = item.href.split("/").length === 2
          const isActive = isRoot
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  )
}
