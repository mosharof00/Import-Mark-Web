import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type PublicProductListItem = {
  id: string
  name: string
  sellPrice: number
  unit: string
  brandName: string | null
  categoryName: string
  imageUrl: string | null
}

export type PublicProductDetail = PublicProductListItem & {
  sku: string | null
  description: string | null
  specifications: string | null
  originCountry: string | null
  unitSize: number | null
  imageUrls: string[]
  inStock: boolean
}

export const getPublicProducts = cache(
  async (limit?: number): Promise<PublicProductListItem[]> => {
    const supabase = await createClient()
    let query = supabase
      .from("products")
      .select(
        "id, name, sell_price, unit, image_urls, categories(name), brands(name)"
      )
      .eq("status", "active")
      .order("name", { ascending: true })

    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error) {
      console.error("[public-catalog] getPublicProducts:", error.message)
      return []
    }
    if (!data) return []

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      sellPrice: p.sell_price,
      unit: p.unit,
      brandName: p.brands?.name ?? null,
      categoryName: p.categories?.name ?? "Uncategorized",
      imageUrl: p.image_urls?.[0] ?? null,
    }))
  }
)

export const getPublicProduct = cache(
  async (productId: string): Promise<PublicProductDetail | null> => {
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id, name, sku, sell_price, unit, unit_size, description, specifications, origin_country, image_urls, categories(name), brands(name), stock(quantity_available)"
      )
      .eq("id", productId)
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      console.error("[public-catalog] getPublicProduct:", error.message)
      return null
    }
    if (!product) return null

    const stock = Array.isArray(product.stock)
      ? product.stock[0]
      : product.stock

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      sellPrice: product.sell_price,
      unit: product.unit,
      unitSize: product.unit_size,
      description: product.description,
      specifications: product.specifications,
      originCountry: product.origin_country,
      brandName: product.brands?.name ?? null,
      categoryName: product.categories?.name ?? "Uncategorized",
      imageUrl: product.image_urls?.[0] ?? null,
      imageUrls: product.image_urls ?? [],
      inStock: (stock?.quantity_available ?? 0) > 0,
    }
  }
)
