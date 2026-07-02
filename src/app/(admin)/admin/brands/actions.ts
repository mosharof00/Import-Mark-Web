"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import {
  deleteStorageUrls,
  storageUrlsAdded,
  storageUrlsToDelete,
} from "@/lib/storage/cleanup"
import {
  brandFormSchema,
  type BrandFormInput,
} from "@/lib/validations/brand"

type ActionResult = { error?: string } | void

async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateBrandPaths(brandId?: string) {
  revalidatePath("/admin/brands")
  if (brandId) {
    revalidatePath(`/admin/brands/${brandId}/edit`)
  }
}

export async function createBrand(values: BrandFormInput): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = brandFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const data = parsed.data
  const logoUrl = data.logoUrl?.trim() || null
  const added = storageUrlsAdded(null, logoUrl)
  const supabase = await createClient()

  const { data: brand, error } = await supabase
    .from("brands")
    .insert({
      name: data.name.trim(),
      logo_url: logoUrl,
      website: data.website?.trim() || null,
      country_of_origin: data.countryOfOrigin?.trim() || null,
      is_active: data.isActive,
    })
    .select("id")
    .single()

  if (error || !brand) {
    await deleteStorageUrls(added)
    return { error: error?.message ?? "Could not create brand." }
  }

  revalidateBrandPaths(brand.id)
  redirect(`/admin/brands/${brand.id}/edit`)
}

export async function updateBrand(
  brandId: string,
  values: BrandFormInput
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const parsed = brandFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Please check the form and try again." }
  }

  const data = parsed.data
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("brands")
    .select("id, logo_url")
    .eq("id", brandId)
    .single()

  if (fetchError || !existing) {
    return { error: "Brand not found." }
  }

  const logoUrl = data.logoUrl?.trim() || null
  const previousLogo = existing.logo_url
  const added = storageUrlsAdded(previousLogo, logoUrl)

  const { error } = await supabase
    .from("brands")
    .update({
      name: data.name.trim(),
      logo_url: logoUrl,
      website: data.website?.trim() || null,
      country_of_origin: data.countryOfOrigin?.trim() || null,
      is_active: data.isActive,
    })
    .eq("id", brandId)

  if (error) {
    await deleteStorageUrls(added)
    return { error: error.message }
  }

  await deleteStorageUrls(storageUrlsToDelete(previousLogo, logoUrl))
  revalidateBrandPaths(brandId)
  redirect("/admin/brands")
}

export async function deleteBrand(brandId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("brands")
    .select("id, logo_url")
    .eq("id", brandId)
    .single()

  if (fetchError || !existing) {
    return { error: "Brand not found." }
  }

  const { count, error: usageError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brandId)

  if (usageError) return { error: usageError.message }
  if ((count ?? 0) > 0) {
    return { error: "Remove this brand from all products before deleting it." }
  }

  const { error } = await supabase.from("brands").delete().eq("id", brandId)
  if (error) return { error: error.message }

  await deleteStorageUrls([existing.logo_url])
  revalidateBrandPaths()
  redirect("/admin/brands")
}
