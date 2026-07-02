"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { UserRole } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"

export function ProductOrderCta({
  inStock,
  canPlaceOrders,
  showRegistration,
  isLoggedIn,
  role,
  orderPath,
  loginNext,
  dashboardHref,
}: {
  inStock: boolean
  canPlaceOrders: boolean
  showRegistration: boolean
  isLoggedIn: boolean
  role: UserRole | null
  orderPath: string
  loginNext: string
  dashboardHref: string
}) {
  if (!canPlaceOrders) {
    return (
      <p className="text-muted-foreground text-sm">
        Online ordering is currently unavailable. Please contact us for a quote.
      </p>
    )
  }

  if (!inStock) {
    return (
      <p className="text-muted-foreground text-sm">
        This product is out of stock. Check back soon or contact us.
      </p>
    )
  }

  if (isLoggedIn && role === "customer") {
    return (
      <Link
        href={orderPath}
        className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6")}
      >
        <ShoppingCart className="size-4" />
        Place order
      </Link>
    )
  }

  if (isLoggedIn && role !== "customer") {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          You are signed in as {role}. Customer accounts can place orders from
          the catalog.
        </p>
        <Link href={dashboardHref} className={buttonVariants({ variant: "outline" })}>
          Go to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/login?next=${loginNext}`}
        className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6")}
      >
        <ShoppingCart className="size-4" />
        Sign in to order
      </Link>
      {showRegistration ? (
        <Link
          href={`/signup?next=${loginNext}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-full px-6"
          )}
        >
          Create account
        </Link>
      ) : null}
    </div>
  )
}
