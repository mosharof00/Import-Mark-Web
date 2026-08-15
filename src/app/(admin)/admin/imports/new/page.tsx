import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { CreateImportWizard } from "./_components/create-import-wizard"
import type {
  ImportCategory,
  ImportProduct,
  ImportSupplier,
} from "./_components/types"

export const dynamic = "force-dynamic"

export default async function NewImportPage() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") notFound()

  const supabase = await createClient()
  const [suppliersRes, productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("suppliers")
      .select("id, name, country, contact_person")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("products")
      .select(
        "id, name, sku, unit, status, category_id, categories(name), brands(name)"
      )
      .neq("status", "rejected")
      .order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ])

  const suppliers: ImportSupplier[] = (suppliersRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    country: s.country,
    contactPerson: s.contact_person,
  }))

  const products: ImportProduct[] = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    brandName: p.brands?.name ?? null,
    categoryName: p.categories?.name ?? "Uncategorized",
    categoryId: p.category_id,
    unit: p.unit,
  }))

  const categories: ImportCategory[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record import"
        description="Create an inbound shipment in steps. Stock is added only when the shipment is marked cleared."
      />
      <CreateImportWizard
        suppliers={suppliers}
        products={products}
        categories={categories}
      />
    </div>
  )
}
