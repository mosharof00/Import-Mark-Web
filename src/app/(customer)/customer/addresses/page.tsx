import Link from "next/link"
import { Suspense } from "react"

import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AddressStats } from "./_components/address-stats"
import { AddressList } from "./_components/address-list"
import {
  AddressStatsSkeleton,
  AddressListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

export default async function CustomerAddressesPage() {
  const { user } = await getAuthedUser()

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Addresses"
        description="Manage your delivery locations for order fulfillment."
        action={
          user ? (
            <Link
              href="/customer/addresses/new"
              className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}
            >
              Add address
            </Link>
          ) : null
        }
      />

      <FadeIn delay={0}>
        <Suspense fallback={<AddressStatsSkeleton />}>
          <AddressStats />
        </Suspense>
      </FadeIn>

      <FadeIn>
        <Suspense fallback={<AddressListSkeleton />}>
          <AddressList />
        </Suspense>
      </FadeIn>
    </div>
  )
}
