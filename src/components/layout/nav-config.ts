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
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@/lib/auth/roles"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

/**
 * Sidebar navigation per role. Each role's dashboard shell renders its own list.
 * Hrefs that point to not-yet-built pages are fine — they will 404 until the
 * corresponding screens are added.
 */
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Approvals", href: "/admin/approvals", icon: CircleCheck },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Suppliers", href: "/admin/suppliers", icon: Building2 },
    { label: "Imports", href: "/admin/imports", icon: Ship },
    { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  ],
  manager: [
    { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { label: "Orders", href: "/manager/orders", icon: ShoppingCart },
    { label: "Products", href: "/manager/products", icon: Package },
    { label: "Inventory", href: "/manager/inventory", icon: Boxes },
    { label: "Customers", href: "/manager/customers", icon: Users },
    { label: "Suppliers", href: "/manager/suppliers", icon: Building2 },
    { label: "Imports", href: "/manager/imports", icon: Ship },
    { label: "Payments", href: "/manager/payments", icon: Wallet },
  ],
  customer: [
    { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
    { label: "Browse Products", href: "/customer/products", icon: Package },
    { label: "My Orders", href: "/customer/orders", icon: ShoppingCart },
    { label: "Ledger", href: "/customer/ledger", icon: Wallet },
  ],
}
