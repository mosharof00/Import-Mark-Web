import { PageHeader } from "@/components/shared/page-header"
import { getAppSettings } from "@/lib/settings/get-settings"
import {
  CATEGORY_LABELS,
  MANAGER_VISIBLE_CATEGORIES,
  STOCK_RESERVE_OPTIONS,
  type SettingCategory,
} from "@/lib/settings/keys"
import { ChangePasswordForm } from "@/components/shared/profile/change-password-form"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

const LABELS: Record<string, string> = {
  manager_can_approve_orders: "Manager can approve orders",
  customer_can_place_orders: "Customer self-ordering",
  require_advance_payment: "Require advance payment",
  min_advance_payment_percent: "Minimum advance payment (%)",
  manager_can_override_sell_price: "Manager can override sell price",
  manager_can_approve_products: "Manager can approve products",
  product_requires_approval: "Require product approval",
  customer_show_stock_quantity: "Show stock count to customers",
  landing_show_product_prices: "Show product prices",
  customer_auto_activate_on_signup: "Auto-activate new customers",
  manager_can_activate_customers: "Manager can activate customers",
  stock_reserve_on: "Reserve stock when order reaches",
  manager_can_adjust_stock: "Manager can adjust stock quantity",
}

function formatValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled"
  if (key === "stock_reserve_on") {
    return (
      STOCK_RESERVE_OPTIONS.find((o) => o.value === value)?.label ??
      String(value)
    )
  }
  return String(value)
}

const CATEGORY_KEYS: Record<string, string[]> = {
  customers: [
    "customer_auto_activate_on_signup",
    "manager_can_activate_customers",
  ],
  orders: [
    "manager_can_approve_orders",
    "customer_can_place_orders",
    "require_advance_payment",
    "min_advance_payment_percent",
    "manager_can_override_sell_price",
  ],
  products: [
    "manager_can_approve_products",
    "product_requires_approval",
    "customer_show_stock_quantity",
    "landing_show_product_prices",
  ],
  inventory: ["stock_reserve_on", "manager_can_adjust_stock"],
}

export default async function ManagerSettingsPage() {
  const settings = await getAppSettings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="View current platform policies. Contact an administrator to change these."
      />

      <div className="border-border flex flex-wrap gap-1 border-b">
        {[...MANAGER_VISIBLE_CATEGORIES, "security" as SettingCategory].map(
          (tab) => (
            <span
              key={tab}
              className="text-muted-foreground px-4 py-2.5 text-sm font-medium"
            >
              {CATEGORY_LABELS[tab]}
            </span>
          )
        )}
      </div>

      <div className="space-y-6">
        {MANAGER_VISIBLE_CATEGORIES.map((category) => (
          <section
            key={category}
            className="border-border bg-card rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-semibold">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="divide-border divide-y">
              {(CATEGORY_KEYS[category] ?? []).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">
                    {LABELS[key] ?? key}
                  </span>
                  <Badge variant="secondary">
                    {formatValue(key, settings[key as keyof typeof settings])}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Security</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  )
}
