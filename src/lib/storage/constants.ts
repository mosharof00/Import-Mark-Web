/** Single public bucket for all platform images. */
export const STORAGE_BUCKET = "platform-media" as const

export const STORAGE_MAX_BYTES = {
  user: 2 * 1024 * 1024,
  product: 10 * 1024 * 1024,
  brand: 5 * 1024 * 1024,
} as const

export const STORAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export const STORAGE_ACCEPT_ATTR = STORAGE_ACCEPTED_MIME_TYPES.join(",")

export const STORAGE_MAX_PRODUCT_IMAGES = 8

/**
 * Flat folders inside `platform-media` (matches Supabase dashboard layout).
 *
 * | Folder   | DB column   | Table(s)                    |
 * |----------|-------------|-----------------------------|
 * | users    | avatar_url  | admins, managers, customers |
 * | products | image_urls  | products                    |
 * | brands   | logo_url    | brands                      |
 */
export const STORAGE_FOLDERS = {
  users: "users",
  products: "products",
  brands: "brands",
} as const

export type StorageAssetKind = "user" | "product" | "brand"
