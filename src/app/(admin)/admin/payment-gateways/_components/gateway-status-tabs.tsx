"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

import {
  GATEWAY_FILTER_LABELS,
  type GatewayFilter,
} from "./gateway-filters"

export function GatewayStatusTabs({
  active,
  counts,
}: {
  active: GatewayFilter
  counts: Record<GatewayFilter, number>
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabs: GatewayFilter[] = ["all", "active", "inactive"]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString())
        if (tab === "all") params.delete("status")
        else params.set("status", tab)
        const href = params.size ? `${pathname}?${params}` : pathname

        return (
          <Link
            key={tab}
            href={href}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === tab
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {GATEWAY_FILTER_LABELS[tab]}
            <span className="ml-1.5 tabular-nums opacity-80">
              ({counts[tab]})
            </span>
          </Link>
        )
      })}
    </div>
  )
}
