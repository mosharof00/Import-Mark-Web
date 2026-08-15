import { computeImportTotals } from "@/lib/imports/landed-cost"
import { formatDate, formatTaka } from "@/lib/format"

import type { ImportCartItem, ImportSupplier } from "./types"

export function StepReview({
  supplier,
  cart,
  invoiceNumber,
  lcNumber,
  blNumber,
  shipmentDate,
  currency,
  exchangeRate,
  freightCost,
  customDuty,
  portCharges,
  otherCharges,
  notes,
}: {
  supplier: ImportSupplier
  cart: ImportCartItem[]
  invoiceNumber: string
  lcNumber: string
  blNumber: string
  shipmentDate: string
  currency: string
  exchangeRate: number
  freightCost: number
  customDuty: number
  portCharges: number
  otherCharges: number
  notes: string
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
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Supplier
          </h3>
          <p className="font-semibold">{supplier.name}</p>
          <p className="text-muted-foreground text-sm">{supplier.country}</p>
        </section>
        <section>
          <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            Documents
          </h3>
          <p className="text-sm">Shipped {formatDate(shipmentDate)}</p>
          <p className="text-muted-foreground text-sm">
            Invoice {invoiceNumber || "—"} · BL {blNumber || "—"} · LC{" "}
            {lcNumber || "—"}
          </p>
        </section>
      </div>

      <section>
        <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
          Line items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Unit cost</th>
                <th className="py-2 font-medium">Batch</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.key} className="border-border border-t">
                  <td className="py-2.5 font-medium">{item.name}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {currency}{" "}
                    {item.costPerUnitForeign.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-muted-foreground py-2.5">
                    {item.batchNumber || "—"}
                    {item.expiryDate ? ` · exp ${item.expiryDate}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-border rounded-xl border p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">
              Invoice {currency}{" "}
              {totals.totalInvoiceCost.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}{" "}
              at {exchangeRate} → {formatTaka(totals.totalInvoiceBdt)}
            </p>
            <p className="text-muted-foreground text-sm">
              Charges {formatTaka(totals.chargesTotal)}
            </p>
          </div>
          <p className="text-xl font-semibold tabular-nums">
            {formatTaka(totals.totalLandedCost)}
          </p>
        </div>
      </section>

      {notes.trim() ? (
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {notes}
        </p>
      ) : null}

      <p className="text-muted-foreground text-xs">
        The shipment will be recorded as <strong>in transit</strong>. Stock is
        added only after you mark it cleared.
      </p>
    </div>
  )
}
