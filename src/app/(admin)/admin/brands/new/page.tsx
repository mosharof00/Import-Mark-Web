import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { BrandForm } from "../_components/brand-form"

export default function NewBrandPage() {
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
        title="Add Brand"
        description="Create a brand and upload its logo to storage."
      />

      <BrandForm
        defaultValues={{
          name: "",
          logoUrl: "",
          website: "",
          countryOfOrigin: "",
          isActive: true,
        }}
      />
    </div>
  )
}
