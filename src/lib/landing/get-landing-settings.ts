import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import { DEFAULT_APP_SETTINGS } from "@/lib/settings/keys"
import {
  DEFAULT_PLATFORM_CURRENCY,
  type PlatformCurrency,
} from "@/lib/settings/get-settings"

export type LandingSettings = {
  showProductPrices: boolean
  publicRegistration: boolean
  customerCanPlaceOrders: boolean
}

export const getLandingSettings = cache(async (): Promise<LandingSettings> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [
      "landing_show_product_prices",
      "public_customer_registration",
      "customer_can_place_orders",
    ])

  if (error) {
    console.error("[landing] getLandingSettings:", error.message)
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value]))

  return {
    showProductPrices: Boolean(
      map.get("landing_show_product_prices") ??
        DEFAULT_APP_SETTINGS.landing_show_product_prices
    ),
    publicRegistration: Boolean(
      map.get("public_customer_registration") ??
        DEFAULT_APP_SETTINGS.public_customer_registration
    ),
    customerCanPlaceOrders: Boolean(
      map.get("customer_can_place_orders") ??
        DEFAULT_APP_SETTINGS.customer_can_place_orders
    ),
  }
})

export const getLandingCurrency = cache(async (): Promise<PlatformCurrency> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_currency")
    .select(
      "currency_code, currency_name, symbol, country, country_code, flag, locale"
    )
    .eq("id", true)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error("[landing] getLandingCurrency:", error.message)
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
