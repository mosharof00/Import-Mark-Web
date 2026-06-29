"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatRelativeTime, formatTaka } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ShipmentStatus } from "@/types"

export type ImportRow = {
  id: string
  shipmentRef: string | null
  supplierName: string
  supplierId: string
  itemCount: number
  landedCost: number
  currency: string
  status: ShipmentStatus
  shipmentDate: string | null
  arrivalDate: string | null
  createdAt: string
}

const columns: ColumnDef<ImportRow>[] = [
  {
    accessorKey: "shipmentRef",
    header: "Shipment",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/manager/imports/${row.original.id}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.shipmentRef ?? "—"}
        </Link>
        <p className="text-muted-foreground text-xs">
          {formatRelativeTime(row.original.createdAt)}
        </p>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "Supplier",
    cell: ({ row }) => (
      <Link
        href={`/manager/suppliers/${row.original.supplierId}`}
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        {row.original.supplierName}
      </Link>
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
    accessorKey: "landedCost",
    header: () => <span className="block text-right">Landed cost</span>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        <span className="text-foreground font-medium">
          {formatTaka(row.original.landedCost)}
        </span>
        <span className="text-muted-foreground text-xs">
          {" "}
          · {row.original.currency}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge kind="shipment" value={row.original.status} />
    ),
  },
  {
    id: "dates",
    header: "Timeline",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {row.original.shipmentDate ? (
          <p>Shipped {formatDate(row.original.shipmentDate)}</p>
        ) : null}
        {row.original.arrivalDate ? (
          <p className="text-xs">Arrived {formatDate(row.original.arrivalDate)}</p>
        ) : !row.original.shipmentDate ? (
          <span>—</span>
        ) : null}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="block text-right">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link
          href={`/manager/imports/${row.original.id}`}
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

export function ImportsTable({ data }: { data: ImportRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search imports..."
        pageSize={12}
      />
    </div>
  )
}
