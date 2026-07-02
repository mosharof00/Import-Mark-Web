import "server-only"

import { createClient } from "@/lib/supabase/server"

import { STORAGE_BUCKET } from "./constants"
import { parseStoragePathFromUrl } from "./paths"
import { isPlatformMediaUrl } from "./urls"

function uniqueUrls(urls: Array<string | null | undefined>): string[] {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))]
}

/** URLs present before but not after an update (safe to delete from storage). */
export function storageUrlsToDelete(
  previous: Array<string | null | undefined> | string | null | undefined,
  next: Array<string | null | undefined> | string | null | undefined
): string[] {
  const prevList = Array.isArray(previous)
    ? previous
    : previous
      ? [previous]
      : []
  const nextList = Array.isArray(next) ? next : next ? [next] : []
  const nextSet = new Set(nextList)

  return uniqueUrls(
    prevList.filter((url) => url && !nextSet.has(url) && isPlatformMediaUrl(url))
  )
}

/** URLs newly added (rollback if the DB write fails). */
export function storageUrlsAdded(
  previous: Array<string | null | undefined> | string | null | undefined,
  next: Array<string | null | undefined> | string | null | undefined
): string[] {
  const prevList = Array.isArray(previous)
    ? previous
    : previous
      ? [previous]
      : []
  const nextList = Array.isArray(next) ? next : next ? [next] : []
  const prevSet = new Set(prevList)

  return uniqueUrls(
    nextList.filter((url) => url && !prevSet.has(url) && isPlatformMediaUrl(url))
  )
}

/** Deletes platform-media objects by their public URLs. Ignores external URLs. */
export async function deleteStorageUrls(
  urls: Array<string | null | undefined>
): Promise<void> {
  const paths = uniqueUrls(urls)
    .map((url) => parseStoragePathFromUrl(url))
    .filter((path): path is string => Boolean(path))

  if (!paths.length) return

  const supabase = await createClient()
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)

  if (error) {
    console.error("[storage] failed to delete objects:", error.message, paths)
  }
}
