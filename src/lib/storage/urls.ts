import { STORAGE_BUCKET } from "./constants"

/** Builds the public CDN URL for a stored object path. */
export function getStoragePublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.")
  }

  const normalized = path.replace(/^\/+/, "")
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${normalized}`
}

/** True when the URL points at our Supabase storage bucket. */
export function isPlatformMediaUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`)
}
