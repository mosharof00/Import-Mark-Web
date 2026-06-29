"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Users } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatTaka } from "@/lib/format"

import type { WizardCustomer } from "./types"

export function StepSelectCustomer({
  customers,
  selectedId,
  onSelect,
}: {
  customers: WizardCustomer[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        (c.companyName?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.toLowerCase().includes(q) ?? false)
    )
  }, [customers, query])

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No active customers"
        description="You need at least one active customer before placing an order."
        action={
          <Link
            href="/manager/customers"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}
          >
            View customers
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company, or phone..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No customers match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((customer) => {
            const selected = customer.id === selectedId
            return (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer.id)}
                className={cn(
                  "border-border bg-card rounded-2xl border p-4 text-left shadow-sm transition-colors",
                  selected
                    ? "border-primary ring-primary/20 ring-2"
                    : "hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <p className="text-foreground font-semibold">
                  {customer.companyName ?? customer.fullName}
                </p>
                {customer.companyName ? (
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {customer.fullName}
                  </p>
                ) : null}
                <div className="text-muted-foreground mt-3 space-y-1 text-sm">
                  {customer.phone ? <p>{customer.phone}</p> : null}
                  {customer.city ? <p>{customer.city}</p> : null}
                </div>
                <p
                  className={cn(
                    "mt-3 text-sm font-medium tabular-nums",
                    customer.totalDue > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  Due: {formatTaka(customer.totalDue)}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
