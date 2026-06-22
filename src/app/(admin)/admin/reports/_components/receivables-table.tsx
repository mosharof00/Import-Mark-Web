"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { formatTaka } from "@/lib/format"
import { cn } from "@/lib/utils"

export type ReceivableRow = {
  customerId: string
  fullName: string
  companyName: string | null
  totalOrders: number
  totalBilled: number
  totalPaid: number
  totalDue: number
}

const columns: ColumnDef<ReceivableRow>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/customers/${row.original.customerId}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.fullName}
        </Link>
        {row.original.companyName ? (
          <p className="text-muted-foreground text-xs">
            {row.original.companyName}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "totalOrders",
    header: () => <span className="block text-center">Orders</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-center tabular-nums">
        {row.original.totalOrders}
      </span>
    ),
  },
  {
    accessorKey: "totalBilled",
    header: () => <span className="block text-right">Billed</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right tabular-nums">
        {formatTaka(row.original.totalBilled)}
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

export function ReceivablesTable({ data }: { data: ReceivableRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search customers..."
        pageSize={15}
      />
    </div>
  )
}
