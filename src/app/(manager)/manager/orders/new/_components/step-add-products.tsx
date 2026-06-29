"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatTaka } from "@/lib/format"

import type { CartItem, CategoryOption, WizardProduct } from "./types"

export function StepAddProducts({
  products,
  categories,
  cart,
  onCartChange,
  readOnlyPrice = false,
}: {
  products: WizardProduct[]
  categories: CategoryOption[]
  cart: CartItem[]
  onCartChange: (cart: CartItem[]) => void
  readOnlyPrice?: boolean
}) {
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState<string>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brandName?.toLowerCase().includes(q) ?? false) ||
        p.categoryName.toLowerCase().includes(q)
      )
    })
  }, [products, query, categoryId])

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  function addProduct(product: WizardProduct) {
    if (product.stockAvailable <= 0) return
    const existing = cart.find((c) => c.productId === product.id)
    if (existing) {
      if (existing.quantity >= product.stockAvailable) return
      onCartChange(
        cart.map((c) =>
          c.productId === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      )
    } else {
      onCartChange([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          stockAvailable: product.stockAvailable,
          avgCost: product.avgCost,
          quantity: 1,
          unitPrice: product.sellPrice,
        },
      ])
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    onCartChange(
      cart.map((c) => {
        if (c.productId !== productId) return c
        const qty = Math.max(1, Math.min(quantity, c.stockAvailable))
        return { ...c, quantity: qty }
      })
    )
  }

  function updateUnitPrice(productId: string, unitPrice: number) {
    onCartChange(
      cart.map((c) =>
        c.productId === productId
          ? { ...c, unitPrice: Math.max(0, unitPrice) }
          : c
      )
    )
  }

  function removeItem(productId: string) {
    onCartChange(cart.filter((c) => c.productId !== productId))
  }

  const selectClassName = cn(
    "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] dark:bg-input/30"
  )

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
          {filtered.map((product) => {
            const outOfStock = product.stockAvailable <= 0
            return (
              <div
                key={product.id}
                className={cn(
                  "border-border bg-card rounded-2xl border p-4 shadow-sm",
                  outOfStock && "opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground font-medium">{product.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {[product.brandName, product.categoryName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {outOfStock ? (
                    <Badge variant="outline" className="shrink-0 text-red-700">
                      Out of Stock
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-foreground font-semibold tabular-nums">
                      {formatTaka(product.sellPrice)}
                      <span className="text-muted-foreground ml-1 text-xs font-normal">
                        / {product.unit}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {outOfStock
                        ? "Out of stock"
                        : `${product.stockAvailable} units available`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={outOfStock}
                    onClick={() => addProduct(product)}
                  >
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-border bg-card min-w-0 flex-[2] rounded-2xl border p-4 shadow-sm lg:sticky lg:top-4 lg:self-start">
        <h3 className="text-foreground mb-4 font-semibold">Cart</h3>
        {cart.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add products from the catalog to build this order.
          </p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => {
              const lineTotal = item.quantity * item.unitPrice
              const belowCost =
                item.avgCost !== null && item.unitPrice < item.avgCost
              return (
                <li
                  key={item.productId}
                  className="border-border border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground text-sm font-medium">
                      {item.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-muted-foreground text-xs">
                        Qty
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={item.stockAvailable}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            Number(e.target.value) || 1
                          )
                        }
                        className="mt-1 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs">
                        Unit price
                      </label>
                      {readOnlyPrice ? (
                        <p className="text-foreground mt-1 text-sm font-medium tabular-nums">
                          {formatTaka(item.unitPrice)}
                        </p>
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateUnitPrice(
                              item.productId,
                              Number(e.target.value) || 0
                            )
                          }
                          className="mt-1 tabular-nums"
                        />
                      )}
                    </div>
                  </div>
                  {!readOnlyPrice && belowCost ? (
                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      Price is below average cost
                    </p>
                  ) : null}
                  <p className="text-foreground mt-2 text-right text-sm font-medium tabular-nums">
                    {formatTaka(lineTotal)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
        <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-sm">Subtotal</span>
          <span className="text-foreground text-lg font-semibold tabular-nums">
            {formatTaka(subtotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
