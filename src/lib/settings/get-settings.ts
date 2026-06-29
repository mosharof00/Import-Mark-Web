import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  type SettingKey,
  type StockReserveOn,
} from "@/lib/settings/keys"

export type PlatformCurrency = {
  currencyCode: string
  currencyName: string
  symbol: string
  country: string
  countryCode: string
  flag: string
  locale: string
}

export const DEFAULT_PLATFORM_CURRENCY: PlatformCurrency = {
  currencyCode: "BDT",
  currencyName: "Bangladeshi Taka",
  symbol: "\u09F3",
  country: "Bangladesh",
  countryCode: "BD",
  flag: "\u{1F1E7}\u{1F1E9}",
  locale: "en-IN",
}

function parseSettingValue(
  key: SettingKey,
  raw: unknown
): AppSettings[SettingKey] {
  switch (key) {
    case "min_advance_payment_percent":
      return typeof raw === "number" ? raw : Number(raw) || 0
    case "stock_reserve_on": {
      const v = String(raw)
      if (
        v === "pending_approval" ||
        v === "approved" ||
        v === "delivered"
      ) {
        return v as StockReserveOn
      }
      return DEFAULT_APP_SETTINGS.stock_reserve_on
    }
    default:
      return Boolean(raw)
  }
}

export const getAppSettings = cache(async (): Promise<AppSettings> => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("app_settings").select("key, value")

  if (error || !data?.length) {
    return { ...DEFAULT_APP_SETTINGS }
  }

  const merged = { ...DEFAULT_APP_SETTINGS }
  for (const row of data) {
    const key = row.key as SettingKey
    if (key in DEFAULT_APP_SETTINGS) {
      merged[key] = parseSettingValue(key, row.value) as never
    }
  }
  return merged
})

export const getPlatformCurrency = cache(async (): Promise<PlatformCurrency> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_currency")
    .select(
      "currency_code, currency_name, symbol, country, country_code, flag, locale"
    )
    .eq("id", true)
    .maybeSingle()

  if (error || !data) {
    return { ...DEFAULT_PLATFORM_CURRENCY }
  }

  return {
    currencyCode: data.currency_code,
    currencyName: data.currency_name,
    symbol: data.symbol,
    country: data.country,
    countryCode: data.country_code,
    flag: data.flag,
    locale: data.locale,
  }
})

export async function getPublicAppSettings(): Promise<
  Pick<AppSettings, "public_customer_registration">
> {
  const settings = await getAppSettings()
  return {
    public_customer_registration: settings.public_customer_registration,
  }
}
