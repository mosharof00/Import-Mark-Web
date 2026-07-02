import { createClient } from "@/lib/supabase/client"

import { STORAGE_BUCKET } from "./constants"
import { buildStoragePath, parseStoragePathFromUrl, type StoragePathInput } from "./paths"
import { getStoragePublicUrl } from "./urls"
import { validateImageFile } from "./validate"

export type UploadImageResult =
  | { path: string; publicUrl: string }
  | { error: string }

export async function uploadImageFile(
  file: File,
  pathInput: StoragePathInput
): Promise<UploadImageResult> {
  const validationError = validateImageFile(file, pathInput.kind)
  if (validationError) return { error: validationError }

  const path = buildStoragePath(pathInput)
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    })

  if (error) return { error: error.message }

  return {
    path,
    publicUrl: getStoragePublicUrl(path),
  }
}

export async function removeImageAtPath(path: string): Promise<string | null> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  return error?.message ?? null
}

export async function removeImageAtUrl(url: string): Promise<string | null> {
  const path = parseStoragePathFromUrl(url)
  if (!path) return "Not a platform media URL."
  return removeImageAtPath(path)
}
