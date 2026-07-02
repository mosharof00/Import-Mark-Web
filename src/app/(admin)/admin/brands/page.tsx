import Link from "next/link"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ErrorCard } from "@/components/shared/error-card"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminBrandsPage() {
  const supabase = await createClient()
  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name, logo_url, country_of_origin, is_active, created_at")
    .order("name")

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Brands" description="Manage brand logos and metadata." />
        <ErrorCard title="Couldn't load brands" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Brands"
          description="Logos are stored in the brands/ folder in Supabase Storage."
        />
        <Link
          href="/admin/brands/new"
          className={cn(buttonVariants())}
        >
          <Plus />
          Add brand
        </Link>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {(brands ?? []).map((brand) => (
              <tr key={brand.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {brand.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logo_url}
                        alt=""
                        className="size-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-muted size-10 rounded-lg" />
                    )}
                    <span className="font-medium">{brand.name}</span>
                  </div>
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {brand.country_of_origin ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {brand.is_active ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/brands/${brand.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!brands?.length ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No brands yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
