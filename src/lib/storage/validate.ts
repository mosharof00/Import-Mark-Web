import {
  STORAGE_ACCEPTED_MIME_TYPES,
  STORAGE_MAX_BYTES,
  type StorageAssetKind,
} from "./constants"

const MIME_SET = new Set<string>(STORAGE_ACCEPTED_MIME_TYPES)

export function fileExtension(filename: string): string {
  const parts = filename.split(".")
  if (parts.length < 2) return "jpg"
  return (parts.pop() ?? "jpg").toLowerCase()
}

export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80)
}

export function validateImageFile(
  file: File,
  kind: StorageAssetKind
): string | null {
  if (!MIME_SET.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed."
  }

  const maxBytes = STORAGE_MAX_BYTES[kind]
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024))
    return `Image must be ${maxMb} MB or smaller.`
  }

  return null
}
