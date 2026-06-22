"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { formatTaka } from "@/lib/format"
import type { ProductStatus } from "@/types"

export type ProductRow = {
  id: string
  name: string
  sku: string | null
  categoryName: string
  brandName: string | null
  sellPrice: number
  unit: string
  status: ProductStatus
  stockQty: number | null
  lowStockThreshold: number | null
}

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/products/${row.original.id}`}
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
    header: () => <span className="block text-right">Sell price</span>,
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
    id: "stock",
    header: () => <span className="block text-right">Stock</span>,
    cell: ({ row }) => {
      const qty = row.original.stockQty
      const threshold = row.original.lowStockThreshold
      const isLow =
        qty !== null && threshold !== null && qty <= threshold

      if (qty === null) {
        return (
          <span className="text-muted-foreground block text-right">—</span>
        )
      }

      return (
        <span
          className={
            isLow
              ? "block text-right font-medium text-red-700 tabular-nums dark:text-red-400"
              : "text-foreground block text-right tabular-nums"
          }
        >
          {qty}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge kind="product" value={row.original.status} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/admin/products/${row.original.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          View
        </Link>
        <Link
          href={`/admin/products/${row.original.id}/edit`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          Edit
        </Link>
        {row.original.status === "pending_approval" ? (
          <Link
            href="/admin/approvals?tab=products"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full px-4"
            )}
          >
            Review
          </Link>
        ) : null}
      </div>
    ),
  },
]

export function ProductsTable({ data }: { data: ProductRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search products..."
        pageSize={12}
      />
    </div>
  )
}
