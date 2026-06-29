"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import type { PaymentMode } from "@/types"

const PAYMENT_LABEL: Record<PaymentMode, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  mobile_banking: "Mobile banking",
  other: "Other",
}

export type PaymentRow = {
  id: string
  amount: number
  paymentMode: PaymentMode
  paymentDate: string
  referenceNo: string | null
  notes: string | null
  createdAt: string
  orderId: string
  orderNumber: string | null
  customerName: string
  companyName: string | null
}

const columns: ColumnDef<PaymentRow>[] = [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/manager/orders/${row.original.orderId}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.orderNumber ?? "—"}
        </Link>
        <p className="text-muted-foreground text-xs">
          {formatRelativeTime(row.original.createdAt)}
        </p>
      </div>
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
    accessorKey: "paymentDate",
    header: "Paid on",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(row.original.paymentDate)}
      </span>
    ),
  },
  {
    accessorKey: "paymentMode",
    header: "Mode",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {PAYMENT_LABEL[row.original.paymentMode]}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <span className="block text-right">Amount</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right font-medium tabular-nums">
        {formatTaka(row.original.amount)}
      </span>
    ),
  },
  {
    id: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.referenceNo ?? row.original.notes ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link
          href={`/manager/orders/${row.original.orderId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          View order
        </Link>
      </div>
    ),
  },
]

export function PaymentsTable({ data }: { data: PaymentRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search payments..."
        pageSize={12}
      />
    </div>
  )
}
