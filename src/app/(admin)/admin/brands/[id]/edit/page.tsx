import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { BrandForm } from "../../_components/brand-form"

export const dynamic = "force-dynamic"

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: brand, error } = await supabase
    .from("brands")
    .select("id, name, logo_url, website, country_of_origin, is_active")
    .eq("id", id)
    .single()

  if (error || !brand) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/admin/brands"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to brands
      </Link>

      <PageHeader
        title="Edit Brand"
        description={`Update ${brand.name} and its logo.`}
      />

      <BrandForm
        brandId={brand.id}
        defaultValues={{
          name: brand.name,
          logoUrl: brand.logo_url ?? "",
          website: brand.website ?? "",
          countryOfOrigin: brand.country_of_origin ?? "",
          isActive: brand.is_active,
        }}
      />
    </div>
  )
}
