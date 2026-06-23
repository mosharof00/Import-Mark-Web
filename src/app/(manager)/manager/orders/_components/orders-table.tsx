"use client"

import { type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { formatDate, formatTaka } from "@/lib/format"
import type { DeliveryMethod, OrderStatus } from "@/types"

export type OrderRow = {
  id: string
  orderNumber: string | null
  customerName: string
  companyName: string | null
  totalAmount: number
  paidAmount: number
  dueAmount: number
  status: OrderStatus
  deliveryMethod: DeliveryMethod
  createdAt: string
}

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  own_team: "Own delivery",
  customer_pickup: "Pickup",
}

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <span className="text-foreground font-medium">
        {row.original.orderNumber ?? "—"}
      </span>
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
    accessorKey: "deliveryMethod",
    header: "Delivery",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {DELIVERY_LABEL[row.original.deliveryMethod]}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
]

export function OrdersTable({ data }: { data: OrderRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search my orders..."
        pageSize={12}
        getRowHref={(row) => `/manager/orders/${row.id}`}
      />
    </div>
  )
}
