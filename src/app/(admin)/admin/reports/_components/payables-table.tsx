"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { formatTaka } from "@/lib/format"
import { cn } from "@/lib/utils"

export type PayableRow = {
  supplierId: string
  name: string
  country: string | null
  totalShipments: number
  totalPurchased: number
  totalPaid: number
  totalDue: number
}

const columns: ColumnDef<PayableRow>[] = [
  {
    id: "supplier",
    header: "Supplier",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/suppliers/${row.original.supplierId}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
        {row.original.country ? (
          <p className="text-muted-foreground text-xs">
            {row.original.country}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "totalShipments",
    header: () => <span className="block text-center">Shipments</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-center tabular-nums">
        {row.original.totalShipments}
      </span>
    ),
  },
  {
    accessorKey: "totalPurchased",
    header: () => <span className="block text-right">Purchased</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right tabular-nums">
        {formatTaka(row.original.totalPurchased)}
      </span>
    ),
  },
  {
    accessorKey: "totalPaid",
    header: () => <span className="block text-right">Paid</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground block text-right tabular-nums">
        {formatTaka(row.original.totalPaid)}
      </span>
    ),
  },
  {
    accessorKey: "totalDue",
    header: () => <span className="block text-right">Due</span>,
    cell: ({ row }) => (
      <span
        className={cn(
          "block text-right font-medium tabular-nums",
          row.original.totalDue > 0
            ? "text-red-700 dark:text-red-400"
            : "text-muted-foreground"
        )}
      >
        {formatTaka(row.original.totalDue)}
      </span>
    ),
  },
]

export function PayablesTable({ data }: { data: PayableRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search suppliers..."
        pageSize={15}
      />
    </div>
  )
}
