"use client"

import { cn } from "@/lib/utils"
import {
  STOCK_RESERVE_OPTIONS,
  type StockReserveOn,
} from "@/lib/settings/keys"

export function StockReserveForm({
  value,
  onChange,
}: {
  value: StockReserveOn
  onChange: (v: StockReserveOn) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Choose when available stock is deducted for a sales order.
      </p>
      <div className="space-y-2">
        {STOCK_RESERVE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "border-border flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
              value === option.value
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/40"
            )}
          >
            <input
              type="radio"
              name="stock_reserve_on"
              className="mt-1"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <div>
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-muted-foreground text-xs">
                {option.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
