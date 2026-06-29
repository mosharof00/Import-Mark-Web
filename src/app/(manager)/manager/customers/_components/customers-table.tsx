"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime, formatTaka } from "@/lib/format"
import type { UserStatus } from "@/types"

export type CustomerRow = {
  id: string
  fullName: string
  companyName: string | null
  email: string
  phone: string | null
  location: string | null
  orderCount: number
  totalBilled: number
  totalDue: number
  status: UserStatus
  createdAt: string
}

const columns: ColumnDef<CustomerRow>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/manager/customers/${row.original.id}`}
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
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm">
        <p className="text-foreground">{row.original.email}</p>
        {row.original.phone ? (
          <p className="text-muted-foreground text-xs">{row.original.phone}</p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.location ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "orderCount",
    header: () => <span className="block text-center">My orders</span>,
    cell: ({ row }) => (
      <span
        className={cn(
          "block text-center tabular-nums",
          row.original.orderCount > 0
            ? "text-foreground font-medium"
            : "text-muted-foreground"
        )}
      >
        {row.original.orderCount}
      </span>
    ),
  },
  {
    accessorKey: "totalBilled",
    header: () => <span className="block text-right">Billed</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-right tabular-nums">
        {row.original.totalBilled > 0
          ? formatTaka(row.original.totalBilled)
          : "—"}
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
        {row.original.totalDue > 0
          ? formatTaka(row.original.totalDue)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge kind="user" value={row.original.status} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
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
      <div className="flex justify-end">
        <Link
          href={`/manager/customers/${row.original.id}`}
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

export function CustomersTable({ data }: { data: CustomerRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search customers..."
        pageSize={12}
      />
    </div>
  )
}
