"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { ImportCartItem, ImportCategory, ImportProduct } from "./types"
import type { StepFieldErrors } from "./wizard-validation"

const selectClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] dark:bg-input/30"

export function StepImportProducts({
  products,
  categories,
  cart,
  currency,
  onCartChange,
  errors,
}: {
  products: ImportProduct[]
  categories: ImportCategory[]
  cart: ImportCartItem[]
  currency: string
  onCartChange: (cart: ImportCartItem[]) => void
  errors?: StepFieldErrors
}) {
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false) ||
        (p.brandName?.toLowerCase().includes(q) ?? false) ||
        p.categoryName.toLowerCase().includes(q)
      )
    })
  }, [products, query, categoryId])

  const invoiceForeign = cart.reduce(
    (sum, item) => sum + item.quantity * item.costPerUnitForeign,
    0
  )

  function addProduct(product: ImportProduct) {
    const existing = cart.find(
      (c) => c.productId === product.id && c.batchNumber.trim() === ""
    )
    if (existing) {
      onCartChange(
        cart.map((c) =>
          c.key === existing.key ? { ...c, quantity: c.quantity + 1 } : c
        )
      )
      return
    }
    onCartChange([
      ...cart,
      {
        key: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        unit: product.unit,
        quantity: 1,
        costPerUnitForeign: 0,
        batchNumber: "",
        expiryDate: "",
      },
    ])
  }

  function updateItem(key: string, patch: Partial<ImportCartItem>) {
    onCartChange(cart.map((c) => (c.key === key ? { ...c, ...patch } : c)))
  }

  function removeItem(key: string) {
    onCartChange(cart.filter((c) => c.key !== key))
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-[3] space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={cn(selectClassName, "sm:w-48")}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="border-border rounded-2xl border p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground font-medium">{product.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {[product.brandName, product.categoryName, product.sku]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => addProduct(product)}
                >
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">{product.unit}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-border min-w-0 flex-[2] rounded-2xl border p-4 shadow-sm lg:sticky lg:top-4 lg:self-start">
        <h3 className="text-foreground mb-1 font-semibold">Shipment lines</h3>
        {errors?.cart ? (
          <p className="text-destructive mb-4 text-sm">{errors.cart}</p>
        ) : (
          <p className="text-muted-foreground mb-4 text-xs">
            Quantity and unit cost are required for each line.
          </p>
        )}
        {cart.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add products that arrived (or will arrive) in this container.
          </p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.key}
                className="border-border border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground text-sm font-medium">
                    {item.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground text-xs">
                      Qty <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0.001}
                      step="0.001"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.key, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                      aria-invalid={Boolean(errors?.lines?.[item.key]?.quantity)}
                      className="mt-1 tabular-nums"
                    />
                    {errors?.lines?.[item.key]?.quantity ? (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.lines[item.key].quantity}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">
                      Unit cost ({currency}){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.costPerUnitForeign || ""}
                      onChange={(e) =>
                        updateItem(item.key, {
                          costPerUnitForeign: Number(e.target.value) || 0,
                        })
                      }
                      aria-invalid={Boolean(errors?.lines?.[item.key]?.cost)}
                      className="mt-1 tabular-nums"
                    />
                    {errors?.lines?.[item.key]?.cost ? (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.lines[item.key].cost}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">
                      Batch
                    </label>
                    <Input
                      value={item.batchNumber}
                      onChange={(e) =>
                        updateItem(item.key, { batchNumber: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">
                      Expiry
                    </label>
                    <Input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) =>
                        updateItem(item.key, { expiryDate: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-muted-foreground mt-2 text-right text-xs tabular-nums">
                  Line: {currency}{" "}
                  {(item.quantity * item.costPerUnitForeign).toLocaleString(
                    "en-IN",
                    { maximumFractionDigits: 2 }
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-sm">Invoice total</span>
          <span className="text-foreground text-lg font-semibold tabular-nums">
            {currency}{" "}
            {invoiceForeign.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
