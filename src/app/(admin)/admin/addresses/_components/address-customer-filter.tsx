"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

export type CustomerFilterOption = {
  id: string
  label: string
}

const selectClassName = cn(
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 min-w-[220px] rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] dark:bg-input/30"
)

export function AddressCustomerFilter({
  customers,
}: {
  customers: CustomerFilterOption[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCustomerId = searchParams.get("customer") ?? "all"

  function onChange(customerId: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (customerId === "all") params.delete("customer")
    else params.set("customer", customerId)
    const href = params.size ? `${pathname}?${params}` : pathname
    router.push(href)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="address-customer-filter" className="text-muted-foreground text-sm">
        Filter by customer
      </label>
      <select
        id="address-customer-filter"
        value={activeCustomerId}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
      >
        <option value="all">All customers</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.label}
          </option>
        ))}
      </select>
    </div>
  )
}
