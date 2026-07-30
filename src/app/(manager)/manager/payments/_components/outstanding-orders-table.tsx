"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  RecordPaymentDialog,
  type GatewayOption,
  type RecordPaymentOrder,
} from "@/components/shared/payments/record-payment-dialog"
import { cn } from "@/lib/utils"
import { formatTaka } from "@/lib/format"
import type { OrderStatus } from "@/types"

export type OutstandingOrderRow = {
  id: string
  orderNumber: string | null
  customerName: string
  companyName: string | null
  totalAmount: number
  paidAmount: number
  dueAmount: number
  status: OrderStatus
}

function buildColumns(
  orderHrefBase: string,
  gateways: GatewayOption[]
): ColumnDef<OutstandingOrderRow>[] {
  return [
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => (
        <Link
          href={`${orderHrefBase}/${row.original.id}`}
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
        <span className="block text-right font-medium tabular-nums text-red-700 dark:text-red-400">
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
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => {
        const order: RecordPaymentOrder = {
          orderId: row.original.id,
          orderNumber: row.original.orderNumber,
          customerName: row.original.customerName,
          dueAmount: row.original.dueAmount,
        }

        return (
          <div className="flex justify-end gap-2">
            <Link
              href={`${orderHrefBase}/${row.original.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full px-4"
              )}
            >
              View
            </Link>
            <RecordPaymentDialog order={order} gateways={gateways} />
          </div>
        )
      },
    },
  ]
}

export function OutstandingOrdersTable({
  data,
  orderHrefBase = "/manager/orders",
  gateways = [],
}: {
  data: OutstandingOrderRow[]
  orderHrefBase?: string
  gateways?: GatewayOption[]
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={buildColumns(orderHrefBase, gateways)}
        data={data}
        searchPlaceholder="Search outstanding orders..."
        pageSize={12}
      />
    </div>
  )
}
