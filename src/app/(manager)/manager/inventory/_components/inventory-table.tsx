"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"
import { SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import {
  adjustStock,
  updateStockThreshold,
} from "@/app/(manager)/manager/inventory/actions"
import type { StockHealth } from "@/app/(admin)/admin/inventory/_components/inventory-filters"

export type InventoryRow = {
  productId: string
  name: string
  sku: string | null
  categoryName: string
  brandName: string | null
  quantity: number
  threshold: number
  health: StockHealth
  lastUpdated: string
}

const HEALTH_CONFIG: Record<
  StockHealth,
  { label: string; className: string }
> = {
  healthy: {
    label: "Healthy",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  low_stock: {
    label: "Low stock",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  out_of_stock: {
    label: "Out of stock",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
}

function AdjustStockDialog({ row }: { row: InventoryRow }) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(String(row.quantity))
  const [threshold, setThreshold] = useState(String(row.threshold))
  const [note, setNote] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const newQty = Number(quantity)
    const newThreshold = Number(threshold)

    if (!note.trim()) {
      toast.error("A note is required for stock adjustments.")
      return
    }

    startTransition(async () => {
      const qtyResult = await adjustStock(row.productId, newQty, note.trim())
      if (qtyResult?.error) {
        toast.error(qtyResult.error)
        return
      }

      if (newThreshold !== row.threshold) {
        const thresholdResult = await updateStockThreshold(
          row.productId,
          newThreshold
        )
        if (thresholdResult?.error) {
          toast.error(thresholdResult.error)
          return
        }
      }

      toast.success("Stock updated.")
      setOpen(false)
      setNote("")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4"
          >
            <SlidersHorizontal className="size-3.5" />
            Adjust
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            Update quantity for {row.name}. Changes are logged in stock
            movements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="quantity">
              New quantity
            </label>
            <Input
              id="quantity"
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Current: {row.quantity} {row.quantity === 1 ? "unit" : "units"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="threshold">
              Low-stock threshold
            </label>
            <Input
              id="threshold"
              type="number"
              min={0}
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="note">
              Reason / note
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Physical count correction, damaged units written off..."
              className={cn(
                "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="ghost"
                className="rounded-full px-5"
                disabled={isPending}
              >
                Cancel
              </Button>
            }
          />
          <Button
            onClick={handleSave}
            disabled={isPending || !note.trim()}
            className="rounded-full px-5"
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const columns: ColumnDef<InventoryRow>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/manager/products/${row.original.productId}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
        <p className="text-muted-foreground text-xs">
          {row.original.sku ?? "No SKU"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.categoryName}</span>
    ),
  },
  {
    accessorKey: "brandName",
    header: "Brand",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.brandName ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    header: () => <span className="block text-right">Available</span>,
    cell: ({ row }) => (
      <span
        className={cn(
          "block text-right text-lg font-semibold tabular-nums",
          row.original.health === "out_of_stock"
            ? "text-red-700 dark:text-red-400"
            : row.original.health === "low_stock"
              ? "text-amber-700 dark:text-amber-400"
              : "text-foreground"
        )}
      >
        {row.original.quantity}
      </span>
    ),
  },
  {
    accessorKey: "threshold",
    header: () => <span className="block text-right">Threshold</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground block text-right tabular-nums">
        {row.original.threshold}
      </span>
    ),
  },
  {
    accessorKey: "health",
    header: "Status",
    cell: ({ row }) => {
      const config = HEALTH_CONFIG[row.original.health]
      return (
        <Badge variant="secondary" className={cn("border-0", config.className)}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(row.original.lastUpdated)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/manager/products/${row.original.productId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          View
        </Link>
        <AdjustStockDialog key={row.original.productId} row={row.original} />
      </div>
    ),
  },
]

export function InventoryTable({ data }: { data: InventoryRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search inventory..."
        pageSize={12}
      />
    </div>
  )
}
