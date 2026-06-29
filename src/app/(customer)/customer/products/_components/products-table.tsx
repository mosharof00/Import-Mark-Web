"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { formatTaka } from "@/lib/format"

export type ProductRow = {
  id: string
  name: string
  sku: string | null
  categoryName: string
  brandName: string | null
  sellPrice: number
  unit: string
  stockQty: number | null
}

function buildColumns(showStockQuantity: boolean): ColumnDef<ProductRow>[] {
  return [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/customer/products/${row.original.id}`}
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
    accessorKey: "sellPrice",
    header: () => <span className="block text-right">Price</span>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        <span className="text-foreground font-medium">
          {formatTaka(row.original.sellPrice)}
        </span>
        <span className="text-muted-foreground text-xs">
          {" "}
          / {row.original.unit}
        </span>
      </div>
    ),
  },
  {
    id: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const qty = row.original.stockQty
      if (qty === null) {
        return <span className="text-muted-foreground">—</span>
      }
      if (qty <= 0) {
        return (
          <span className="font-medium text-red-700 dark:text-red-400">
            Out of stock
          </span>
        )
      }
      if (!showStockQuantity) {
        return <span className="text-muted-foreground">In stock</span>
      }
      return (
        <span className="text-muted-foreground">{qty} in stock</span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link
          href={`/customer/products/${row.original.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          View
        </Link>
      </div>
    ),
  },
  ]
}

export function ProductsTable({
  data,
  showStockQuantity = false,
}: {
  data: ProductRow[]
  showStockQuantity?: boolean
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={buildColumns(showStockQuantity)}
        data={data}
        searchPlaceholder="Search products..."
        pageSize={12}
      />
    </div>
  )
}
