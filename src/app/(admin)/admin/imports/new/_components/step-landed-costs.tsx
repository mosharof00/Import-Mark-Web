"use client"

import { Input } from "@/components/ui/input"
import { computeImportTotals } from "@/lib/imports/landed-cost"
import { formatTaka } from "@/lib/format"

import type { ImportCartItem } from "./types"

export function StepLandedCosts({
  cart,
  currency,
  exchangeRate,
  freightCost,
  customDuty,
  portCharges,
  otherCharges,
  onFreightCostChange,
  onCustomDutyChange,
  onPortChargesChange,
  onOtherChargesChange,
}: {
  cart: ImportCartItem[]
  currency: string
  exchangeRate: number
  freightCost: number
  customDuty: number
  portCharges: number
  otherCharges: number
  onFreightCostChange: (value: number) => void
  onCustomDutyChange: (value: number) => void
  onPortChargesChange: (value: number) => void
  onOtherChargesChange: (value: number) => void
}) {
  const totals = computeImportTotals({
    items: cart,
    exchangeRate,
    freightCost,
    customDuty,
    portCharges,
    otherCharges,
  })

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-foreground font-semibold">Local charges (BDT)</h3>
        <p className="text-muted-foreground text-sm">
          Invoice value is converted at the shipment exchange rate. Add freight,
          customs, and port costs to get the landed cost.
        </p>
        <MoneyField
          label="Freight"
          value={freightCost}
          onChange={onFreightCostChange}
        />
        <MoneyField
          label="Customs duty"
          value={customDuty}
          onChange={onCustomDutyChange}
        />
        <MoneyField
          label="Port charges"
          value={portCharges}
          onChange={onPortChargesChange}
        />
        <MoneyField
          label="Other charges"
          value={otherCharges}
          onChange={onOtherChargesChange}
        />
      </div>

      <div className="border-border h-fit rounded-2xl border p-5 shadow-sm">
        <h3 className="text-foreground mb-4 font-semibold">Cost preview</h3>
        <dl className="space-y-3 text-sm">
          <Row
            label={`Invoice (${currency})`}
            value={`${currency} ${totals.totalInvoiceCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          />
          <Row label="Exchange rate" value={`${exchangeRate} BDT`} />
          <Row label="Invoice (BDT)" value={formatTaka(totals.totalInvoiceBdt)} />
          <Row label="Charges" value={formatTaka(totals.chargesTotal)} />
          <div className="border-border flex items-center justify-between border-t pt-3">
            <dt className="font-medium">Landed cost</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {formatTaka(totals.totalLandedCost)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <Input
        type="number"
        min={0}
        step="0.01"
        value={value || ""}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
        className="tabular-nums"
      />
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
