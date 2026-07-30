import type { OrderStatus } from "@/types"

export const SETTING_CATEGORIES = [
  "general",
  "customers",
  "orders",
  "products",
  "inventory",
  "security",
] as const

export type SettingCategory = (typeof SETTING_CATEGORIES)[number]

/** Order statuses used for stock reservation timing. */
export type StockReserveOn = Extract<
  OrderStatus,
  "pending_approval" | "approved" | "delivered"
>

export const STOCK_RESERVE_OPTIONS: {
  value: StockReserveOn
  label: string
  description: string
}[] = [
  {
    value: "pending_approval",
    label: "Pending approval",
    description: "Reserve stock as soon as the order is placed.",
  },
  {
    value: "approved",
    label: "Approved",
    description: "Reserve stock when an admin or manager approves the order.",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Reserve stock only when the order is marked delivered.",
  },
]

export const SETTING_KEYS = {
  public_customer_registration: "boolean",
  landing_show_product_prices: "boolean",
  manager_can_approve_orders: "boolean",
  customer_can_place_orders: "boolean",
  require_advance_payment: "boolean",
  min_advance_payment_percent: "number",
  manager_can_override_sell_price: "boolean",
  stock_reserve_on: "order_status",
  manager_can_adjust_stock: "boolean",
  manager_can_approve_products: "boolean",
  product_requires_approval: "boolean",
  customer_show_stock_quantity: "boolean",
  customer_auto_activate_on_signup: "boolean",
  manager_can_activate_customers: "boolean",
} as const

export type SettingKey = keyof typeof SETTING_KEYS

export type AppSettings = {
  public_customer_registration: boolean
  landing_show_product_prices: boolean
  manager_can_approve_orders: boolean
  customer_can_place_orders: boolean
  require_advance_payment: boolean
  min_advance_payment_percent: number
  manager_can_override_sell_price: boolean
  stock_reserve_on: StockReserveOn
  manager_can_adjust_stock: boolean
  manager_can_approve_products: boolean
  product_requires_approval: boolean
  customer_show_stock_quantity: boolean
  customer_auto_activate_on_signup: boolean
  manager_can_activate_customers: boolean
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  public_customer_registration: true,
  landing_show_product_prices: true,
  manager_can_approve_orders: false,
  customer_can_place_orders: true,
  require_advance_payment: false,
  min_advance_payment_percent: 0,
  manager_can_override_sell_price: true,
  stock_reserve_on: "pending_approval",
  manager_can_adjust_stock: false,
  manager_can_approve_products: false,
  product_requires_approval: true,
  customer_show_stock_quantity: false,
  customer_auto_activate_on_signup: true,
  manager_can_activate_customers: false,
}

export const MANAGER_VISIBLE_CATEGORIES: SettingCategory[] = [
  "customers",
  "orders",
  "products",
  "inventory",
]

export const CATEGORY_LABELS: Record<SettingCategory, string> = {
  general: "General",
  customers: "Customers",
  orders: "Orders",
  products: "Products",
  inventory: "Inventory",
  security: "Security",
}
