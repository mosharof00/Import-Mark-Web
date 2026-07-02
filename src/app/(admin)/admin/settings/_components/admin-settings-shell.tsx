"use client"

import { useCallback, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  CATEGORY_LABELS,
  type AppSettings,
  type SettingCategory,
} from "@/lib/settings/keys"
import type { PlatformCurrency } from "@/lib/settings/get-settings"
import {
  savePlatformCurrency,
  saveSettingsCategory,
  type CurrencyInput,
} from "@/app/(admin)/admin/settings/actions"
import { ChangePasswordForm } from "@/components/shared/profile/change-password-form"

import { GeneralSettingsForm } from "./general-settings-form"
import { ToggleSettingsForm } from "./toggle-settings-form"
import { StockReserveForm } from "./stock-reserve-form"

const EDITABLE_TABS: SettingCategory[] = [
  "general",
  "customers",
  "orders",
  "products",
  "inventory",
  "security",
]

type TabState = {
  general: {
    settings: Pick<AppSettings, "public_customer_registration">
    currency: CurrencyInput
  }
  customers: Pick<
    AppSettings,
    "customer_auto_activate_on_signup" | "manager_can_activate_customers"
  >
  orders: Pick<
    AppSettings,
    | "manager_can_approve_orders"
    | "customer_can_place_orders"
    | "require_advance_payment"
    | "min_advance_payment_percent"
    | "manager_can_override_sell_price"
  >
  products: Pick<
    AppSettings,
    | "manager_can_approve_products"
    | "product_requires_approval"
    | "customer_show_stock_quantity"
    | "landing_show_product_prices"
  >
  inventory: Pick<AppSettings, "stock_reserve_on">
}

function toCurrencyInput(currency: PlatformCurrency): CurrencyInput {
  return {
    currencyCode: currency.currencyCode,
    currencyName: currency.currencyName,
    symbol: currency.symbol,
    country: currency.country,
    countryCode: currency.countryCode,
    flag: currency.flag,
    locale: currency.locale,
  }
}

export function AdminSettingsShell({
  settings,
  currency,
}: {
  settings: AppSettings
  currency: PlatformCurrency
}) {
  const [activeTab, setActiveTab] = useState<SettingCategory>("general")
  const [pendingTab, setPendingTab] = useState<SettingCategory | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [saved, setSaved] = useState<TabState>({
    general: {
      settings: {
        public_customer_registration: settings.public_customer_registration,
      },
      currency: toCurrencyInput(currency),
    },
    customers: {
      customer_auto_activate_on_signup: settings.customer_auto_activate_on_signup,
      manager_can_activate_customers: settings.manager_can_activate_customers,
    },
    orders: {
      manager_can_approve_orders: settings.manager_can_approve_orders,
      customer_can_place_orders: settings.customer_can_place_orders,
      require_advance_payment: settings.require_advance_payment,
      min_advance_payment_percent: settings.min_advance_payment_percent,
      manager_can_override_sell_price: settings.manager_can_override_sell_price,
    },
    products: {
      manager_can_approve_products: settings.manager_can_approve_products,
      product_requires_approval: settings.product_requires_approval,
      customer_show_stock_quantity: settings.customer_show_stock_quantity,
      landing_show_product_prices: settings.landing_show_product_prices,
    },
    inventory: {
      stock_reserve_on: settings.stock_reserve_on,
    },
  })

  const [draft, setDraft] = useState(saved)

  const isDirty =
    activeTab === "security"
      ? false
      : JSON.stringify(draft[activeTab as keyof TabState]) !==
        JSON.stringify(saved[activeTab as keyof TabState])

  const requestTab = useCallback(
    (tab: SettingCategory) => {
      if (tab === activeTab) return
      if (isDirty) {
        setPendingTab(tab)
        setSaveOpen(true)
      } else {
        setActiveTab(tab)
      }
    },
    [activeTab, isDirty]
  )

  function discardAndSwitch() {
    if (pendingTab) {
      setDraft((d) => ({
        ...d,
        [activeTab]: saved[activeTab as keyof TabState],
      }))
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
    setSaveOpen(false)
  }

  function handleSave() {
    startTransition(async () => {
      let error: string | undefined

      if (activeTab === "general") {
        const r1 = await saveSettingsCategory("general", draft.general.settings)
        if (r1?.error) error = r1.error
        else {
          const r2 = await savePlatformCurrency(draft.general.currency)
          if (r2?.error) error = r2.error
        }
      } else if (activeTab !== "security") {
        const result = await saveSettingsCategory(
          activeTab,
          draft[activeTab as keyof TabState] as Partial<AppSettings>
        )
        if (result?.error) error = result.error
      }

      if (error) {
        toast.error(error)
        return
      }

      setSaved((s) => ({
        ...s,
        [activeTab]: draft[activeTab as keyof TabState],
      }))
      toast.success("Settings saved.")
      setSaveOpen(false)
      if (pendingTab) {
        setActiveTab(pendingTab)
        setPendingTab(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="border-border flex flex-wrap gap-1 border-b">
        {EDITABLE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => requestTab(tab)}
            className={cn(
              "relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {CATEGORY_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        {activeTab === "general" ? (
          <GeneralSettingsForm
            settings={draft.general.settings}
            currency={draft.general.currency}
            onSettingsChange={(v) =>
              setDraft((d) => ({
                ...d,
                general: { ...d.general, settings: v },
              }))
            }
            onCurrencyChange={(v) =>
              setDraft((d) => ({
                ...d,
                general: { ...d.general, currency: v },
              }))
            }
          />
        ) : null}

        {activeTab === "customers" ? (
          <ToggleSettingsForm
            items={[
              {
                key: "customer_auto_activate_on_signup",
                label: "Auto-activate new customers",
                description:
                  "Self-registered customers become active immediately after email verification.",
                value: draft.customers.customer_auto_activate_on_signup,
              },
              {
                key: "manager_can_activate_customers",
                label: "Manager can activate customers",
                description:
                  "Managers can approve pending customer accounts.",
                value: draft.customers.manager_can_activate_customers,
              },
            ]}
            onChange={(key, value) =>
              setDraft((d) => ({
                ...d,
                customers: { ...d.customers, [key]: value },
              }))
            }
          />
        ) : null}

        {activeTab === "orders" ? (
          <div className="space-y-6">
            <ToggleSettingsForm
              items={[
                {
                  key: "manager_can_approve_orders",
                  label: "Manager can approve orders",
                  description:
                    "Managers can approve or reject any pending order.",
                  value: draft.orders.manager_can_approve_orders,
                },
                {
                  key: "customer_can_place_orders",
                  label: "Customer self-ordering",
                  description: "Customers can place orders from the portal.",
                  value: draft.orders.customer_can_place_orders,
                },
                {
                  key: "require_advance_payment",
                  label: "Require advance payment",
                  description:
                    "New orders must include an advance payment.",
                  value: draft.orders.require_advance_payment,
                },
                {
                  key: "manager_can_override_sell_price",
                  label: "Manager can override sell price",
                  description:
                    "Managers can change unit prices while placing orders.",
                  value: draft.orders.manager_can_override_sell_price,
                },
              ]}
              onChange={(key, value) =>
                setDraft((d) => ({
                  ...d,
                  orders: { ...d.orders, [key]: value },
                }))
              }
            />
            <div className="max-w-xs space-y-2">
              <label className="text-sm font-medium">
                Minimum advance payment (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                value={draft.orders.min_advance_payment_percent}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    orders: {
                      ...d.orders,
                      min_advance_payment_percent: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
              <p className="text-muted-foreground text-xs">
                Applies when advance payment is required.
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === "products" ? (
          <ToggleSettingsForm
            items={[
              {
                key: "manager_can_approve_products",
                label: "Manager can approve products",
                description:
                  "Managers can approve product submissions from other managers.",
                value: draft.products.manager_can_approve_products,
              },
              {
                key: "product_requires_approval",
                label: "Require product approval",
                description:
                  "New manager-submitted products start as pending approval.",
                value: draft.products.product_requires_approval,
              },
              {
                key: "customer_show_stock_quantity",
                label: "Show stock count to customers",
                description:
                  "Customers see exact quantities in the catalog.",
                value: draft.products.customer_show_stock_quantity,
              },
              {
                key: "landing_show_product_prices",
                label: "Show product prices",
                description:
                  "Sell prices are visible on the public website and product catalog.",
                value: draft.products.landing_show_product_prices,
              },
            ]}
            onChange={(key, value) =>
              setDraft((d) => ({
                ...d,
                products: { ...d.products, [key]: value },
              }))
            }
          />
        ) : null}

        {activeTab === "inventory" ? (
          <StockReserveForm
            value={draft.inventory.stock_reserve_on}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                inventory: { stock_reserve_on: v },
              }))
            }
          />
        ) : null}

        {activeTab === "security" ? <ChangePasswordForm /> : null}

        {activeTab !== "security" ? (
          <div className="mt-8 flex justify-end">
            <Button
              className="rounded-full px-6"
              disabled={!isDirty || isPending}
              onClick={handleSave}
            >
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save settings?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in {CATEGORY_LABELS[activeTab]}. Save
              before leaving this tab?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={discardAndSwitch}>
              Discard
            </Button>
            <DialogClose
              render={
                <Button variant="outline" className="rounded-full">
                  Keep editing
                </Button>
              }
            />
            <Button onClick={handleSave} disabled={isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
