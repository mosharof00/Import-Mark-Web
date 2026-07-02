"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AppSettings } from "@/lib/settings/keys"
import type { CurrencyInput } from "@/app/(admin)/admin/settings/actions"

import { SettingToggle } from "./setting-toggle"

export function GeneralSettingsForm({
  settings,
  currency,
  onSettingsChange,
  onCurrencyChange,
}: {
  settings: Pick<AppSettings, "public_customer_registration">
  currency: CurrencyInput
  onSettingsChange: (
    v: Pick<AppSettings, "public_customer_registration">
  ) => void
  onCurrencyChange: (v: CurrencyInput) => void
}) {
  return (
    <div className="space-y-8">
      <SettingToggle
        label="Public customer registration"
        description="When disabled, the create-account link is hidden and sign-up is blocked."
        checked={settings.public_customer_registration}
        onCheckedChange={(checked) =>
          onSettingsChange({
            ...settings,
            public_customer_registration: checked,
          })
        }
      />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Platform currency</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency_code">Currency code</Label>
            <Input
              id="currency_code"
              value={currency.currencyCode}
              onChange={(e) =>
                onCurrencyChange({
                  ...currency,
                  currencyCode: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_symbol">Symbol</Label>
            <Input
              id="currency_symbol"
              value={currency.symbol}
              onChange={(e) =>
                onCurrencyChange({ ...currency, symbol: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_name">Currency name</Label>
            <Input
              id="currency_name"
              value={currency.currencyName}
              onChange={(e) =>
                onCurrencyChange({
                  ...currency,
                  currencyName: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale">Number locale</Label>
            <Input
              id="locale"
              value={currency.locale}
              onChange={(e) =>
                onCurrencyChange({ ...currency, locale: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={currency.country}
              onChange={(e) =>
                onCurrencyChange({ ...currency, country: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country_code">Country code</Label>
            <Input
              id="country_code"
              value={currency.countryCode}
              onChange={(e) =>
                onCurrencyChange({
                  ...currency,
                  countryCode: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flag">Flag emoji</Label>
            <Input
              id="flag"
              value={currency.flag}
              onChange={(e) =>
                onCurrencyChange({ ...currency, flag: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
