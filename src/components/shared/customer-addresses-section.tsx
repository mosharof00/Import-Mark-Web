import Link from "next/link"
import { MapPin } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { formatCustomerAddress } from "@/lib/format-address"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export async function CustomerAddressesSection({
  customerId,
  addressesPath,
  newAddressHref,
}: {
  customerId: string
  addressesPath: string
  newAddressHref: string
}) {
  const supabase = await createClient()

  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("id, label, recipient_name, is_default, city, country, address_line_1")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false })
    .order("label")

  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Delivery addresses
        </h2>
        <Link
          href={newAddressHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full px-4"
          )}
        >
          Add address
        </Link>
      </div>

      {!addresses?.length ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-center text-sm">
          <MapPin className="size-8 opacity-40" />
          <p>No saved delivery addresses.</p>
          <Link
            href={newAddressHref}
            className="text-foreground hover:text-muted-foreground underline-offset-4 hover:underline"
          >
            Add the first address
          </Link>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {addresses.map((address) => (
            <li key={address.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`${addressesPath}/${address.id}`}
                    className="text-foreground hover:text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {address.label}
                  </Link>
                  {address.is_default ? (
                    <Badge
                      variant="secondary"
                      className="border-0 bg-green-100 text-xs text-green-700 dark:bg-green-950 dark:text-green-300"
                    >
                      Default
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {address.recipient_name} · {formatCustomerAddress(address)}
                </p>
              </div>
              <Link
                href={`${addressesPath}/${address.id}/edit`}
                className="text-muted-foreground hover:text-foreground shrink-0 text-xs underline-offset-4 hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
