"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime, formatTaka } from "@/lib/format"
import type { UserStatus } from "@/types"

export type SupplierRow = {
  id: string
  name: string
  country: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  shipmentCount: number
  totalPurchased: number
  totalDue: number
  isActive: boolean
  createdAt: string
}

function supplierStatus(isActive: boolean): UserStatus {
  return isActive ? "active" : "inactive"
}

const columns: ColumnDef<SupplierRow>[] = [
  {
    accessorKey: "name",
    header: "Supplier",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/suppliers/${row.original.id}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
        <p className="text-muted-foreground text-xs">{row.original.country}</p>
      </div>
    ),
  },
  {
    accessorKey: "contactPerson",
    header: "Contact person",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.contactPerson ?? "—"}
      </span>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.email ? (
          <p className="text-foreground">{row.original.email}</p>
        ) : null}
        {row.original.phone ? (
          <p className="text-muted-foreground text-xs">{row.original.phone}</p>
        ) : null}
        {!row.original.email && !row.original.phone ? (
          <span className="text-muted-foreground">—</span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "shipmentCount",
    header: () => <span className="block text-center">Shipments</span>,
    cell: ({ row }) => (
      <span className="text-foreground block text-center tabular-nums">
        {row.original.shipmentCount}
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
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        kind="user"
        value={supplierStatus(row.original.isActive)}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Added",
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
          href={`/admin/suppliers/${row.original.id}`}
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

export function SuppliersTable({ data }: { data: SupplierRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search suppliers..."
        pageSize={12}
      />
    </div>
  )
}
