"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime, formatTaka } from "@/lib/format"
import type { OrderStatus } from "@/types"

export type OrderRow = {
  id: string
  orderNumber: string | null
  customerName: string
  companyName: string | null
  itemCount: number
  totalAmount: number
  paidAmount: number
  dueAmount: number
  status: OrderStatus
  createdByName: string
  createdAt: string
}

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
      >
        {row.original.orderNumber ?? "—"}
      </Link>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="text-foreground font-medium">
          {row.original.customerName}
        </p>
        {row.original.companyName ? (
          <p className="text-muted-foreground text-xs">
            {row.original.companyName}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "itemCount",
    header: () => <span className="block text-center">Items</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-center tabular-nums">
        {row.original.itemCount}
      </span>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: () => <span className="block text-right">Total</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right tabular-nums">
        {formatTaka(row.original.totalAmount)}
      </span>
    ),
  },
  {
    accessorKey: "paidAmount",
    header: () => <span className="block text-right">Paid</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground block text-right tabular-nums">
        {formatTaka(row.original.paidAmount)}
      </span>
    ),
  },
  {
    accessorKey: "dueAmount",
    header: () => <span className="block text-right">Due</span>,
    cell: ({ row }) => (
      <span
        className={cn(
          "block text-right font-medium tabular-nums",
          row.original.dueAmount > 0
            ? "text-red-700 dark:text-red-400"
            : "text-muted-foreground"
        )}
      >
        {formatTaka(row.original.dueAmount)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge kind="order" value={row.original.status} />
    ),
  },
  {
    accessorKey: "createdByName",
    header: "Created by",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {row.original.createdByName}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/admin/orders/${row.original.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          View
        </Link>
        {row.original.status === "pending_approval" ? (
          <Link
            href="/admin/approvals?tab=orders"
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

export function OrdersTable({ data }: { data: OrderRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search orders..."
        pageSize={12}
      />
    </div>
  )
}
