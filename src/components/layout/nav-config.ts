import type { UserRole } from "@/lib/auth/roles"

/**
 * String keys for nav icons. We store a key (not the lucide component itself)
 * because this config is read in a Server Component (DashboardShell) and passed
 * to the client Sidebar — React cannot serialize component functions across the
 * server/client boundary. The Sidebar maps each key to its lucide icon.
 */
export type NavIcon =
  | "dashboard"
  | "approvals"
  | "products"
  | "orders"
  | "inventory"
  | "customers"
  | "managers"
  | "suppliers"
  | "imports"
  | "reports"
  | "payments"
  | "gateways"
  | "addresses"
  | "brands"

export type NavItem = {
  label: string
  href: string
  icon: NavIcon
}

/**
 * Sidebar navigation per role. Each role's dashboard shell renders its own list.
 * Hrefs that point to not-yet-built pages are fine — they will 404 until the
 * corresponding screens are added.
 */
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: "dashboard" },
    { label: "Approvals", href: "/admin/approvals", icon: "approvals" },
    { label: "Products", href: "/admin/products", icon: "products" },
    { label: "Brands", href: "/admin/brands", icon: "brands" },
    { label: "Orders", href: "/admin/orders", icon: "orders" },
    { label: "Payments", href: "/admin/payments", icon: "payments" },
    { label: "Inventory", href: "/admin/inventory", icon: "inventory" },
    { label: "Customers", href: "/admin/customers", icon: "customers" },
    { label: "Managers", href: "/admin/managers", icon: "managers" },
    { label: "Suppliers", href: "/admin/suppliers", icon: "suppliers" },
    { label: "Imports", href: "/admin/imports", icon: "imports" },
    { label: "Payment Gateways", href: "/admin/payment-gateways", icon: "gateways" },
    { label: "Addresses", href: "/admin/addresses", icon: "addresses" },
    { label: "Reports", href: "/admin/reports", icon: "reports" },
  ],
  manager: [
    { label: "Dashboard", href: "/manager", icon: "dashboard" },
    { label: "Orders", href: "/manager/orders", icon: "orders" },
    { label: "Products", href: "/manager/products", icon: "products" },
    { label: "Inventory", href: "/manager/inventory", icon: "inventory" },
    { label: "Customers", href: "/manager/customers", icon: "customers" },
    { label: "Suppliers", href: "/manager/suppliers", icon: "suppliers" },
    { label: "Imports", href: "/manager/imports", icon: "imports" },
    { label: "Payments", href: "/manager/payments", icon: "payments" },
    { label: "Payment Gateways", href: "/manager/payment-gateways", icon: "gateways" },
    { label: "Addresses", href: "/manager/addresses", icon: "addresses" },
  ],
  customer: [
    { label: "Dashboard", href: "/customer", icon: "dashboard" },
    { label: "Browse Products", href: "/customer/products", icon: "products" },
    { label: "Place Order", href: "/customer/orders/new", icon: "orders" },
    { label: "My Orders", href: "/customer/orders", icon: "orders" },
    { label: "Ledger", href: "/customer/ledger", icon: "payments" },
    { label: "My Addresses", href: "/customer/addresses", icon: "addresses" },
  ],
}
