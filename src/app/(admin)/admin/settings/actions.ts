"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import {
  type AppSettings,
  type SettingCategory,
  type SettingKey,
  DEFAULT_APP_SETTINGS,
} from "@/lib/settings/keys"
import type { PlatformCurrency } from "@/lib/settings/get-settings"
import type { StockReserveOn } from "@/lib/settings/keys"

type ActionResult = { error?: string } | void

const CATEGORY_KEYS: Record<
  Exclude<SettingCategory, "security">,
  SettingKey[]
> = {
  general: ["public_customer_registration"],
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
  inventory: ["stock_reserve_on"],
}

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateSettingsPaths() {
  revalidatePath("/admin/settings")
  revalidatePath("/manager/settings")
  revalidatePath("/customer/settings")
  revalidatePath("/login")
  revalidatePath("/signup")
  revalidatePath("/")
  revalidatePath("/products")
}

export async function saveSettingsCategory(
  category: Exclude<SettingCategory, "security">,
  values: Partial<AppSettings>
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const keys = CATEGORY_KEYS[category]
  const supabase = await createClient()
  const now = new Date().toISOString()

  for (const key of keys) {
    if (!(key in values)) continue
    const value = values[key]
    const { error } = await supabase
      .from("app_settings")
      .update({
        value: JSON.parse(JSON.stringify(value)),
        updated_at: now,
        updated_by: auth.userId,
      })
      .eq("key", key)

    if (error) return { error: error.message }
  }

  revalidateSettingsPaths()
}

export type CurrencyInput = {
  currencyCode: string
  currencyName: string
  symbol: string
  country: string
  countryCode: string
  flag: string
  locale: string
}

export async function savePlatformCurrency(
  values: CurrencyInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()
  const { error } = await supabase
    .from("platform_currency")
    .update({
      currency_code: values.currencyCode.trim().toUpperCase(),
      currency_name: values.currencyName.trim(),
      symbol: values.symbol.trim(),
      country: values.country.trim(),
      country_code: values.countryCode.trim().toUpperCase(),
      flag: values.flag.trim(),
      locale: values.locale.trim(),
      updated_at: new Date().toISOString(),
      updated_by: auth.userId,
    })
    .eq("id", true)

  if (error) return { error: error.message }
  revalidateSettingsPaths()
}

export type SettingsRow = {
  key: SettingKey
  value: AppSettings[SettingKey]
  category: string
  label: string
  description: string | null
  valueType: string
}

export async function getSettingsRowsForAdmin(): Promise<{
  settings: AppSettings
  rows: SettingsRow[]
  currency: PlatformCurrency
}> {
  const supabase = await createClient()
  const [settingsRes, currencyRes] = await Promise.all([
    supabase.from("app_settings").select("*"),
    supabase
      .from("platform_currency")
      .select(
        "currency_code, currency_name, symbol, country, country_code, flag, locale"
      )
      .eq("id", true)
      .maybeSingle(),
  ])

  const merged = { ...DEFAULT_APP_SETTINGS }
  const rows: SettingsRow[] = []

  for (const row of settingsRes.data ?? []) {
    const key = row.key as SettingKey
    if (key in merged) {
      const raw = row.value
      if (key === "min_advance_payment_percent") {
        merged[key] = Number(raw) as never
      } else if (key === "stock_reserve_on") {
        merged[key] = String(raw) as StockReserveOn
      } else {
        merged[key] = Boolean(raw) as never
      }
    }
    rows.push({
      key,
      value: merged[key as SettingKey] ?? row.value,
      category: row.category,
      label: row.label,
      description: row.description,
      valueType: row.value_type,
    })
  }

  const currency = currencyRes.data
    ? {
        currencyCode: currencyRes.data.currency_code,
        currencyName: currencyRes.data.currency_name,
        symbol: currencyRes.data.symbol,
        country: currencyRes.data.country,
        countryCode: currencyRes.data.country_code,
        flag: currencyRes.data.flag,
        locale: currencyRes.data.locale,
      }
    : {
        currencyCode: "BDT",
        currencyName: "Bangladeshi Taka",
        symbol: "\u09F3",
        country: "Bangladesh",
        countryCode: "BD",
        flag: "\u{1F1E7}\u{1F1E9}",
        locale: "en-IN",
      }

  return { settings: merged, rows, currency }
}
