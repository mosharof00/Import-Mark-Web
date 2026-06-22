"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { formatTaka } from "@/lib/format"
import { cn } from "@/lib/utils"

export type ProfitabilityRow = {
  productId: string
  name: string
  category: string | null
  brand: string | null
  sellPrice: number | null
  avgCost: number | null
  marginPerUnit: number | null
  marginPercent: number | null
  stockAvailable: number | null
}

const columns: ColumnDef<ProfitabilityRow>[] = [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => (
      <Link
        href={`/admin/products/${row.original.productId}`}
        className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.category ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.brand ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "sellPrice",
    header: () => <span className="block text-right">Sell price</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right tabular-nums">
        {row.original.sellPrice !== null
          ? formatTaka(row.original.sellPrice)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "avgCost",
    header: () => <span className="block text-right">Avg cost</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground block text-right tabular-nums">
        {row.original.avgCost !== null ? formatTaka(row.original.avgCost) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "marginPerUnit",
    header: () => <span className="block text-right">Margin / unit</span>,
    cell: ({ row }) => {
      const margin = row.original.marginPerUnit
      if (margin === null) {
        return (
          <span className="text-muted-foreground block text-right">—</span>
        )
      }
      return (
        <span
          className={cn(
            "block text-right font-medium tabular-nums",
            margin >= 0
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          )}
        >
          {formatTaka(margin)}
        </span>
      )
    },
  },
  {
    accessorKey: "marginPercent",
    header: () => <span className="block text-right">Margin %</span>,
    cell: ({ row }) => {
      const pct = row.original.marginPercent
      if (pct === null) {
        return (
          <span className="text-muted-foreground block text-right">—</span>
        )
      }
      return (
        <span
          className={cn(
            "block text-right font-medium tabular-nums",
            pct >= 0
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          )}
        >
          {pct.toFixed(1)}%
        </span>
      )
    },
  },
  {
    accessorKey: "stockAvailable",
    header: () => <span className="block text-right">Stock</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right tabular-nums">
        {row.original.stockAvailable ?? "—"}
      </span>
    ),
  },
]

export function ProfitabilityTable({ data }: { data: ProfitabilityRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search products..."
        pageSize={15}
      />
    </div>
  )
}
