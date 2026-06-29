"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"

export type AddressRow = {
  id: string
  label: string
  recipientName: string
  city: string
  country: string
  isDefault: boolean
  createdAt: string
}

const BASE_PATH = "/customer/addresses"

const columns: ColumnDef<AddressRow>[] = [
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => (
      <Link
        href={`${BASE_PATH}/${row.original.id}`}
        className="text-foreground hover:text-muted-foreground font-medium underline-offset-4 hover:underline"
      >
        {row.original.label}
      </Link>
    ),
  },
  {
    accessorKey: "recipientName",
    header: "Recipient",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.recipientName}</span>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.city}</span>
    ),
  },
  {
    id: "default",
    header: "Default",
    cell: ({ row }) =>
      row.original.isDefault ? (
        <Badge
          variant="secondary"
          className="border-0 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          Default
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
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
          href={`${BASE_PATH}/${row.original.id}/edit`}
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

export function AddressesTable({ data }: { data: AddressRow[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm md:p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search addresses..."
        pageSize={12}
        getRowHref={(row) => `${BASE_PATH}/${row.id}`}
      />
    </div>
  )
}
