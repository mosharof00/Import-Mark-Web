"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PAYMENT_MODE_LABEL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { PaymentGatewayStatus, PaymentMode } from "@/types"

export type GatewayRow = {
  id: string
  name: string
  type: PaymentMode
  status: PaymentGatewayStatus
  accountNumber: string | null
  sortOrder: number
}

export function buildGatewayColumns(basePath: string): ColumnDef<GatewayRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Gateway",
      cell: ({ row }) => (
        <Link
          href={`${basePath}/${row.original.id}`}
          className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {PAYMENT_MODE_LABEL[row.original.type]}
        </span>
      ),
    },
    {
      accessorKey: "accountNumber",
      header: "Account",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {row.original.accountNumber ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: () => <span className="block text-center">Order</span>,
      cell: ({ row }) => (
        <span className="text-foreground block text-center tabular-nums">
          {row.original.sortOrder}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge kind="gateway" value={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`${basePath}/${row.original.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full px-4"
            )}
          >
            Edit
          </Link>
        </div>
      ),
    },
  ]
}

export function GatewaysTable({
  data,
  basePath,
}: {
  data: GatewayRow[]
  basePath: string
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={buildGatewayColumns(basePath)}
        data={data}
        searchPlaceholder="Search gateways..."
        pageSize={12}
        getRowHref={(row) => `${basePath}/${row.id}`}
      />
    </div>
  )
}
