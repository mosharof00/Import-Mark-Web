"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Building2, Search } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { IMPORT_CURRENCIES } from "@/lib/imports/status-flow"
import { cn } from "@/lib/utils"

import type { ImportSupplier } from "./types"
import type { StepFieldErrors } from "./wizard-validation"

const selectClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] dark:bg-input/30"

export function StepSupplierDocs({
  suppliers,
  supplierId,
  invoiceNumber,
  lcNumber,
  blNumber,
  shipmentDate,
  currency,
  exchangeRate,
  notes,
  onSupplierIdChange,
  onInvoiceNumberChange,
  onLcNumberChange,
  onBlNumberChange,
  onShipmentDateChange,
  onCurrencyChange,
  onExchangeRateChange,
  onNotesChange,
  errors,
}: {
  suppliers: ImportSupplier[]
  supplierId: string | null
  invoiceNumber: string
  lcNumber: string
  blNumber: string
  shipmentDate: string
  currency: string
  exchangeRate: number
  notes: string
  onSupplierIdChange: (id: string) => void
  onInvoiceNumberChange: (value: string) => void
  onLcNumberChange: (value: string) => void
  onBlNumberChange: (value: string) => void
  onShipmentDateChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onExchangeRateChange: (value: number) => void
  onNotesChange: (value: string) => void
  errors?: StepFieldErrors
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        (s.contactPerson?.toLowerCase().includes(q) ?? false)
    )
  }, [suppliers, query])

  if (suppliers.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No active suppliers"
        description="Add a supplier before recording an import shipment."
        action={
          <Link
            href="/admin/suppliers"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}
          >
            View suppliers
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-foreground font-semibold">
          Select supplier <span className="text-destructive">*</span>
        </h3>
        {errors?.supplierId ? (
          <p className="text-destructive text-sm">{errors.supplierId}</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Required before you can add products.
          </p>
        )}
        <div className="relative max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suppliers..."
            className="pl-9"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No suppliers match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((supplier) => {
              const selected = supplier.id === supplierId
              return (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onSupplierIdChange(supplier.id)}
                  className={cn(
                    "border-border rounded-2xl border p-4 text-left shadow-sm transition-colors",
                    selected
                      ? "border-primary ring-primary/20 ring-2"
                      : errors?.supplierId
                        ? "border-destructive/50 hover:border-destructive"
                        : "hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <p className="text-foreground font-semibold">{supplier.name}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {supplier.country}
                  </p>
                  {supplier.contactPerson ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {supplier.contactPerson}
                    </p>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Shipment date"
          required
          error={errors?.shipmentDate}
        >
          <Input
            type="date"
            value={shipmentDate}
            onChange={(e) => onShipmentDateChange(e.target.value)}
            aria-invalid={Boolean(errors?.shipmentDate)}
          />
        </Field>
        <Field label="Invoice number">
          <Input
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="BL number">
          <Input
            value={blNumber}
            onChange={(e) => onBlNumberChange(e.target.value)}
            placeholder="Bill of lading"
          />
        </Field>
        <Field label="LC number">
          <Input
            value={lcNumber}
            onChange={(e) => onLcNumberChange(e.target.value)}
            placeholder="Letter of credit"
          />
        </Field>
        <Field label="Currency" required>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className={selectClassName}
          >
            {IMPORT_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={`Exchange rate to BDT (1 ${currency})`}
          required
          error={errors?.exchangeRate}
        >
          <Input
            type="number"
            min={0}
            step="0.0001"
            value={exchangeRate || ""}
            onChange={(e) =>
              onExchangeRateChange(Number.parseFloat(e.target.value) || 0)
            }
            aria-invalid={Boolean(errors?.exchangeRate)}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Optional shipment notes…"
          className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
        />
      </Field>
    </div>
  )
}

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </label>
  )
}
