"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { UserStatus } from "@/types"

export type ManagerRow = {
  id: string
  fullName: string
  email: string
  phone: string | null
  status: UserStatus
  createdAt: string
}

const columns: ColumnDef<ManagerRow>[] = [
  {
    id: "manager",
    header: "Manager",
    cell: ({ row }) => (
      <Link
        href={`/admin/managers/${row.original.id}`}
        className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
      >
        {row.original.fullName}
      </Link>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge kind="user" value={row.original.status} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Added",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
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
          href={`/admin/managers/${row.original.id}`}
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

export function ManagersTable({ data }: { data: ManagerRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search managers..."
        pageSize={12}
      />
    </div>
  )
}
